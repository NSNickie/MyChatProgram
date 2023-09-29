<template>
  <div v-if="type === 'MEMBERSHIP'" class="item-div">
    <span class="sys-font">{{ systemMessage }}</span>
    <span class="time-font">{{ temps }}</span>
  </div>

  <div v-if="type === 'ORDER'">
    <div v-if="orderCreater === userStore.uid" class="my-order-div">
      <div class="order-content">
        <span class="title-font">ORDER</span>
        <span class="time-font">{{ temps }} - {{ orderUid }}</span>
        <el-divider class="divider"></el-divider>
        <div class="content-div">
          <span class="content-font">Order status</span>
          <el-button round type="primary" class="result-font">{{ orderStatus }}</el-button>
        </div>

        <el-divider class="divider"></el-divider>
        <div class="content-div">
          <span class="content-font">Requested delivery</span>
          <!-- <span class="result-font">{{ requestedDeliveryDate }}</span> -->
        </div>
        <el-divider class="divider"></el-divider>
        <div class="content-div">
          <span class="content-font">Order products</span>
          <span class="result-font">{{ productQuantity }} products</span>
        </div>
        <el-divider class="divider"></el-divider>
        <div class="content-div">
          <span class="content-font">Delivery check</span>
          <span class="result-font"> {{ deliveryCheck }} </span>
        </div>
        <el-divider class="divider"></el-divider>
        <!-- <div class="content-div">
          <span class="content-font">Created by</span>
          <span class="result-font"> {{ orderCreater }}</span>
        </div>
        <el-divider class="divider"></el-divider> -->
        <el-button type="primary" @click="openOrderDetailsDrawer" class="details-button" text
          >VIEW DETAILS</el-button
        >
      </div>
    </div>
    <div v-else class="other-order-div">
      <div class="avatar-div">
        <el-avatar
          :size="35"
          :src="
            chatStore.avatarUrlPool[avatar]
              ? chatStore.avatarUrlPool[avatar].url
              : chatStore.avatarDefaultUrl
          "
        />
      </div>
      <div class="other-item-div">
        <span class="sender-name">{{ senderName }}</span>
        <div class="order-content">
          <span class="title-font">ORDER</span>
          <span class="time-font">{{ temps }} - {{ orderUid }}</span>
          <el-divider class="divider"></el-divider>
          <div class="content-div">
            <span class="content-font">Order status</span>
            <el-button round type="primary" class="result-font">{{ orderStatus }}</el-button>
          </div>

          <el-divider class="divider"></el-divider>
          <div class="content-div">
            <span class="content-font">Requested delivery</span>
            <!-- <span class="result-font"></span> -->
          </div>
          <el-divider class="divider"></el-divider>
          <div class="content-div">
            <span class="content-font">Order products</span>
            <span class="result-font">{{ productQuantity }} products</span>
          </div>
          <el-divider class="divider"></el-divider>
          <div class="content-div">
            <span class="content-font">Delivery check</span>
            <span class="result-font"> {{ deliveryCheck }} </span>
          </div>
          <!-- <el-divider class="divider"></el-divider> -->
          <!-- <div class="content-div">
            <span class="content-font">Created by</span>
            <span class="result-font"> {{ orderCreater }}</span>
          </div> -->
          <el-divider class="divider"></el-divider>
          <el-button type="primary" @click="openOrderDetailsDrawer" class="details-button" text
            >VIEW DETAILS</el-button
          >
        </div>
      </div>
    </div>
    <el-drawer
      :destroy-on-close="true"
      direction="rtl"
      size="1000"
      style="border-radius: 30px; margin: 10px 15px 20px 15px; height: calc(100% - 20px)"
      v-model="detailDrawerVisible"
    >
      <template #header>
        <h1>Order from {{ groupName }} - {{ orderUid }}</h1>
      </template>
      <OrderDetailsDrawer :deliveryTime="time" :orderUid="orderUid"></OrderDetailsDrawer>
    </el-drawer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import OrderDetailsDrawer from './OrderDetailsDrawer.vue'
import { onMounted, computed, ref, watch } from 'vue'
import { useChatStore, useUserStore, useOrderStore } from '../../stores'

const messageType = {
  memberAdded: 'MEMBERSHIP',
  memberRemoved: 'MEMBERSHIP',
  memberUpgrade: 'MEMBERSHIP',
  memberDowngrade: 'MEMBERSHIP',
  orderCreated: 'ORDER',
  orderUpdated: 'ORDER',
  orderDeleted: 'ORDER'
}
// const orderStore = useOrderStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const orderStore = useOrderStore()

watch(
  () => orderStore.needCloseOrderDetailDrawer,
  (newValue) => {
    if (newValue === true) {
      // console.log('ok,new value is true')
      // console.log(detailDrawerVisible)
      // if (detailDrawerVisible.value === true) {
      // console.log('we should close drawer right now')
      detailDrawerVisible.value = false
      // }
      orderStore.needCloseOrderDetailDrawer = false
    }
  }
)

const props = defineProps(['groupUuid', 'index'])
const route = useRoute()
const detailDrawerVisible = ref(false)
const groupName = computed(() => {
  return route.params.groupName
})

const type = computed(() => {
  return messageType[chatStore.chatMessage[props.groupUuid][props.index].message.action]
})

//membership
const systemMessage = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].message.displayMessage
})
const temps = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].temps
})

const time = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].time
})

//order
const orderUid = computed(() => {
  return chatStore.chatMessage[props.groupUuid]
    ? chatStore.chatMessage[props.groupUuid][props.index].message.orderUid
    : ''
})

const orderCreater = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].message.operator
})

const orderStatus = computed(() => {
  if (!chatStore.chatMessage[props.groupUuid][props.index].message.status) return ''
  let statusArray = chatStore.chatMessage[props.groupUuid][props.index].message.status.split(',')
  statusArray.pop()
  let status = statusArray[statusArray.length - 1]
  return status
})

const productQuantity = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].message.productQuantity
})

// const requestedDeliveryDate=computed(()=>{
//   return chatStore.chatMessage[props.groupUuid][props.index].message.requestedDeliveryDate
// })

const deliveryCheck = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].message.deliveryCheck
})

const avatar = computed(() => {
  return chatStore.chatMembersPool[orderCreater.value]
    ? chatStore.chatMembersPool[orderCreater.value].avatar
    : ''
})

const senderName = computed(() => {
  return chatStore.chatMembersPool[orderCreater.value]
    ? chatStore.chatMembersPool[orderCreater.value].firstName +
        ' ' +
        chatStore.chatMembersPool[orderCreater.value].lastName
    : '... ...'
})

onMounted(async () => {
  if (type.value === 'ORDER' && orderCreater.value !== userStore.uid) {
    await chatStore.getMemberBasicInfo(orderCreater.value)
    chatStore.updateAvatarUrl(avatar.value)
  }
})

function openOrderDetailsDrawer() {
  // orderStore.needRefreshOrderDetail = true
  detailDrawerVisible.value = true
}
</script>

<style scoped>
.item-div {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10px 0px;
}

.order-div {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0px;
}

.my-order-div {
  display: flex;
  justify-content: right;
  align-items: center;
  padding: 15px 5px;
  margin-right: 25px;
}

.other-order-div {
  display: flex;
  justify-content: left;
  padding: 15px 0px;
}

.avatar-div {
  margin-top: 25px;
}

.other-item-div {
  display: flex;
  flex-direction: column;
  margin-left: 15px;
}

.order-content {
  display: flex;
  justify-content: center;
  align-items: left;
  flex-direction: column;
  background-color: rgb(245, 255, 250);
  border-radius: 15px;
  padding: 15px;
  box-shadow: var(--el-box-shadow);
  width: 400px;
}

.divider {
  margin: 15px 0px;
  --el-border-color: #dcdfe669;
}

.sys-font {
  font-size: 14px;
  color: #909399b8;
}

.content-font {
  font-size: 16px;
  color: #878787;
}

.result-font {
  font-size: 16px;
  font-weight: bold;
  pointer-events: none;
}

.content-div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-font {
  font-size: 18px;
  font-weight: bold;
}

.time-font {
  font-size: 14px;
  color: #909399b8;
}

.details-button {
  font-size: 16px;
}

.sender-name {
  color: darkgrey;
}
</style>
