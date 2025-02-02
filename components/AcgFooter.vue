<template>
  <footer class="footer">
    <var-divider>
      <var-icon name="heart-outline" style="margin: 0 16px; color: var(--color-danger)" />
    </var-divider>
    <div class="divider-vertical-container">
      <var-link :text-color="linkColors.sponsor" underline="none" href="https://github.com/krau/ManyACG"
        target="_blank">Github</var-link>
      <var-divider vertical />
      <var-link underline="none" href="https://t.me/moreacg" target="_blank"
        :text-color="linkColors.telegram">TG频道</var-link>
    </div>
  </footer>
</template>

<script lang="ts" setup>

const linkColors = computed(() => {
  if (usePiniaStore().preferLight) {
    return {
      telegram: '#2c6aa3',
      sponsor: '#ee2d5c',
    }
  } else {
    return {
      telegram: '#39c5bb',
      sponsor: 'pink',
    }
  }
})

</script>

<style scoped>
.footer {
  margin-top: 20px;
}

.divider-vertical-container {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
}
</style>