<template>
  <el-row class="container">
    <el-col :span="8" class="left-bar">
      <div class="blank"></div>
      <div @click="backToSignin" class="logo">
        <img src="/img/logo.png" alt="" />
      </div>
    </el-col>
    <el-col :span="16" class="right-bar">
      <main class="login-box-content">
        <router-view></router-view>
      </main>
    </el-col>
  </el-row>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores'

const userStore = useUserStore()
const router = useRouter()

function backToSignin() {
  userStore.$reset()
  router.push('/')
}
</script>

<style scoped>
.blank {
  height: 50%;
}

.logo {
  display: flex;
  justify-content: left;
  cursor: pointer;
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

.login-box-content .main-body-div {
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

  .login-box-content .main-body-div {
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
