<template>
  <div class="chat-page-div">
    <div class="chat-rooms-div main-padding">
      <div class="up-div">
        <h1 class="title">CHATS</h1>
        <el-divider class="divider" />
        <el-input
          class="search-input transparent-input-border"
          placeholder="Search"
          suffix-icon="Search"
        >
        </el-input>
        <el-button class="invite-button" @click="inviteCustomers" plain>INVITE CUSTOMERS</el-button>
        <el-dialog v-model="inviteGroupDialogVisible" title="Invite Customer" width="35%">
          <el-form
            ref="newGroupForm"
            :model="newGroupData"
            label-position="top"
            :rules="newGroupRules"
            size="large"
          >
            <el-form-item prop="name" label="Customer Name">
              <el-input v-model="newGroupData.name" placeholder="Enter Customer Name"> </el-input>
            </el-form-item>
            <!-- <el-form-item prop="members" label="Supplier Members">
              <el-select
                v-loading="membersloading"
                v-model="newGroupData.members"
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
            </el-form-item> -->
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="inviteGroupDialogVisible = false">Cancel</el-button>
              <el-button v-loading.fullscreen.lock="fullscreenLoading" type="primary">
                Invite
              </el-button>
            </span>
          </template>
        </el-dialog>
        <el-divider class="invite-divider"></el-divider>
      </div>
      <div class="rooms-div" v-loading="chatStore.groupsLoading">
        <el-scrollbar>
          <div>
            <el-menu router :default-active="groupPath">
              <RoomItem
                v-for="item in chatStore.chatGroups"
                :key="item.groupUuid"
                :groupName="item.groupName"
                :groupUuid="item.groupUuid"
                :index="`/chats/${item.groupUuid}/${item.groupName}`"
              ></RoomItem>
            </el-menu>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <router-view v-if="chatStore.dbInitFinshed"></router-view>
  </div>
</template>

<script setup>
import RoomItem from '@/components/ChatsPage/RoomItem.vue'
import { useRoute } from 'vue-router'
// import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { useChatStore } from '../../stores/chat'
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import orgAPI from '@/api/org'
import chatAPI from '@/api/chat'
// import chatAPI from '@/api/chat'
import { useUserStore } from '../../stores'
import { useRecordStore } from '@/stores/record'

import dayjs from 'dayjs'

const recordStore = useRecordStore()
const userStore = useUserStore()
const groupPath = computed(() => {
  let path = useRoute().path.replaceAll('%20', ' ')
  return path
})
const chatStore = useChatStore()
const newGroupRules = reactive({
  name: [{ required: true, message: 'Please input customer name', trigger: 'blur' }],
  members: [{ required: true, message: 'Please select supplier members', trigger: 'blur' }]
})
const newGroupData = reactive({
  name: '',
  members: []
})
let staffData = ref([])

const membersloading = ref(false)
const fullscreenLoading = ref(false)
const newGroupForm = ref()
const inviteGroupDialogVisible = ref(false)

// async function createGroup() {
//   let groupUuid = ''
//   try {
//     await newGroupForm.value.validate()
//   } catch (error) {
//     console.log(error)
//     return
//   }

//   try {
//     fullscreenLoading.value = true
//     let result = await chatAPI.createChatGroup(newGroupData.name)
//     console.log(result)
//     ElMessage({
//       message: 'Create group successfully...',
//       type: 'success'
//     })
//     chatStore.chatGroups.push({
//       groupName: result.data.pkg.name,
//       groupUuid: result.data.pkg.groupUuid
//     })
//     groupUuid = result.data.pkg.groupUuid
//   } catch (error) {
//     fullscreenLoading.value = false
//     ElMessage({
//       message: error.response ? error.response.data.pkg.msg : error,
//       type: 'error'
//     })
//     return
//   }

//   try {
//     let result = await chatAPI.addChatMembers(groupUuid, newGroupData.members)
//     ElMessage({
//       message: 'Add group members successfully',
//       type: 'success'
//     })
//     console.log(result)
//   } catch (error) {
//     fullscreenLoading.value = false
//     ElMessage({
//       message: error.response ? error.response.data.pkg.msg : error,
//       type: 'error'
//     })
//     return
//   }
//   fullscreenLoading.value = false
//   inviteGroupDialogVisible.value = false
//   newGroupForm.value.resetFields()
//   getChatGroups()
// }

onMounted(async () => {
  await getChatGroups()
  getUnreadMessagesCount()
})

async function getUnreadMessagesCount() {
  let apiLatestTime = {}
  try {
    let result = await chatAPI.getMyLatestMsgs()
    apiLatestTime = result.data.pkg.latestMsgs
  } catch (error) {
    console.log(error)
  }

  for (let group of chatStore.chatGroups) {
    let notBefore = ''
    if (recordStore.groupsLatestHaveReadTime[group.groupUuid]) {
      notBefore = dayjs(recordStore.groupsLatestHaveReadTime[group.groupUuid]).valueOf()
    } else {
      try {
        let time = apiLatestTime[group.groupUuid]
        recordStore.groupsLatestHaveReadTime[group.groupUuid] = time
        if (time) {
          notBefore = dayjs(time).valueOf()
        } else {
          notBefore = null
        }
      } catch (error) {
        console.log(error)
      }
    }

    chatAPI
      .getChatHistory(group.groupUuid, notBefore, dayjs().valueOf(), null, 21)
      .then((result) => {
        let list = result.data.pkg.channelMessages
        list = list.filter((obj) => {
          let content = JSON.parse(obj.content)
          if (content.messageType === 'txt' && obj.userUid === userStore.uid) {
            return false
          } else if (
            content.messageType === 'sys' &&
            content.messageData.operator === userStore.uid
          ) {
            return false
          } else {
            return true
          }
        })
        chatStore.unreadMessagesCount[group.groupUuid] = list.length
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

async function getChatGroups() {
  await chatStore.getChatGroups()
}

function inviteCustomers() {
  inviteGroupDialogVisible.value = true
  getStaff()
}

async function getStaff() {
  try {
    membersloading.value = true
    let result = await orgAPI.getStaff()
    staffData.value = result.data.pkg.staff
    for (let i = 0; i < staffData.value.length; i++) {
      if (userStore.uid === staffData.value[i].uid) {
        staffData.value[i].disabled = true
        break
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
</script>

<style scoped>
.chat-page-div {
  display: flex;
  height: 100%;
}

.chat-rooms-div {
  display: flex;
  flex-direction: column;
  width: 350px;
  background-color: azure;
  border-radius: 10px;
}

.chat-box-div {
  display: flex;
  width: calc(100% - 350px);
  background-color: aliceblue;
  flex-direction: column;
}

.transparent-input-border {
  --el-input-border-color: #ffffff00;
}

.up-div {
  margin-bottom: 0px;
}

.invite-button {
  width: 100%;
  --el-button-border-color: #ffffff00;
  font-size: medium;
  margin-top: 10px;
  height: 45px;
  color: cornflowerblue;
  justify-content: flex-start;
}

.rooms-div {
  height: calc(100% - 185px);
}

.el-menu {
  border-right: none;
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

.chat-header div .el-button {
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
  padding: 20px 40px;
  height: calc(100% - 155px);
}

.chat-send {
  padding: 20px;
  display: flex;
  height: 80px;
  /* background-color: rgba(100, 148, 237, 0.153); */
  border-radius: 10px;
  align-items: center;
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

.invite-divider {
  margin: 0px;
  --el-border-color: #dcdfe618;
}
</style>
