// db.js
import Dexie from 'dexie'
import { useChatStore } from '../stores'

let dexie = null
export const initDB = (uid) => {
  dexie = new Dexie(`userStore - ${uid}`)
  dexie.version(8).stores({
    messages:
      'messageId,nanoid,groupUuid,senderId,avatar,avatarUrl,isLoading,isMyself,messageType,message,name,time,temps,[groupUuid+messageType]',
    members: 'uid, fistName,lastName,username,avatar,email,mobilePhone,role',
    groups: 'groupUuid,groupName'
    // Primary key and indexed props
  })
  dexie.open()
  dexie.on('ready', function callback() {
    useChatStore().dbInitFinshed = true
  })
}

export const messagesTable = () => {
  if (dexie) {
    return dexie.messages
  }
}
export const membersTable = () => {
  if (dexie) {
    return dexie.members
  }
}
export const groupsTable = () => {
  if (dexie) {
    return dexie.groups
  }
}
