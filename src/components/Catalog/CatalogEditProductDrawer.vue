<template>
  <div>
    <el-form
      label-width="130px"
      label-position="top"
      ref="productForm"
      :rules="productRules"
      :model="productData"
      size="large"
    >
      <div class="form-scroll-item">
        <el-scrollbar height="100%">
          <div class="must-input-div">
            <el-form-item label="Category" prop="productCategory">
              <el-cascader v-model="productData.productCategory" :options="productOptions" />
            </el-form-item>
            <el-form-item label="Product id" prop="productId">
              <el-input type="text" v-model="productData.productId" clearable></el-input>
            </el-form-item>
            <el-form-item label="Name" prop="name">
              <el-input type="text" v-model="productData.name" clearable></el-input>
            </el-form-item>
            <!-- <el-form-item label="Stock" prop="stock">
          <el-input type="text" v-model="productData.stock" clearable></el-input>
        </el-form-item> -->
            <el-form-item label="Unit" prop="unitId">
              <el-select v-model="productData.unitId" placeholder="Unit" class="width100">
                <el-option
                  v-for="item in UOMData.tableData"
                  :key="item.uid"
                  :label="item.code"
                  :value="item.uom"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Currency" prop="currency">
              <el-input type="text" v-model="productData.currency" clearable></el-input>
            </el-form-item>
            <el-form-item label="Price" prop="price">
              <el-input type="text" v-model="productData.price" clearable></el-input>
            </el-form-item>
            <el-form-item label="Tax" prop="tax">
              <el-input type="text" v-model="productData.tax" clearable></el-input>
            </el-form-item>
            <el-form-item label="Minimum order Quantity" prop="minOrderQuantity">
              <el-input type="text" v-model="productData.minOrderQuantity" clearable></el-input>
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input type="textarea" v-model="productData.description" clearable></el-input>
            </el-form-item>
            <el-form-item label="Images" prop="fileList">
              <el-upload
                ref="imgUploader"
                v-model:file-list="productData.fileList"
                method="put"
                :action="imgUploadUrl"
                list-type="picture-card"
                :on-preview="handlePictureCardPreview"
                :auto-upload="false"
                :http-request="uploadImg"
                :limit="2"
                :on-success="handleUploadSuccess"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </div>
        </el-scrollbar>
      </div>
    </el-form>
    <div class="button-div">
      <div v-loading="isCreatingProduct">
        <el-button type="primary" @click="updateProduct" class="input-button" round size="large"
          >UPDATE PRODUCT
        </el-button>
      </div>
    </div>

    <el-dialog
      @click="picPreviewdialogVisible = false"
      class="custom-dialog"
      style="--el-bg-color: transparent; --el-box-shadow: 0px"
      top="5vh"
      v-model="picPreviewdialogVisible"
      :show-close="false"
    >
      <img :src="dialogImageUrl" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCatalogStore } from '../../stores'
import { cloneDeep } from 'lodash'
import newAxios from 'axios'
import { ElMessage } from 'element-plus'
import productAPI from '@/api/product'
import uploadAPI from '@/api/upload'
// import { cloneDeep } from 'lodash';
const emit = defineEmits(['UPDATE_PRODUCTS_LIST', 'CLOSE_CATALOG_EDIT_PRODUCT_DRAWER'])
const imgUploadUrl = ref('')
const imgUploader = ref()
const catalogStore = useCatalogStore()
const props = defineProps(['uid', 'tableData', 'UOMData'])
const productRules = ref({
  productId: [
    {
      required: true,
      message: 'please input product id',
      trigger: 'blur'
    }
  ],
  name: [
    {
      required: true,
      message: 'please input product name',
      trigger: 'blur'
    }
  ],
  unitId: [
    {
      required: true,
      message: 'please input unitId',
      trigger: 'blur'
    }
  ],
  currency: [
    {
      required: true,
      message: 'please input currency',
      trigger: 'blur'
    }
  ]
})
let productData = ref({})
const productOptions = ref([])
const picPreviewdialogVisible = ref(false)
const dialogImageUrl = ref('')
const isCreatingProduct = ref(false)
const productForm = ref()

function handlePictureCardPreview(uploadFile) {
  dialogImageUrl.value = uploadFile.url
  picPreviewdialogVisible.value = true
}

async function uploadImg(res) {
  // let length = 0
  // for (let i = 0; i < productData.value.fileList.length; i++) {
  //   if (productData.value.fileList[i].status !== 'success') {
  //     length++
  //   }
  // }
  let file = res.file
  console.log(file)
  let config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  try {
    ElMessage({
      message: 'Upload the images..',
      type: 'info'
    })
    for (let i = 0; i < productData.value.fileList.length; i++) {
      if (file.name === productData.value.fileList[i].name) {
        let newResult = await newAxios.put(productData.value.fileList[i].pushUrl, file, config)
        console.log(newResult)
        break
      }
    }
  } catch (error) {
    ElMessage({
      message: error,
      type: 'error'
    })
    console.log(error)
  }
}

async function handleUploadSuccess() {
  emit('UPDATE_PRODUCTS_LIST')
  emit('CLOSE_CATALOG_EDIT_PRODUCT_DRAWER')
  productForm.value.resetFields()
  productData.value.imgKeyList = []
  isCreatingProduct.value = false
}

function updateProduct() {
  //first validate form
  productForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      //if there are pictures need to be uploaded, get upload url and keys
      let length = 0
      for (let i = 0; i < productData.value.fileList.length; i++) {
        if (productData.value.fileList[i].status !== 'success') {
          length++
        }
      }
      if (length !== 0) {
        await getUploadProductImgInfo(length)
      } else {
        let newImgKeyList = []
        for (let i = 0; i < productData.value.fileList.length; i++) {
          for (let j = 0; j < productData.value.imgKeyList.length; j++) {
            if (productData.value.imgKeyList[j] === productData.value.fileList[i].name) {
              newImgKeyList.push(productData.value.imgKeyList[j])
              break
            }
          }
        }
        productData.value.imgKeyList = newImgKeyList
        console.log(`NEW image key list:${newImgKeyList}`)
      }
      isCreatingProduct.value = true
      let result = await productAPI.updateProduct(
        productData.value.productCategory[productData.value.productCategory.length - 1] === '0'
          ? '00'
          : productData.value.productCategory[productData.value.productCategory.length - 1],

        productData.value.name,
        productData.value.currency,
        productData.value.description,
        productData.value.price,
        productData.value.tax,
        productData.value.stock,
        productData.value.minOrderQuantity,
        productData.value.unitId,
        productData.value.imgKeyList,
        productData.value.productId,
        props.uid
      )
      console.log(result)
      if (result.data.apiStatus === 'ok') {
        let data = result.data
        ElMessage({
          message: data.pkg.msg,
          type: 'success'
        })

        if (length !== 0) {
          submitPicture()
        } else {
          handleUploadSuccess()
        }
      }
    } catch (error) {
      isCreatingProduct.value = false
      console.log(error)
      ElMessage({
        message: error.response.data.pkg.msg || error,
        type: 'error'
      })
    }
  })
}

function submitPicture() {
  console.log('start submit........')
  isCreatingProduct.value = true
  imgUploader.value.submit()
}

async function getUploadProductImgInfo(num) {
  isCreatingProduct.value = true
  ElMessage({
    message: 'Get upload image info..',
    type: 'info'
  })

  //  let newImgKeyList = []
  let oldImgKeyList = cloneDeep(productData.value.imgKeyList)
  productData.value.imgKeyList = []

  let result = await uploadAPI.getUploadProductImgInfo(num)
  if (result.data.apiStatus === 'ok') {
    let data = result.data
    for (let i = 0; i < data.pkg.urls.length; i++) {
      for (let j = 0; j < productData.value.fileList.length; j++) {
        if (productData.value.fileList[j].status !== 'success') {
          productData.value.imgKeyList.push(data.pkg.urls[i].keyName)
          productData.value.fileList[j].pushUrl = data.pkg.urls[i].putPresignedUrl
          break
        } else {
          productData.value.imgKeyList.push(oldImgKeyList[j])
        }
      }
    }
  }
  console.log(productData.value.imgKeyList)
}

onMounted(() => {
  let fileList = []
  console.log(props.tableData)
  productData.value = cloneDeep(props.tableData)
  productData.value.productCategory = productData.value.category1Cid
  for (let i = 0; i < productData.value.imageUrls.length; i++) {
    let data = {
      name: productData.value.images[i],
      url: productData.value.imageUrls[i]
    }
    fileList.push(data)
  }
  productData.value.fileList = fileList
  productData.value.imgKeyList = productData.value.images
  console.log(`imgKeyList: ${productData.value.imgKeyList}`)
  productOptions.value = catalogStore.cascaderOptions
})
</script>

<style scoped>
.must-input-div {
  border-radius: 10px;
  margin: 10px;
  margin-right: 15px;
  padding: 30px;
  box-shadow: var(--el-box-shadow-light);
}

.select-input-div {
  border-radius: 10px;
  margin: 10px;
  margin-top: 25px;
  margin-right: 15px;
  padding: 30px;
  box-shadow: var(--el-box-shadow-light);
}

.form-scroll-item {
  height: calc(100vh - 200px);
}

.button-div {
  display: flex;
  margin-top: 20px;
  justify-content: flex-end;
  padding: 10px;
}

.input-button {
  box-shadow: var(--el-box-shadow-dark);
  font-size: 16px;
}
</style>
