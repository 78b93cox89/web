<template>
  <div class="contanier">
    <waterfall-content :mode="'random'" />
  </div>
</template>

<script setup>
useHead({
  title: '随便看看'
})
</script>

<style scoped>
.contanier {
  margin: 0 auto;
  max-width: 95%;
}

@media (max-width: 768px) {
  .contanier {
    max-width: 100%;
  }
}
</style>
