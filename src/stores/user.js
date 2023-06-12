import {defineStore} from "pinia";
import {api} from "boot/axios";

export const useUserStore = defineStore("user", {
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
    refreshTokenTimeout: null,
    githubEnabled: false,
    openAIEnabled: false,
  }),
  getters: {
    getToken(state) {
      return state.accessToken;
    },
    getUserId(state) {
      return state.userId;
    },
    getUserName(state) {
      return state.defaultUsername;
    },
    getUserImg(state) {
      return state.defaultImgUrl;
    },
    isUserLogin(state) {
      return state.userId != null;
    },
    getUserDefaultEmail(state) {
      return state.defaultEmail;
    },
    getRole(state) {
      return state.role;
    },
    isGithubEnabled(state){
      return state.githubEnabled
    },
    isOpenAIEnabled(state){
      return state.openAIEnabled
    }
  },
  persist: true,
  actions: {
    setToken(token) {
      this.accessToken = token;
    },
    me() {
      return api
        .get("/user/me")
        .then(
          (response) => {
            console.debug("/user/me response : ", response);
            console.log(response?.message, response.data);
            this.saveUser(response.data).then(() => console.log("User saved."));
          }
        )
    },
    async saveUser(data) {
      this.userId = data.userId;
      this.role = data.role;
      this.providerType = data.providerType;
      this.defaultEmail = data.defaultEmail;
      this.defaultUsername = data.defaultUsername;
      this.defaultImgUrl = data.defaultImgUrl;
      this.providerEmail = data.providerEmail;
      this.providerLoginId = data.providerLoginId;
      this.providerUsername = data.providerUsername;
      this.providerImgUrl = data.providerImgUrl;
      this.githubEnabled = data.githubEnabled;
      this.openAIEnabled = data.openAIEnabled;
    },
    invalidateUser() {
      this.userId = null;
      this.role = null;
      this.providerType = null;
      this.defaultEmail = null;
      this.defaultUsername = null;
      this.defaultImgUrl = null;
      this.providerEmail = null;
      this.providerLoginId = null;
      this.providerUsername = null;
      this.providerImgUrl = null;
      this.accessToken = null;
      this.refreshTokenTimeout = null;
      this.githubEnabled = false;
      this.openAiEnabled = false;
    },
    login(data) {
      return api.post("/auth/login", data).then(
        ({data, message}) => {
          console.debug("login data : ", data);
          this.accessToken = data?.accessToken;
          if (!this.accessToken) {
            throw new Error("로그인 실패. 서버 에러.");
          }
          console.log(this.accessToken);
          return this.me().then(r => {
            this.startRefreshTokenTimer();
            return Promise.resolve({message})
          });
        },
        (reject) => {
          console.debug("login error in user store", reject);
          return Promise.reject("로그인 실패");
        }
      );
    },
    loginOAuth(token) {
      this.accessToken = token;
      console.debug("############ this.accessToken", this.accessToken);
      return this.me();
    },
    logout() {
      return api.post("/auth/logout").then(
        (resolve) => {
          this.invalidateUser();
        },
        (reject) => {
          console.debug("logout error in user store", reject);
          throw new Error("logout error");
        }
      ).catch((error) => Promise.reject(error));
    },
    refreshToken() {
      api
        .post("/auth/reissue", this.accessToken)
        .then((data) => {
          const renewedToken = data.data?.accessToken;
          if (!renewedToken) {
            throw new Error("Failed to refresh token");
          }
          this.accessToken = renewedToken;
          this.startRefreshTokenTimer();
          console.info("Token refreshed. result : ", data?.result);
        })
        .catch((error) => {
          console.debug("Cannot refresh token. error : ", error);
          this.invalidateUser();
        });
    },
    startRefreshTokenTimer() {
      const jwtBase64 = this.accessToken.split(".")[1];
      const jwtToken = JSON.parse(atob(jwtBase64));

      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000);

      // set a timeout to refresh the token a minute before it expires
      const timeout = expires.getTime() - Date.now() - 60 * 1000;
      console.debug(
        "Start refresh token timer. expires : ",
        expires,
        "\ntimeout :",
        timeout
      );
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
    },
    stopRefreshTokenTimer() {
      clearTimeout(this.refreshTokenTimeout);
    },
  },
});
