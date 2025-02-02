<template>
  <div>
    <var-paper ripple :elevation="elevation" v-hover="handleHover" class="tag-paper">
      <var-link underline="none" :to="`/tag/${encodeURIComponent(text)}`">
        <var-chip class="chip">{{ text }}</var-chip>
      </var-link>
    </var-paper>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  text: string
}>()

const elevation = ref(1)
const handleHover = (isHovering: boolean) => {
  elevation.value = isHovering ? 4 : 2
}

</script>

<style scoped>
.tag-paper {
  transition: box-shadow 0.1s ease-in-out;
}

.chip {
  cursor: pointer;
}
</style>