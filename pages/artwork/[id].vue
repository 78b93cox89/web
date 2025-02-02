<template>
  <div data-allow-mismatch>
    <ClientOnly>
      <var-progress :value="downloadProgress" v-if="downloadProgress > 0" />
    </ClientOnly>

    <var-skeleton :loading="loading" fullscreen></var-skeleton>

    <Transition>
      <div class="container" v-show="!loading">
        <div class="artwork-container">
          <div class="artwork-pictures">
            <div class="pictures-container">
              <div class="picture-card var-elevation--2" v-for="(picture, index) in artwork?.pictures" :key="picture.id"
                :style="adjustPictureSize(picture)">
                <detail-image :index="index" :regular="picture.regular" :thumbnail="picture.thumbnail"
                  @preview="previewImage" @load="imageLoad" />
              </div>
            </div>
          </div>

          <div class="artwork-info">
            <div class="artwork-title">{{ artwork?.title }}</div>

            <var-link underline="none" class="source-url-link" :href="artwork?.source_url" target="_blank"
              rel="noopener noreferrer">
              → {{ artwork?.source_type }}
            </var-link>

            <var-link class="artwork-artist" underline="none" :to="`/artist/${artwork?.artist.id}`">
              <var-icon name="account-circle" />
              {{ artwork?.artist.name }}
            </var-link>
            <div>
              <div class="artwork-tags">
                <tag-chip v-for="tag in artwork?.tags.slice(0, 10)" :key="tag" :text="tag" />
              </div>
              <div v-if="artwork && artwork?.tags.length > 10">
                <var-collapse-transition :expand="expandedTags">
                  <div class="artwork-tags">
                    <tag-chip v-for="tag in artwork?.tags.slice(10)" :key="tag" :text="tag" />
                  </div>
                </var-collapse-transition>
                <var-divider hairline>
                  <var-button size="small" @click="expandedTags = !expandedTags" title="展开/收起标签" style="margin: 0 8px;">
                    <var-icon :name="expandedTags ? 'chevron-up' : 'chevron-down'" />
                  </var-button>
                </var-divider>
              </div>
            </div>
            <div :line-clamp="5" :tooltip="false" expand-trigger="click" class="artwork-description">
              <div style="white-space: pre-wrap;"> {{ artwork?.description }}</div>
            </div>

            <div class="artwork-action">
              <var-button @click="routerBack" size="large" title="返回">
                <var-icon name="chevron-left" />
              </var-button>
              <var-button size="large" text-color="#39c5bb" @click="downloadPictures" :loading="!downloadAvailable"
                title="下载">
                <var-icon name="download-outline" />
              </var-button>
              <var-menu placement="top-start">
                <var-button size="large" title="相关推荐" text-color="#f92f60" @click="searchSimilar">
                  <var-icon name="camera-outline" />
                </var-button>
              </var-menu>
            </div>
          </div>
        </div>

        <ClientOnly>
          <acg-footer />
        </ClientOnly>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onDeactivated, onActivated } from 'vue'
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js'
import fileSaver from 'file-saver'
const { saveAs } = fileSaver
import { ImagePreview, Snackbar } from '@varlet/ui'
import asyncPool from 'tiny-async-pool'
import type { ArtworkDetailResponse, Picture } from '~/typing/artwork'

const route = useRoute()
const artworkId = route.params.id as string

const adjustPictureSize = (picture: ArtworkDetailResponse['data']['pictures'][0]) => {
  const ratio = picture.width / picture.height
  if (ratio > 1) {
    return {
      width: '100%',
      height: 'auto',
    }
  } else {
    return {
      width: `${ratio * 100}%`,
      height: 'auto',
    }
  }
}

const artwork = ref<ArtworkDetailResponse['data']>()
const downloadAvailable = ref(false)
const pictureRegularUrls = computed(() =>
  artwork.value?.pictures.map((picture) => picture.regular)
)

const { data, error } = await useAcgapiData<ArtworkDetailResponse>(`/artwork/${artworkId}`)

if (error.value) {
  if (error.value.statusCode === 401) {
    throw createError({
      statusCode: 401,
      message: '这个作品需要登录后才能查看哦',
    })
  }
  throw createError({
    statusCode: error.value.statusCode || 500,
    message: error.value.message || '未知错误',
  })
}

if (data.value) {
  artwork.value = data.value.data
  downloadAvailable.value = true
  useHead({
    title: `${artwork.value.title}`,
  })
  const ogImageUrl = artwork.value.pictures[0].thumbnail.endsWith('.avif')
    ? `https://wsrv.unv.app/?url=${artwork.value.pictures[0].thumbnail}&output=jpg`
    : artwork.value.pictures[0].thumbnail
  useSeoMeta({
    description: `${artwork.value.description}`,
    ogTitle: `${artwork.value.title} | ManyACG`,
    ogDescription: `${artwork.value.description}`,
    ogImage: ogImageUrl,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: `${artwork.value.title} | ManyACG`,
    twitterDescription: `${artwork.value.description}`,
    twitterImage: ogImageUrl,
  })
}

const loading = ref(true)
const imageLoad = (index: number) => {
  if (index === 0) {
    loading.value = false
    setTimeout(() => {
      document.body.style.backgroundImage = `url(${artwork.value?.pictures[0].regular})`
    }, 1000)
  }
}

onDeactivated(() => {
  document.body.style.backgroundImage = ''
})

onActivated(() => {
  if (loading.value) {
    return
  }
  setTimeout(() => {
    document.body.style.backgroundImage = `url(${artwork.value?.pictures[0].regular})`
  }, 1000)
})

const downloadedCount = ref(0)
const downloadProgress = computed(() => {
  if (!artwork.value) {
    return 0
  }
  return (downloadedCount.value / artwork.value.pictures.length) * 100
})

const downloadPictures = async () => {
  if (!downloadAvailable.value || !artwork.value) {
    return
  }

  downloadAvailable.value = false

  if (artwork.value.pictures.length === 1) {
    try {
      const resp = await $acgapi<Blob>(`/picture/file/${artwork.value.pictures[0].id}`, {
        onRequestError({ error }) {
          Snackbar({
            content: `请求失败: ${error.message}`,
            position: 'bottom',
            type: 'error',
          })
        },
        onResponseError({ response }) {
          if (response.status === 401) {
            Snackbar({
              content: '这张图片需要登录后才能下载哦',
              position: 'bottom',
              type: 'error',
            })
          } else {
            Snackbar({
              content: `响应失败: ${response.statusText || response.status}`,
              position: 'bottom',
              type: 'error',
            })
          }
        },
      })
      if (resp) {
        saveAs(resp, artwork.value.pictures[0].file_name)
        Snackbar.clear()
      }
    } finally {
      downloadAvailable.value = true
    }
    return
  }

  const zip = new ZipWriter(new BlobWriter('application/zip'), {
    zip64: true,
  })
  const failedDownloads: string[] = []

  try {
    const downloadPicture = async (picture: Picture) => {
      try {
        const resp = await $acgapi<Blob>(`/picture/file/${picture.id}`, {
          onRequestError({ error }) {
            throw new Error(`请求失败: ${error.message}`)
          },
          onResponseError({ response }) {
            if (response.status === 401) {
              throw new Error('这张图片需要登录后才能下载哦')
            } else {
              throw new Error(`响应失败: ${response.statusText || response.status}`)
            }
          },
        })

        if (resp) {
          await zip.add(picture.file_name, new BlobReader(resp))
        } else {
          throw new Error('响应为空')
        }
        return picture.file_name
      } catch (error) {
        failedDownloads.push(picture.file_name)
        throw error
      }
    }

    for await (const fileName of asyncPool(3, artwork.value.pictures, downloadPicture)) {
      downloadedCount.value++
      console.log(`下载完成: ${fileName}`)
      console.log(`当前下载进度: ${downloadedCount.value}/${artwork.value.pictures.length}`)
    }

    if (failedDownloads.length > 0) {
      Snackbar({
        content: `有 ${failedDownloads.length} 张图片下载失败`,
        position: 'bottom',
        type: 'warning',
      })
    }
    const zipFile = await zip.close()
    saveAs(zipFile, `${artwork.value.title}.zip`)
    Snackbar({
      content: '下载完成',
      position: 'bottom',
      type: 'success',
    })
  } catch (e: any) {
    Snackbar({
      content: `下载过程发生错误: ${e.message}`,
      position: 'bottom',
      type: 'error',
    })
  } finally {
    downloadAvailable.value = true
    downloadedCount.value = 0
    setTimeout(() => {
      Snackbar.clear()
    }, 3000)
  }
}

const previewImage = (index: number) => {
  ImagePreview({
    images: pictureRegularUrls.value,
    initialIndex: index,
    closeable: true,
    closeOnKeyEscape: true,
  })
}

const expandedTags = ref(false)

const searchSimilar = () => {
  navigateTo(`/search/result?similar_target=${artworkId}`, {
    open: {
      target: '_blank',
    },
  })
}
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 1600px;
  padding: 20px;
}

@media (min-width: 2000px) {
  .container {
    max-width: 80%;
  }
}

.artwork-container {
  display: flex;
  gap: 20px;
}

.need-login-result {
  flex: 1;
  max-width: 70%;
}

.artwork-pictures {
  flex: 1;
  max-width: 70%;
  max-height: 90vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  background-color: rgba(192, 238, 240, 0.2);
  border-radius: 4px;
}

.pictures-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.picture-card {
  margin: 0 auto;
}

.artwork-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 30%;
}

.artwork-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  word-break: break-all;
  overflow-wrap: break-word;
}

.artwork-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 18px;
  margin-bottom: 10px;
  margin-left: 5px;
}

.source-url-link {
  display: block;
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
  background-color: rgba(192, 238, 240, 0.3);
  border-radius: 10px;
  padding: 5px 5px;
  transition: background-color 0.2s ease;
  font-weight: bold;
}

.source-url-link:hover {
  background-color: rgba(192, 238, 240, 0.5);
}

.artwork-artist {
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 5px 5px;
  gap: 5px;
  font-size: 18px;
  transition: background-color 0.2s ease;
  align-self: start;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.artwork-artist:hover {
  background-color: rgba(192, 238, 240, 0.5);
}

.artwork-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.artwork-description {
  font-size: 16px;
  line-height: 1.5;
  word-break: break-all;
  overflow-wrap: break-word;
}

.artwork-action {
  margin-top: auto;
  border-radius: 10px;
  padding: 10px 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease;
}

@media (max-width: 1000px) {
  .container {
    max-width: 100%;
  }

  .artwork-container {
    flex-direction: column;
  }

  .artwork-pictures,
  .artwork-info {
    max-width: 100%;
  }

  .artwork-container .picture-card {
    width: 100% !important;
  }
}

.v-enter-active,
.v-leave-active {
  opacity: 1;
  transition: all 0.4s linear;
  will-change: opacity;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  will-change: opacity;
}
</style>
