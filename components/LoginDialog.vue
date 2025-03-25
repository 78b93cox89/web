<template>
  <div>
    <var-dialog
      title="登录"
      v-model:show="show"
      @before-close="beforeClose"
      :lock-scroll="false"
      :close-on-click-overlay="false"
    >
      <var-form ref="form">
        <var-input
          v-model="formData.identifier"
          placeholder="用户名/邮箱/telegram id"
          :rules="[(v) => !!v || '请输入用户名/邮箱/telegram id']"
        />
        <var-input
          v-model="formData.password"
          placeholder="密码"
          type="password"
          :rules="[(v) => !!v || '密码不能为空', (v) => v.length >= 6 || '密码不能低于6位']"
        />
      </var-form>
      <var-chip type="warning" block v-if="showIncorrect">
        {{ errorText }}
      </var-chip>

      <template #title>
        <var-space justify="space-between">
          <div>登录</div>
          <var-link type="info" underline="hover" href="/register"> 去注册 </var-link>
        </var-space>
      </template>
    </var-dialog>
  </div>
</template>

<script lang="ts" setup>
import { Form, type DialogActions, Snackbar } from '@varlet/ui'

const show = defineModel('show', { type: Boolean })

const formData = reactive({
  identifier: '',
  password: ''
})

const form = ref<Form>()
const showIncorrect = ref(false)
const errorText = ref('用户名或密码错误')

const beforeClose = async (action: DialogActions, done: () => any) => {
  if (action === 'confirm') {
    const valid = await form.value?.validate()
    if (valid) {
      Snackbar.loading({
        content: '请稍等'
      })
      const resp = await $acgapi<LoginSuccessResponse>('/login', {
        headers: {
          Authorization: `Bearer ${useCookie('TOKEN').value}`
        },
        method: 'POST',
        body: {
          username: formData.identifier,
          telegram_id: parseInt(formData.identifier),
          email: IsEmail(formData.identifier) ? formData.identifier : '',
          password: formData.password
        },
        onResponseError({ response, options, error }) {
          showIncorrect.value = true
          if (response.status === 401) {
            errorText.value = '用户名或密码错误'
          } else {
            errorText.value = `登录失败: ${response.statusText}`
          }
          setTimeout(() => {
            Snackbar.clear()
          }, 500)
        }
      })
      if (resp.token) {
        const expireTime = new Date(resp.expire)
        const cookie = useCookie('TOKEN', { expires: expireTime })
        cookie.value = resp.token
        const profile = await $acgapi<ProfileResponse>('/user/profile', {
          headers: {
            Authorization: `Bearer ${resp.token}`
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
        if (profile.data) {
          Snackbar({
            content: `欢迎回来, ${profile.data.username} ~`
          })
          usePiniaStore().setR18(profile.data.settings.r18)
        }
        if (import.meta.client) {
          window.location.reload()
        }
        done()
      }
    }
    return
  }
  done()
}
</script>

<style></style>
