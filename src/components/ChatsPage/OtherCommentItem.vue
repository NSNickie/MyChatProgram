<template>
  <div class="my-chat-item-div">
    <div class="left-content">
      <span class="another-span">
        <el-avatar :size="35" :src="avatarUrl" />
      </span>
      <span class="right-item">
        <span class="sender-name">{{ senderName }}</span>
        <span class="chat-item"> {{ message }}</span>
      </span>
    </div>
    <div class="time-div">
      <span>{{ temps }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useChatStore } from '@/stores/chat'
import dayjs from 'dayjs'

const chatStore = useChatStore()
const orderStore = useOrderStore()
const props = defineProps(['index', 'orderUid'])

const userUid = computed(() => {
  return orderStore.ordersDetailList[props.orderUid].remarks[props.index].userUid
})

const message = computed(() => {
  return orderStore.ordersDetailList[props.orderUid].remarks[props.index].message
})

const temps = computed(() => {
  return dayjs(orderStore.ordersDetailList[props.orderUid].remarks[props.index].time).format(
    'YYYY-MM-DD HH:mm:ss'
  )
})

const senderName = computed(() => {
  return chatStore.chatMembersPool[userUid.value]
    ? chatStore.chatMembersPool[userUid.value].firstName +
        ' ' +
        chatStore.chatMembersPool[userUid.value].lastName
    : '... ...'
})

const avatarUrl = computed(() => {
  return chatStore.avatarUrlPool[avatar]
    ? chatStore.avatarUrlPool[avatar].url
    : chatStore.avatarDefaultUrl
})

const avatar = computed(() => {
  return chatStore.chatMembersPool[userUid.value]
    ? chatStore.chatMembersPool[userUid.value].avatar
    : ''
})

onMounted(async () => {
  await chatStore.getMemberBasicInfo(userUid.value)
  chatStore.updateAvatarUrl(avatar.value)
})
</script>

<style scoped>
.my-chat-item-div {
  padding: 10px 5px;
  display: flex;
  /* align-items: center; */
  justify-content: space-between;
}

.left-content {
  max-width: 55%;
  display: flex;
}
.another-span {
  margin-top: 5px;
}

.right-item {
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

.sender-name {
  color: darkgrey;
}

.chat-item {
  width: 100%;
  border-radius: 15px;
  /* background-color: #00bd8b; */
  color: #000000;
  font-family: Public Sans, sans-serif;
  font-size: 15px;
  font-weight: 400;
  padding: 0px 16px 8px 0p;
  line-height: 1.5;
  word-wrap: break-word;
  /* box-shadow: var(--el-box-shadow-lighter); */
  /* overflow: hidden; */
}

.my-chat-item-div .el-avatar {
  margin-right: 14px;
}

.time-div {
  font-size: 12px;
  color: hsla(0, 0%, 0%, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
