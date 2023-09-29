<template>
  <div class="chat-box-div" v-loading.lock="chatBoxLoading">
    <div class="chat-header">
      <div>
        <el-avatar
          :size="35"
          src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        />
        <span>{{ useRoute().params.groupName }}</span>
      </div>
      <div>
        <el-button class="edit-guide-button" @click="openOrderDrawer" type="primary" round
          >START ORDER GUIDE</el-button
        >
        <el-button @click="openGroupDrawer" type="info" icon="MoreFilled" circle size="large" />
      </div>
    </div>
    <div class="chat-content">
      <div
        v-if="chatHistoryLoading"
        element-loading-background="rgba(0, 0, 0, 0)"
        v-loading="chatHistoryLoading"
        class="loading-item"
      ></div>
      <el-scrollbar @scroll="handleScroll" ref="chatScrollView">
        <div ref="scrollInnerRef">
          <component
            v-for="(item, index) in useChatStore().chatMessage[groupUuid]"
            :key="item.messageId"
            :index="index"
            :groupUuid="groupUuid"
            :is="getItemType(item)"
          />
        </div>
      </el-scrollbar>
    </div>
    <div v-if="chatStore.isUserInChannelsInfo[groupUuid]" class="chat-send">
      <el-upload
        ref="imgUploader"
        v-model:file-list="imgList"
        :auto-upload="false"
        :http-request="uploadImg"
        :limit="1"
        :on-success="handleUploadSuccess"
        :show-file-list="false"
        accept=".jpg, .png"
        action="aws"
      >
        <el-button type="primary" icon="Camera" circle size="large" />
      </el-upload>

      <el-input
        @keyup.enter="sendMessage"
        ref="sendInput"
        v-model="inputMessage"
        class="msg-input"
        placeholder="Say something..."
      ></el-input>
      <el-button @click="sendMessage" type="primary" icon="Promotion" circle size="large" />
    </div>
    <div
      v-loading="channelBlockChecking"
      v-if="!chatStore.isUserInChannelsInfo[groupUuid]"
      class="channel-block"
    >
      <span class="channel-block-name">#{{ groupName }}</span>
      <el-button type="success" @click="joinChannel" class="join-channel-button"
        >Join Channel</el-button
      >
    </div>
    <el-drawer
      size="500"
      style="border-radius: 30px; margin: 10px 15px 20px 15px; height: calc(100% - 20px)"
      modal-class="group-drawer"
      v-model="groupDrawer"
      direction="rtl"
    >
      <template #header>
        <h4>ABOUT</h4>
      </template>
      <template #default>
        <div class="drawer-top">
          <el-avatar
            class="drawer-avatar"
            :size="70"
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
          />
          <h1>{{ groupName }}</h1>
          <el-divider class="invite-divider"></el-divider>
        </div>
        <div v-loading="gettingMembersList">
          <div class="drawer-members">
            <el-tabs :stretch="true" v-model="activeName" class="member-tabs">
              <el-tab-pane class="tab-pane" label="Supplier" name="Supplier">
                <div class="scrollbar-div">
                  <el-scrollbar height="100%">
                    <el-menu>
                      <MemberItem
                        v-for="(item, index) in supplierMembersList"
                        :key="item.uid"
                        :index="index"
                        :name="item.firstName + ' ' + item.lastName"
                        :email="item.email"
                        :uid="item.uid"
                        :groupUuid="groupUuid"
                        :groupRole="item.groupRole"
                        :isUserAdmin="isUserAdmin"
                        :isUserOwner="isUserOwner"
                        :isRoleOwner="item.groupOwner"
                        :isUserInChannel="isUserInChannel"
                      >
                      </MemberItem>
                    </el-menu>
                  </el-scrollbar>
                </div>
              </el-tab-pane>
              <el-tab-pane class="tab-pane" label="Restaurant" name="Restaurant">
                <div class="scrollbar-div">
                  <el-scrollbar height="100%">
                    <MemberItem
                      v-for="(item, index) in restourantMembersList"
                      :key="item.uid"
                      :index="index"
                      :name="item.firstName + ' ' + item.lastName"
                      :email="item.email"
                      :uid="item.uid"
                      :groupUuid="groupUuid"
                      :groupRole="item.groupRole"
                      :isUserAdmin="isUserAdmin"
                      :isUserOwner="isUserOwner"
                      :isRoleOwner="item.groupOwner"
                    >
                    </MemberItem>
                  </el-scrollbar>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="drawer-operation">
            <el-button
              v-if="isUserInChannel && (isUserAdmin || isUserOwner)"
              type="primary"
              @click="addMember"
              round
              >ADD MEMBER</el-button
            >
            <!-- <el-button type="primary" @click="addModerator" round>ADD MODERATOR</el-button> -->
            <!-- <el-button type="danger" @click="deleteMember" round>DELETE MEMBER</el-button> -->
            <el-button v-if="isUserInChannel" type="danger" round @click="leaveChannel"
              >LEAVE CHANNEL</el-button
            >
          </div>
        </div>
        <el-dialog
          :close-on-click-modal="false"
          v-model="addMemberDialog"
          title="ADD MEMBER"
          width="30%"
        >
          <!-- <span>You can add members here</span> -->
          <el-form
            v-loading="addMembersloading"
            ref="addMembersForm"
            :model="addMembersData"
            label-position="top"
            :rules="addMembersRules"
            size="large"
          >
            <el-form-item prop="members" label="Supplier Members">
              <el-select
                v-loading="membersloading"
                v-model="addMembersData.members"
                multiple
                collapse-tags
                placeholder="Select Members"
                style="width: 100%"
                :max-collapse-tags="3"
              >
                <el-option
                  v-for="member in staffData"
                  :key="member.uid"
                  :label="member.firstName + ' ' + member.lastName + ' ' + `(${member.email})`"
                  :value="member.uid"
                  :disabled="member.disabled"
                >
                  <span style="float: left">{{ member.firstName + ' ' + member.lastName }}</span>
                  <span
                    style="float: right; color: var(--el-text-color-secondary); font-size: 13px"
                    >{{ `${member.email}` }}</span
                  ></el-option
                >
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addMemberDialog = false">Cancel</el-button>
              <el-button type="primary" @click="requestAddMembers"> Confirm </el-button>
            </span>
          </template>
        </el-dialog>
      </template>
    </el-drawer>
    <el-drawer
      size="1000"
      style="border-radius: 30px; margin: 10px 15px 20px 15px; height: calc(100% - 20px)"
      v-model="orderStore.orderDrawerVisible"
      direction="rtl"
    >
      <template #header>
        <h1>Start order guide for {{ groupName }}</h1>
      </template>
      <OrderDrawer :channelName="groupName"></OrderDrawer>
    </el-drawer>
  </div>
</template>

<script setup>
import SystemChatItem from './SystemChatItem.vue'
import MyChatItem from './MyChatItem.vue'
import OtherChatItem from './OtherChatItem.vue'
import MemberItem from './MemberItem.vue'
import OrderDrawer from './OrderDrawer.vue'
import { useChatStore } from '@/stores/chat'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import chatAPI from '@/api/chat'
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { messagesTable } from '@/utils/db'
import { useUserStore } from '@/stores'
import { useOrderStore } from '@/stores/order'
import uploadAPI from '@/api/upload'
import newAxios from 'axios'
import orgAPI from '@/api/org'
import { useRecordStore } from '@/stores/record'

const recordStore = useRecordStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const chatBoxLoading = ref(false)
const scrollInnerRef = ref()
const chatScrollView = ref()
const chatStore = useChatStore()
const route = useRoute()
let groupUuid = computed(() => {
  return route.params.groupUuid
})
let groupName = computed(() => {
  return route.params.groupName
})
const isUserAdmin = ref(false)
const isUserOwner = ref(false)
const isUserInChannel = ref(false)
const channelBlockChecking = ref(false)
const membersloading = ref(false)
const addMembersloading = ref(false)
const addMembersRules = reactive({
  members: [{ required: true, message: 'Please select supplier members', trigger: 'blur' }]
})
const addMembersData = reactive({ members: [] })
const staffData = ref([])
const existingMembersTable = ref({})
const addMembersForm = ref()
const sendInput = ref()
const inputMessage = ref('')
const imgList = ref([])
const imgKeyList = ref([])
const imgUploader = ref()
const imgGetUrl = ref('')
const imgKeyName = ref('')
const groupDrawer = ref(false)
const membersList = ref([])
const supplierMembersList = computed(() => {
  return membersList.value.filter((item) => {
    if (item.userSource === 'supplier') {
      return item
    }
  })
})
const restourantMembersList = computed(() => {
  return membersList.value.filter((item) => {
    if (item.userSource === 'restaurant') {
      return item
    }
  })
})
const gettingMembersList = ref(false)
const addMemberDialog = ref(false)
const chatHistoryLoading = ref(false)
const historyMode = ref(false)
const activeName = ref('Supplier')
// const router = useRouter()

watch(
  () =>
    chatStore.chatMessage[groupUuid.value]
      ? chatStore.chatMessage[groupUuid.value].length
      : chatStore.chatMessage[groupUuid.value],
  () => {
    // console.log(chatStore.chatMessage[groupUuid.value].length)
    if (historyMode.value === true) return
    scrollBarScrollToBottom('instant')
  }
)

watch(
  () => imgList.value,
  (newValue, oldValue) => {
    if (oldValue.length === 0) {
      imgUploader.value.submit()
    }
  }
)

watch(
  () => chatStore.imagesLoadedCount,
  (newValue) => {
    // console.log('need to load: ' + chatStore.imagesCountNeedToLoad)
    // console.log('loaded: ' + newValue)
    if (newValue === chatStore.imagesCountNeedToLoad && historyMode.value !== true) {
      scrollBarScrollToBottom('instant')
    }
  }
)

watch(
  () => groupUuid.value,
  (newValue) => {
    chatStore.currentGroupUuid = newValue
  }
)

watch(
  () => chatStore.needToUpdateGroupMembers,
  (newValue) => {
    if (newValue === true) {
      membersList.value = []
      getMemberList()
      chatStore.needToUpdateGroupMembers = false
    }
  }
)

watch(
  () => chatStore.needToUpdateIsInChannel,
  (newValue) => {
    if (newValue === true) {
      getIsChannelBlock()
      chatStore.needToUpdateIsInChannel = false
    }
  }
)

function getItemType(item) {
  if (item.messageType === 'sys') {
    return SystemChatItem
  }
  if (item.isMyself) {
    return MyChatItem
  } else {
    return OtherChatItem
  }
}

async function uploadImg(res) {
  try {
    let nid = nanoid()
    pushImgMessageAnyway(nid)
    await getUploadChatImgInfo(imgList.value.length)
    await putImgToAwsUrl(res)
    sendImgMessage(nid)
  } catch (error) {
    ElMessage({
      message: error,
      type: 'error'
    })
    console.log(error)
  }
}

function openOrderDrawer() {
  orderStore.needRefreshOrders = true
  orderStore.orderChanged = false
  orderStore.orderDrawerVisible = true
}

function openGroupDrawer() {
  groupDrawer.value = true
  getMemberList()
}

function addMember() {
  addMemberDialog.value = true
  getStaff()
}

async function requestAddMembers() {
  try {
    await addMembersForm.value.validate()
  } catch (error) {
    return
  }

  try {
    addMembersloading.value = true
    let result = await chatAPI.addChatMembers(groupUuid.value, addMembersData.members)
    chatStore.needToUpdateGroupMembers = true
    console.log(result)
    ElMessage({
      message: 'Add member(s) successfully...',
      type: 'success'
    })
    addMembersloading.value = false
    addMemberDialog.value = false
    addMembersData.members = []
  } catch (error) {
    addMembersloading.value = false
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : error,
      type: 'error'
    })
  }
}

async function getStaff() {
  try {
    membersloading.value = true
    let result = await orgAPI.getStaff()
    staffData.value = result.data.pkg.staff
    for (let i = 0; i < staffData.value.length; i++) {
      if (existingMembersTable.value[staffData.value[i].uid]) {
        staffData.value[i].disabled = true
      }
    }
    console.log(staffData.value)
    membersloading.value = false
  } catch (error) {
    membersloading.value = false
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : error,
      type: 'error'
    })
  }
}

async function leaveChannel() {
  try {
    await ElMessageBox.confirm(`Are you sure you want to leave?`, 'Warning', {
      confirmButtonText: 'Yes, I am sure',
      cancelButtonText: 'No',
      type: 'warning'
    })
  } catch (error) {
    return
  }
  try {
    gettingMembersList.value = true
    await chatAPI.deleteMember(groupUuid.value, userStore.uid)
    ElMessage({
      message: 'leave channel successfully',
      type: 'success'
    })
    groupDrawer.value = false
    getIsChannelBlock()
    chatStore.getChatGroups()
    gettingMembersList.value = false
  } catch (error) {
    gettingMembersList.value = false
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : error,
      type: 'error'
    })
  }
}

async function getMemberList() {
  try {
    existingMembersTable.value = {}
    let nextToken = null
    let list = []
    membersList.value = []
    gettingMembersList.value = true
    let result = {}
    do {
      if (nextToken) {
        result = await chatAPI.getMemberList(groupUuid.value, nextToken)
      } else {
        result = await chatAPI.getMemberList(groupUuid.value)
      }
      console.log(result)
      let users = result.data.pkg.users
      nextToken = result.data.pkg.nextToken
      list = list.concat(users)
    } while (nextToken)
    membersList.value = list

    for (let member of membersList.value) {
      existingMembersTable.value[member.uid] = true
      if (member.uid === userStore.uid) {
        if (member.groupOwner === true) {
          isUserOwner.value = true
        } else {
          isUserOwner.value = false
        }
        if (member.groupRole === 'Manager') {
          isUserAdmin.value = true
        } else {
          isUserAdmin.value = false
        }
      }
    }
    gettingMembersList.value = false
  } catch (error) {
    gettingMembersList.value = false
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : error,
      type: 'error'
    })
  }
}

function pushImgMessageAnyway(nid) {
  let data = {
    message: { imgKeyList: imgKeyList.value },
    isLoading: true,
    nanoid: nid,
    temps: dayjs().format('YYYY-MM-DD HH:mm'),
    isMyself: true,
    messageType: 'img'
  }
  if (!chatStore.chatMessage[groupUuid.value]) {
    chatStore.chatMessage[groupUuid.value] = []
  }
  chatStore.chatMessage[groupUuid.value].push(data)
}

async function sendImgMessage(nid) {
  ElMessage({
    message: 'send img message',
    type: 'info'
  })
  chatStore.imagesCountNeedToLoad = 1
  chatStore.imagesLoadedCount = 0
  await chatAPI.sendGroupMessageImg(groupUuid.value, imgKeyList.value, nid)
  ElMessage({
    message: 'send img message successfully',
    type: 'success'
  })
}

async function putImgToAwsUrl(res) {
  let file = res.file
  let config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  for (let i = 0; i < imgList.value.length; i++) {
    if (file.name === imgList.value[i].name) {
      let result = await newAxios.put(imgList.value[i].pushUrl, file, config)
      console.log(result)
      break
    }
  }
  ElMessage({
    message: 'Upload the images successfully!',
    type: 'info'
  })
  chatStore.imgUrlPool[imgKeyName.value] = {
    url: imgGetUrl.value,
    getTime: dayjs()
  }
}

async function getUploadChatImgInfo(num) {
  imgKeyList.value = []
  let result = await uploadAPI.getUploadChatFileInfo(num)
  ElMessage({
    message: 'Get upload image keys successfully!',
    type: 'success'
  })
  if (result.data.apiStatus === 'ok') {
    let data = result.data
    for (let i = 0; i < data.pkg.urls.length; i++) {
      imgKeyList.value.push(data.pkg.urls[i].keyName)
      imgList.value[i].pushUrl = data.pkg.urls[i].putPresignedUrl
      imgGetUrl.value = data.pkg.urls[i].getPresignedUrl
      imgKeyName.value = data.pkg.urls[i].keyName
    }
  }
}

async function handleUploadSuccess() {
  console.log('update successfully')
  imgKeyList.value = []
  imgList.value = []
}

async function sendMessage() {
  try {
    if (!inputMessage.value) {
      ElMessage({
        message: "Can't send space",
        type: 'warning'
      })
      return
    }

    let nid = nanoid()
    let data = {
      message: { text: inputMessage.value },
      isLoading: true,
      nanoid: nid,
      temps: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      isMyself: true,
      messageType: 'txt'
    }
    if (!chatStore.chatMessage[groupUuid.value]) {
      chatStore.chatMessage[groupUuid.value] = []
    }
    chatStore.chatMessage[groupUuid.value].push(data)

    let inputMsg = inputMessage.value
    sendInput.value.clear()
    historyMode.value = false
    let result = await chatAPI.sendGroupMessageTxt(groupUuid.value, inputMsg, nid)
    if (result.data.apiStatus === 'ok') {
      for (let i = 0; i < chatStore.chatMessage[groupUuid.value].length; i++) {
        if (chatStore.chatMessage[groupUuid.value][i].nanoid === result.data.pkg.nid) {
          chatStore.chatMessage[groupUuid.value][i].isLoading = false
          break
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

async function scrollBarScrollToBottom(behavior) {
  setTimeout(() => {
    // console.log('scroll to bottom')
    if (chatScrollView.value) {
      chatScrollView.value.update()
      chatScrollView.value.scrollTo({ top: scrollInnerRef.value.clientHeight, behavior })
    }
  }, 0)
}

async function getChatHistory(to) {
  try {
    let id = groupUuid.value
    if (to) {
      id = to.params.groupUuid
    }

    chatBoxLoading.value = true
    let chatHistory = await messagesTable().where('groupUuid').equals(id).toArray()
    chatHistory.sort((a, b) => {
      if (dayjs(a.time).isAfter(dayjs(b.time))) {
        return 1
      } else {
        return -1
      }
    })
    chatHistory = chatHistory.slice(-20)
    if (chatHistory && chatHistory.length !== 0) {
      // console.log('chat history exist, but we can update silently')
      chatStore.imagesCountNeedToLoad = 0
      chatStore.chatMessage[id] = chatHistory
      chatStore.imagesCountNeedToLoad = await messagesTable()
        .where({ groupUuid: id, messageType: 'img' })
        .count()
      updateChatHistorySilently(to, chatHistory)
    } else {
      // console.log('chat history not exist')
      let result = await chatAPI.getChatHistory(id, null, null, null, 20)
      // console.log(result)
      await handleChatHistory(result.data.pkg.channelMessages, id)
    }
    chatBoxLoading.value = false
  } catch (error) {
    console.log(error)
  }
}

async function updateChatHistorySilently(to, chatHistory) {
  let id = groupUuid.value
  if (to) {
    id = to.params.groupUuid
  }
  let result = await chatAPI.getChatHistory(id, null, null, null, 20)
  // console.log(result)
  let history = result.data.pkg.channelMessages
  let handledHistory = []
  let imagesCount = 0
  for (let i = 0; i < history.length; i++) {
    let content = JSON.parse(history[i].content)
    let result = false
    for (let j = 0; j < chatHistory.length; j++) {
      if (chatStore.chatMessage[id][j].messageId === history[i].messageId) {
        result = true
        break
      }
    }
    // let result = await messagesTable().get(history[i].messageId)

    if (content.messageType === 'img') {
      imagesCount++
    }

    if (result) continue
    let data = {
      time: history[i].createdTimestamp,
      messageId: history[i].messageId,
      senderId: history[i].userUid,
      messageType: content.messageType,
      message: content.messageData,
      nanoid: content.nid,
      groupUuid: id,
      isLoading: false,
      isMyself: history[i].userUid === userStore.uid,
      temps: dayjs(history[i].createdTimestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    handledHistory.push(data)
  }
  //if there are new messages
  if (handledHistory.length !== 0) {
    try {
      await messagesTable().bulkPut(handledHistory)
    } catch (error) {
      console.log(error)
    }

    let chatHistory = await messagesTable().where('groupUuid').equals(id).toArray()
    chatHistory.sort((a, b) => {
      if (dayjs(a.time).isAfter(dayjs(b.time))) {
        return 1
      } else {
        return -1
      }
    })
    chatHistory = chatHistory.slice(-20)
    chatStore.chatMessage[id] = chatHistory

    chatStore.imagesCountNeedToLoad = 0
    chatStore.imagesCountNeedToLoad += imagesCount
  }
}

async function handleChatHistory(history, id) {
  let handledHistory = []
  chatStore.imagesCountNeedToLoad = 0
  for (let i = 0; i < history.length; i++) {
    let content = JSON.parse(history[i].content)

    if (content.messageType === 'img') {
      chatStore.imagesCountNeedToLoad++
      // console.log('++'+chatStore.imagesCountNeedToLoad)
    }
    let data = {
      time: history[i].createdTimestamp,
      messageId: history[i].messageId,
      senderId: history[i].userUid,
      messageType: content.messageType,
      message: content.messageData,
      nanoid: content.nid,
      groupUuid: id,
      isLoading: false,
      isMyself: history[i].userUid === userStore.uid,
      temps: dayjs(history[i].createdTimestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    handledHistory.push(data)
  }
  await messagesTable().bulkPut(handledHistory)
  let chatHistory = await messagesTable().where('groupUuid').equals(id).toArray()
  chatHistory.sort((a, b) => {
    if (dayjs(a.time).isAfter(dayjs(b.time))) {
      return 1
    } else {
      return -1
    }
  })
  chatHistory = chatHistory.slice(-20)
  chatStore.chatMessage[id] = chatHistory
}

async function handleScroll(event) {
  let topDistance = event.scrollTop
  if (topDistance === 0) {
    try {
      if (chatStore.chatMessage[groupUuid.value].length === 0) return
      let beforeUpdateHeight = scrollInnerRef.value.clientHeight

      historyMode.value = true
      chatHistoryLoading.value = true

      //check db first
      let chatHistory = await messagesTable().where('groupUuid').equals(groupUuid.value).toArray()
      chatHistory.sort((a, b) => {
        if (dayjs(a.time).isAfter(dayjs(b.time))) {
          return 1
        } else {
          return -1
        }
      })
      let filteredMessages = chatHistory.filter((record) => {
        return dayjs(record.time).isBefore(dayjs(chatStore.chatMessage[groupUuid.value][0].time))
      })

      //if db has history messages
      if (filteredMessages && filteredMessages.length >= 20) {
        chatStore.chatMessage[groupUuid.value].unshift(...filteredMessages.slice(-20))
        setTimeout(() => {
          if (chatScrollView.value) {
            let afterUpdateHeight = scrollInnerRef.value.clientHeight

            let heightDifference = afterUpdateHeight - beforeUpdateHeight
            chatScrollView.value.update()
            chatScrollView.value.scrollTo({ top: heightDifference, behavior: 'instant' })
          }
        }, 0)
      } else {
        //get api data
        let notAfter = dayjs(chatStore.chatMessage[groupUuid.value][0].time).valueOf()
        let result = await chatAPI.getChatHistory(groupUuid.value, null, notAfter, null, 20)
        let history = result.data.pkg.channelMessages
        let handledHistory = chatStore.getHandledAPIHistory(history, groupUuid.value)

        await messagesTable().bulkPut(handledHistory)
        if (handledHistory.length !== 0) {
          chatStore.chatMessage[groupUuid.value].unshift(...handledHistory)

          setTimeout(() => {
            if (chatScrollView.value) {
              let afterUpdateHeight = scrollInnerRef.value.clientHeight

              let heightDifference = afterUpdateHeight - beforeUpdateHeight
              chatScrollView.value.update()
              chatScrollView.value.scrollTo({ top: heightDifference, behavior: 'instant' })
            }
          }, 0)
        }
      }

      chatHistoryLoading.value = false
    } catch (error) {
      console.log(error)
      chatHistoryLoading.value = false
    }
  }
}

function initImagesCount(to) {
  chatStore.imagesLoadedCount = 0
  let id = ''
  if (to) {
    // console.log('to: ')
    // console.log(to.params.groupUuid)
    id = to.params.groupUuid
  } else {
    id = groupUuid.value
    // console.log(id)
  }

  let list = chatStore.chatMessage[id]
  if (!list || list.length === 0) return
  chatStore.imagesCountNeedToLoad = 0
  for (let i = 0; i < list.length; i++) {
    if (list[i].messageType === 'img') {
      chatStore.imagesCountNeedToLoad++
    }
  }
}

async function getIsChannelBlock(to) {
  try {
    existingMembersTable.value = {}
    let existMembersList = {}
    let id = groupUuid.value
    if (to) {
      id = to.params.groupUuid
    }
    let nextToken = null
    let list = []
    membersList.value = []
    // channelBlockChecking.value = true

    isUserInChannel.value = false
    let result = {}
    do {
      if (nextToken) {
        result = await chatAPI.getMemberList(id, nextToken)
      } else {
        result = await chatAPI.getMemberList(id)
      }
      let users = result.data.pkg.users
      nextToken = result.data.pkg.nextToken
      list = list.concat(users)
    } while (nextToken)
    membersList.value = list

    for (let member of membersList.value) {
      existMembersList[member.uid] = true
    }
    if (existMembersList[userStore.uid]) {
      chatStore.isUserInChannelsInfo[id] = true
      isUserInChannel.value = true
    } else {
      chatStore.isUserInChannelsInfo[id] = false
      isUserInChannel.value = false
    }
    // channelBlockChecking.value = false
    // console.log('over')
    scrollBarScrollToBottom()
  } catch (error) {
    console.log(error)
  }
}

async function joinChannel() {
  try {
    channelBlockChecking.value = true
    await chatAPI.addChatMembers(groupUuid.value, [userStore.uid])
    getChatHistory()
    chatStore.isUserInChannelsInfo[groupUuid.value] = true
    isUserInChannel.value = true
    channelBlockChecking.value = false
  } catch (error) {
    chatStore.isUserInChannelsInfo[groupUuid.value] = false
    isUserInChannel.value = false
    channelBlockChecking.value = true
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'Failed',
      type: 'error'
    })
  }
}

onMounted(async () => {
  clearUnreadMessages()
  initImagesCount()
  chatStore.currentGroupUuid = groupUuid.value
  getIsChannelBlock()
  await getChatHistory()
  scrollBarScrollToBottom('instant')
  updateLatestHaveReadGroupsInfo()
  chatStore.needToUpdateGroupMembers = false
  chatStore.needToUpdateIsInChannel = false
})

onBeforeRouteUpdate(async (to) => {
  clearUnreadMessages(to)
  getIsChannelBlock(to)
  initImagesCount(to)
  await getChatHistory(to)
  scrollBarScrollToBottom('instant')
  updateLatestHaveReadGroupsInfo(to)
  chatStore.currentGroupUuid = to.params.groupUuid
  chatStore.needToUpdateGroupMembers = false
  chatStore.needToUpdateIsInChannel = false
})
//23-09-15 20:36:14
function updateLatestHaveReadGroupsInfo(to) {
  let id = groupUuid.value
  if (to) {
    id = to.params.groupUuid
  }
  recordStore.groupsLatestHaveReadTime[id] =dayjs()
    // chatStore.chatMessage[id][chatStore.chatMessage[id].length - 1].time
}

function clearUnreadMessages(to) {
  let id = groupUuid.value
  if (to) {
    id = to.params.groupUuid
  }
  setTimeout(() => {
    chatStore.unreadMessagesCount[id] = 0
  }, 700)
}
</script>

<style lang="less" scoped>
.chat-box-div {
  display: flex;
  width: calc(100% - 350px);
  background-color: aliceblue;
  flex-direction: column;
}

.chat-header {
  margin: 5px;
  box-shadow: var(--el-box-shadow-light);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  width: calc(100% - 10px);
  height: 65px;
  background-color: rgba(31, 184, 208, 0.071);
  align-items: center;
  justify-content: space-between;
}

.chat-header div {
  display: flex;
  align-items: center;
}

.chat-header div .el-button:nth-child(2) {
  --el-button-size: 35px;
  font-size: 23px;
}

.chat-header .el-avatar {
  margin-right: 10px;
}

.chat-header span {
  font-size: 17px;
  font-weight: 600;
}

.chat-content {
  position: relative;
  padding: 20px 20px;
  height: calc(100% - 155px);
  max-height: calc(100% - 155px);
  min-height: calc(100% - 215px);
}

.chat-send {
  padding: 20px;
  display: flex;
  height: 80px;
  /* background-color: rgba(100, 148, 237, 0.153); */
  border-radius: 10px;
  align-items: center;
  bottom: 0px;
}

.chat-send .el-button {
  --el-button-size: 35px;
  font-size: 23px;
}

.chat-send .el-button:nth-child(1) {
  margin-right: 10px;
}

/* .chat-send .el-button:nth-child(2) {
  margin-left: 0px;
  margin-right: 10px;
} */

.chat-send .el-button:nth-child(3) {
  margin-left: 10px;
}

.chat-send .el-input {
  font-size: 18px;
  height: 40px;
  --el-input-border-color: #ffffff00;
  --el-border-radius-base: 15px;
}

.divider {
  --el-border-color: #dcdfe64f;
}

:deep(.el-drawer__header) {
  margin-bottom: 0px;
}

.drawer-top {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.drawer-avatar {
  margin-bottom: 20px;
}

.invite-divider {
  margin: 20px 0 0 0;
  --el-border-color: #a0a0a021;
}

.drawer-members {
  height: calc(100% - 350px);
}

.el-menu {
  border-right: none;
}

.drawer-operation {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drawer-operation .el-button {
  width: 90%;
  margin-left: 0px;
  margin-top: 5px;
  height: 40px;
}

.loading-item {
  --el-loading-spinner-size: 30px;
  position: absolute;
  left: 50%;
  top: 20px;
}

.edit-guide-button {
  height: 35px;
}

.channel-block {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
  background-color: rgba(31, 184, 208, 0.071);
  box-shadow: var(--el-box-shadow-light);
  min-height: 120px;
  border-radius: 10px;
  margin: 10px;
}

.channel-block-name {
  text-align: center;
  width: 100%;
  overflow-wrap: anywhere;
  font-weight: 700;
  font-size: 24px;
}

.join-channel-button {
  font-size: 18px;
  margin-bottom: 15px;
}

.scrollbar-div {
  height: calc(100vh - 423px);
  padding: 0px 10px 20px 10px;
}
</style>
