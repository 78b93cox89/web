<template>
  <div>
    <var-menu placement="bottom" same-width :offset-y="6">
      <var-button color="transparent" text-color="#fff" text title="主题">
        <Icon name="i-line-md:paint-drop-half-filled-twotone" size="24" />
        <var-icon name="chevron-down" />
      </var-button>
      <template #menu>
        <var-button text block @click="setLight(true)" title="Light" style="border-radius: 0%;">混沌邪恶</var-button>
        <var-button text block @click="setLight(false)" title="Dark" style="border-radius: 0%;">守序善良</var-button>
      </template>
    </var-menu>
  </div>
</template>

<script lang="ts" setup>
import { StyleProvider } from '@varlet/ui'
const piniaStore = usePiniaStore()
const setLight = (light: boolean) => {
  StyleProvider(light ? lightTheme : darkTheme)
  piniaStore.setpreferLight(light)
}

</script>

<style></style>