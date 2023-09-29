<template>
  <!-- <div>
    <h1 style="font-size: 70px; text-align: center">CATALOG</h1>
    <h2>The quieter you become, the more you are able to hear</h2>
  </div> -->
  <div class="main-padding">
    <div class="main-header">
      <h1 class="title">CATALOG</h1>
      <el-divider />
    </div>
    <div class="main-main">
      <div class="functions-bar">
        <span class="left-functions">
          <el-input
            class="search-input"
            v-model="searchWord"
            size="large"
            placeholder="Search"
            suffix-icon="Search"
            @input="searchWordInput"
            clearable
          >
          </el-input>

          <el-cascader
            v-model="searchCategory"
            :options="searchCategoriesOptions"
            collapse-tags
            clearable
            size="large"
            class="search-cascader"
            @change="searchCategoryChange"
          />

          <!-- <el-select class="select-input" v-model="value" placeholder="Status" size="large">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select> -->

          <!-- <el-switch v-model="editMode" size="large" active-text="Edit mode" /> -->
        </span>
        <div class="right-functions">
          <!-- <el-button @click="createCategoryDialog" type="primary" round>CREATE CATEGORY</el-button> -->
          <el-button @click="openCatalogAddProductDrawer" type="primary" round
            >ADD PRODUCT</el-button
          >
          <el-dropdown @command="handleCommand" class="settings-dropdown" trigger="click">
            <!-- <span class="el-dropdown-link">
              <el-icon><MoreFilled /></el-icon>
            </span> -->
            <el-button :icon="MoreFilled" circle class="more-filled-button"></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="UOM Setting"> UOM Setting </el-dropdown-item>
                <el-dropdown-item divided command="Currency Setting">
                  Currency Setting
                </el-dropdown-item>
                <el-dropdown-item divided command="Category Setting"
                  >Category Setting</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="table-area">
        <div ref="scrollDiv" class="scroll-div">
          <el-scrollbar>
            <el-table
              class="products-table"
              v-loading="isTableLoading"
              :height="tableHeight"
              ref="catalogTable"
              :data="productsTable"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column>
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <!-- <img :src="scope.row.images[0]" /> -->
                    <img :src="imgUrl(scope)" class="table-img" />
                    <!-- <span style="margin-left: 10px">{{ scope.row.createdAt }}</span> -->
                  </div>
                </template>
              </el-table-column>
              <el-table-column property="productId" label="ID" />
              <el-table-column property="name" label="Name" />
              <el-table-column property="price" label="Price" />
              <el-table-column property="tax" label="Tax" />
              <el-table-column property="currency" label="Currency" />
              <el-table-column property="unitId" label="Unit" />
              <!-- <el-table-column property="stock" label="Stock" /> -->
              <el-table-column property="minOrderQuantity" label="MOQ" />
              <el-table-column property="category" label="Category" />

              <el-table-column property="description" label="Description" />

              <el-table-column>
                <template #default="scope">
                  <div class="buttons-group">
                    <el-button
                      @click="openEditProductDrawer(scope)"
                      class="delete-button"
                      type="primary"
                      :icon="Edit"
                      text
                    />
                    <el-button
                      class="delete-button"
                      @click="deleteProduct(scope)"
                      type="danger"
                      :icon="Delete"
                      text
                    />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>

        <div class="page-area">
          <el-pagination
            @current-change="handlePageChange"
            v-model:current-page="currentPage"
            layout="prev, pager, next"
            :total="totalCount"
          />
        </div>
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

    <el-dialog v-model="createCategoryDialogVisible" width="35%" title="Create category">
      <el-form
        label-width="130px"
        label-position="right"
        ref="categoryForm"
        :rules="categoryRules"
        :model="categoryData"
      >
        <el-form-item label="Category" prop="createdCategory">
          <el-cascader
            v-model="categoryData.createdCategory"
            :options="categoryOptions"
            :props="masterCascaderProps"
            collapse-tags
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            type="primary"
            v-loading.fullscreen.lock="fullscreenLoading"
            @click="createCatelog"
          >
            Create
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      :before-close="handleUOMSettingClose"
      v-model="UOMsettingDialogVisible"
      title="UOM Setting"
    >
      <div class="dialog-table">
        <el-form ref="UOMForm" :model="UOMData" class="UOMform" :inline-message="true">
          <el-table v-loading="UOMLoading" :data="UOMData.tableData" style="line-height: 50px">
            <el-table-column prop="code" label="Code">
              <template #default="scope">
                <el-form-item
                  :ref="setCodeRef"
                  :prop="'tableData.' + scope.$index + '.code'"
                  required
                >
                  <el-input
                    pladceholder="code"
                    class="input-font"
                    style="text-align: center; --el-input-border-color: #ffffff00"
                    v-model="scope.row.code"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="uom" label="Unit of Measure">
              <template #default="scope">
                <el-form-item
                  :ref="setUnitRef"
                  :prop="'tableData.' + scope.$index + '.uom'"
                  required
                >
                  <el-input
                    pladceholder="unit"
                    style="box-shadow: none; text-align: center; --el-input-border-color: #ffffff00"
                    v-model="scope.row.uom"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column fixed="right" width="120">
              <template #default="scope">
                <div class="table-functions">
                  <el-button
                    link
                    type="primary"
                    class="save-icon"
                    size="small"
                    @click="handleSave(scope.$index, scope.row)"
                  >
                    <el-icon> <Check /></el-icon>
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    class="delete-icon"
                    size="small"
                    @click="handleDelete(scope.$index, scope.row)"
                    ><el-icon><Close /></el-icon
                  ></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="success" @click="addNewUnit">Add </el-button>
          <el-button type="primary" @click="handleUOMSettingClose">Close </el-button>
        </span>
      </template>
    </el-dialog>
    <el-drawer
      :destroy-on-close="true"
      direction="rtl"
      size="550"
      style="border-radius: 30px; margin: 10px 15px 20px 15px; height: calc(100% - 20px)"
      v-model="catalogAddProductDrawerVisible"
    >
      <template #header>
        <h1>ADD PRODUCT</h1>
        <!-- <h1>Order from {{ customerName }} - {{ orderUid }}</h1> -->
      </template>
      <CatalogAddProductDrawer
        :UOMData="UOMData"
        @UPDATE_PRODUCTS_LIST="handleAddedNewProduct"
        @CLOSE_CATALOG_ADD_PRODUCT_DRAWER="closeDrawer"
      ></CatalogAddProductDrawer>
    </el-drawer>
    <el-drawer
      :destroy-on-close="true"
      direction="rtl"
      size="550"
      style="border-radius: 30px; margin: 10px 15px 20px 15px; height: calc(100% - 20px)"
      v-model="catalogEditProductDrawerVisible"
    >
      <template #header>
        <h1>EDIT PRODUCT {{ editProductName }} - {{ editProductId }}</h1>
        <!-- <h1>Order from {{ customerName }} - {{ orderUid }}</h1> -->
      </template>
      <CatalogEditProductDrawer
        @UPDATE_PRODUCTS_LIST="handleAddedNewProduct"
        @CLOSE_CATALOG_EDIT_PRODUCT_DRAWER="closeDrawer"
        :UOMData="UOMData"
        :tableData="editProductData"
        :uid="editProductUid"
      ></CatalogEditProductDrawer>
    </el-drawer>
  </div>
</template>

<script setup>
import { Delete, MoreFilled, Edit } from '@element-plus/icons-vue'
import { onMounted, reactive, computed } from 'vue'
import productAPI from '@/api/product'
import catalogAPI from '@/api/catalog'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import unitAPI from '@/api/unit'
import CatalogAddProductDrawer from '../../components/Catalog/CatalogAddProductDrawer.vue'
import CatalogEditProductDrawer from '../../components/Catalog/CatalogEditProductDrawer.vue'
import { useRouter, useRoute } from 'vue-router'
import { debounce, cloneDeep } from 'lodash'

const router = useRouter()
const route = useRoute()
const addNewUOMFlag = ref(false)
const UOMLoading = ref(false)
const UOMForm = ref()
const UOMsettingDialogVisible = ref(false)
const scrollDiv = ref(null)
const tableHeight = computed(() => {
  return scrollDiv.value ? scrollDiv.value.offsetHeight : 0
})

const dialogImageUrl = ref('')
const picPreviewdialogVisible = ref(false)
const categoryForm = ref()
const createCategoryDialogVisible = ref(false)
const fullscreenLoading = ref(false)
const catalogStore = useCatalogStore()
const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1)
const totalCount = ref(0)
const isTableLoading = ref(true)
const searchWord = ref(route.query.searchWord ? route.query.searchWord : '')
const searchCategory = ref(route.query.category ? route.query.category : null)
const searchCategoriesOptions = computed(() => {
  let options = cloneDeep(catalogStore.cascaderOptions)
  options.unshift({ label: 'All categories', value: null })
  return options
})

let categoryOptions = catalogStore.masterCategoryOptions
const masterCascaderProps = { multiple: true }
const categoryData = reactive({
  createdCategory: '',
  name: '',
  description: ''
})

const UOMData = reactive({
  tableData: []
})

const categoryRules = ref({
  createdCategory: [
    {
      required: true,
      message: 'please select category',
      trigger: 'change'
    }
  ]
})

const productsTable = ref([])
const codeRefs = ref([])
const unitRefs = ref([])
const catalogAddProductDrawerVisible = ref(false)
const catalogEditProductDrawerVisible = ref(false)
const editProductUid = ref('')
const editProductName = ref('')
const editProductId = ref('')
const editProductData = ref({})

onMounted(() => {
  getCategory()
  getUnits()
  getSpecialOrdersList(true)
})

function openEditProductDrawer(scope) {
  editProductUid.value = scope.row.uid
  editProductName.value = scope.row.name
  editProductId.value = scope.row.productId
  editProductData.value = scope.row
  catalogEditProductDrawerVisible.value = true
}

function handleAddedNewProduct() {
  getCategory()
  getSpecialOrdersList()
}

async function getUnits() {
  try {
    UOMLoading.value = true
    let result = await unitAPI.getUnit()
    if (result.data.apiStatus === 'ok') {
      let data = result.data.pkg
      UOMData.tableData = data.results
      UOMLoading.value = false
      addNewUOMFlag.value = false
    }
    console.log(result)
  } catch (error) {
    UOMLoading.value = false
    console.log(error)
  }
}

async function getProducts(name, description, category1Cid, page) {
  try {
    isTableLoading.value = true
    let result = await productAPI.getProducts(name, description, category1Cid, page)
    if (result.status === 200) {
      let data = result.data.pkg
      productsTable.value = data.results
      for (let i = 0; i < productsTable.value.length; i++) {
        productsTable.value[i].category =
          catalogStore.masterCategoryHashTable[productsTable.value[i].category1Cid]
      }
      totalCount.value = data.totalCount
      currentPage.value = data.page
    }
    isTableLoading.value = false
    console.log(result)
  } catch (error) {
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Get products failed',
      type: 'error'
    })
  }
}

function handlePageChange() {
  getSpecialOrdersList(true)
}

function closeDrawer() {
  catalogAddProductDrawerVisible.value = false
  catalogEditProductDrawerVisible.value = false
}
// function createProductDialog() {
//   productOptions.value = catalogStore.cascaderOptions
//   createProductDialogVisible.value = true
// }

function openCatalogAddProductDrawer() {
  console.log('test')
  catalogAddProductDrawerVisible.value = true
}

function imgUrl(scope) {
  return scope.row.imageUrls.length !== 0
    ? scope.row.imageUrls[0]
    : 'https://placehold.jp/50x50.png'
}

function createCatelog() {
  categoryForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      fullscreenLoading.value = true
      let sendCategory = []
      let unit = {}
      let level1Unit = {}
      let level1Hash = {}
      let hasLevel1 = true
      for (let i = 0; i < categoryData.createdCategory.length; i++) {
        if (!level1Hash[categoryData.createdCategory[i][0]]) {
          level1Hash[categoryData.createdCategory[i][0]] = true
          hasLevel1 = false
        }
        if (!hasLevel1) {
          level1Unit = {
            cid: categoryData.createdCategory[i][0],
            cname: catalogStore.masterCategoryHashTable[categoryData.createdCategory[i][0]]
          }
          sendCategory.push(level1Unit)
          hasLevel1 = true
        }
        unit = {
          cid: categoryData.createdCategory[i][1],
          cname: catalogStore.masterCategoryHashTable[categoryData.createdCategory[i][1]]
        }
        sendCategory.push(unit)
      }

      let result = await catalogAPI.createCategory(
        catalogStore.catalogUid,
        null,
        null,
        sendCategory
      )

      await getCategory()
      if (result.data.apiStatus === 'ok') {
        let data = result.data
        ElMessage({
          message: data.pkg.msg,
          type: 'success'
        })
      }
      console.log(result)
      categoryForm.value.resetFields()
      createCategoryDialogVisible.value = false
      fullscreenLoading.value = false
    } catch (error) {
      console.log(error)
      ElMessage({
        message: error.response.data.pkg ? error.response.data.pkg.msg : error.message,
        type: 'error'
      })
      fullscreenLoading.value = false
    }
  })
}

function createCategoryDialog() {
  createCategoryDialogVisible.value = true
}

async function getCategory() {
  let result = await catalogAPI.getCategory(catalogStore.catalogUid)
  console.log(result)
  let data = result.data
  if (data.apiStatus !== 'ok') {
    return
  }
  catalogStore.category1 = data.pkg.details.categories
}

function handleCommand(command) {
  switch (command) {
    case 'UOM Setting':
      getUnits()
      addNewUOMFlag.value = false
      UOMsettingDialogVisible.value = true
      break
    case 'Currency Setting':
      break
    case 'Category Setting':
      createCategoryDialog()
      break
  }
}

function setCodeRef(el) {
  if (el) {
    codeRefs.value.push(el)
  }
}
function setUnitRef(el) {
  if (el) {
    unitRefs.value.push(el)
  }
}

async function deleteProduct(scope) {
  try {
    isTableLoading.value = true
    await productAPI.deleteProduct(scope.row.uid)
    ElMessage({
      message: 'Deleted successfully',
      type: 'success'
    })
    await getProducts()
    isTableLoading.value = false
  } catch (error) {
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Delete failed',
      type: 'error'
    })
    console.log(error)
    isTableLoading.value = false
  }
}

async function handleSave(index, row) {
  UOMForm.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      let result
      UOMLoading.value = true
      if (row.uid) {
        result = await unitAPI.updateUnit(row.code, row.uom, row.uid)
      } else {
        result = await unitAPI.createUnit(row.code, row.uom)
      }
      if (result.data.apiStatus === 'ok') {
        await getUnits()
        UOMLoading.value = false
        addNewUOMFlag.value = false
      }
      console.log(result)
    } catch (error) {
      console.log(error)
    }
    console.log(`tableData[${index}].code`)
  })
}

async function handleDelete(index, row) {
  try {
    if (!row.uid) {
      UOMData.tableData.splice(index, 1)
      addNewUOMFlag.value = false
      return
    }
    UOMLoading.value = true
    let result = await unitAPI.deleteUnit(row.uid)
    if (result.data.apiStatus === 'ok') {
      await getUnits()
      UOMLoading.value = false
    }
    console.log(result)
  } catch (error) {
    console.log(error)
  }
  console.log(`tableData[${index}].code`)
}

function addNewUnit() {
  let data = { code: '', uom: '' }
  if (addNewUOMFlag.value) {
    ElMessage({
      message: 'please save or delete the setting you add',
      type: 'warning'
    })
    return
  }
  UOMData.tableData.push(data)
  addNewUOMFlag.value = true
}

function handleUOMSettingClose() {
  for (let i = 0; i < UOMData.tableData.length; i++) {
    if (!UOMData.tableData[i].uid) {
      UOMData.tableData.splice(i, 1)
    }
  }
  UOMsettingDialogVisible.value = false
}

const searchWordInput = debounce(async () => {
  getSpecialOrdersList()
}, 800)

async function searchCategoryChange() {
  getSpecialOrdersList()
}

function getSpecialOrdersList(isPageChangeOrOnMounted) {
  let query = {
    searchWord: searchWord.value.trim(),
    category: searchCategory.value,
    page: isPageChangeOrOnMounted ? currentPage.value : 1
  }
  router.push({ query: query })
  getProducts(
    searchWord.value.trim(),
    null,
    searchCategory.value ? searchCategory.value[searchCategory.value.length - 1] : null,
    isPageChangeOrOnMounted ? currentPage.value : 1,
    null
  )
}
</script>

<style scoped>
.functions-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 0px;
}

.search-input {
  --el-input-border-color: #ffffff00;
  width: 220px;
  margin-right: 10px;
}

.select-input {
  --el-border-color: #ffffff00;
  width: 170px;
  margin-right: 10px;
}

.left-functions {
  display: flex;
  justify-content: space-between;
}

.skeleton-padding {
  padding: 30px 0px 0px 60px;
}
.skeleton-center {
  display: flex;
  align-items: center;
  justify-items: space-between;
}

.skeleton-img {
  width: 50px;
  height: 50px;
}

.skeleton-p-column {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
}

.table-area {
  height: calc(100% - 60px);
}

.page-area {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0px;
}

.scroll-div {
  height: calc(100% - 52px);
}

/* .table-page-div{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
} */

.table-img {
  width: 50px;
  height: 50px;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}

.right-functions :nth-child(1),
.right-functions:nth-child(2) {
  display: flex;
  align-items: center;
}

.settings-dropdown {
  margin: 0px 30px 0px 20px;
}

.indent {
  text-indent: 10px;
}

.dialog-table {
  display: flex;
  justify-content: center;
}

.save-icon {
  color: green;
}

.delete-icon {
  color: red;
}

.UOMform {
  width: 80%;
}

.table-functions {
  display: flex;
  justify-content: flex-end;
}

.UOMform .el-form-item {
  margin-bottom: 0px;
}

.delete-button {
  font-size: 18px;
  margin: 0px;
}

:deep(.el-drawer__header) {
  margin-bottom: 0px;
}

:deep(.search-cascader .el-input__wrapper) {
  --el-input-border-color: #dcdfe600;
}

.more-filled-button {
  border-color: #ffffff00;
}

.products-table {
  --el-table-row-hover-bg-color: #f5f7fa00;
}

.buttons-group {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
