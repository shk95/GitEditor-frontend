import { boot } from "quasar/wrappers";
import axios from "axios";
import { useUserStore } from "stores/user";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_API_URL}`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  // app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file
  // app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  const userStore = useUserStore();

  api.interceptors.request.use(
    (config) => {
      // const isToken = (config.headers || {}).isToken === false
      // const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
      const token = userStore.getToken;
      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }

      // encoding a parameter of get method
      /*if (config.method === 'get' && config.params) {
                          let url = config.url + '?' + tansParams(config.params);
                          url = url.slice(0, -1);
                          config.params = {};
                          config.url = url;
                      }*/
      /*if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
                          const requestObj = {
                              url: config.url,
                              data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
                              time: new Date().getTime()
                          }
                          const sessionObj = cache.session.getJSON('sessionObj')
                          if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
                              cache.session.setJSON('sessionObj', requestObj)
                          } else {
                              const s_url = sessionObj.url;                // 请求地址
                              const s_data = sessionObj.data;              // 请求数据
                              const s_time = sessionObj.time;              // 请求时间
                              const interval = 1000;                       // 间隔时间(ms)，小于此时间视为重复提交
                              if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
                                  const message = '数据正在处理，请勿重复提交';
                                  console.warn(`[${s_url}]: ` + message)
                                  return Promise.reject(new Error(message))
                              } else {
                                  cache.session.setJSON('sessionObj', requestObj)
                              }
                          }
                      }*/
      return config;
    },
    (error) => {
      console.warn("Axios error : ", error);
      new Error(error);
      return error;
    }
  );

  const errorCode = {
    //TODO: error code 수정
    401: "인증 실패, 시스템 리소스에 액세스할 수 없습니다.",
    403: "현재 작업에 권한이 없습니다.",
    404: "리소스가 존재하지 않습니다.",
    default: "알 수 없는 오류입니다.",
  };

  api.interceptors.response.use(
    (res) => {
      //default response code is 200
      const status = res.data.status || 200;
      const msg = res.data.message || errorCode[status] || errorCode["default"];
      if (
        res.request.responseType === "blob" ||
        res.request.responseType === "arraybuffer"
      ) {
        return res.data;
      }
      switch (true) {
        case status >199 && status < 300:
          return Promise.resolve(res.data);

        case status === 401:
          if (!require.reLogin) {
            require.reLogin = true;
          }

          return Promise.reject(() => {
            new Error("로그인 세션 만료");
            return res.data;
          });

        case status === 500:
          // ElMessage({message: msg, type: 'error'})
          return Promise.reject(res);

        case status === 601:
          // ElMessage({message: msg, type: 'warning'})
          return Promise.reject(() => {
            new Error(msg);
            return res.data;
          });

        case status !== 200:
          // ElNotification.error({title: msg})
          return Promise.reject("Unknown error");

        default:
          return Promise.resolve(res);
      }
    },
    (error) => {
      console.log("Unhandled Server Error : ", error);

      return Promise.reject(error);
    }
  );
});

/*export function download(url, params, filename, config) {
    downloadLoadingInstance = ElLoading.service({ text: "正在下载数据，请稍候", background: "rgba(0, 0, 0, 0.7)", })
    return service.post(url, params, {
        transformRequest: [(params) => { return tansParams(params) }],
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'blob',
        ...config
    }).then(async (data) => {
        const isBlob = blobValidate(data);
        if (isBlob) {
            const blob = new Blob([data])
            saveAs(blob, filename)
        } else {
            const resText = await data.text();
            const rspObj = JSON.parse(resText);
            const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
            ElMessage.error(errMsg);
        }
        downloadLoadingInstance.close();
    }).catch((r) => {
        console.error(r)
        ElMessage.error('下载文件出现错误，请联系管理员！')
        downloadLoadingInstance.close();
    })
}*/

export let require = { reLogin: false };
export { api };
