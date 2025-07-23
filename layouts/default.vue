<template>
  <div>
    <search-dialog v-model:show="showSearchDialog" />

    <var-app-bar title-position="center" :fixed="true" :placeholder="true">
      <var-link text-color="#fff" underline="none" text-size="large" to="/">ManyACG</var-link>
      <template #left>
        <var-button
          color="transparent"
          text-color="#fff"
          text
          @click="showPopup = true"
          title="菜单"
        >
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
        <!-- <color-change-menu /> -->
        <var-button text color="transparent" @click="handleChangeTheme" title="切换主题">
          <Icon :name="themeIcon" size="24" />
        </var-button>
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
          <template v-for="item in menuItems" :key="item.text">
            <popup-menu-item
              :icon-name="item.iconName"
              :text="item.text"
              :to="item.to"
              @click="item.onClick ? item.onClick() : (showPopup = false)"
            />
          </template>
        </var-space>

        <div style="position: absolute; bottom: 0; width: 100%; margin-bottom: 20px">
          <var-divider>
            <div style="text-align: center; margin: 0 16px 8px">
              <var-tooltip content="申请友联请联系 link@manyacg.top" placement="right-end">
                友情链接
              </var-tooltip>
            </div>
          </var-divider>
          <div class="divider-vertical-container">
            <template v-for="(link, index) in friendLinks" :key="link.href">
              <var-divider v-if="index > 0 && !link.hideDivider" vertical />
              <var-link underline="none" :href="link.href" target="_blank" :text-color="link.color">
                {{ link.text }}
              </var-link>
            </template>
          </div>
        </div>
      </div>
    </var-popup>

    <slot />

    <FabButton v-if="showFabButton" />
  </div>
</template>

<script lang="ts" setup>
import type { MyIPResponse } from '~/types/artwork'

const toggleR18 = () => {
  const piniaStore = usePiniaStore()
  piniaStore.setR18(!piniaStore.r18)
  showPopup.value = false
  if (import.meta.client) {
    window.location.reload()
  }
}

const isNotCN = ref<boolean>(false)

onMounted(async () => {
  const ipResp = await $acgapi<MyIPResponse>('/myip')
  isNotCN.value = (ipResp && ipResp.country !== 'CN') || false
  if (!isNotCN.value) {
    const piniaStore = usePiniaStore()
    piniaStore.setR18(false)
  }
})

const r18StatusIcon = computed(() => {
  const piniaStore = usePiniaStore()
  return piniaStore.r18 ? 'i-mdi:check-circle' : 'i-mdi:close-circle'
})

const showFabButton = computed(() => {
  return !useSmallWindow().value
})

const showPopup = ref(false)
const showSearchDialog = ref(false)

const linkColors = useLinkColors()

const handleRSSClick = () => {
  navigateTo('/atom.xml', {
    external: true,
    open: {
      target: '_blank'
    }
  })
}

const handleChangeTheme = () => {
  const piniaStore = usePiniaStore()
  const currentTheme = piniaStore.preferLight
  StyleProvider(currentTheme ? darkTheme : lightTheme)
  piniaStore.setpreferLight(!currentTheme)
}

const friendLinks = computed(() => [
  {
    href: 'https://t.me/moreacg',
    text: '频道',
    color: linkColors.value.telegram
  },
  {
    href: 'https://krau.top',
    text: 'Blog',
    color: linkColors.value.blog
  },
  {
    href: 'https://www.someacg.top',
    text: 'SomeACG',
    color: linkColors.value.someacg
  },
  {
    href: 'https://www.moely.link/',
    text: '萌哩',
    color: linkColors.value.moely
  },
  {
    href: 'https://pic.cosine.ren/',
    text: 'Cosine 🎨 Gallery',
    color: linkColors.value.cosine,
    hideDivider: true
  },
  {
    href: 'https://www.chooiin.com',
    text: '初音导航',
    color: undefined
  }
])

const menuItems = computed(() => [
  {
    iconName: 'i-mdi:fire',
    text: '随便看看',
    to: '/random'
  },
  {
    iconName: 'i-mdi:information-outline',
    text: '关于',
    to: '/about'
  },
  ...(isNotCN.value
    ? [
        {
          iconName: r18StatusIcon.value,
          text: 'R18',
          to: '',
          onClick: toggleR18
        }
      ]
    : [])
])

const themeIcon = computed(() => {
  const piniaStore = usePiniaStore()
  return !piniaStore.preferLight ? 'i-line-md:sunny-filled' : 'i-line-md:moon-filled'
})
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
