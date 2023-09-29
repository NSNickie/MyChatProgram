import { post, get, _delete } from '@/utils/request'

export default class Chat {
  static async getChatGroups(nextToken) {
    return get('chat/customer-group', {
      nextToken
    })
  }

  static async createChatGroup(name) {
    return post('chat/group', {
      name
    })
  }

  static async addChatMembers(groupUuid, userUids) {
    return post(`chat/group/${groupUuid}/member`, {
      userUids
    })
  }

  static async getWebSocketUrl() {
    return get(`/chat/chime-endpoint`)
  }

  static async sendGroupMessageTxt(groupUuid, content, nid) {
    let jsonString = JSON.stringify({
      messageType: 'txt',
      messageData: {
        text: content
      }
    })
    return post(`/chat/group/${groupUuid}/message`, { content: jsonString, nid })
  }

  static async sendGroupMessageImg(groupUuid, content, nid) {
    let jsonString = JSON.stringify({
      messageType: 'img',
      messageData: {
        imgKeyList: content
      }
    })
    return post(`/chat/group/${groupUuid}/message`, { content: jsonString, nid })
  }

  static async getGroupMessage(groupUuid, content) {
    return post(`/chat/group/${groupUuid}/message`, {
      content
    })
  }

  static async getMemberList(groupUuid, nextToken) {
    return get(`/chat/group/${groupUuid}/member`, {
      nextToken
    })
  }

  static async getChatHistory(groupUuid, notBefore, notAfter, nextToken, perPage, sortOrder) {
    return get(`/chat/group/${groupUuid}/message`, {
      nextToken,
      notBefore,
      notAfter,
      perPage,
      sortOrder
    })
  }
  static async deleteMember(groupUuid, userUid) {
    return _delete(`/chat/group/${groupUuid}/member/${userUid}`)
  }

  static async addModerator(groupUuid, userUid) {
    return post(`/chat/group/${groupUuid}/moderator`, {
      userUid
    })
  }

  static async deleteModerator(groupUuid, userUid) {
    return _delete(`/chat/group/${groupUuid}/moderator/${userUid}`)
  }

  static async getMyLatestMsgs() {
    return get(`/chat/my-latest-msgs`)
  }
}
