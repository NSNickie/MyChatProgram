<template>
  <div class="main-body-div">
    <div class="title">We've sent a code to {{ emailShow }}</div>
    <div class="desc">Please enter the 6-digit code to verify your account.</div>
    <el-form
      ref="verifyForm"
      :rules="rules"
      :model="form"
      class="form"
      label-width="80px"
      label-position="top"
      size="large"
    >
      <el-form-item label="Code" prop="code">
        <el-input type="text" v-model="form.code" clearable></el-input>
      </el-form-item>

      <div class="robot-verify"></div>
      <div class="footer signup">
        <div>
          <el-button
            v-loading.fullscreen.lock="fullscreenLoading"
            @click="verifyAccount()"
            round
            class="signin-button"
            size="large"
            type="primary"
            >Verify account</el-button
          >
        </div>
        <div class="signup-div">
          Didn’t receive a code?
          <a class="pointer" @click="resendEmail"> Resend email</a>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import userAPI from '@/api/user.js'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
let email = useRoute().params.email
let emailShow = computed(() => {
  let atIndex = email.indexOf('@')
  if (atIndex === -1) {
    return email
  }
  let str1 = email.substring(0, atIndex)
  let str2 = email.substring(atIndex + 1)
  return str1[0] + '*'.repeat(3) + '@' + (str2[0] + '*'.repeat(3))
})
let fullscreenLoading = ref(false)
let verifyForm = ref()
let form = reactive({
  code: ''
})
let rules = ref({
  code: [
    {
      message: 'please enter the code',
      trigger: ['blur'],
      required: true
    }
  ]
})

function verifyAccount() {
  verifyForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      fullscreenLoading.value = true
      let result = await userAPI.signUpConfirm(email, form.code)
      console.log(result)
      let data = result.data
      if (data.apiStatus === 'ok') {
        ElMessage({
          message: data.pkg.msg,
          type: 'success'
        })
        router.push('/signin')
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
      console.log(error)
      ElMessage({
        message: error.response.data.pkg.msg,
        type: 'error'
      })
    }
  })
}

async function resendEmail() {
  try {
    fullscreenLoading.value = true
    let result = await userAPI.resendVerificationCode(email)
    console.log(result)
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
  text-align: right !important;
}

.forgot-password-div a {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
}

.signup {
  margin-top: 70px;
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
.form-flex-class {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.email-input-width {
  width: 85%;
}

.pointer {
  cursor: pointer;
}
</style>
