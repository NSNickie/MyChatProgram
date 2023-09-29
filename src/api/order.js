import { get, post, put } from '@/utils/request'

export default class Order {
  static async getFavouriteProductsList(customerId) {
    return get(`/order-guide/${customerId}/products`)
  }

  static async updateFavouriteProductsList(customerId, products) {
    return post(`/order-guide/${customerId}/products`, {
      products
    })
  }

  static async createOrder(groupUuid, customerId, remarks, items, status) {
    return post(`/orders/`, {
      groupUuid,
      customerId,
      remarks,
      items,
      status
    })
  }

  static async getOrderDetail(orderUid) {
    return get(`/orders/${orderUid}`)
  }

  static async getOrderDetailHistory(orderUid) {
    return get(`/orders/${orderUid}/history`)
  }

  static async updateOrder(orderUid, groupUuid, notifyFlag, status, remarks, items) {
    let data = {
      groupUuid,
      notifyFlag,
      status,
      remarks,
      items
    }
    if (!status) {
      delete data.status
    }
    if (!remarks || !remarks.length) {
      delete data.remarks
    }
    if (!groupUuid) {
      delete data.groupUuid
    }
    return put(`/orders/${orderUid}/fullupdate`, data)
  }

  static async getOrderList(customerId, sortBy, orderBy, perPage, page,status,start,end) {
    return get(`/orders/`, {
      customerId,
      sortBy,
      orderBy,
      perPage,
      page,
      status,
      start,
      end
    })
  }
}
