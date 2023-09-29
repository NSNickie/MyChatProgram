<template>
  <div class="my-chat-item-div">
    <div
      v-if="chatItemLoading"
      class="loading-item"
      element-loading-background="rgba(0, 0, 0, 0)"
      v-loading="chatItemLoading"
    ></div>
    <el-icon v-else class="check-item"><CircleCheck /></el-icon>

    <span v-if="!isImg" class="chat-item">
      {{ textMessage }}
      <div class="time-div">{{ temps }}</div>
    </span>

    <span v-else class="img-item-span">
      <div v-if="chatItemLoading" class="img-item">
        <el-icon><icon-picture /></el-icon>
      </div>
      <div v-else>
        <el-image class="img-pic" :src="imgUrl" @load="imageLoadingSuccess">
          <!-- <template #placeholder>
            <div class="img-item">
              <el-icon><icon-picture /></el-icon>
            </div>
          </template> -->
          <template #error>
            <div class="img-item">
              <el-icon><icon-picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <div class="img-time-div">{{ temps }}</div>
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '../../stores/chat'
import { Picture as IconPicture } from '@element-plus/icons-vue'

function imageLoadingSuccess() {
  if (isImg.value) {
    chatStore.imagesLoadedCount++
  }
}

const chatStore = useChatStore()
const props = defineProps(['index', 'groupUuid'])
let imgKeyList = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].message.imgKeyList
})
let imgUrl = computed(() => {
  return chatStore.imgUrlPool[imgKeyList.value] ? chatStore.imgUrlPool[imgKeyList.value].url : ''
})
const isImg = ref(false)

const textMessage = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].message.text
})
const temps = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].temps
})
const chatItemLoading = computed(() => {
  return chatStore.chatMessage[props.groupUuid][props.index].isLoading
})

// watch(
//   () => imgKeyList,
//   async (newValue) => {
//     if (newValue.value && newValue.value.length !== 0) {
//       await chatStore.getImgUrl(imgKeyList.value)
//       if (imgUrl.value) {
//         chatStore.chatMessage[props.groupUuid][props.index].isLoading = false
//         messagesTable().update(chatStore.chatMessage[props.groupUuid][props.index].messageId, {
//           isLoading: false
//         })
//       }
//     }
//   }
// )

onMounted(async () => {
  isImg.value = chatStore.chatMessage[props.groupUuid][props.index].messageType === 'img'
  if (!isImg.value) return
  // console.log(imgKeyList.value)
  await chatStore.getImgUrl(imgKeyList.value)
  // chatStore.chatMessage[props.groupUuid][props.index].isLoading = false
})
</script>

<style scoped>
.my-chat-item-div {
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 25px;
}

.chat-item {
  max-width: 60%;
  border-radius: 15px;
  background-color: #00a2ff;
  color: #ffffff;
  font-family: Public Sans, sans-serif;
  font-size: 15px;
  font-weight: 400;
  padding: 12px 16px 8px 16px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: var(--el-box-shadow-lighter);
  /* overflow: hidden; */
}

.img-item-span {
  max-width: 300px;
  border-radius: 15px;
  background-color: transparent;
  color: #ffffff;
  font-family: Public Sans, sans-serif;
  font-size: 15px;
  font-weight: 400;
  padding: 0px;
  line-height: 1.5;
  word-wrap: break-word;
}

.img-item {
  box-shadow: var(--el-box-shadow);
  border-radius: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 280px;
  height: 300px;
  background-color: rgba(220, 220, 220, 0.537);
  color: var(--el-text-color-secondary);
  font-size: 30px;
  margin-bottom: 5px;
}

.time-div {
  font-size: 12px;
  color: hsla(0, 0%, 100%, 0.5);
  text-align: right;
}

.img-pic {
  box-shadow: var(--el-box-shadow);
  border-radius: 13px;
}

.img-time-div {
  font-size: 12px;
  color: darkgray;
  text-align: right;
}

.loading-item {
  height: 30px;
  width: 30px;
  margin-right: 10px;
  --el-loading-spinner-size: 25px;
}

.check-item {
  height: 30px;
  width: 30px;
  margin-right: 5px;
  color: green;
  font-size: 18px;
}
</style>
