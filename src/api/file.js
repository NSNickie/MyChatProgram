import { post } from '@/utils/request'

export default class FileStorage {
  static async getAvatarUrl(keyNames) {
    return post('/fileStorage', {
        keyNames
    })
  }

  static async getImgUrl(keyNames){
    return post('/fileStorage', {
      keyNames
  })
  }

}
