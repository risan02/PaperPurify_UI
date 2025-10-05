<template>
  <div class="register-container">
    <!-- 左侧区域 -->
    <div class="register-left">
      <div class="logo-container">

      </div>
      <div class="left-content">
        <h1>論文のAI成分を浄化し、学術を初心に戻す</h1>
        <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>
        <p>PaperPurify - 学術の純粋性を守る</p>
      </div>
    </div>

    <!-- 右侧注册区域 -->
    <div class="register-right">
      <div class="register-box">
        <h2 class="register-title">新規登録</h2>

        <el-form
            ref="registerRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
        >
          <el-form-item prop="username">
            <el-input
                v-model="registerForm.username"
                type="text"
                auto-complete="off"
                placeholder="アカウント"
                class="custom-input"
            >
              <template #prefix>
                <svg-icon icon-class="user" class="el-input__icon input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="registerForm.password"
                type="password"
                auto-complete="off"
                placeholder="パスワード"
                @keyup.enter="handleRegister"
                class="custom-input"
            >
              <template #prefix>
                <svg-icon icon-class="password" class="el-input__icon input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                auto-complete="off"
                placeholder="パスワード確認"
                @keyup.enter="handleRegister"
                class="custom-input"
            >
              <template #prefix>
                <svg-icon icon-class="password" class="el-input__icon input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input
                v-model="registerForm.code"
                auto-complete="off"
                placeholder="確認コード"
                style="width: 63%"
                @keyup.enter="handleRegister"
                class="custom-input"
            >
              <template #prefix>
                <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
              </template>
            </el-input>
            <div class="register-code">

            </div>
          </el-form-item>

          <el-form-item style="margin-top: 30px;">
            <el-button
                :loading="loading"
                type="primary"
                class="register-btn"
                @click.prevent="handleRegister"
            >
              <span v-if="!loading">登録</span>
              <span v-else>登録中...</span>
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="login-link">
              <span>すでにアカウントをお持ちですか？</span>
              <router-link class="link-type" :to="'/login'">ログイン</router-link>
            </div>
          </el-form-item>
        </el-form>

        <div class="register-footer">
          <span>利用規約</span>
          <span>プライバシーポリシー</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus"
import { getCodeImg, register } from "@/api/login"

const title = import.meta.env.VITE_APP_TITLE
const router = useRouter()
const { proxy } = getCurrentInstance()

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
})

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(true)

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true
      register(registerForm.value).then(res => {
        const username = registerForm.value.username
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push("/login")
        }).catch(() => {})
      }).catch(() => {
        loading.value = false
        if (captchaEnabled) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      registerForm.value.uuid = res.uuid
    }
  })
}

// 图片加载失败处理
const handleImageError = (e) => {
  console.error("图片加载失败，请检查路径");
  // 可以设置一个默认的文本LOGO
  e.target.style.display = 'none';
  e.target.parentElement.innerHTML = '<div class="logo-text">PaperPurify</div>';
}

getCode()
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  .register-left {
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

  .register-right {
    width: 40%;
    min-width: 500px;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;

    .register-box {
      width: 100%;
      max-width: 400px;
      padding: 0 20px;

      .register-title {
        color: #fff;
        font-size: 28px;
        margin-bottom: 40px;
        text-align: center;
      }

      .register-form {
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

        .register-btn {
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

        .login-link {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #999;

          .link-type {
            margin-left: 5px;
            color: #1890ff;
            text-decoration: none;
            font-weight: 500;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .register-footer {
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

.register-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
}

// 响应式设计
@media (max-width: 968px) {
  .register-container {
    flex-direction: column;

    .register-left {
      display: none;
    }

    .register-right {
      width: 100%;
      min-width: auto;
    }
  }
}
</style>