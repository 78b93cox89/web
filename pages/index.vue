<template>
  <div>
    <div class="index-contanier">
      <waterfall-content mode="index" />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'ManyACG - 二次元美图精选收集',
  titleTemplate: '%s'
})
</script>

<style scoped>
.index-contanier {
  margin: 0 auto;
  max-width: 95%;
}

.title-text {
  font-size: 24px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .index-contanier {
    max-width: 100%;
  }
}
</style>
