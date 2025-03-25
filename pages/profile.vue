<template>
  <div>
    <div class="profile">
      <var-paper :elevation="2" class="card-container">
        <var-cell
          ripple
          border-offset="0"
          :border="true"
          class="paper-cell"
          :title="userProfile?.data.username"
        >
          <template #icon>
            <var-icon name="account-circle" size="36" style="margin-right: 24px" />
          </template>
        </var-cell>

        <var-cell ripple border-offset="0" :border="true" class="paper-cell" title="邮箱">
          <template #icon>
            <var-icon name="email-outline" size="36" style="margin-right: 24px" />
          </template>
          <template #description>
            {{ userProfile?.data.email || '未设置' }}
          </template>
        </var-cell>

        <var-cell ripple border-offset="0" :border="true" class="paper-cell" title="Telegram">
          <template #icon>
            <Icon name="i-mdi:telegram" size="36" style="margin-right: 24px" />
          </template>
          <template #description>
            {{ userProfile?.data.telegram_id || '未设置' }}
          </template>
        </var-cell>

        <var-cell
          ripple
          border-offset="0"
          :border="true"
          class="paper-cell"
          title="涩涩"
          @click="toggleR18"
        >
          <template #icon>
            <Icon name="i-ic:round-18-up-rating" size="36" style="margin-right: 24px" />
          </template>
          <template #extra>
            <var-switch v-model="enabledR18" variant />
          </template>
        </var-cell>

        <var-cell
          ripple
          border-offset="0"
          :border="true"
          class="paper-cell"
          title="登出账号"
          @click="logout"
        >
          <template #icon>
            <var-icon name="power" size="36" style="margin-right: 24px" />
          </template>
        </var-cell>
      </var-paper>
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({
  title: '账号设定'
})
const piniaStore = usePiniaStore()

const userProfile = ref<ProfileResponse>()
const enabledR18 = ref(userProfile.value?.data.settings.r18)
const cookie = useCookie('TOKEN')

onMounted(async () => {
  const resp = await $acgapi<ProfileResponse>('/user/profile', {
    headers: {
      Authorization: `Bearer ${useCookie('TOKEN').value}`
    },
    onResponseError({ request, response, options }) {
      Snackbar.error({
        content: `请求失败: ${response.statusText || response.status}`
      })
    },
    onRequestError({ request, options, error }) {
      Snackbar.error({
        content: `请求失败: ${error.message}`
      })
    }
  })
  if (resp) {
    userProfile.value = resp
    enabledR18.value = userProfile.value.data.settings.r18
  }
})

const switchingR18 = ref(false)

const toggleR18 = async () => {
  switchingR18.value = true
  const resp = await $acgapi<UpdateSettingsResponse>('/user/settings', {
    headers: {
      Authorization: `Bearer ${useCookie('TOKEN').value}`
    },
    method: 'PUT',
    body: {
      r18: !userProfile.value!.data.settings.r18,
      theme: userProfile.value!.data.settings.theme || '',
      language: userProfile.value!.data.settings.language || ''
    },
    onResponseError({ response, options, error }) {
      Snackbar.error({
        content: `请求失败: ${response.statusText || response.status}`
      })
    },
    onRequestError({ request, options, error }) {
      Snackbar.error({
        content: `请求失败: ${error.message}`
      })
    }
  }).finally(() => {
    switchingR18.value = false
  })
  if (resp) {
    userProfile.value!.data.settings = resp.data
    enabledR18.value = userProfile.value!.data.settings.r18
    piniaStore.setR18(resp.data.r18)
  }
}

const logout = async () => {
  cookie.value = null
  piniaStore.setR18(false)
  Snackbar({
    content: '已登出'
  })

  await $acgapi('/logout', {
    headers: {
      Authorization: `Bearer ${useCookie('TOKEN').value}`
    },
    method: 'POST'
  })

  useNuxtApp().runWithContext(() => {
    navigateTo('/')
  })

  if (import.meta.client) {
    window.location.href = '/'
  }
}
</script>

<style scoped>
.profile {
  margin: 0 auto;
  max-width: 800px;
}

@media (max-width: 768px) {
  .profile {
    margin: 0 16px;
  }
}

.card-container {
  margin-top: 16px;
}

.paper-cell {
  --cell-font-size: large;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.paper-cell:hover {
  background-color: rgba(192, 238, 240, 0.3);
}
</style>
