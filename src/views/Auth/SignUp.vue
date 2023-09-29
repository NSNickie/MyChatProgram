<template>
  <div class="main-body-div">
    <div class="title">Sign Up</div>
    <div class="desc">welcome to taab-supplier!</div>
    <el-form
      ref="SignUpForm"
      :rules="rules"
      :model="form"
      class="form"
      label-width="100px"
      label-position="right"
      size="large"
    >
      <el-form-item label="First Name" prop="firstName">
        <el-input type="text" v-model="form.firstName" clearable></el-input>
      </el-form-item>
      <el-form-item label="Last Name" prop="lastName">
        <el-input type="text" v-model="form.lastName" clearable></el-input>
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input type="email" v-model="form.email" clearable> </el-input>
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input type="password" v-model="form.password" clearable show-password></el-input>
      </el-form-item>

      <div class="robot-verify"></div>
      <div class="footer signup">
        <div>
          <el-button
            v-loading.fullscreen.lock="fullscreenLoading"
            @click="signUp"
            round
            class="signin-button"
            size="large"
            type="primary"
            >Sign up</el-button
          >
          <div class="center">
            By signing up, you agree to Taab’s updated
            <a href="">Terms of Service</a>
            and
            <a href="">Privacy Policy</a>
          </div>
        </div>
        <div class="signup-div">
          Already have an account?
          <router-link to="/signin"> Sign In</router-link>
        </div>
        <!-- <el-button type="primary" @click="goVerifyTest()">goVerifyTest</el-button> -->
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import userAPI from '@/api/user.js'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
let fullscreenLoading = ref(false)
let SignUpForm = ref()
let form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})
let rules = ref({
  firstName: [
    {
      message: 'please enter first name',
      trigger: 'blur'
    }
  ],
  lastName: [
    {
      message: 'please enter last name',
      trigger: 'blur'
    }
  ],
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
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!%*?&~+._-])[a-zA-Z\d@#!%*?&~+._-]{8,20}$/,
      message: 'please input legal password',
      trigger: ['change', 'blur']
    }
  ]
})

function signUp() {
  SignUpForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      fullscreenLoading.value = true
      let result = await userAPI.signUp(form.email, form.password, form.firstName, form.lastName)
      console.log(result)
      let data = result.data
      if (data.apiStatus === 'ok') {
        ElMessage({
          message: data.pkg.msg,
          type: 'success'
        })
        router.push(`/verifycode/${form.email}`)
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

// function goVerifyTest(){
//     router.push(`/verifycode/${form.email}`)
// }
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
.form-flex-class {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.email-input-width {
  width: 85%;
}
</style>
