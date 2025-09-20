<template>
  <div class="register-container">
    <!-- 顶部黑色导航区域 -->
    <div class="top-section">
      <div class="top-left">
        <h1>PaperPurify</h1>
      </div>
      <div class="top-right">
        <div class="user-info">
          <el-avatar :size="40" src="" />
          <span class="username">ゲスト</span>
          <el-button link class="logout-btn" @click="goToLogin">ログインへ戻る</el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧品牌宣传区域 -->
      <div class="left-content">
        <h2>論文のAI成分を浄化し、学術を初心に戻す</h2>
        <p>AIの影がどこにも隠れられないようにし、オリジナルの光を輝かせよう。</p>
        <div class="brand-decoration">
          <el-icon :size="80"><Document /></el-icon>
        </div>
      </div>

      <!-- 右侧注册表单区域 -->
      <div class="right-content">
        <div class="register-form-container">
          <h3 class="form-title">新規登録</h3>

          <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
            <el-form-item prop="username">
              <el-input
                  v-model="registerForm.username"
                  type="text"
                  size="large"
                  auto-complete="off"
                  placeholder="アカウント"
              >
                <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                  v-model="registerForm.password"
                  type="password"
                  size="large"
                  auto-complete="off"
                  placeholder="パスワード"
                  @keyup.enter="handleRegister"
              >
                <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  size="large"
                  auto-complete="off"
                  placeholder="パスワード確認"
                  @keyup.enter="handleRegister"
              >
                <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="code" v-if="captchaEnabled">
              <el-input
                  size="large"
                  v-model="registerForm.code"
                  auto-complete="off"
                  placeholder="確認コード"
                  style="width: 63%"
                  @keyup.enter="handleRegister"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <div class="register-code">
                <img :src="codeUrl" @click="getCode" class="register-code-img"/>
              </div>
            </el-form-item>

            <el-form-item style="width:100%;">
              <el-button
                  :loading="loading"
                  size="large"
                  type="primary"
                  class="register-btn"
                  @click.prevent="handleRegister"
              >
                <span v-if="!loading">登録</span>
                <span v-else>登録中...</span>
              </el-button>

              <div class="login-link">
                <span>すでにアカウントをお持ちですか？</span>
                <router-link class="link-type" :to="'/login'">ログイン</router-link>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="el-register-footer">
      <span>Copyright © 2018-2025 sunny.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus"
import { getCodeImg, register } from "@/api/login"
import { Document } from '@element-plus/icons-vue'

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

function goToLogin() {
  router.push('/login')
}

getCode()
</script>

<style lang='scss' scoped>
.register-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部黑色区域 */
.top-section {
  background-color: #000;
  color: #fff;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-left h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 16px;
}

.logout-btn {
  color: #fff;
  margin-left: 15px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  background-color: #fff;
}

/* 左侧品牌宣传区域 */
.left-content {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-content h2 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.left-content p {
  font-size: 16px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.brand-decoration {
  text-align: center;
  margin-top: 40px;
}

/* 右侧注册表单区域 */
.right-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.register-form-container {
  width: 100%;
  max-width: 400px;
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.register-form {
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.register-btn {
  width: 100%;
  background-color: #000;
  border-color: #000;
  color: #fff;
  margin-top: 10px;
}

.register-btn:hover {
  background-color: #333;
  border-color: #333;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link .link-type {
  margin-left: 5px;
  color: #1890ff;
  text-decoration: none;
}

.login-link .link-type:hover {
  text-decoration: underline;
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

.el-register-footer {
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: #999;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  padding: 20px 0;
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .left-content {
    padding: 30px;
    text-align: center;
  }

  .right-content {
    padding: 20px;
  }
}
</style>