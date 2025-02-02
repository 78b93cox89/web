<template>
  <div>
    <ClientOnly>
      <login-dialog v-model:show="showLoginDialog" />
      <search-dialog v-model:show="showSearchDialog" />

      <var-app-bar title-position="center" :fixed="true" :placeholder="true">
        <var-link text-color="#fff" underline="none" text-size="large" to="/">ManyACG</var-link>
        <template #left>
          <var-button color="transparent" text-color="#fff" text @click="showPopup = true" title="菜单">
            <var-icon name="menu" size="24" />
          </var-button>
          <var-button text color="transparent" @click="showSearchDialog = true" title="搜索">
            <Icon name="i-line-md:search" size="24" />
          </var-button>
        </template>
        <template #right>
          <var-button text color="transparent" @click="handleRSSClick" title="RSS">
            <Icon name="i-line-md:rss" size="24" />
          </var-button>
          <color-change-menu />
        </template>
      </var-app-bar>

      <var-popup position="left" v-model:show="showPopup" :lock-scroll="false">
        <div class="popup-content">
          <var-space>
            <div id="close-popup-button">
              <var-button text @click="showPopup = false" color="transparent" title="close">
                <var-icon name="menu" size="24" />
              </var-button>
            </div>
            <div id="popup-top-text">
              <NuxtLink to="/" @click="showPopup = false">
                <var-link underline="none" text-size="large">ManyACG</var-link>
              </NuxtLink>
            </div>
          </var-space>

          <var-divider />

          <var-space direction="column" size="large">
            <popup-menu-item icon-name="i-mdi:account-circle" text="登录" @click="showLoginDialog = true"
              v-if="!loggedIn" />
            <popup-menu-item icon-name="i-mdi:account-circle" text="账号设定" @click="showPopup = false" to="/profile"
              v-if="loggedIn" />
            <popup-menu-item icon-name="i-mdi:fire" to="/random" @click="showPopup = false" text="随便看看" />
            <popup-menu-item icon-name="i-mdi:information-outline" to="/about" @click="showPopup = false" text="关于" />
          </var-space>

          <div style="position: absolute; bottom: 0; width: 100%; margin-bottom: 20px;">
            <var-divider>
              <div style="text-align: center; margin: 0 16px 8px;">
                <var-tooltip content="申请友联请联系 link@manyacg.top" placement="right-end">
                  友情链接
                </var-tooltip>
              </div>
            </var-divider>

            <div class="divider-vertical-container">
              <var-link underline="none" :href="`https://t.me/moreacg`" target="_blank"
                :text-color="linkColors.telegram">
                TG频道
              </var-link>
              <var-divider vertical />
              <var-link underline="none" :href="`https://krau.top`" target="_blank" :text-color="linkColors.blog">
                Blog
              </var-link>
              <var-divider vertical />
              <var-link underline="none" :href="`https://www.someacg.top`" target="_blank"
                :text-color="linkColors.someacg">
                SomeACG
              </var-link>
              <var-divider vertical />
              <var-link underline="none" :href="`https://www.moely.link/`" target="_blank"
                :text-color="linkColors.moely">
                萌哩
              </var-link>
            </div>
          </div>
        </div>
      </var-popup>
    </ClientOnly>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const showPopup = ref(false)
const cookie = useCookie('TOKEN')
const showLoginDialog = ref(false)
const showSearchDialog = ref(false)
const loggedIn = computed(() => !!cookie.value)

const store = usePiniaStore()
const linkColors = computed(() => {
  if (store.preferLight) {
    return {
      telegram: '#2c6aa3',
      blog: '#347985',
      someacg: '#5a4e41',
      moely: '#f724b9',
    }
  } else {
    return {
      telegram: '#7db7ff',
      blog: '#39c5bb',
      someacg: '#f3dcbd',
      moely: '#f724b9',
    }
  }
})

const handleRSSClick = () => {
  navigateTo('/atom.xml', {
    external: true,
    open: {
      target: '_blank'
    }
  })
}
</script>

<style scoped>
.popup-content {
  width: 300px;
}

.divider-vertical-container {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  gap: 8px;
  flex-wrap: wrap;
}

#close-popup-button {
  margin: 8px;
}

#popup-top-text {
  margin-top: 8px;
  font-size: 24px;
}
</style>
