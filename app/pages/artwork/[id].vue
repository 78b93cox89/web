<template>
  <div data-allow-mismatch>
    <ClientOnly>
      <var-progress :value="downloadProgress" v-if="downloadProgress > 0" />
    </ClientOnly>

    <var-skeleton :loading="loading" fullscreen />

    <Transition>
      <div class="container" v-show="!loading">
        <div class="artwork-container">
          <div class="artwork-pictures">
            <div class="pictures-container">
              <div
                class="picture-card var-elevation--2"
                v-for="(picture, index) in artwork?.pictures"
                :key="picture.id"
                :style="{ width: pictureWidth(picture), height: 'auto' }"
              >
                <detail-image
                  :index="index"
                  :regular="picture.regular"
                  :thumbnail="picture.thumbnail"
                  @preview="previewImage"
                  @load="imageLoad"
                />
              </div>
            </div>
          </div>

          <div class="artwork-info">
            <div class="artwork-title">{{ artwork?.title }}</div>

            <var-link
              underline="none"
              class="info-link source-url-link"
              :href="artwork?.source_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              → {{ artwork?.source_type }}
            </var-link>

            <var-link
              class="info-link artwork-artist"
              underline="none"
              :to="`/artist/${artwork?.artist.id}`"
            >
              <var-icon name="account-circle" />
              {{ artwork?.artist.name }}
            </var-link>

            <div class="artwork-tags">
              <tag-chip v-for="tag in artwork?.tags" :key="tag" :text="tag" />
            </div>

            <div
              class="artwork-description"
              :line-clamp="5"
              :tooltip="false"
              expand-trigger="click"
            >
              <div style="white-space: pre-wrap">{{ artwork?.description }}</div>
            </div>

            <div class="artwork-action">
              <var-button @click="routerBack" size="large" title="返回">
                <var-icon name="chevron-left" />
              </var-button>
              <var-button
                size="large"
                text-color="#39c5bb"
                @click="downloadPictures"
                :loading="!downloadAvailable"
                title="下载"
              >
                <var-icon name="download-outline" />
              </var-button>
              <var-button size="large" title="相关推荐" text-color="#f92f60" @click="searchSimilar">
                <var-icon name="camera-outline" />
              </var-button>
            </div>
          </div>
        </div>

        <div class="artwork-similar">
          <var-divider>
            <div class="similar-title">相关推荐</div>
          </var-divider>
          <VirtualWaterfall
            v-bind="waterfallOption"
            :calc-item-height="calcItemHeight"
            :items="result.list"
          >
            <template #default="scope">
              <WaterfallCard v-if="scope?.item" :item="scope.item" />
            </template>
          </VirtualWaterfall>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onDeactivated, onActivated } from 'vue'
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js'
import { saveAs } from 'file-saver'
import { ImagePreview, Snackbar } from '@varlet/ui'
import asyncPool from 'tiny-async-pool'
import type { Artwork, ArtworkDetailResponse, Picture } from '~/types/artwork'

const route = useRoute()
const artworkStore = useArtworkStore()
const artworkId = route.params.id as string

const BACKGROUND_DELAY = 1000
const DOWNLOAD_CONCURRENCY = 3
const SNACKBAR_CLEAR_DELAY = 3000

const artwork = ref<Artwork | null>(artworkStore.getArtwork(artworkId))
const downloadAvailable = ref(false)
const loading = ref(true)
const downloadedCount = ref(0)

const pictureRegularUrls = computed(() => artwork.value?.pictures.map((p) => p.regular) || [])
const downloadProgress = computed(() => {
  if (!artwork.value?.pictures?.length) return 0
  return (downloadedCount.value / artwork.value.pictures.length) * 100
})

const pictureWidth = (picture: Picture) =>
  picture.width / picture.height > 1 ? '100%' : `${(picture.width / picture.height) * 100}%`

const showSnackbar = (content: string, type: 'success' | 'error' | 'warning' = 'error') => {
  Snackbar({ content, position: 'bottom', type })
}

const handleApiError = (error: any, response?: any) => {
  if (response?.status === 401) {
    throw new Error('这张图片需要登录后才能下载哦')
  }
  throw new Error(error.message || `响应失败: ${response?.statusText || response?.status}`)
}

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  similarTarget: artworkId
})

// 获取作品数据
if (!artwork.value) {
  try {
    const data = await $acgapi<ArtworkDetailResponse>(`/artwork/${artworkId}`)
    if (data.status === 200) {
      artwork.value = data.data
      downloadAvailable.value = true
    }
  } catch {
    throw createError({
      status: 500,
      statusMessage: '获取作品失败'
    })
  }
} else {
  downloadAvailable.value = true
}

const setupSEO = () => {
  if (!artwork.value) return

  useHead({ title: artwork.value.title })

  const ogImageUrl = artwork.value.r18
    ? '/og-image/nsfw.webp'
    : artwork.value.pictures[0]?.regular.endsWith('.avif')
    ? `https://wsrv.unv.app/?url=${artwork.value.pictures[0].regular}&output=jpg`
    : artwork.value.pictures[0]?.regular
  const seoData = {
    description: artwork.value.description,
    ogTitle: `${artwork.value.title} | ManyACG`,
    ogDescription: artwork.value.description,
    ogImage: ogImageUrl,
    ogType: 'article' as const,
    twitterCard: 'summary_large_image' as const,
    twitterTitle: `${artwork.value.title} | ManyACG`,
    twitterDescription: artwork.value.description,
    twitterImage: ogImageUrl
  }

  useSeoMeta(seoData)
}

setupSEO()

const setBackgroundImage = () => {
  const firstPicture = artwork.value?.pictures?.[0]
  if (!firstPicture) return
  setTimeout(() => {
    document.body.style.backgroundImage = `url(${firstPicture.regular})`
  }, BACKGROUND_DELAY)
}

const clearBackgroundImage = () => {
  document.body.style.backgroundImage = ''
}

const imageLoad = (index: number) => {
  if (index === 0) {
    loading.value = false
    setBackgroundImage()
  }
}

onDeactivated(clearBackgroundImage)
onActivated(() => {
  if (!loading.value) setBackgroundImage()
})

// 下载功能
const downloadSinglePicture = async (picture: Picture) => {
  const resp = await $acgapi<Blob>(`/picture/file/${picture.id}`, {
    onRequestError: ({ error }) => handleApiError(error),
    onResponseError: ({ response }) => handleApiError(null, response)
  })

  if (resp) {
    saveAs(resp, picture.file_name)
    Snackbar.clear()
  }
}

const downloadMultiplePictures = async () => {
  const zip = new ZipWriter(new BlobWriter('application/zip'), { zip64: true })
  const failedDownloads: string[] = []

  const downloadPicture = async (picture: Picture) => {
    try {
      const resp = await $acgapi<Blob>(`/picture/file/${picture.id}`, {
        onRequestError: ({ error }) => handleApiError(error),
        onResponseError: ({ response }) => handleApiError(null, response)
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

  for await (const fileName of asyncPool(
    DOWNLOAD_CONCURRENCY,
    artwork.value!.pictures,
    downloadPicture
  )) {
    downloadedCount.value++
  }

  if (failedDownloads.length > 0) {
    showSnackbar(`有 ${failedDownloads.length} 张图片下载失败`, 'warning')
  }

  const zipFile = await zip.close()
  saveAs(zipFile, `${artwork.value!.title}.zip`)
  showSnackbar('下载完成', 'success')
}

const downloadPictures = async () => {
  if (!downloadAvailable.value || !artwork.value) return

  downloadAvailable.value = false
  try {
    if (artwork.value.pictures.length === 1) {
      await downloadSinglePicture(artwork.value.pictures[0]!)
    } else {
      await downloadMultiplePictures()
    }
  } catch (e: any) {
    showSnackbar(`下载过程发生错误: ${e.message}`)
  } finally {
    downloadAvailable.value = true
    downloadedCount.value = 0
    setTimeout(() => Snackbar.clear(), SNACKBAR_CLEAR_DELAY)
  }
}

const previewImage = (index: number) => {
  ImagePreview({
    images: pictureRegularUrls.value,
    initialIndex: index,
    closeable: true,
    closeOnKeyEscape: true
  })
}

const searchSimilar = () => {
  navigateTo(`/search/result?similar_target=${artworkId}`)
}
</script>

<style scoped>
.artwork-container {
  display: flex;
  gap: 20px;
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

.info-link {
  display: block;
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
  border-radius: 10px;
  padding: 5px;
  transition: background-color 0.2s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.info-link:hover {
  background-color: rgba(192, 238, 240, 0.5);
}

.source-url-link {
  background-color: rgba(192, 238, 240, 0.3);
  font-weight: bold;
}

.artwork-artist {
  gap: 5px;
  align-self: start;
  max-width: 100%;
  white-space: normal;
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
  padding: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.similar-title {
  font-size: large;
  margin: 0 16px;
  text-align: center;
  color: hsla(var(--hsl-text), 0.8);
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
