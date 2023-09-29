<template>
  <div class="main-padding">
    <div class="main-header">
      <h1 class="title">ALL ORDERS</h1>
      <el-divider class="divider" />
    </div>

    <div class="main-main">
      <div class="functions-bar">
        <span class="left-functions">
          <!-- <el-input class="search-input" size="large" placeholder="Search" suffix-icon="Search">
          </el-input> -->
          <el-select
            class="customer-select"
            placeholder="Customer"
            @change="customerIdChange"
            size="large"
            v-model="customerId"
            v-loading="customerLoading"
          >
            <el-option
              v-for="item in customerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          /></el-select>

          <el-date-picker
            v-model="searchDateRange"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            size="large"
            class="date-picker-order-page"
            :clearable="true"
            @change="searchOrdersOfDate"
          />

          <el-select
            class="select-input"
            v-model="searchStatus"
            @change="searchOrdersOfStatus"
            placeholder="Order status"
            size="large"
          >
            <el-option
              v-for="item in orderStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <!-- <el-switch size="large" active-text="Edit mode" /> -->
        </span>
        <div class="right-functions">
          <!-- <el-button @click="createCategoryDialog" type="primary" round>CREATE CATEGORY</el-button> -->
          <el-button type="primary" round disabled>CONFIRM ORDERS</el-button>
          <el-button type="primary" round>EXPORT</el-button>
        </div>
      </div>
      <div class="table-area">
        <el-table
          v-loading="isTableLoading"
          class="orders-table"
          height="100%"
          :data="ordersTableData"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column property="customer" label="Customer" />

          <el-table-column property="deliveryDate" label="Delivery date" />
          <el-table-column property="productsCount" label="Products ordered" />
          <el-table-column property="totalPrice" label="Total price" />
          <el-table-column property="status" label="Order status">
            <template #default="scope">
              <span>{{ scope.row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column property="time" label="Ordered date" />
          <el-table-column property="updatedTime" label="Updated date" />
          <el-table-column width="70px">
            <template #default="scope">
              <el-button @click="openOrderDetailDrawer(scope)" text :icon="MoreFilled"></el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="No order" />
          </template>
        </el-table>
      </div>
      <div class="page-area">
        <el-pagination
          @current-change="handlePageChange"
          v-model:current-page="currentPage"
          layout="prev, pager, next"
          :page-size="12"
          :total="totalCount"
        ></el-pagination>
      </div>
    </div>
    <el-drawer
      :destroy-on-close="true"
      direction="rtl"
      size="1000"
      style="border-radius: 30px; margin: 10px 15px 20px 15px; height: calc(100% - 20px)"
      v-model="orderStore.detailDrawerVisible"
    >
      <template #header>
        <!-- <h1>Order from {{ groupName }} - {{ orderUid }}</h1> -->
        <h1>Order from {{ customerName }} - {{ orderUid }}</h1>
      </template>
      <OrderDetailsDrawer
        :isFromOrdersPage="isFromOrdersPage"
        :orderUid="orderUid"
      ></OrderDetailsDrawer>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'
import orderAPI from '@/api/order'
import chatAPI from '@/api/chat'
import dayjs from 'dayjs'
import OrderDetailsDrawer from '../../components/ChatsPage/OrderDetailsDrawer.vue'
import { useRouter, useRoute } from 'vue-router'
// const detailDrawerVisible = ref(false)
const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderStatus = ref([
  { value: '', label: 'All status' },
  { value: 'Awaiting confirmation', label: 'Awaiting confirmation' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Processing orders', label: 'Processing orders' },
  { value: 'Order placed', label: 'Order placed' },
  { value: 'Canceled', label: 'Canceled' }
])
const customerLoading = ref(false)
const customerOptions = ref([])
const ordersTableData = ref([])
const orderUid = ref('')
const customerName = ref('')
const isTableLoading = ref(false)
const isFromOrdersPage = ref(true)
const currentPage = ref(1)
const totalCount = ref(0)
const searchDateRange = ref([parseInt(route.query.startDate), parseInt(route.query.endDate)])
const searchStatus = ref(route.query.status ? route.query.status.slice(0, -1) : '')
const customerId = ref(route.query.id ? route.query.id : '')

watch(
  () => orderStore.needRefreshOrdersList,
  async (newValue) => {
    if (newValue === true) {
      getSpecialOrdersList()
    }
  }
)

function getSpecialOrdersList() {
  let status
  if (searchStatus.value) {
    status = searchStatus.value + ','
    route.params.status = status
  } else {
    status = null
  }
  let start, end
  if (
    searchDateRange.value &&
    searchDateRange.value.length !== 0 &&
    searchDateRange.value[0] &&
    searchDateRange.value[1]
  ) {
    start = dayjs(searchDateRange.value[0]).valueOf()
    end = dayjs(searchDateRange.value[1]).valueOf()
    route.params.startDate = start
    route.params.endDate = end
  } else {
    start = null
    end = null
  }
  let id
  if (customerId.value) {
    id = customerId.value
  } else {
    id = null
  }

  let query = {
    startDate: start,
    endDate: end,
    status: status,
    page: 1,
    id: id
  }
  router.push({ query: query })
  getOrdersData(id, null, null, 12, null, status, start, end)
}

function handlePageChange(page) {
  let status
  if (searchStatus.value) {
    status = searchStatus.value + ','
    route.params.status = status
  } else {
    status = null
  }
  let start, end
  if (
    searchDateRange.value &&
    searchDateRange.value.length !== 0 &&
    searchDateRange.value[0] &&
    searchDateRange.value[1]
  ) {
    start = dayjs(searchDateRange.value[0]).valueOf()
    end = dayjs(searchDateRange.value[1]).valueOf()
    route.params.startDate = start
    route.params.endDate = end
  } else {
    start = null
    end = null
  }
  let id
  if (customerId.value) {
    id = customerId.value
  } else {
    id = null
  }

  let query = {
    startDate: start,
    endDate: end,
    status: status,
    page: currentPage.value,
    id: id
  }
  router.push({ query: query })
  getOrdersData(id, null, null, 12, page, status, start, end)
}

function openOrderDetailDrawer(scope) {
  customerName.value = scope.row.customer
  orderUid.value = scope.row.uid
  orderStore.detailDrawerVisible = true
  console.log(scope)
}

function searchOrdersOfStatus() {
  getSpecialOrdersList()
}

function searchOrdersOfDate() {
  getSpecialOrdersList()
}

function customerIdChange() {
  getSpecialOrdersList()
}
async function getOrdersData(customerId, sortBy, orderBy, perPage, page, status, start, end) {
  try {
    isTableLoading.value = true
    let result = await orderAPI.getOrderList(
      customerId,
      sortBy,
      orderBy,
      perPage,
      page,
      status,
      start,
      end
    )
    let list = result.data.pkg.results
    totalCount.value = result.data.pkg.totalCount
    currentPage.value = result.data.pkg.page
    let tableData = []
    for (let order of list) {
      let status = order.status.split(',')
      status = status[status.length - 2]
      let data = {
        uid: order.uid,
        customer: order.customerName,
        time: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        deliveryDate: order.deliveryDate,
        productsCount: order.itemsCount,
        status,
        totalPrice: order.totalPrice,
        updatedTime: dayjs(order.updatedAt).format('YYYY-MM-DD HH:mm:ss')
      }
      tableData.push(data)
    }
    ordersTableData.value = tableData
    orderStore.needRefreshOrdersList = false
    isTableLoading.value = false
  } catch (error) {
    console.log(error)
    isTableLoading.value = false
  }
}

async function getCustomerOptions() {
  try {
    customerLoading.value = true
    let result = await chatAPI.getChatGroups()
    let data = []
    let groups = result.data.pkg.groups
    for (let i = 0; i < groups.length; i++) {
      let option = {
        label: groups[i].customerName,
        value: groups[i].customerId
      }
      data.push(option)
    }
    data.unshift({
      label:'All customers',
      value:''
    })
    customerOptions.value = data
    customerLoading.value = false
  } catch (error) {
    customerLoading.value = false
    console.log(error)
  }
}

onMounted(async () => {
  getCustomerOptions()
  getOrdersData(
    route.query.id,
    null,
    null,
    12,
    route.query.page,
    route.query.status,
    route.query.startDate,
    route.query.endDate
  )
})
</script>

<style scoped>
.page-area {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0px;
}
.orders-table {
  --el-table-row-hover-bg-color: #f5f7fa00;
}
.functions-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 0px;
  /* background-color: rgba(0, 255, 255, 0.329); */
}

.table-area {
  height: calc(100% - 129px);
  /* background-color: rgba(165, 237, 157, 0.404); */
}

.left-functions {
  display: flex;
  justify-content: space-between;
}

.search-input {
  --el-input-border-color: #ffffff00;
  width: 220px;
  margin-right: 10px;
}

.select-input {
  --el-border-color: #ffffff00;
  /* width: 170px; */
  margin-left: 15px;
}

.right-functions :nth-child(1),
.right-functions:nth-child(2) {
  display: flex;
  align-items: center;
}

.settings-dropdown {
  margin: 0px 30px 0px 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}

:deep(.el-drawer__header) {
  margin-bottom: 0px;
}

:deep(.date-picker-order-page) {
  margin-left: 15px;
  --el-input-border-color: #ffffff00;
}

.customer-select {
  --el-border-color: #ffffff00;
  width: 150px;
}
</style>
