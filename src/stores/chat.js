import { defineStore } from 'pinia'
import chatAPI from '@/api/chat'
import dayjs from 'dayjs'
import fileAPI from '@/api/file'
import orgAPI from '@/api/org'
import { membersTable, messagesTable } from '@/utils/db'
import { useUserStore } from '@/stores/user'

export const useChatStore = defineStore('chat', {
  state: () => ({
    chatGroups: [],
    chatMessage: {},
    chatNanoIdMessageIdTable: {},
    nanoIdChatMessageTable: {},
    groupsMembers: {},
    groupsLoading: false,
    //avatar url pool
    avatarUrlPool: {},
    chatMembersPool: {},
    imgUrlPool: {},
    avatarUrlExpiredMinutes: 30,
    membersInfoExpiredMinutes: 60,
    imgUrlExpiredMinutes: 30,
    gettingMemberInfoFlag: false,
    gettingImgUrlFlag: false,
    avatarDefaultUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    dbInitFinshed: false,
    imagesCountNeedToLoad: 0,
    imagesLoadedCount: 0,
    currentGroupUuid: '',
    needToUpdateGroupMembers:false,
    needToUpdateIsInChannel:false,
    isUserInChannelsInfo:{},
    unreadMessagesCount:{},
  }),
  getters: {},
  actions: {
    async getImgUrl(imgKeyList) {
      if (this.imgUrlPool[imgKeyList[0]]) {
        let now = dayjs()
        let getTime = dayjs(this.imgUrlPool[imgKeyList[0]].getTime)
        if (!getTime.isBefore(now.subtract(this.imgUrlExpiredMinutes, 'minute'))) {
          return
        }
      }
      try {
        // if (this.gettingImgUrlFlag) return
        // this.gettingImgUrlFlag = true
        console.log('reload img')
        let keyNames = [imgKeyList[0]]
        let result = await fileAPI.getImgUrl(keyNames)
        // this.gettingImgUrlFlag = false
        if (!this.imgUrlPool[imgKeyList[0]]) {
          this.imgUrlPool[imgKeyList[0]] = {}
        }
        this.imgUrlPool[imgKeyList[0]].url = result.data.pkg.urls[0].url
        this.imgUrlPool[imgKeyList[0]].getTime = dayjs()
        // //DB
        // let dbMemberInfo = await membersTable().where('uid').equals(uid).first()
        // if (dbMemberInfo) {
        //   membersTable().update(uid, result.data.pkg.details)
        // } else {
        //   membersTable().add(result.data.pkg.details)
        // }
      } catch (error) {
        console.log(error)
        // this.gettingImgUrlFlag = false
      }
    },
    async getChatGroups() {
      try {
        // this.groupsLoading = true
        let result = await chatAPI.getChatGroups()
        this.chatGroups = result.data.pkg.groups
        // this.groupsLoading = false
      } catch (error) {
        // this.groupsLoading = false
        console.log(error)
      }
    },
    async getMemberBasicInfo(uid) {
      if (this.chatMembersPool[uid]) {
        let now = dayjs()
        let getTime = dayjs(this.chatMembersPool[uid].getTime)
        if (getTime) {
          if (!getTime.isBefore(now.subtract(this.membersInfoExpiredMinutes, 'minute'))) {
            this.chatMembersPool[uid].needToUpdate = false
            return
          } else {
            this.chatMembersPool[uid].needToUpdate = true
          }
        }
      }
      try {
        if (this.chatMembersPool[uid] && !this.chatMembersPool[uid].needToUpdate) return
        this.chatMembersPool[uid] = {}
        this.chatMembersPool[uid].needToUpdate = false
        this.chatMembersPool[uid].firstName = '...'
        this.chatMembersPool[uid].lastName = '...'

        let result = await orgAPI.getUserInfo(uid)

        this.chatMembersPool[uid] = result.data.pkg.details
        this.chatMembersPool[uid].getTime = dayjs()

        //DB
        let dbMemberInfo = await membersTable().where('uid').equals(uid).first()
        if (dbMemberInfo) {
          membersTable().update(uid, result.data.pkg.details)
        } else {
          membersTable().add(result.data.pkg.details)
        }
      } catch (error) {
        if (this.chatMembersPool[uid]) {
          delete this.chatMembersPool[uid]
        }
        console.log(error)
      }
    },
    updateAvatarUrl(avatar) {
      if (!avatar) {
        this.avatarUrlPool[avatar] = {
          url: this.avatarDefaultUrl,
          isDefault: true
        }
        return
      }
      try {
        if (this.avatarUrlPool[avatar] && !this.avatarUrlPool[avatar].isDefault) {
          let now = dayjs()
          let getTime = dayjs(this.avatarUrlPool[avatar].getTime)
          if (getTime.isBefore(now.subtract(this.avatarUrlExpiredMinutes, 'minute'))) {
            this.getAvatarUrl(avatar)
          }
        } else {
          this.getAvatarUrl(avatar)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async getAvatarUrl(avatar) {
      let result = await fileAPI.getAvatarUrl([avatar])
      if (!this.avatarUrlPool[avatar]) {
        this.avatarUrlPool[avatar] = {}
      }
      this.avatarUrlPool[avatar].url = result.data.pkg.urls[0].url
      this.avatarUrlPool[avatar].getTime = dayjs()
    },
    async updateOneGroupChatData(groupUuid, notBefore) {
      try {
        let userStore = useUserStore()
        let history = []
        let nextToken = ''
        let result
        do {
          if (nextToken) {
            result = await chatAPI.getChatHistory(groupUuid, notBefore, null, nextToken, 20)
          } else {
            result = await chatAPI.getChatHistory(groupUuid, notBefore, null, null, 20)
          }
          let messages = result.data.pkg.channelMessages
          nextToken = result.data.pkg.nextToken
          history = history.concat(messages)
          console.log('Update history from chat store:  ')
          console.log(messages)
        } while (nextToken)
        let handledHistory = []
        for (let i = 0; i < history.length; i++) {
          let content = JSON.parse(history[i].content)
          let result = await messagesTable().get(history[i].messageId)
          if (result) continue
          let data = {
            time: history[i].createdTimestamp,
            messageId: history[i].messageId,
            senderId: history[i].userUid,
            messageType: content.messageType,
            message: content.messageData,
            nanoid: content.nid,
            groupUuid: groupUuid,
            isLoading: false,
            isMyself: history[i].userUid === userStore.uid,
            temps: dayjs(history[i].createdTimestamp).format('YYYY-MM-DD HH:mm:ss')
          }
          handledHistory.push(data)
        }
        if (handledHistory.length !== 0) {
          await messagesTable().bulkPut(handledHistory)
          this.chatMessage[groupUuid] = await messagesTable()
            .where('groupUuid')
            .equals(groupUuid)
            .limit(20)
            .sortBy('time')
        }
      } catch (error) {
        console.log(error)
      }
    },
    getHandledAPIHistory(history, groupUuid) {
      let userStore = useUserStore()
      let handledHistory = []
      for (let i = 0; i < history.length; i++) {
        let content = JSON.parse(history[i].content)
        let data = {
          time: history[i].createdTimestamp,
          messageId: history[i].messageId,
          senderId: history[i].userUid,
          messageType: content.messageType,
          message: content.messageData,
          nanoid: content.nid,
          groupUuid: groupUuid,
          isLoading: false,
          isMyself: history[i].userUid === userStore.uid,
          temps: dayjs(history[i].createdTimestamp).format('YYYY-MM-DD HH:mm:ss')
        }
        handledHistory.unshift(data)
      }
      return handledHistory
    }
  },
  persist: true
})
