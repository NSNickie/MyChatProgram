<template>
  <div class="main-body-div">
    <div class="title">Sign in</div>
    <div class="desc">welcome to taab-supplier!</div>
    <el-form
      ref="loginForm"
      :rules="rules"
      :model="form"
      class="form"
      label-width="120px"
      label-position="top"
      size="large"
    >
      <el-form-item label="Email" prop="email">
        <el-input type="email" v-model="form.email" clearable></el-input>
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input show-password type="password" v-model="form.password" clearable></el-input>
      </el-form-item>
      <div class="forgot-password-div">
        <!-- <el-checkbox class="remember-checkbox" v-model="userStore.isRememberMe" label="Remember me" /> -->
        <a class="pointer" @click="forgotPasswordDialog = true">Forgot password?</a>
      </div>
      <div class="robot-verify"></div>
      <div class="footer signup">
        <div>
          <el-button
            v-loading.body.lock="fullscreenLoading"
            @click="signIn"
            round
            class="signin-button"
            size="large"
            type="primary"
            >Sign in</el-button
          >
          <div class="center">
            By signing in, you agree to Taab’s updated
            <a href="">Terms of Service</a>
            and
            <a href="">Privacy Policy</a>
          </div>
        </div>
        <div class="signup-div">
          Need an account?
          <router-link to="/signup"> Sign up </router-link>
        </div>
      </div>
    </el-form>
  </div>
  <el-dialog v-model="forgotPasswordDialog" title="Forgot password" width="30%">
    <span>
      Enter your email associated with your account and we’ll send an email with instructions to
      reset your password.
    </span>
    <el-form
      ref="forgetForm"
      :rules="forgetRules"
      :model="forgetFormData"
      label-width="120px"
      label-position="top"
      @submit.prevent
    >
      <el-form-item label="Email Address" prop="email">
        <el-input
          type="email"
          v-model="forgetFormData.email"
          @keyup.enter="sendInstructions"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="sendInstructions"> Send instructions </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    v-model="setNewPasswordDialog"
    title="Set new password"
    width="30%"
    :close-on-click-modal="false"
  >
    <span> Please enter the 6-digit code sent to {{ forgetFormData.email }} </span>
    <el-form
      ref="setNewPasswordForm"
      :rules="setNewPasswordRules"
      :model="setNewPasswordFormData"
      label-width="120px"
      label-position="top"
    >
      <el-form-item label="Code" prop="code">
        <el-input type="text" v-model="setNewPasswordFormData.code"></el-input>
      </el-form-item>
      <span> Your new password must be different from your previously used passwords. </span>
      <el-form-item label="New password" prop="password">
        <el-input
          type="password"
          v-model="setNewPasswordFormData.password"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item label="Confirm new password" prop="passwordConfirm">
        <el-input
          type="password"
          v-model="setNewPasswordFormData.passwordConfirm"
          show-password
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="resetPassword"> Change password </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import userAPI from '@/api/user.js'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { useCatalogStore } from '@/stores/catalog'
import catalogAPI from '@/api/catalog'
import dayjs from 'dayjs'
// const { proxy } = getCurrentInstance()

// console.log(dayjs().isBefore(dayjs(dayjs().format()).subtract(3600,'minute')))
const catalogStore = useCatalogStore()
const userStore = useUserStore()
let setNewPasswordDialog = ref(false)
let forgotPasswordDialog = ref(false)
let fullscreenLoading = ref(false)
let setNewPasswordForm = ref()
let loginForm = ref()
let forgetForm = ref()
let forgetFormData = reactive({
  email: ''
})
let setNewPasswordFormData = reactive({
  code: '',
  password: '',
  passwordConfirm: ''
})
let form = reactive({
  email: '',
  password: ''
})
let rules = ref({
  email: [
    {
      type: 'email',
      message: 'please enter correct email',
      trigger: ['blur'],
      required: true
    }
  ],
  password: [
    {
      required: true,
      message: 'please enter password',
      trigger: 'blur'
    }
  ]
})
let forgetRules = ref({
  email: [
    {
      type: 'email',
      message: 'please enter correct email',
      trigger: ['blur'],
      required: true
    }
  ]
})
let sameValidator = (rule, value, callback) => {
  if (value !== setNewPasswordFormData.password) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}
let setNewPasswordRules = ref({
  code: [
    {
      message: 'please enter the code',
      trigger: ['blur'],
      required: true
    }
  ],
  password: [
    {
      required: true,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!%*?&~+._-])[a-zA-Z\d@#!%*?&~+._-]{8,20}$/,
      message: 'please input legal password',
      trigger: ['change', 'blur']
    }
  ],
  passwordConfirm: [
    {
      required: true,
      message: 'please enter password',
      trigger: 'blur'
    },
    { validator: sameValidator, trigger: 'blur' }
  ]
})


function signIn() {
  loginForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      fullscreenLoading.value = true

      let result = await userAPI.login(form.email, form.password)
      let data = result.data
      if (data.apiStatus === 'ok') {
        ElMessage({
          message: data.pkg.msg || 'Login success..',
          type: 'success'
        })
        userStore.token = data.pkg.AccessToken
        userStore.uid = data.pkg.uid
        userStore.supplierUid = data.pkg.supplierUid
        userStore.avatar = data.pkg.avatar
        userStore.supplierAvatar = data.pkg.supplierAvatar
        userStore.firstName = data.pkg.firstName
        userStore.lastName = data.pkg.lastName
        userStore.businessName = data.pkg.businessName
        userStore.refreshToken=data.pkg.RefreshToken
        userStore.loginAt=dayjs().format()
        userStore.tokenExpiresIn=data.pkg.ExpiresIn
        catalogStore.catalogUid = data.pkg.catalogUid
        // await getCatalogs()
        // await getCategory()
        if (!data.pkg.supplierUid) {
          router.push('/searchbusiness')
        } else {
          // await getWebSocketUrl()
          await getMasterCatalog()
          // connectWebSocketUrl()
          router.push('/home')
        }
      }
      fullscreenLoading.value = false
    } catch (error) {
      fullscreenLoading.value = false
      console.log(error)
      ElMessage({
        message: error.response.data.pkg.msg || error,
        type: 'error'
      })
      if (error.response.data.pkg.errorType === 'UserNotConfirmedException') {
        router.push(`/verifycode/${form.email}`)
      }
    }
  })
  return false
}

// async function getCatalogs() {
//   let result = await catalogAPI.getCatalogs(userStore.supplierUid)
//   let data = result.data
//   if (data.apiStatus !== 'ok') {
//     throw new Error()
//   }
//   ElMessage({
//     message: 'Get catalogs successfully',
//     type: 'success'
//   })
//   catalogStore.catalogs = data.pkg.catalogs
// }

// async function getCategory() {
//   let result = await catalogAPI.getCategory(catalogStore.catalogs[0].uid)
//   console.log(result)
//   let data = result.data
//   if (data.apiStatus !== 'ok') {
//     throw new Error()
//   }
//   ElMessage({
//     message:'Get category successfully',
//     type: 'success'
//   })
//   catalogStore.category1 = data.pkg.details.categories
// }

// function connectWebSocketUrl() {
//   console.log(proxy)
//   if (proxy === null) return
//   proxy.$connect(chatStore.websocketUrl)
// }

async function getMasterCatalog() {
  let result = await catalogAPI.getMasterCategory()
  console.log(result)
  let data = result.data
  if (data.apiStatus !== 'ok') {
    throw new Error()
  }
  ElMessage({
    message: 'Get master category successfully',
    type: 'success'
  })
  catalogStore.masterCategory = data.pkg.result
  catalogStore.masterCategoryHashTable = catalogStore.masterCategoryHash
  catalogStore.masterCategoryOptions = catalogStore.masterCascaderCategoryOptions
}

function sendInstructions() {
  forgetForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      forgotPasswordDialog.value = false
      fullscreenLoading.value = true
      let result = await userAPI.forgetPassword(forgetFormData.email)
      let data = result.data
      if (data.apiStatus === 'ok') {
        ElMessage({
          message: "We've sent instructions to reset your password.",
          type: 'success'
        })
        setNewPasswordDialog.value = true
      } else {
        ElMessage({
          message: data.pkg.msg,
          type: 'warning'
        })
      }
      fullscreenLoading.value = false

      console.log(result)
    } catch (error) {
      fullscreenLoading.value = false
      ElMessage({
        message: error.response.data.pkg.msg,
        type: 'error'
      })
    }
  })
}

function resetPassword() {
  setNewPasswordForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      setNewPasswordDialog.value = false
      fullscreenLoading.value = true
      let result = await userAPI.confirmForgotPassword(
        forgetFormData.email,
        setNewPasswordFormData.password,
        setNewPasswordFormData.code
      )
      let data = result.data
      if (data.apiStatus === 'ok') {
        ElMessage({
          message: data.pkg.msg,
          type: 'success'
        })
      } else {
        ElMessage({
          message: data.pkg.msg,
          type: 'warning'
        })
      }
      fullscreenLoading.value = false
      console.log(result)
    } catch (error) {
      console.log(error)
      fullscreenLoading.value = false
      ElMessage({
        message: error.response.data.pkg.msg,
        type: 'error'
      })
    }
  })
}
</script>

<style scoped>
.blank {
  height: 50%;
}

.logo {
  display: flex;
  justify-content: left;
}

/* .left-bar {
  background-color: cadetblue;
} */

.left-bar .logo img {
  width: 80%;
  max-width: 308px;
}

.right-bar {
  padding: 40px 50px 0px;
}

.login-box-content {
  background-color: #fff;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  box-shadow: 1px 1px 8px rgb(0 0 0 / 25%);
  /* height: 100%; */
}

.main-body-div {
  width: 100%;
  max-width: 800px;
  min-height: calc(100vh - 40px);
  margin: 0 auto;
  padding: 0 50px;
  font-size: 14px;
}

.main-body-div .title {
  font-style: normal;
  font-weight: 400;
  font-size: 30px;
  line-height: 41px;
  text-align: center;
  color: #363430;
  padding-top: 32px;
}

.main-body-div .desc {
  margin-top: 30px;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #363430;
}

.social-buttons {
  margin-top: 20px;
  text-align: center;
}

.google {
  display: inline-block;
  margin: 5px;
}

.google img {
  height: 45px;
}

.form {
  margin: 100px 0 15px;
}

.forgot-password-div {
  display: flex;
  justify-content: right;
  align-items: center;
}



.forgot-password-div a {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
}

.signup {
  margin-top: 50px;
}

.footer {
  text-align: center;
}

.signin-button {
  margin-bottom: 30px;
  font-style: normal;
  font-size: 18px;
  line-height: 45px;
  height: 45px;
  width: 293px;
  font-weight: 600;
}

.center a {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
}

.center {
  text-align: center;
  font-size: 14px;
  max-width: 293px;
  margin: 0 auto;
}

.signup-div {
  margin-top: 20px;
  text-align: center;
  font-style: normal;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  color: #363430;
  padding-bottom: 20px;
}

.signup-div a {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
}

@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  .right-bar {
    flex: 8;
    position: relative;
    max-width: 100%;
    padding: 20px 16px 0px 16px;
  }

  .main-body-div {
    padding: 0 20px;
  }
  .left-bar {
    flex: 1;
    min-height: auto;
  }
  .blank {
    display: none;
  }

  .form {
    margin: 30px 0 15px;
  }
}
</style>
