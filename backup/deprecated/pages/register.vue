<template>
  <div>
    <LoginDialog v-model:show="showLoginDialog"> </LoginDialog>

    <div class="register-chooser" v-if="!choosed">
      <div class="register-header">请选择注册方式</div>

      <var-space direction="column" size="large">
        <var-button
          @click="
            () => {
              choosed = true
              authMethod = 'telegram'
            }
          "
          block
          size="large"
        >
          <Icon name="i-line-md:telegram" size="large" />
          <div style="font-size: large; margin-left: 10px">Telegram</div>
        </var-button>
        <var-button
          @click="
            () => {
              choosed = true
              authMethod = 'email'
            }
          "
          block
          size="large"
        >
          <Icon name="i-line-md:email" size="large" />
          <div style="font-size: large; margin-left: 10px">Email</div>
        </var-button>
      </var-space>
    </div>

    <div class="register" v-if="choosed">
      <div class="register-header">注册</div>
      <var-form ref="form" class="form" :disabled="loggedIn" v-if="authMethod === 'telegram'">
        <var-space direction="column" size="24px">
          <var-input
            placeholder="用户名"
            :rules="[
              (v) => !!v || '用户名不能为空',
              (v) => v.length >= 4 || '用户名长度不能低于4位',
              (v) => /^[a-zA-Z0-9]+$/.test(v) || '用户名只能包含英文和数字'
            ]"
            variant="outlined"
            v-model="formData.username"
            :disabled="sentCode"
          />
          <var-input
            v-model="formData.telegramId"
            placeholder="Telegram ID"
            v-if="sentCode"
            variant="outlined"
            :rules="[
              (v) => !!v || 'Telegram ID不能为空',
              (v) => /^[0-9]+$/.test(v) || 'Telegram ID 只能包含数字'
            ]"
          />
          <var-input
            placeholder="密码"
            :rules="[(v) => !!v || '密码', (v) => v.length >= 6 || '密码长度不能低于6位']"
            variant="outlined"
            v-model="formData.password"
            v-if="sentCode"
            type="password"
          />
          <var-input
            v-model="formData.code"
            placeholder="验证码"
            v-if="sentCode"
            variant="outlined"
            :rules="[(v) => !!v || '验证码不能为空']"
          />
        </var-space>
      </var-form>

      <var-form ref="form" class="form" :disabled="loggedIn" v-if="authMethod === 'email'">
        <var-space direction="column" size="24px">
          <var-input
            placeholder="用户名"
            :rules="[
              (v) => !!v || '用户名不能为空',
              (v) => v.length >= 4 || '用户名长度不能低于4位',
              (v) => /^[a-zA-Z0-9]+$/.test(v) || '用户名只能包含英文和数字'
            ]"
            variant="outlined"
            v-model="formData.username"
            :disabled="sentCode"
          />

          <var-input
            v-model="formData.email"
            placeholder="Email"
            variant="outlined"
            :rules="[
              (v) => !!v || 'Email 不能为空',
              (v) =>
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'Email 格式不正确'
            ]"
            :disabled="sentCode"
          />

          <var-input
            placeholder="密码"
            :rules="[(v) => !!v || '密码', (v) => v.length >= 6 || '密码长度不能低于6位']"
            variant="outlined"
            v-model="formData.password"
            v-if="sentCode"
            type="password"
          />

          <var-input
            v-model="formData.code"
            placeholder="验证码"
            v-if="sentCode"
            variant="outlined"
            :rules="[(v) => !!v || '验证码不能为空']"
          />
        </var-space>
      </var-form>

      <var-space justify="space-between" align="center">
        <var-link @click="showLoginDialog = true" underline="hover" text-size="large"
          >登录已有账号</var-link
        >
        <var-link
          :href="deepLink"
          underline="hover"
          text-size="large"
          v-if="authMethod === 'telegram' && sentCode"
          target="_blank"
          >获取验证码</var-link
        >
        <var-button
          type="primary"
          size="large"
          @click="onRegister"
          v-if="sentCode"
          :disabled="requesting || loggedIn"
        >
          {{ requesting ? '注册中...' : '注册' }}
        </var-button>
        <var-button
          type="primary"
          size="large"
          @click="onSendCode"
          v-else
          :disabled="requesting || loggedIn"
        >
          {{ requesting ? '发送中...' : '发送验证码' }}
        </var-button>
      </var-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Form, Snackbar, Dialog } from '@varlet/ui'
const cookie = useCookie('TOKEN')
const loggedIn = computed(() => !!cookie.value)
const sentCode = ref(false)
const choosed = ref(false)
const authMethod = ref<'telegram' | 'email'>('telegram')

useHead({
  title: '注册'
})

onMounted(() => {
  if (loggedIn.value) {
    Dialog({
      title: '你已经登录了哦',
      onBeforeClose(action, done) {
        navigateTo('/')
        done()
      }
    })
  }
})

const formData = ref({
  username: '',
  password: '',
  code: '',
  telegramId: '',
  email: ''
})

const form = ref<Form>()
const showLoginDialog = ref(false)
const requesting = ref(false)

const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()
const deepLink = ref('')

const onSendCode = async () => {
  const valid = await form.value?.validate()
  if (valid) {
    requesting.value = true
    const resp = await $acgapi<SendCodeSuccessResponse>('/send_code', {
      method: 'POST',
      body: {
        username: formData.value.username,
        email: formData.value.email,
        auth_method: authMethod.value
      },
      onRequestError(error) {
        Snackbar.error({
          content: `请求失败: ${error.error.message}`,
          duration: 2500
        })
      },
      onResponseError({ response, options, error }) {
        if (response.status === 409) {
          Snackbar.error({
            content: '用户已存在',
            duration: 2500
          })
        } else if (response.status === 400) {
          Snackbar.error({
            content: '用户名非法',
            duration: 2500
          })
        } else {
          Snackbar.error({
            content: `注册失败: ${response.statusText}`,
            duration: 2500
          })
        }
      }
    }).finally(() => {
      setTimeout(() => {
        requesting.value = false
      }, 1000)
    })
    if (resp.status === 200) {
      sentCode.value = true
      if (authMethod.value === 'telegram') {
        Dialog({
          title: '验证码已生成',
          message: '请打开 Telegram 查看',
          cancelButton: false,
          onBeforeClose(action, done) {
            deepLink.value = `https://t.me/${config.public.botUsername}?start=code_${resp.data?.id}`
            open(deepLink.value)
            done()
          }
        })
      } else {
        Dialog({
          title: `验证码已发送到 ${formData.value.email}`,
          message: '请检查邮件, 如果没有收到, 请检查垃圾箱哦',
          cancelButton: false
        })
      }
    }
  }
}

interface RegisterSuccessResponse {
  status: number
  message: string
}

const onRegister = async () => {
  const valid = await form.value?.validate()
  if (valid) {
    requesting.value = true
    const resp = await $acgapi<RegisterSuccessResponse>('/register', {
      method: 'POST',
      body: {
        username: formData.value.username,
        password: formData.value.password,
        email: formData.value.email,
        code: formData.value.code,
        telegram_id: parseInt(formData.value.telegramId),
        auth_method: authMethod.value
      },
      onRequestError(error) {
        Snackbar.error({
          content: `请求失败: ${error.error.message}`,
          duration: 2500
        })
      },
      onResponseError({ response, options, error }) {
        if (response.status === 409) {
          Snackbar.error({
            content: '用户名已被注册',
            duration: 2500
          })
        } else if (response.status === 400) {
          Snackbar.error({
            content: '用户名非法',
            duration: 2500
          })
        } else {
          Snackbar.error({
            content: `注册失败: ${response.statusText}`,
            duration: 2500
          })
        }
      }
    }).finally(() => {
      setTimeout(() => {
        requesting.value = false
      }, 1000)
    })

    if (resp.status === 200) {
      Snackbar.success({
        content: `注册成功`,
        duration: 2500
      })
      try {
        const loginResp = await $acgapi<LoginSuccessResponse>('/login', {
          method: 'POST',
          body: {
            username: formData.value.username,
            password: formData.value.password
          }
        })
        if (loginResp) {
          const expireTime = new Date(loginResp.expire)
          const cookie = useCookie('TOKEN', { expires: expireTime })
          cookie.value = loginResp.token
          Snackbar.success({
            content: `欢迎 ${formData.value.username} ~`,
            duration: 2500
          })
          nuxtApp.runWithContext(() => {
            navigateTo('/')
          })
        }
      } catch (error) {
        Snackbar.error({
          content: `自动登录失败, 请手动登录一下哦`,
          duration: 2500
        })
      }
    }
  }
}
</script>

<style scoped>
.register-chooser {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 10vh;
}

.register {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 10vh;
}

.register-header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 3vh;
  text-align: center;
}

.form {
  margin-bottom: 3vh;
}
</style>
