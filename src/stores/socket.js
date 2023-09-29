import { defineStore } from 'pinia'
// import main from '@/main'
// import store from '@/stores'
import { ElMessage } from 'element-plus'
import { useUrlStore } from '@/stores/url'
import { useChatStore } from './chat'
import { useUserStore } from '@/stores/user'
import { useRecordStore } from '@/stores/record'
import dayjs from 'dayjs'
import { messagesTable } from '@/utils/db'
import chatAPI from '@/api/chat'
// import { membersTable } from '@/utils/db'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    // status
    isConnected: false,
    // content
    message: '',
    // error
    reconnectError: false,
    // heartbeat time
    heartBeatInterval: 50000,
    // heartbeat timer
    heartBeatTimer: 0,
    reconnectTimer: 0,
    reconnectInterval: 7000,
    maxReconnectAttempts: 100,
    currentReconnectAttempts: 1,
    currentWS: {},
    isShutdownByAccident: false,
    shutdownTime: ''
  }),
  getters: {},
  actions: {
    SOCKET_ONOPEN(event) {
      clearInterval(this.reconnectTimer)
      if (this.isShutdownByAccident) {
        this.isShutdownByAccident = false
        let chatStore = useChatStore()
        let groupUuid = chatStore.currentGroupUuid
        if (groupUuid) {
          chatStore.updateOneGroupChatData(groupUuid, this.shutdownTime)
        }
        this.shutdownTime = ''
      }
      // console.log(event)
      const urlStore = useUrlStore()
      urlStore.websocketConnecting.close()
      ElMessage({
        message: 'connect websocket sucessfully',
        type: 'success'
      })
      console.log('successful websocket connection')
      this.currentWS = event.currentTarget
      this.isConnected = true
      // heartbeat
      this.heartBeatTimer = window.setInterval(() => {
        const message = 'Heartbeat message'
        console.info(message)
        this.isConnected &&
          this.currentWS.sendObj({
            code: 200,
            msg: message
          })
      }, this.heartBeatInterval)
    },
    // close
    SOCKET_ONCLOSE(event) {
      ElMessage({
        message: 'Websocket connection has been closed',
        type: 'warning'
      })
      console.log(event)
      let disconnectCode = event.code

      switch (disconnectCode) {
        case 1006:
          this.handleCloseUnexpected()
          break
        case 4401:
          this.handleCloseUnexpected()
          break
        default:
          this.handleCloseNomally()
      }
    },
    // error
    SOCKET_ONERROR(event) {
      const urlStore = useUrlStore()

      if (urlStore.websocketDisconnecting.visible) urlStore.websocketDisconnecting.close()

      ElMessage({
        message: event,
        type: 'error'
      })
      console.error(event)
    },
    //message
    SOCKET_ONMESSAGE(message) {
      const chatStore = useChatStore()
      console.log(message)
      let obj
      switch (message.Headers['x-amz-chime-event-type']) {
        case 'CREATE_CHANNEL_MESSAGE':
          obj = JSON.parse(message.Payload)
          console.log(obj)
          handleMessage(message)
          break
        case 'CREATE_CHANNEL_MEMBERSHIP':
          chatStore.getChatGroups()
          break
        case 'DELETE_CHANNEL_MEMBERSHIP':
          chatStore.needToUpdateGroupMembers = true
          break
        case 'BATCH_CREATE_CHANNEL_MEMBERSHIP':
          chatStore.needToUpdateGroupMembers = true
          break
        default:
          break
      }
      // if (message.Headers['x-amz-chime-message-type'] !== 'STANDARD') return
      // let obj = JSON.parse(message.Payload)
      // console.log(obj)
      // handleMessage(message)
    },
    // reconnects
    SOCKET_RECONNECT(count) {
      ElMessage({
        message: 'Reconnecting...' + count,
        type: 'warning'
      })
      console.info('Reconnecting...', count)
    },
    // reconnect error
    SOCKET_RECONNECT_ERROR() {
      this.reconnectError = true
    },
    handleCloseNomally() {
      const urlStore = useUrlStore()
      if (urlStore.websocketDisconnecting.visible) {
        urlStore.websocketDisconnecting.close()
      }
      this.isConnected = false
      window.clearInterval(this.heartBeatTimer)
      this.heartBeatTimer = 0
      console.log('Disconnect: ' + new Date())
      if (urlStore.router) {
        urlStore.router.push('/signin')
      }
      urlStore.$reset()
    },
    handleCloseUnexpected() {
      this.shutdownTime = dayjs().valueOf()
      this.isShutdownByAccident = true
      const urlStore = useUrlStore()
      if (urlStore.websocketDisconnecting.visible) {
        urlStore.websocketDisconnecting.close()
      }
      this.isConnected = false
      window.clearInterval(this.heartBeatTimer)
      this.heartBeatTimer = 0
      console.log('Disconnect: ' + new Date())
      console.log('RE: get ws url and reconnect...')
      this.getWSUrlAndReconnect()
    },
    getWSUrlAndReconnect() {
      console.log('start reconnection')
      this.reconnectTimer = setInterval(this.reconnectWebsocket, this.reconnectInterval)
    },
    reconnectWebsocket() {
      if (this.isConnected) {
        clearInterval(this.reconnectTimer)
        console.log('Reconnect successfully,stop reconnection.')
        this.currentReconnectAttempts = 1
        return
      }
      // const urlStore = useUrlStore()
      const urlStore = useUrlStore()
      chatAPI
        .getWebSocketUrl()
        .then((result) => {
          console.log(result)
          urlStore.websocketUrl = result.data.pkg.wssUrl
          if (this.currentReconnectAttempts < this.maxReconnectAttempts) {
            console.log('reconnect...' + this.currentReconnectAttempts)
            ElMessage({
              message: 'Get websocket url successfully!',
              type: 'success'
            })
            this.currentReconnectAttempts++
            this.isConnected = false
            urlStore.proxy.$connect(urlStore.websocketUrl)
          } else {
            clearInterval(this.reconnectTimer)
            console.log('Stop reconnection.')
          }
        })
        .catch((error) => {
          if (this.currentReconnectAttempts < this.maxReconnectAttempts) {
            console.log('Cannot get websocket url...try again...' + this.currentReconnectAttempts)
            this.currentReconnectAttempts++
            console.log(error)
          } else {
            //
            clearInterval(this.reconnectTimer)
            this.currentReconnectAttempts = 1
            console.log('Stop reconnection.')
          }
        })
    }
  }
})

async function handleMessage(message) {
  //there could be some system websocket message
  if (!message.Payload) {
    console.log(message)
    return
  }
  const userStore = useUserStore()
  const chatStore = useChatStore()
  let obj = JSON.parse(message.Payload)

  //get groupUuid
  let split = obj.ChannelArn.split('/')
  let groupUuid = split[split.length - 1]
  if (!chatStore.chatMessage[groupUuid]) {
    chatStore.chatMessage[groupUuid] = []
  }

  //make message to a acceptable structure
  let content = JSON.parse(obj.Content)
  let senderId = obj.Sender.Name.replace('SUPP_supplier_', '')
  let data = {
    message: content.messageData,
    messageType: content.messageType,
    temps: dayjs(obj.CreatedTimestamp).format('YYYY-MM-DD HH:mm:ss'),
    isMyself: senderId === userStore.uid,
    messageId: obj.MessageId,
    isLoading: false,
    nanoid: content.nid,
    senderId,
    time: obj.CreatedTimestamp,
    groupUuid: groupUuid
  }

  //handle messages
  if (senderId === userStore.uid) {
    //if the sender is myself
    for (let i = 0; i < chatStore.chatMessage[groupUuid].length; i++) {
      if (chatStore.chatMessage[groupUuid][i].nanoid === content.nid) {
        chatStore.chatMessage[groupUuid][i] = data
        break
      }
    }
  } else {
    //others' or system's

    chatStore.chatMessage[groupUuid].push(data)
  }

  //handle system messages that need to update ui
  if (
    content.messageType === 'sys' &&
    content.messageData.objectId === userStore.uid &&
    (content.messageData.action === 'memberRemoved' ||
      content.messageData.action === 'memberUpgrade' ||
      content.messageData.action === 'memberAdded')
  ) {
    chatStore.needToUpdateIsInChannel = true
  }

  //handle unread messages count object

  let urlStore = useUrlStore()
  // console.log(urlStore.route)
  if (urlStore.route && urlStore.route.params && urlStore.route.params.groupUuid === groupUuid) {
    useRecordStore().groupsLatestHaveReadTime[groupUuid] = obj.CreatedTimestamp
  } else {
    if (!chatStore.unreadMessagesCount[groupUuid]) {
      chatStore.unreadMessagesCount[groupUuid] = 0
    }
    if (!(content.messageType === 'sys' && content.messageData.operator === userStore.uid)) {
      chatStore.unreadMessagesCount[groupUuid]++
    }
  }

  //DB operation
  let messageUnit = await messagesTable().get(obj.MessageId)
  if (messageUnit) {
    console.log('ABNORMAL CIRCUMSTANCE!!!')
    messagesTable().update(obj.MessageId, data)
  } else {
    messagesTable().add(data)
  }
}

// Need to be used outside the setup
// export function useSocketStoreWithOut() {
//   return useSocketStore(store)
// }
