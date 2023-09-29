<template>
  <div class="item-div">
    <div class="supplier-item">
      <div v-if="props.operatorType === 'supplier'" class="supplier-content-item">
        <div class="main-item">
          <div class="supplier-time-item">
            <span>{{ temps }}</span>
            <span class="user-item">{{ name }}</span>
          </div>
          <span class="message-item">{{ message }}</span>
        </div>
      </div>
    </div>
    <div class="line-item">
      <div class="line">
        <div class="marker"></div>
      </div>
    </div>
    <div class="restaurant-item">
      <div v-if="props.operatorType === 'restaurant'" class="restaurant-content-item">
        <div class="main-item">
          <div class="restaurant-time-item">
            <span>{{ temps }}</span>
            <span class="user-item">{{ name }}</span>
          </div>
          <span class="message-item">{{ message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import dayjs from 'dayjs'
const props = defineProps(['metaInfo', 'operator', 'operatorType', 'ts'])
const message = ref('')
const chatStore = useChatStore()
const temps = ref('')
const name = computed(() => {
  return chatStore.chatMembersPool[props.operator]
    ? chatStore.chatMembersPool[props.operator].firstName +
        ' ' +
        chatStore.chatMembersPool[props.operator].lastName
    : '... ...'
})

onMounted(async () => {
  await chatStore.getMemberBasicInfo(props.operator)
  for (let i = 0; i < props.metaInfo.length; i++) {
    message.value = message.value + props.metaInfo[i] + '\n'
  }
  temps.value = dayjs(props.ts).format('YYYY-MM-DD HH:mm:ss')
})
</script>

<style scoped>
.item-div {
  display: flex;
  justify-content: space-between;
  /* height: 50px; */
}

.line {
  /* clip-path: polygon(0 100%, 100% 100%, 100% 40%, 0 40%); */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1px;
  top: 0;
  bottom: 0;
  position: absolute;
  background-color: var(--el-text-color-placeholder);
}

.marker {
  position: absolute;
  width: 13px;
  height: 13px;
  background-color: var(--el-text-color-placeholder);
  border-radius: 50%;
}

.line-item {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 10px;
}

.supplier-item {
  
  width: 50%;
  /* background-color: rgba(30, 225, 231, 0.493); */
  padding: 15px 10px 15px 150px;
}

.restaurant-item {
  width: 50%;
  padding: 15px 10px;
}

.supplier-content-item {
  /* padding-left: 75px; */
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.restaurant-content-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.message-item {
  max-width: 100%;
  font-size: 15px;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  white-space: pre-line;
}

.restaurant-time-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  color: hsla(0, 0%, 0%, 0.5);
}

.supplier-time-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  color: hsla(0, 0%, 0%, 0.5);
}

.user-item {
  margin-left: 10px;
  text-align: left;
}

.main-item {
  max-width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.supplier-main-item {
  max-width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}
</style>
