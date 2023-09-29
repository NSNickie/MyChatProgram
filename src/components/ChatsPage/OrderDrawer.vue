<template>
  <div ref="orderContent" class="order-content">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Request items" name="Request items">
        <div class="main-content">
          <el-scrollbar :always="true" height="100%">
            <div class="table-div">
              <div class="main-header">
                <div class="header-left">
                  <!-- <el-icon><Tickets /></el-icon> -->
                  <span class="header-title">List of purchase request items</span>
                </div>
                <!-- <div class="header-right">
                  <el-button class="export-button" type="primary" size="large" :icon="Download" text
                    >EXPORT
                  </el-button>
                  <el-button class="export-button" type="primary" size="large" :icon="Printer" text
                    >PRINT
                  </el-button>
                </div> -->
                <div v-if="orderStore.orderChanged" class="header-right">
                  <el-button
                    @click="saveProduct"
                    class="export-button"
                    type="primary"
                    size="large"
                    :icon="Check"
                    text
                    >UPDATE
                  </el-button>
                </div>
              </div>
              <div class="main-table-content">
                <!-- <div class="table-div"> -->
                <el-table
                  class="order-table"
                  empty-text="No Items"
                  :data="orderData"
                  stripe
                  style="width: 100%"
                  :scrollbar-always-on="true"
                  v-loading="isTableLoading"
                >
                  <el-table-column prop="number">
                    <template #default="scope">
                      {{ scope.$index + 1 }}
                    </template>
                  </el-table-column>
                  <!-- <el-table-column prop="imageUrls">
            <template #default="scope">
              <div style="display: flex; align-items: center">
                <img :src="imgUrl(scope)" class="table-img" />
              </div>
            </template>
          </el-table-column> -->
                  <el-table-column prop="productId" label="ID" />
                  <el-table-column prop="name" label="Name" />
                  <el-table-column prop="price" label="Price" width="200">
                    <template #default="scope">
                      <!-- <el-input
                type="number"
                :min="0"
                v-model="orderStore.orderList[chatStore.currentGroupUuid][scope.$index].price"
              ></el-input> -->
                      <el-input-number
                        @change="handlePriceChange(scope)"
                        :precision="2"
                        :min="0"
                        :controls="false"
                        v-model="
                          orderStore.orderList[chatStore.currentGroupUuid][scope.$index].price
                        "
                      ></el-input-number>
                    </template>
                  </el-table-column>
                  <el-table-column prop="unitId" label="Unit" />
                  <el-table-column prop="quantity" label="Quantity" width="200">
                    <template #default="scope">
                      <el-input-number
                        :precision="2"
                        :controls="false"
                        :value-on-clear="0"
                        :min="0"
                        v-model="
                          orderStore.orderList[chatStore.currentGroupUuid][scope.$index].quantity
                        "
                      ></el-input-number>
                      <!-- <el-input
                :min="0"
                type="number"
                v-model="orderStore.orderList[chatStore.currentGroupUuid][scope.$index].quantity"
              ></el-input> -->
                    </template>
                  </el-table-column>
                  <el-table-column label="Total">
                    <template #default="scope">
                      {{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                    </template>
                  </el-table-column>
                  <el-table-column width="80px">
                    <template #default="scope">
                      <el-button
                        class="delete-button"
                        @click="deleteProduct(scope)"
                        type="danger"
                        :icon="Delete"
                        text
                      />
                    </template>
                  </el-table-column>
                </el-table>
                <!-- </div> -->
                <div class="table-functions">
                  <span class="products-msg"
                    >{{ orderData ? orderData.length : 0 }} Items, Total price
                    {{ totalPrice }}</span
                  >
                  <el-button
                    class="export-button"
                    @click="addProduct"
                    type="primary"
                    size="large"
                    :icon="Plus"
                    text
                    >ADD ITEM
                  </el-button>
                  <el-drawer
                    :destroy-on-close="true"
                    size="570"
                    style="
                      border-radius: 25px;
                      margin: 5px 10px 20px 5px;
                      height: calc(100% - 20px);
                    "
                    v-model="orderStore.addProdcuatDrawerVisible"
                    :append-to-body="true"
                  >
                    <template #header>
                      <h3>ADD ITEM</h3>
                    </template>
                    <AddProductsDrawer></AddProductsDrawer>
                  </el-drawer>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Delivery" name="Delivery">
        <div class="main-content">
          <el-scrollbar :always="true" height="100%">
            <div class="date-div">
              <div class="main-header">
                <div class="header-left">
                  <span class="header-title">Request delivery date</span>
                </div>
              </div>
              <div>
                <el-form ref="dateFormRef" :model="dateForm" :rules="dateRules" status-icon>
                  <el-form-item prop="deliveryDate">
                    <el-date-picker
                      class="date-picker"
                      v-model="dateForm.deliveryDate"
                      type="date"
                      placeholder="Pick a day"
                      size="large"
                    >
                    </el-date-picker>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="main-footer" v-loading.lock="creatingOrder">
      <div class="footer-title">Confirm order</div>
      <div class="footer-description">
        Let your customers know their order is to be confirmed by themself after supplier place an
        order for customer.
      </div>
      <div class="input-div">
        <el-input v-model="message" :placeholder="placeholderMsg" class="msg-input"></el-input>
        <el-button class="input-button" size="large" round>CANCEL </el-button>
        <el-button @click="createOrder" class="input-button" type="primary" size="large" round
          >CONFIRM
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Delete, Check } from '@element-plus/icons-vue'
import { computed, ref, watch, onMounted, reactive } from 'vue'
import AddProductsDrawer from './AddProductsDrawer.vue'
import { useOrderStore } from '@/stores/order'
import { useChatStore } from '../../stores/chat'
import orderAPI from '@/api/order'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { useUserStore } from '../../stores'
import { nanoid } from 'nanoid'

const orderContent = ref()

const chatStore = useChatStore()
const isTableLoading = ref(false)
const orderStore = useOrderStore()
const orderData = computed(() => {
  return orderStore.orderList[chatStore.currentGroupUuid]
})
const props = defineProps(['channelName'])
const placeholderMsg = computed(() => {
  return `Add a message for ${props.channelName}`
})
const message = ref('')
const totalPrice = computed(() => {
  let total = new Decimal('0.00')
  if (!orderStore.orderList[chatStore.currentGroupUuid]) {
    return Decimal('0.00')
  }
  orderStore.orderList[chatStore.currentGroupUuid].forEach((product) => {
    let price = product.price
    let quantity = product.quantity
    price = price ? price : '0.00'
    quantity = quantity ? quantity : '0.00'
    total = total.plus(new Decimal(price).mul(quantity).toFixed(2, Decimal.ROUND_HALF_UP))
  })
  return total
})
const creatingOrder = ref(false)
const dateFormRef = ref()
const dateForm = reactive({
  deliveryDate: ''
})
const dateRules = reactive({
  deliveryDate: [
    { required: true, message: 'Please pick a delivery date', type: 'date', trigger: 'change' }
  ]
})
const activeTab = ref('Request items')

watch(
  () => orderStore.needRefreshOrders,
  (newValue) => {
    if (newValue === true) {
      getOrdersList(null, null, null, null, 8)
      orderStore.needRefreshOrders = false
    }
  }
)

function handlePriceChange() {
  orderStore.orderChanged = true
}

async function deleteProduct(scope) {
  isTableLoading.value = true
  let copyOrderData = JSON.parse(JSON.stringify(orderData.value))
  copyOrderData.splice(scope.$index, 1)
  for (let order of copyOrderData) {
    order.price = +order.price
  }
  orderStore.orderList[chatStore.currentGroupUuid] = copyOrderData
  orderStore.orderChanged = true
  isTableLoading.value = false
}

async function saveProduct() {
  try {
    isTableLoading.value = true
    let customerId = ''
    for (let group of chatStore.chatGroups) {
      if (group.groupUuid === chatStore.currentGroupUuid) {
        customerId = group.customerId
      }
    }
    let copyOrderData = JSON.parse(JSON.stringify(orderData.value))
    for (let order of copyOrderData) {
      order.quantity = 0
      order.price = +order.price
    }
    await orderAPI.updateFavouriteProductsList(customerId, copyOrderData)
    orderStore.orderList[chatStore.currentGroupUuid] = copyOrderData
    orderStore.orderChanged = false
    isTableLoading.value = false
  } catch (error) {
    isTableLoading.value = false
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Delete failed',
      type: 'error'
    })
  }
}

function addProduct() {
  orderStore.addProdcuatDrawerVisible = true
}

async function getOrdersList() {
  try {
    isTableLoading.value = true
    let customerId = ''
    for (let group of chatStore.chatGroups) {
      if (group.groupUuid === chatStore.currentGroupUuid) {
        customerId = group.customerId
        break
      }
    }
    let result = await orderAPI.getFavouriteProductsList(customerId)
    let products = result.data.pkg.products
    for (let product of products) {
      product.price = +product.price
    }
    orderStore.orderList[chatStore.currentGroupUuid] = products
    orderStore.orderChanged = false
    isTableLoading.value = false
  } catch (error) {
    isTableLoading.value = false
    console.log(error)
  }
}

async function createOrder() {
  try {
    await dateFormRef.value.validate()
  } catch (error) {
    ElMessage({ message: error.deliveryDate[0].message, type: 'warning' })
    console.log(error)
    return
  }

  try {
    let quantityEquals0Flag = true
    for (let orderItem of orderData.value) {
      if (orderItem.quantity) {
        quantityEquals0Flag = false
        break
      }
    }
    if (quantityEquals0Flag) {
      ElMessage({
        message: 'Order must have at least one item',
        type: 'warning'
      })
      return
    }

    let customerId = ''
    for (let group of chatStore.chatGroups) {
      if (group.groupUuid === chatStore.currentGroupUuid) {
        customerId = group.customerId
        break
      }
    }
    let items = []
    let item = {}
    for (let orderItem of orderData.value) {
      if (orderItem.quantity === 0) {
        continue
      }
      item = {}
      item.productUid = orderItem.uid
      item.quantity = orderItem.quantity
      item.price = new Decimal(orderItem.price).toFixed(2, Decimal.ROUND_HALF_UP)
      item.productId = orderItem.productId
      item.name = orderItem.name
      item.unit = orderItem.unitId
      items.push(item)
    }
    creatingOrder.value = true

    let remarks = []
    let time = dayjs()
    if (message.value) {
      let remark = {
        message: message.value,
        time: time,
        userUid: useUserStore().uid,
        id: nanoid()
      }
      remarks.push(remark)
    }

    let result = await orderAPI.createOrder(chatStore.currentGroupUuid, customerId, remarks, items,'Awaiting Confirmation,')
    ElMessage({
      message: result.data.pkg.msg,
      type: 'success'
    })
    creatingOrder.value = false
    message.value=''
    orderStore.orderDrawerVisible = false
  } catch (error) {
    creatingOrder.value = false

    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Create failed',
      type: 'error'
    })
    console.log(error)
  }
}

onMounted(() => {
  getOrdersList()
  orderStore.needRefreshOrders = false
})
</script>

<style scoped>
.export-button {
  font-size: 16px;
  margin: 0px;
}
.order-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.main-content {
  height: calc(100vh - 343px);
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}

.header-left {
  display: flex;
  align-items: center;
  font-size: 18px;
}
.header-right {
  font-size: 18px;
}
.header-title {
  margin-left: 5px;
}

.main-table-content {
  /* padding: 20px; */
  border-radius: 10px;
  height: calc(100% - 50px);
  /* border-top: 1px solid var(--el-border-color); */
  /* margin-top: 10px; */
  /* box-shadow: var(--el-box-shadow-light); */
}

.table-functions {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-size: 18px;
}

.main-footer {
  padding: 12px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  height: 150px;
  box-shadow: var(--el-box-shadow-dark);
  /* margin-top: 20px; */
}

.footer-title {
  font-size: 20px;
  font-weight: bolder;
}

.footer-description {
  font-size: 15px;
}

.msg-input {
  font-size: 15px;
  height: 40px;
  --el-border-radius-base: 15px;
}

.input-div {
  display: flex;
  margin-top: 20px;
}

.input-button {
  font-size: 16px;
  margin-left: 15px;
}

.products-msg {
  font-weight: bolder;
}

.delete-button {
  font-size: 18px;
}

.order-table {
  border-radius: 10px;
  --el-table-row-hover-bg-color: #f5f7fa00;
}

.table-div {
  height: calc(100% - 80px);
}

.invite-divider {
  margin: 25px 0 0 0;
  --el-border-color: #a0a0a072;
}

.divider-div {
  display: flex;
  justify-content: center;
}

.date-div {
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  box-shadow: var(--el-box-shadow-light);
}

.table-div {
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  box-shadow: var(--el-box-shadow-light);
}
</style>
