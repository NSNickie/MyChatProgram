<template>
  <div class="main-body-div">
    <div class="title">Let's register your business.</div>
    <div class="desc">welcome to taab-supplier!</div>
    <el-form
      :inline="true"
      ref="RegisterForm"
      :rules="rules"
      :model="form"
      class="form"
      label-width="80px"
      label-position="top"
      size="large"
    >
      <el-form-item label="Business Name" prop="businessName" class="default-input">
        <el-input
          type="text"
          v-model="form.businessName"
          clearable
          class="default-input"
        ></el-input>
      </el-form-item>
      <el-form-item label="Business street address" prop="street" class="default-input">
        <el-input type="text" v-model="form.street" clearable class="default-input"></el-input>
      </el-form-item>
      <el-row class="default-input">
        <el-col :span="10">
          <el-form-item label="City" prop="city">
            <el-input type="text" v-model="form.city" clearable class="default-input"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="State" prop="state">
            <!-- <el-input
                    type="text"
                    v-model="form.state"
                    clearable
                    class="default-input"
                  ></el-input> -->

            <el-select v-model="form.state" placeholder="Select" class="state-input">
              <el-option
                v-for="item in states"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Zip code" prop="zipCode">
            <el-input type="text" v-model="form.zipCode" clearable class="default-input"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Business phone number" prop="phone" class="default-input">
        <el-input type="text" v-model="form.phone" clearable class="default-input"></el-input>
      </el-form-item>
    </el-form>
    <div class="robot-verify"></div>
    <div class="footer signup">
      <div>
        <el-button
          v-loading.fullscreen.lock="fullscreenLoading"
          @click="registerSupplier"
          round
          class="signin-button"
          size="large"
          type="primary"
          >Register</el-button
        >
        <!-- <div class="center">
                By signing up, you agree to Taab’s updated
                <a href="">Terms of Service</a>
                and
                <a href="">Privacy Policy</a>
              </div> -->
      </div>
      <!-- <div class="signup-div">
              Already have an account?
              <router-link to="/signin"> Sign In</router-link>
            </div> -->
      <!-- <el-button type="primary" @click="goVerifyTest()">goVerifyTest</el-button> -->
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import orgAPI from '@/api/org.js'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCatalogStore } from '../../stores/catalog'
import catalogAPI from '@/api/catalog'
// import { ElMessageBox } from 'element-plus'

const catalogStore = useCatalogStore()
const userStore = useUserStore()
const states = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
]

const router = useRouter()
let fullscreenLoading = ref(false)
let RegisterForm = ref()
let form = reactive({
  businessName: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  phone: ''
})
let rules = ref({
  businessName: [
    {
      required: true,
      message: 'please enter business name',
      trigger: 'blur'
    }
  ],
  street: [
    {
      required: true,
      message: 'please enter business street address',
      trigger: 'blur'
    }
  ],
  city: [
    {
      required: true,
      message: 'please enter city',
      trigger: ['blur']
    }
  ],
  state: [
    {
      required: true,
      trigger: ['blur'],
      message: 'please input state'
    }
  ],
  zipCode: [
    {
      required: true,
      trigger: ['blur'],
      message: 'please input zip code'
    }
  ],
  phone: [
    {
      required: true,
      trigger: ['blur'],
      message: 'please input phone number'
    }
  ]
})

function registerSupplier() {
  RegisterForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      fullscreenLoading.value = true
      // let firstSearchresult = await orgAPI.getSupplier(
      //   form.businessName,
      //   form.street,
      //   form.state,
      //   form.city,
      //   form.zipCode,
      //   form.phone
      // )
      // if (firstSearchresult.data.pkg.results.length !== 0) {
      //   try {
      //     fullscreenLoading.value = false
      //     await ElMessageBox.confirm(
      //       'There is already an existing supplier group. Do you want to join?',
      //       'Supplier exist',
      //       {
      //         confirmButtonText: 'Yes, I do',
      //         cancelButtonText: "No, I don't",
      //         type: 'info'
      //       }
      //     )
      //     fullscreenLoading.value = true
      //     let bindResult = await orgAPI.bindSupplier(
      //       firstSearchresult.data.pkg.results[0].supplierUid
      //     )
      //     if (bindResult.data.apiStatus === 'ok') {
      //       ElMessage({
      //         message: 'bind success',
      //         type: 'success'
      //       })
      //       userStore.supplierUid = firstSearchresult.data.pkg.results[0].supplierUid
      //       userStore.businessName = firstSearchresult.data.pkg.results[0].businessName
      //       userStore.supplierAvatarUrl = firstSearchresult.data.pkg.results[0].supplierAvatarUrl
      //       let catalogResult = await catalogAPI.getCatalogs(userStore.supplierUid)
      //       catalogStore.catalogUid = catalogResult.data.pkg.catalogs[0].uid
      //       await getMasterCatalog()
      //       router.push('/home')
      //       return
      //     }
      //   } catch (error) {
      //     if (error === 'cancel') {
      //       fullscreenLoading.value = false
      //       return
      //     } else {
      //       throw error
      //     }
      //   }
      // }

      let createResult = await orgAPI.createSupplier(
        form.businessName,
        form.street,
        form.state,
        form.city,
        form.zipCode,
        form.phone
      )
      let data = createResult.data
      let uid = createResult.data.pkg.supplierUid
      if (data.apiStatus === 'ok') {
        ElMessage({
          message: data.pkg.msg,
          type: 'success'
        })
        let searchResult = await orgAPI.getSupplierDetails(uid)
        userStore.supplierUid = searchResult.data.pkg.details.supplierUid
        userStore.businessName = searchResult.data.pkg.details.businessName
        userStore.supplierAvatarUrl = searchResult.data.pkg.details.supplierAvatarUrl
        let catalogResult = await catalogAPI.getCatalogs(userStore.supplierUid)
        catalogStore.catalogUid = catalogResult.data.pkg.catalogs[0].uid
        // await getCatalogs()
        await getMasterCatalog()
        router.push('/home')
      }
      fullscreenLoading.value = false
    } catch (error) {
      console.log(error)
      fullscreenLoading.value = false
      let msg = error.response.data.pkg ? error.response.data.pkg.msg : error.response.data.message
      msg = msg ? msg : error
      ElMessage({
        message: msg,
        type: 'error'
      })
      switch (error.response.data.pkg.errorType) {
        case 'ALREADY_HAVE_SUPPLIER':
          router.push('/home')
          break
        default:
          console.log(error)
      }
    }
  })
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
  margin: 50px 0 15px;
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

.city-input {
  margin-right: 0px;
}

.state-input {
  width: 100%;
}

.zip-input {
  margin-right: 0px;
}

.default-input {
  width: 100%;
}

.el-input {
  width: 100%;
}

.el-form {
  --el-form-inline-content-width: 100%;
}

.el-form--inline .el-form-item {
  margin-right: 10px;
}
</style>
