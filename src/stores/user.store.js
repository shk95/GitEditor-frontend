/*
유저의 데이터와 관련된 주요 로직을 포함.
다른 서비스를 사용한다.
 */
import { defineStore } from 'pinia'
import { router } from '@/router'
import { $axios } from '@/utils/axios-custom'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null, // login id
    role: null,
    providerType: null,
    defaultEmail: null,
    defaultUsername: null,
    defaultImgUrl: null,
    providerEmail: null,
    providerLoginId: null,
    providerUsername: null,
    providerImgUrl: null,
    accessToken: null,
    refreshTokenTimeout: null
  }),
  getters: {
    getToken(state) {
      return state.accessToken
    },
    getUserId(state) {
      return state.userId
    }
  },
  persist: true,
  actions: {
    setToken(token) {
      this.accessToken = token
    },
    me() {
      $axios
        .get('/user/me')
        .then(
          (response) => {
            console.debug('/user/me response : ', response)
            console.log(response.message, response.data)
            this.saveUser(response.data)
          },
          () => {}
        )
        .catch()
    },
    saveUser(data) {
      this.userId = data.userId
      this.role = data.role
      this.providerType = data.providerType
      this.defaultEmail = data.defaultEmail
      this.defaultUsername = data.defaultUsername
      this.defaultImgUrl = data.defaultImgUrl
      this.providerEmail = data.providerEmail
      this.providerLoginId = data.providerLoginId
      this.providerUsername = data.providerUsername
      this.providerImgUrl = data.providerImgUrl
    },
    invalidateUser() {
      this.userId = null
      this.role = null
      this.providerType = null
      this.defaultEmail = null
      this.defaultUsername = null
      this.defaultImgUrl = null
      this.providerEmail = null
      this.providerLoginId = null
      this.providerUsername = null
      this.providerImgUrl = null
      this.accessToken = null
      this.refreshTokenTimeout = null
    },
    login(data) {
      $axios.post('/auth/login', data).then(
        ({ data, message }) => {
          console.debug('login data : ', data)
          alert(message)
          this.accessToken = data?.accessToken
          if (!this.accessToken) {
            new Error('로그인 실패')
          }
          console.log(this.accessToken)
          this.me()
          this.startRefreshTokenTimer()
        },
        (reject) => {
          console.debug('login error in user store', reject)
        }
      )
    },
    loginOAuth(token) {
      this.accessToken = token
      this.me()
      this.startRefreshTokenTimer()
    },
    logout() {
      $axios.post('/auth/logout').then(
        (resolve) => {
          this.invalidateUser()
          router.push('/login').then(() => {
            alert('로그아웃 성공')
            console.debug(resolve)
          })
        },
        (reject) => {
          console.debug('logout error in user store', reject)
        }
      )
    },
    async refreshToken() {
      $axios
        .post('/auth/reissue', this.accessToken)
        .then(({ data }) => {
          this.saveUser(data)
          this.startRefreshTokenTimer()
          console.debug('Token refreshed. result : ', data.result)
        })
        .catch((error) => {
          console.debug('refreshToken error : ', error)
          this.invalidateUser()
        })
    },
    startRefreshTokenTimer() {
      const jwtBase64 = this.accessToken.split('.')[1]
      const jwtToken = JSON.parse(atob(jwtBase64))

      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000)

      // set a timeout to refresh the token a minute before it expires
      const timeout = expires.getTime() - Date.now() - 60 * 1000
      console.debug('Start refresh token timer. expires : ', expires, '\ntimeout :', timeout)
      this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout)
    },
    stopRefreshTokenTimer() {
      clearTimeout(this.refreshTokenTimeout)
    }
  }
})
