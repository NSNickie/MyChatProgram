<template>
  <div ref="orderContent" class="order-content-all">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Request items" name="Request items">
        <div v-loading="mainContentLoading" class="main-content">
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
                <!-- <div v-if="orderStore.orderChanged" class="header-right">
                  <el-button
                    @click="saveProduct"
                    class="export-button"
                    type="primary"
                    size="large"
                    :icon="Check"
                    text
                    >UPDATE
                  </el-button>
                </div> -->
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
                          orderStore.ordersDetailList[props.orderUid].items[scope.$index].price
                        "
                      ></el-input-number>
                    </template>
                  </el-table-column>
                  <el-table-column prop="unit" label="Unit" />
                  <el-table-column prop="quantity" label="Quantity" width="200">
                    <template #default="scope">
                      <el-input-number
                        :precision="2"
                        :controls="false"
                        :value-on-clear="0"
                        :min="0"
                        v-model="
                          orderStore.ordersDetailList[props.orderUid].items[scope.$index].quantity
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
                      {{
                        new Decimal(scope.row.price)
                          .mul(new Decimal(scope.row.quantity))
                          .toFixed(2, Decimal.ROUND_HALF_UP)
                      }}
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
                    v-model="orderStore.detailAddProdcuatDrawerVisible"
                    :append-to-body="true"
                  >
                    <template #header>
                      <h3>ADD ITEM</h3>
                    </template>
                    <AddProductsDrawer
                      :isOrderDetail="isOrderDetail"
                      :orderUid="props.orderUid"
                    ></AddProductsDrawer>
                  </el-drawer>
                </div>
              </div></div
          ></el-scrollbar>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Status" name="Status">
        <div class="main-content">
          <el-scrollbar :always="true" height="100%">
            <div class="status-div">
              <div class="main-header">
                <div class="header-left">
                  <span class="header-title">Status</span>
                </div>
              </div>
              <div class="steps-div">
                <el-steps
                  v-if="!isOrderCancelled"
                  process-status="finish"
                  finish-status="success"
                  :active="activeStatusIndex"
                >
                  <el-step
                    v-for="status in statusSteps"
                    :title="status.value"
                    :key="status.value"
                  />
                </el-steps>
                <el-steps
                  v-else
                  process-status="error"
                  finish-status="success"
                  :active="activeStatusIndex"
                >
                  <el-step v-for="status in statusData" :key="status" :title="status" />
                </el-steps>
              </div>
            </div>
            <div class="status-div">
              <div class="main-header">
                <div class="header-left">
                  <span class="header-title">Choose status</span>
                </div>
              </div>
              <div class="choose-status-div">
                <el-select v-model="orderStatus" placeholder="Status" size="large">
                  <el-option
                    v-for="option in supplierStatusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  >
                  </el-option>
                </el-select>
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

      <el-tab-pane label="Comments" name="Comments">
        <div class="main-content">
          <el-scrollbar :always="true" height="100%">
            <div class="comments-div">
              <div class="main-header">
                <div class="header-left">
                  <span class="header-title">Comments</span>
                </div>
              </div>
              <div class="comments-scrollbar-div">
                <el-scrollbar>
                  <OtherCommentItem
                    v-for="(remark, index) in remarks"
                    :index="index"
                    :orderUid="props.orderUid"
                    :key="remark.id"
                  >
                  </OtherCommentItem>
                </el-scrollbar>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Timeline" name="Timeline">
        <div v-loading="historyDataLoading" class="main-content">
          <el-scrollbar>
            <div class="history-div">
              <div class="main-header">
                <div class="header-left">
                  <span class="header-title">Timeline</span>
                </div>
              </div>
              <div>
                <div class="no-data" v-if="historyData.length === 0">No history</div>
                <HistoryItem
                  v-for="item of historyData"
                  :key="item.uid"
                  :metaInfo="item.metaInfo"
                  :operator="item.operator"
                  :operatorType="item.operatorType"
                  :ts="item.ts"
                ></HistoryItem>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="main-footer" v-loading.lock="creatingOrder">
      <div class="footer-title">Confirm order</div>
      <div class="footer-description">Let your customers know their order has been changed.</div>
      <div class="send-message-confirm">
        <el-checkbox
          v-model="needSendUpdateMessage"
          label="Send order update message to the group"
          size="large"
        ></el-checkbox>
      </div>
      <div class="input-div">
        <el-input v-model="message" :placeholder="placeholderMsg" class="msg-input"></el-input>
        <!-- <el-button class="input-button" size="large" round>CANCEL </el-button> -->
        <el-button @click="confirmOrder" class="input-button" type="primary" size="large" round>
          CONFIRM
        </el-button>
      </div>
     
    </div>
  </div>
</template>

<script setup>
import HistoryItem from './HistoryItem.vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { computed, ref, onMounted, reactive } from 'vue'
import AddProductsDrawer from './AddProductsDrawer.vue'
import { useOrderStore } from '@/stores/order'
import orderAPI from '@/api/order'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import OtherCommentItem from '@/components/ChatsPage/OtherCommentItem.vue'
import lodash from 'lodash'
import { nanoid } from 'nanoid'
import { useUserStore, useChatStore } from '../../stores'

const historyData = ref([])

const orderStatus = ref('')
const chatStore = useChatStore()
const orderContent = ref()
const historyDataLoading = ref(false)

const statusSteps = [
  {
    value: 'Awaiting Confirmation',
    label: 'Awaiting Confirmation'
  },
  {
    value: 'Confirmed',
    label: 'Confirmed'
  },
  {
    value: 'Processing Orders',
    label: 'Processing Orders'
  },

  {
    value: 'Order Placed',
    label: 'Order Placed'
  }
]

const supplierStatusOptions = [
  {
    value: 'Awaiting Confirmation',
    label: 'Awaiting Confirmation'
  },
  {
    value: 'Processing Orders',
    label: 'Processing Orders'
  },
  {
    value: 'Order Placed',
    label: 'Order Placed'
  },
  {
    value: 'Canceled',
    label: 'Canceled'
  }
]
const needSendUpdateMessage = ref(true)
const mainContentLoading = ref(false)
const isTableLoading = ref(false)
const orderStore = useOrderStore()
const orderData = computed(() => {
  return orderStore.ordersDetailList[props.orderUid]
    ? orderStore.ordersDetailList[props.orderUid].items
    : []
})
const props = defineProps(['isFromOrdersPage', 'deliveryTime', 'orderUid'])
const placeholderMsg = computed(() => {
  return `Add a comment for this order`
})
const message = ref('')
const totalPrice = computed(() => {
  let total = new Decimal('0.00')
  if (
    !orderStore.ordersDetailList[props.orderUid] ||
    !orderStore.ordersDetailList[props.orderUid].items
  ) {
    return Decimal('0.00')
  }
  orderStore.ordersDetailList[props.orderUid].items.forEach((product) => {
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
  deliveryDate: dayjs(props.deliveryTime).format('YYYY-MM-DD')
})
const dateRules = reactive({
  deliveryDate: [{ required: true, message: 'Please pick a date', type: 'date', trigger: 'change' }]
})
const remarks = computed(() => {
  let data = []
  if (orderStore.ordersDetailList[props.orderUid]) {
    data = lodash.cloneDeep(orderStore.ordersDetailList[props.orderUid].remarks)
    data.reverse()
  }
  return data
})
const activeTab = ref('Request items')
const isOrderDetail = ref(true)
let orderDetailFromServer = ref({})
let orderIdTable = ref({})
const statusData = ref([])
const isOrderCancelled = ref(false)
const activeStatusIndex = ref(0)
const initialOrderStatus = ref('')

// watch(
//   () => orderStore.needRefreshOrderDetail,
//   (newValue) => {
//     if (newValue === true) {
//       getOrderDetail()
//       orderStore.needRefreshOrderDetail = false
//     }
//   }
// )

function handlePriceChange() {
  orderStore.orderChanged = true
}

async function deleteProduct(scope) {
  try {
    let copyOrderData = JSON.parse(
      JSON.stringify(orderStore.ordersDetailList[props.orderUid].items)
    )
    copyOrderData.splice(scope.$index, 1)
    for (let order of copyOrderData) {
      order.price = +order.price
    }
    orderStore.ordersDetailList[props.orderUid].items = copyOrderData
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
  orderStore.detailAddProdcuatDrawerVisible = true
}

async function getOrderDetail() {
  try {
    // console.log(props.orderUid)
    mainContentLoading.value = true
    let result = await orderAPI.getOrderDetail(props.orderUid)
    orderStore.ordersDetailList[props.orderUid] = result.data.pkg.details
    orderDetailFromServer.value = lodash.cloneDeep(result.data.pkg.details)

    for (let i = 0; i < orderDetailFromServer.value.items.length; i++) {
      orderIdTable[orderDetailFromServer.value.items[i].productId] =
        orderDetailFromServer.value.items[i].uid
    }

    let items = orderStore.ordersDetailList[props.orderUid].items
    for (let item of items) {
      item.price = +item.price
      item.quantity = +item.quantity
    }
    orderStore.ordersDetailList[props.orderUid].items = items

    statusData.value = result.data.pkg.details.status.split(',')
    statusData.value.pop()
    console.log(statusData.value)
    activeStatusIndex.value = statusData.value.length - 1
    if (statusData.value[activeStatusIndex.value] === 'Canceled') {
      isOrderCancelled.value = true
    } else {
      isOrderCancelled.value = false
    }
    orderStatus.value = statusData.value[activeStatusIndex.value]
    initialOrderStatus.value = statusData.value[activeStatusIndex.value]
    mainContentLoading.value = false
  } catch (error) {
    mainContentLoading.value = false
    console.log(error)
  }
}

async function getHistoryData() {
  try {
    historyDataLoading.value = true
    let result = await orderAPI.getOrderDetailHistory(props.orderUid)
    historyData.value = result.data.pkg.history
    historyDataLoading.value = false
  } catch (error) {
    historyDataLoading.value = false
    console.log(error)
  }
}

async function confirmOrder() {
  let afterData = lodash.cloneDeep(orderStore.ordersDetailList[props.orderUid])
  for (let item of afterData.items) {
    item.price = item.price.toFixed(2)
  }

  //has status changed?
  let statusChanged = orderStatus.value !== initialOrderStatus.value
  let statusString = ''
  if (statusChanged) {
    if (orderStatus.value !== 'Canceled') {
      for (let status of statusSteps) {
        if (status.value !== orderStatus.value) {
          statusString = statusString + status.value + ','
        } else {
          statusString = statusString + status.value + ','
          break
        }
      }
    } else {
      for (let status of statusSteps) {
        if (status.value !== initialOrderStatus.value) {
          statusString = statusString + status.value + ','
        } else {
          statusString = statusString + status.value + ','
          statusString = statusString + 'Canceled' + ','
          break
        }
      }
    }
  }
  // console.log(statusString)

  let dataChanged =
    lodash.isEqual(afterData, orderDetailFromServer.value) && !message.value && !statusChanged

  if (dataChanged) {
    ElMessage({
      message: 'You cannot confirm if you did not change anything.',
      type: 'warning'
    })
    return
  }

  //check items different
  if (orderStore.ordersDetailList[props.orderUid].items.length === 0) {
    ElMessage({
      message: 'You cannot delete all items.',
      type: 'warning'
    })
    return
  }

  for (let item of orderStore.ordersDetailList[props.orderUid].items) {
    if (item.quantity === 0) {
      ElMessage({
        message: 'Quantity of items cannot be 0.',
        type: 'warning'
      })
      return
    }
  }

  creatingOrder.value = true

  //check new item
  let addedItems = []
  for (let newItem of afterData.items) {
    if (
      !orderDetailFromServer.value.items.some((oldItem) => {
        return oldItem.productId === newItem.productId
      })
    ) {
      let item = {}
      item.actionFlg = 'create'
      item.productId = newItem.productId
      item.productUid = newItem.productUid
      item.name = newItem.name
      item.unit = newItem.unit
      item.quantity = newItem.quantity
      item.price = newItem.price
      addedItems.push(item)
    }
  }

  //check removed items
  let removedItems = []
  for (let oldItem of orderDetailFromServer.value.items) {
    if (
      !afterData.items.some((newItem) => {
        return oldItem.productId === newItem.productId
      })
    ) {
      let item = {}
      item.actionFlg = 'delete'
      item.uid = oldItem.uid
      item.productId = oldItem.productId
      item.productUid = oldItem.productUid
      item.name = oldItem.name
      item.unit = oldItem.unit
      item.quantity = oldItem.quantity
      item.price = oldItem.price
      removedItems.push(item)
    }
  }

  //check changed items
  let changedItems = []

  for (let newItem of afterData.items) {
    for (let oldItem of orderDetailFromServer.value.items) {
      let changed = false
      if (newItem.productId === oldItem.productId) {
        changed = newItem.price !== oldItem.price || newItem.quantity !== oldItem.quantity
        if (changed) {
          let item = {}
          item.productId = newItem.productId
          item.productUid = newItem.productUid
          // item.name = newItem.name
          // item.unit = newItem.unit
          item.uid = orderIdTable[newItem.productId]
          item.quantity = newItem.quantity
          item.price = newItem.price
          item.actionFlg = 'update'
          changedItems.push(item)
        }
      }
    }
  }

  let newItems = [].concat(addedItems, removedItems, changedItems)

  //remarks
  let remarks = orderDetailFromServer.value.remarks
  if (message.value) {
    let data = {
      message: message.value,
      id: nanoid(),
      time: dayjs(),
      userUid: useUserStore().uid
    }
    remarks.unshift(data)
  }

  let orderUid = props.orderUid

  try {
    let result = await orderAPI.updateOrder(
      orderUid,
      props.isFromOrdersPage ? null : chatStore.currentGroupUuid,
      needSendUpdateMessage.value,
      statusChanged ? statusString : null,
      message.value ? remarks : null,
      newItems
    )
    ElMessage({
      message: result.data.pkg.msg,
      type: 'success'
    })
    await getOrderDetail()
    await getHistoryData()
    orderStore.needCloseOrderDetailDrawer = true
    orderStore.detailDrawerVisible = false
    orderStore.needRefreshOrdersList = true
    message.value = ''
    creatingOrder.value = false
  } catch (error) {
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Update failed!',
      type: 'error'
    })
    creatingOrder.value = false
  }
}

onMounted(() => {
  getOrderDetail()
  getHistoryData()
})
</script>

<style scoped>
.export-button {
  font-size: 16px;
  margin: 0px;
}
.order-content-all {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-content {
  height: calc(100vh - 363px);
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
  height: 170px;
  box-shadow: var(--el-box-shadow-dark);
  margin-top: 20px;
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
  margin-top: 5px;
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

.comments-div {
  border-radius: 10px;
  margin: 10px;
  padding: 10px 20px 15px 20px;
  box-shadow: var(--el-box-shadow-light);
}

.status-div {
  border-radius: 10px;
  margin: 10px;
  padding: 10px 10px 15px 10px;
  box-shadow: var(--el-box-shadow-light);
}
.history-div {
  border-radius: 10px;
  margin: 10px;
  padding: 10px 20px 15px 10px;
  box-shadow: var(--el-box-shadow-light);
}

.table-div {
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  box-shadow: var(--el-box-shadow-light);
}

/* .comments-scrollbar-div {
  max-height: 300px;
} */

.steps-div {
  padding: 10px;
  height: 80px;
  /* display: flex; */
  /* justify-content: center; */
}

.choose-status-div {
  padding: 10px;
}

.no-data {
  display: flex;
  justify-content: center;
  padding: 20px;
}
:deep(.el-checkbox.el-checkbox--large .el-checkbox__label)  {
  font-size: 15px;
}

.send-message-confirm{
  height: auto;
}
</style>
