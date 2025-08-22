<template>
  <div class="container" ref="containerRef" data-allow-mismatch>
    <div class="tag-info">
      <h2># {{ route.params.name }} 标签下的作品</h2>
    </div>
    <var-divider dashed />
    <var-skeleton :loading="result.list.length === 0" fullscreen></var-skeleton>

    <VirtualWaterfall
      :virtual="waterfallOption.virtual"
      :gap="waterfallOption.gap"
      :preload-screen-count="waterfallOption.preloadScreenCount"
      :item-min-width="waterfallOption.itemMinWidth"
      :max-column-count="waterfallOption.maxColumnCount"
      :min-column-count="waterfallOption.minColumnCount"
      :calc-item-height="calcItemHeight"
      :items="result.list"
      :enable-cache="waterfallOption.enableCache"
    >
      <template #default="scope">
        <WaterfallCard v-if="scope?.item" :item="scope.item" />
      </template>
    </VirtualWaterfall>
    <div class="index-footer" v-if="result.end && result.list.length > 0">
      <div
        style="
          font-size: large;
          margin: 0 16px;
          text-align: center;
          color: hsla(var(--hsl-text), 0.8);
        "
      >
        ∑( 口 || 你居然看完了!
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const tagName = route.params.name

useHead({
  title: `#${tagName}`
})

useSeoMeta({
  title: `#${tagName}`,
  ogTitle: `#${tagName} | ManyACG`,
  description: `${tagName}标签下的作品 | ManyACG`,
  ogDescription: `${tagName}标签下的作品 | ManyACG`,
  twitterDescription: `${tagName}标签下的作品 | ManyACG`,
  twitterTitle: `#${tagName} | ManyACG`,
  twitterCard: 'summary'
})

const { containerRef } = useWaterfallContainer()

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  tag: `${route.params.name}`,
  mode: 'index'
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 95%;
}

.tag-info {
  margin-bottom: 5vh;
}

.index-footer {
  margin-top: 16px;
  height: 64px;
}

@media (max-width: 768px) {
  .container {
    max-width: 100%;
  }
}
</style>
