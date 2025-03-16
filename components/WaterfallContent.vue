<template>
  <div class="waterfall" id="waterfall-container" ref="containerRef" data-allow-mismatch>
    <var-skeleton :loading="result.list.length === 0 && props.mode === 'random'" fullscreen></var-skeleton>
    <VirtualWaterfall :virtual="waterfallOption.virtual" :gap="waterfallOption.gap"
      :preload-screen-count="waterfallOption.preloadScreenCount" :item-min-width="waterfallOption.itemMinWidth"
      :max-column-count="waterfallOption.maxColumnCount" :min-column-count="waterfallOption.minColumnCount"
      :calc-item-height="calcItemHeight" :items="result.list">
      <template #default="scope">
        <WaterfallCard v-if="scope?.item" :item="scope.item" @click="handleCardClick(scope.item)" />
      </template>
    </VirtualWaterfall>
    <ClientOnly>
      <div class="index-footer" v-if="result.list.length > 0">
        <var-divider>
          <div style="font-size: large;margin: 0 16px;">{{ tipText }}</div>
        </var-divider>
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type { WaterfallItem } from '~/typing/waterfall';

const props = withDefaults(defineProps<{
  mode: "random" | "index";
}>(), {
  mode: "index"
});

const containerRef = ref<HTMLElement | null>(null);
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.style.height = window.innerHeight - 64 + "px";
  }
});

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  mode: props.mode,
});

if (result.errorMessage) {
  showError({ statusCode: result.statusCode, statusMessage: "网站似乎挂掉了" });
}

const tipText = computed(() => {
  if (result.end) {
    return " ∑( 口 || 你居然看完了!";
  }
  return "正在加载, 别急 §(*￣▽￣*)§";
});

const artworkStore = useArtworkStore();

const handleCardClick = (item: WaterfallItem) => {
  artworkStore.addArtwork(item.detail);
  navigateTo({
    path: `/artwork/${item.id}`
  });
};

</script>

<style scoped>
.index-footer {
  margin-top: 16px;
  height: 64px;
}
</style>