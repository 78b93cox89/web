<template>
  <div class="container" ref="containerRef" data-allow-mismatch>
    <div class="search-info">
      <h2>{{ titleText }}</h2>
      <div v-if="hybird" style="display: flex; align-items: center; justify-content: center;">
        <Icon name="line-md:hazard-lights-loop" size="20" style="margin-right: 8px;"></Icon>混合搜索已启用
      </div>
    </div>
    <var-divider dashed />
    <var-skeleton :loading="result.list.length === 0" fullscreen></var-skeleton>
    <VirtualWaterfall :virtual="waterfallOption.virtual" :gap="waterfallOption.gap"
      :preload-screen-count="waterfallOption.preloadScreenCount" :item-min-width="waterfallOption.itemMinWidth"
      :max-column-count="waterfallOption.maxColumnCount" :min-column-count="waterfallOption.minColumnCount"
      :calc-item-height="calcItemHeight" :items="result.list">
      <template #default="scope">
        <WaterfallCard v-if="scope?.item" :item="scope.item" />
      </template>
    </VirtualWaterfall>
    <div class="index-footer" v-if="result.list.length > 0">
      <var-divider>
        <div style="font-size: large;margin: 0 16px;text-align: center;color: hsla(var(--hsl-text), 0.8);">{{ tipText }}
        </div>
      </var-divider>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const keyword = route.query.q
const hybird = route.query.hybrid === 'true'
const similarTarget = route.query.similar_target

if (!keyword && !similarTarget) {
  navigateTo('/search')
}

const titleText = ref(route.query.q ? `"${route.query.q}"的搜索结果` : `"${similarTarget}"的相似作品`);

useSeoMeta({
  title: titleText.value,
  ogTitle: titleText.value + ' | ManyACG',
  description: titleText.value + ' | ManyACG',
  ogDescription: titleText.value + ' | ManyACG',
  twitterDescription: titleText.value + ' | ManyACG',
  twitterTitle: titleText.value + ' | ManyACG',
  twitterCard: 'summary'
})

const containerRef = ref<HTMLElement>();
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.style.height = window.innerHeight - 64 + "px";
  }
});

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  hybrid: hybird,
  similarTarget: similarTarget?.toString() || '',
  keyword: route.query.q?.toString() || '',
  mode: 'index',
});

if (result.errorMessage) {
  showError({ statusCode: result.statusCode, statusMessage: "找不到你要搜索的内容" })
}

const tipText = computed(() => {
  if (result.end) {
    return " ∑( 口 || 你居然看完了!";
  }
  return "正在加载, 别急 §(*￣▽￣*)§";
});


</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 95%;
}

.search-info {
  margin-bottom: 2vh;
  text-align: center;
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