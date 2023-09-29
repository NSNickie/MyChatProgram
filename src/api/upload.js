import { get } from '@/utils/request'

export default class Upload {
  static async getUploadProductImgInfo(num) {
    return get('/fileStorage/product-image', {
      num
    })
  }

  static async getUploadChatFileInfo(num){
    return get('/fileStorage/chat-file', {
      num
    })
  }
}
