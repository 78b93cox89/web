<template>
  <div>
    <var-paper
      ripple
      class="card"
      @click.left="handleCardClick(item)"
      @click.right.prevent="handleRightClick(item)"
    >
      <div :data-id="item.id" class="card-content" underline="none" rel="prefetch">
        <div class="cover">
          <Transition>
            <img
              :src="item.detail.pictures[0].thumbnail"
              :alt="item.detail.title"
              class="img"
              v-if="loaded"
            />
          </Transition>
        </div>
        <div class="overlay">
          <div class="card-body">
            <h3>{{ item.detail.title }}</h3>
            <div class="author">
              {{ item.detail.artist.name }}
            </div>
          </div>
        </div>
      </div>
    </var-paper>
    <ElImageViewer
      v-if="showViewer"
      :url-list="item.detail.pictures.map((pic) => pic.regular)"
      @close="showViewer = false"
      close-on-press-escape
      hide-on-click-modal
      show-progress
      teleported
    />
  </div>
</template>

<script setup lang="ts">
import type { WaterfallItem } from '~/types/artwork'
const props = withDefaults(
  defineProps<{
    item: WaterfallItem
    onlyImage?: boolean
    noImage?: boolean
  }>(),
  {
    onlyImage: false,
    noImage: false
  }
)

const loaded = ref(false)

onBeforeMount(() => {
  if (!props.noImage) {
    new Promise((resolve) => {
      const image = new Image()

      image.onload = () => {
        loaded.value = true
        resolve(true)
      }

      image.onerror = (error) => {
        console.error(error)
        loaded.value = true
        resolve(true)
      }

      image.src = props.item.detail.pictures[0].thumbnail
    })
  }
})

const handleCardClick = (item: WaterfallItem) => {
  useArtworkStore().addArtwork(item.detail)
  navigateTo({
    path: `/artwork/${item.id}`
  })
}

const showViewer = ref(false)

const handleRightClick = (item: WaterfallItem) => {
  showViewer.value = true
  // ImagePreview({
  //   images: item.detail.pictures.map((pic) => pic.regular),
  //   closeable: true,
  //   closeOnKeyEscape: true
  // })
}
</script>

<style scoped>
.card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
}

.card-content {
  width: 100%;
  height: 100%;
  display: block;
}

.cover {
  width: 100%;
  height: 100%;
}

.img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.action-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.card:hover .img {
  transform: scale(1.12);
}

.card:hover .overlay {
  transform: translateY(0);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 10px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.card-body {
  color: white;

  h3 {
    margin: 0 0 3px;
    font-size: 14px;
    font-weight: bold;
  }

  .author {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .card {
    border-radius: 0;
  }

  .card:hover .img {
    transform: none;
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s linear;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
