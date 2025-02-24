<template>
  <client-only>
    <var-fab drag position="right-bottom" type="primary" title="操作菜单">
      <var-button @click="toggleAutoScroll" title="自动滚动" type="primary">
        <Icon name=i-line-md:play v-if="!isAutoScrolling" />
        <Icon name="i-line-md:pause" v-else />
      </var-button>
    </var-fab>
  </client-only>
</template>

<script setup>
const isAutoScrolling = ref(false)
let scrollInterval = null
const scrollStep = 4
const scrollSpeed = 50

const startAutoScroll = () => {
  window.scrollBy({ top: scrollStep, behavior: 'smooth' })
  scrollInterval = setInterval(() => {
    window.scrollBy({ top: scrollStep, behavior: 'smooth' })
  }, scrollSpeed)
}

const stopAutoScroll = () => {
  clearInterval(scrollInterval)
  scrollInterval = null
}

const toggleAutoScroll = () => {
  isAutoScrolling.value = !isAutoScrolling.value
  if (isAutoScrolling.value) {
    startAutoScroll()
  } else {
    stopAutoScroll()
  }
}

onActivated(() => {
  window.addEventListener('scroll', () => {
    if (isAutoScrolling.value) {
      stopAutoScroll()
      isAutoScrolling.value = false
    }
  })
})

onDeactivated(() => {
  stopAutoScroll()
  window.removeEventListener('scroll')
})

const router = useRouter()
router.beforeEach(() => {
  stopAutoScroll()
  isAutoScrolling.value = false
})
</script>

<style scoped></style>