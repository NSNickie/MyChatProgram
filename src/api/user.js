import { post } from '@/utils/request'

export default class User {
  /**
   * Login
   * @param {String} email 邮箱
   * @param {String} password 密码
   * @returns
   */
  static async login(email, password) {
    return post('/auth/login', {
      email,
      password
    })
  }

  /**
   * Login
   * @param {String} email 邮箱
   * @param {String} password 密码
   * @param {String} firstName 名
   * @param {String} lastName 姓
   * @returns
   */
  static async signUp(email, password, firstName, lastName) {
    return post('/auth/signUp', {
      email,
      password,
      firstName,
      lastName
    })
  }

  static async signUpConfirm(email, confirmationCode) {
    return post('/auth/signUpConfirm', {
      email,
      confirmationCode
    })
  }

  static async resendVerificationCode(email) {
    return post('/auth/resendVerificationCode', {
      email
    })
  }

  static async forgetPassword(email) {
    return post('/auth/forgetPassword', {
      email
    })
  }

  static async confirmForgotPassword(email, password, confirmationCode) {
    return post('/auth/confirmForgotPassword', {
      email,
      password,
      confirmationCode
    })
  }

  static async refreshToken(refreshToken) {
    return post(`/auth/refreshToken`, {
      refreshToken
    })
  }
}
