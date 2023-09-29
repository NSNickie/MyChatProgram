<template>
  <div class="add-content">
    <div class="add-main">
      <div class="add-header-functions">
        <el-input
          class="search-input"
          v-model="searchWord"
          size="large"
          placeholder="Search"
          suffix-icon="Search"
          @input="searchProduct"
        >
        </el-input>
        <el-select
          class="select-input"
          v-model="selectCategory"
          placeholder="Category"
          size="large"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="add-main-table-content">
        <div class="table-div">
          <el-table
            ref="tableRef"
            v-loading="isTableLoading"
            class="add-table"
            empty-text="No Products"
            :data="productsData"
            stripe
            style="width: 100%"
            height="100%"
            @selection-change="handleAddProductChange"
            :row-key="(row) => row.uid"
          >
            <el-table-column type="selection" :reserve-selection="true" width="55" />
            <el-table-column prop="imageUrls">
              <template #default="scope">
                <div style="display: flex; align-items: center">
                  <img :src="imgUrl(scope)" class="table-img" />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="productId" width="70px" label="ID" />
            <el-table-column prop="name" label="Name" />
            <el-table-column prop="price" label="Price" />
            <el-table-column prop="unitId" label="Unit" />
            <el-table-column prop="minOrderQuantity" label="MOQ" />
          </el-table>
        </div>
        <div class="add-table-footer">
          <div class="add-table-msg">{{ selectedProductsData.length }} Products</div>
          <el-pagination
            @current-change="handlePageChange"
            v-model:current-page="currentPage"
            layout="prev, pager, next"
            :total="totalCount"
          />
        </div>
      </div>
    </div>

    <div class="add-footer">
      <el-button
        class="input-button"
        @click="confirmSelectedProducts"
        type="primary"
        size="large"
        round
        >ADD
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import productAPI from '@/api/product'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'
// import orderAPI from '@/api/order'
// import { useChatStore } from '../../stores/chat'
import debounce from 'lodash/debounce'
import { useRoute } from 'vue-router'

const props = defineProps(['isOrderDetail', 'orderUid'])
const route = useRoute()
// const chatStore = useChatStore()
const orderStore = useOrderStore()
const searchWord = ref('')
const categoryOptions = [
  {
    value: 'Option1',
    label: 'Option1'
  },
  {
    value: 'Option2',
    label: 'Option2'
  },
  {
    value: 'Option3',
    label: 'Option3'
  },
  {
    value: 'Option4',
    label: 'Option4'
  },
  {
    value: 'Option5',
    label: 'Option5'
  }
]
const selectCategory = ref('')
const productsData = ref([])
const selectedProductsData = ref([])
const currentPage = ref(1)
const totalCount = ref(0)
const isTableLoading = ref(false)
const isSearchMode = computed(() => {
  return searchWord.value ? true : false
})
const tableRef = ref()

// watch(
//   () => orderStore.needRefreshProducts,
//   (newValue) => {
//     if (newValue === true) {
//       getProducts(null, null, null, null, 8)
//       searchWord.value = ''
//       orderStore.needRefreshProducts = false
//     }
//   }
// )

function imgUrl(scope) {
  return scope.row.imageUrls.length !== 0
    ? scope.row.imageUrls[0]
    : 'https://placehold.jp/50x50.png'
}

function handleAddProductChange(data) {
  selectedProductsData.value = data
}

async function handlePageChange(page) {
  try {
    isTableLoading.value = true
    let result = await productAPI.getProducts(
      isSearchMode.value ? searchWord.value : null,
      null,
      null,
      page,
      8
    )
    totalCount.value = result.data.pkg.totalCount
    currentPage.value = result.data.pkg.page
    productsData.value = result.data.pkg.results
    isTableLoading.value = false
  } catch (error) {
    isTableLoading.value = false
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Load failed',
      type: 'error'
    })
    console.log(error)
  }
}

async function getProducts(name, description, category1Cid, page, perpage) {
  try {
    isTableLoading.value = true
    let result = await productAPI.getProducts(name, description, category1Cid, page, perpage)
    let data = result.data.pkg
    productsData.value = data.results
    totalCount.value = data.totalCount
    currentPage.value = data.page
    isTableLoading.value = false
  } catch (error) {
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Get products list failed',
      type: 'error'
    })
  }
}

async function confirmSelectedProducts() {
  try {
    console.log(selectedProductsData.value)
    if (!selectedProductsData.value.length) {
      ElMessage({
        message: 'Please choose products',
        type: 'warning'
      })
      return
    }
    isTableLoading.value = true

    // let customerId = ''
    // for (let group of chatStore.chatGroups) {
    //   if (group.groupUuid === chatStore.currentGroupUuid) {
    //     customerId = group.customerId
    //     break
    //   }
    // }

    if (props.isOrderDetail) {
      console.log(`Is order detail? ${props.isOrderDetail}, ${props.orderUid}`)
      let copyOrderList = JSON.parse(
        JSON.stringify(orderStore.ordersDetailList[props.orderUid].items)
      )
      for (let selectedProduct of selectedProductsData.value) {
        let exist = false
        selectedProduct.quantity = 0
        selectedProduct.price = +selectedProduct.price
        selectedProduct.unit = selectedProduct.unitId
        for (let orderedProduct of orderStore.ordersDetailList[props.orderUid].items) {
          if (selectedProduct.productId === orderedProduct.productId) {
            selectedProduct.price = orderedProduct.price

            exist = true
            break
          }
        }
        if (!exist) {
          selectedProduct.productUid = selectedProduct.uid
          copyOrderList.push(selectedProduct)
        }
      }
      orderStore.ordersDetailList[props.orderUid].items = copyOrderList
    } else {
      console.log(`Is order detail? ${props.isOrderDetail}, ${props.orderUid}`)
      let copyOrderList = JSON.parse(JSON.stringify(orderStore.orderList[route.params.groupUuid]))
      for (let selectedProduct of selectedProductsData.value) {
        let exist = false
        selectedProduct.quantity = 0
        selectedProduct.price = +selectedProduct.price
        for (let orderedProduct of orderStore.orderList[route.params.groupUuid]) {
          if (selectedProduct.productId === orderedProduct.productId) {
            selectedProduct.price = orderedProduct.price
            exist = true
            break
          }
        }
        if (!exist) {
          orderStore.orderChanged = true
          copyOrderList.push(selectedProduct)
        }
      }
      orderStore.orderList[route.params.groupUuid] = copyOrderList
    }

    isTableLoading.value = false
    if (props.isOrderDetail) {
      orderStore.detailAddProdcuatDrawerVisible = false
    } else {
      orderStore.addProdcuatDrawerVisible = false
    }

    tableRef.value.clearSelection()
  } catch (error) {
    isTableLoading.value = false

    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Upload list failed',
      type: 'error'
    })
    console.log(error)
  }
}

const searchProduct = debounce(async () => {
  let word = searchWord.value.trim()
  try {
    isTableLoading.value = true
    let result = await productAPI.getProducts(word, null, null, null, 8)
    productsData.value = result.data.pkg.results
    totalCount.value = result.data.pkg.totalCount
    currentPage.value = result.data.pkg.page
    isTableLoading.value = false
  } catch (error) {
    isTableLoading.value = false
    console.log(error)
  }
}, 800)

onMounted(() => {
  console.log(
    `opened from ${props.isOrderDetail ? `detail, the uid is ${props.orderUid}` : 'guide'}`
  )
  getProducts(null, null, null, null, 8)
})
</script>

<style scoped>
.add-table-footer {
  display: flex;
  padding: 10px;
  justify-content: space-between;
}
.add-footer {
  display: flex;
  align-items: center;
  justify-content: right;
  height: 60px;
}
.add-table-msg {
  font-weight: bolder;
}
.add-main {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}
.add-main-table-content {
  box-shadow: var(--el-box-shadow-dark);
  margin-top: 20px;
  height: calc(100% - 80px);
  border-radius: 10px;
}
.add-header-functions {
  display: flex;
  justify-content: left;
  align-items: center;
}

.add-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-input {
  width: 40%;
}

.select-input {
  margin-left: 10px;
  width: 30%;
}

.table-img {
  width: 50px;
  height: 50px;
  border-radius: 5px;
}

.table-div {
  height: calc(100% - 91px);
}

.input-button {
  font-size: 16px;
  box-shadow: var(--el-box-shadow-dark);
}
</style>
