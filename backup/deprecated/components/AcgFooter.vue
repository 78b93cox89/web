<template>
  <footer class="footer">
    <var-divider>
      <var-tooltip content="申请友联请联系 link@manyacg.top" placement="right-end">
        <var-icon name="heart-outline" style="margin: 0 16px; color: var(--color-danger)" />
      </var-tooltip>
    </var-divider>
    <div class="divider-vertical-container">
      <var-link
        :text-color="linkColors.github"
        underline="none"
        href="https://github.com/krau/ManyACG"
        target="_blank"
        >开源地址</var-link
      >
      <var-divider vertical />
      <var-link
        underline="none"
        href="https://t.me/moreacg"
        target="_blank"
        :text-color="linkColors.telegram"
        >频道</var-link
      >
      <var-divider vertical />
      <var-link
        underline="none"
        href="https://krau.top"
        target="_blank"
        :text-color="linkColors.blog"
        >博客</var-link
      >
      <var-divider vertical />
      <var-link
        underline="none"
        href="https://www.someacg.top"
        target="_blank"
        :text-color="linkColors.someacg"
        >SomeACG</var-link
      >
      <var-divider vertical />
      <var-link
        underline="none"
        href="https://www.moely.link/"
        target="_blank"
        :text-color="linkColors.moely"
        >萌哩</var-link
      >
      <var-divider vertical />
      <var-link
        underline="none"
        href="https://pic.cosine.ren/"
        target="_blank"
        :text-color="linkColors.cosine"
        >Cosine 🎨 Gallery</var-link
      >
    </div>
  </footer>
</template>

<script lang="ts" setup>
const linkColors = useLinkColors()
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
