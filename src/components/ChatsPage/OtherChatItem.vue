<template>
  <div class="my-chat-item-div">
    <span class="another-span">
      <el-avatar
        :size="35"
        :src="
          chatStore.avatarUrlPool[avatar]
            ? chatStore.avatarUrlPool[avatar].url
            : chatStore.avatarDefaultUrl
        "
      />
    </span>

    <span v-if="!isImg" class="right-item">
      <span class="sender-name">{{ senderName }}</span>
      <span class="chat-item">
        {{ textMessage }}
        <div class="time-div">{{ temps }}</div>
      </span>
    </span>
    <span v-else class="img-item-span">
      <div class="img-item-div">
        <span class="sender-name">{{ senderName }}</span>
        <el-image class="img-pic" :src="imgUrl" @load="imageLoadingSuccess" >
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
import { ref, onMounted, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Picture as IconPicture } from '@element-plus/icons-vue'
const isImg = ref(false)

const senderName = computed(() => {
  return chatStore.chatMembersPool[senderId.value]
    ? chatStore.chatMembersPool[senderId.value].firstName +
        ' ' +
        chatStore.chatMembersPool[senderId.value].lastName
    : '... ...'
})
const senderId = ref('')
const avatar = computed(() => {
  return chatStore.chatMembersPool[senderId.value]
    ? chatStore.chatMembersPool[senderId.value].avatar
    : ''
})
let imgKeyList = ref([])
let imgUrl = computed(() => {
  return chatStore.imgUrlPool[imgKeyList.value] ? chatStore.imgUrlPool[imgKeyList.value].url : ''
})
const props = defineProps(['index', 'groupUuid'])
const textMessage = ref('')
const chatStore = useChatStore()
const temps = ref('')

function imageLoadingSuccess() {
  if (isImg.value) {
    chatStore.imagesLoadedCount++
  }
}

onMounted(async () => {
  handleMessageData()
  await chatStore.getMemberBasicInfo(senderId.value)
  chatStore.updateAvatarUrl(avatar.value)
})

async function handleMessageData() {
  isImg.value = chatStore.chatMessage[props.groupUuid][props.index].messageType === 'img'
  temps.value = chatStore.chatMessage[props.groupUuid][props.index].temps
  senderId.value = chatStore.chatMessage[props.groupUuid][props.index].senderId
  if (!isImg.value) {
    textMessage.value = chatStore.chatMessage[props.groupUuid][props.index].message.text
  } else {
    imgKeyList.value = chatStore.chatMessage[props.groupUuid][props.index].message.imgKeyList
    await chatStore.getImgUrl(imgKeyList.value)
  }

  // senderName.value = chatStore.chatMessage[props.groupUuid][props.index].name
  // avatar.value = chatStore.chatMessage[props.groupUuid][props.index].avatar
}
</script>

<style scoped>
.my-chat-item-div {
  padding: 5px;
  display: flex;
  /* align-items: center; */
  justify-content: flex-start;
}

.my-chat-item-div .el-avatar {
  margin-right: 16px;
}

.img-item-div {
  display: flex;
  flex-direction: column;
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
.img-pic {
  box-shadow: var(--el-box-shadow);
  border-radius: 13px;
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
  max-height: 300px;
}
.right-item {
  max-width: 55%;
  display: flex;
  flex-direction: column;
}

.another-span{
  margin-top: 25px;
}

.chat-item {
  width: 100%;
  border-radius: 15px;
  background-color: #00bd8b;
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

.time-div {
  font-size: 12px;
  color: hsla(0, 0%, 100%, 0.5);
  text-align: left;
}

.img-time-div {
  font-size: 12px;
  color: darkgray;
  text-align: left;
}
.sender-name {
  color: darkgrey;
}
</style>
