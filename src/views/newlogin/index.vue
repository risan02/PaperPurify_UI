<template>
  <div class="login-container">
    <!-- 左侧区域 -->
    <div class="login-left">
      <div class="logo-container">
        <!-- 使用相对路径引用图片 -->
        <img src="@/assets/logo/logo_japan.png" alt="Logo" class="logo-img" @error="handleImageError">
      </div>
      <div class="left-content">
        <h1>{{ $t('aiAnalysis.title') }}</h1>
        <p>{{ $t('aiAnalysis.description') }}</p>
        <p>PaperPurify - {{ $t('common.info') }}</p>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-right">
      <div class="language-switcher-wrapper">
        <LanguageSwitcher />
      </div>
      <div class="login-box">
        <h2 class="login-title">{{ $t('login.title') }}</h2>

        <el-form
            ref="loginRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
        >
          <el-form-item prop="username">
            <el-input
                v-model="loginForm.username"
                type="text"
                auto-complete="off"
                :placeholder="$t('login.usernamePlaceholder')"
                class="custom-input"
            >
              <template #prefix>
                <svg-icon icon-class="user" class="el-input__icon input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="loginForm.password"
                type="password"
                auto-complete="off"
                :placeholder="$t('login.passwordPlaceholder')"
                @keyup.enter="handleLogin"
                class="custom-input"
            >
              <template #prefix>
                <svg-icon icon-class="password" class="el-input__icon input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item style="margin-top: 30px;">
            <el-button
                :loading="loading"
                type="primary"
                class="login-btn"
                @click.prevent="handleLogin"
            >
              <span v-if="!loading">{{ $t('login.loginButton') }}</span>
              <span v-else>{{ $t('login.loggingIn') }}</span>
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button class="register-btn" @click.prevent="handleRegister">
              {{ $t('login.registerButton') }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>{{ $t('common.termsOfService') }}</span>
          <span>{{ $t('common.privacyPolicy') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const { t } = useI18n()
const title = import.meta.env.VITE_APP_TITLE
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
})

// 使用computed使验证规则支持动态翻译
const loginRules = computed(() => ({
  username: [{ required: true, trigger: "blur", message: t('login.usernameRequired') }],
  password: [{ required: true, trigger: "blur", message: t('login.passwordRequired') }]
}))

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关 - 根据UI设计隐藏
const captchaEnabled = ref(false)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)

// 图片加载失败处理
const handleImageError = (e) => {
  console.error("图片加载失败，请检查路径");
  // 可以设置一个默认的文本LOGO
  e.target.style.display = 'none';
  e.target.parentElement.innerHTML = '<div class="logo-text">LOGO</div>';
}

watch(route, (newRoute) => {
  redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }

      // 确保不发送验证码相关字段
      const loginData = {
        username: loginForm.value.username,
        password: loginForm.value.password,
        rememberMe: loginForm.value.rememberMe
      }

      // 调用action的登录方法
      userStore.login(loginData).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function handleRegister() {
  router.push('/register')
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  .login-left {
    flex: 1;
    background-color: #ffffff;
    padding: 40px;
    position: relative;

    .logo-container {
      position: absolute;
      top: 60px;
      left: 60px;

      .logo-img {
        height: 60px; /* 根据实际图片尺寸调整 */
        width: auto;
      }

      .logo-text {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
    }

    .left-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 10%;

      h1 {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #333;
      }

      p {
        font-size: 18px;
        color: #666;
        margin-bottom: 10px;
      }
    }
  }

  .login-right {
    width: 40%;
    min-width: 500px;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .language-switcher-wrapper {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 10;
    }

    .login-box {
      width: 100%;
      max-width: 400px;
      padding: 0 20px;

      .login-title {
        color: #fff;
        font-size: 28px;
        margin-bottom: 40px;
        text-align: center;
      }

      .login-form {
        :deep(.custom-input) {
          .el-input__wrapper {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: none;
            padding: 0 15px;
            height: 50px;

            &.is-focus {
              box-shadow: 0 0 0 1px #409EFF inset;
            }
          }

          .el-input__inner {
            color: #333;
            height: 50px;
            font-size: 16px;

            &::placeholder {
              color: #999;
            }
          }

          .el-input__prefix {
            color: #999;
            display: flex;
            align-items: center;
            margin-right: 10px;
          }
        }

        .login-btn {
          width: 100%;
          height: 50px;
          background-color: #1890ff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          margin-top: 10px;

          &:hover {
            background-color: #40a9ff;
          }
        }

        .register-btn {
          width: 100%;
          height: 50px;
          background-color: transparent;
          border: 1px solid #d9d9d9;
          color: #fff;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;

          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: #fff;
          }
        }
      }

      .login-footer {
        margin-top: 60px;
        text-align: center;

        span {
          color: #999;
          font-size: 12px;
          cursor: pointer;
          margin: 0 10px;

          &:hover {
            color: #fff;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 968px) {
  .login-container {
    flex-direction: column;

    .login-left {
      display: none;
    }

    .login-right {
      width: 100%;
      min-width: auto;

      .language-switcher-wrapper {
        top: 15px;
        right: 15px;
      }
    }
  }
}
</style>