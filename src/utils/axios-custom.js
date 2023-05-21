/*
axios 를 통한 request 와 response + interceptor 를 포함.
요청과 관련된 수행만 한다.
 */
import { useUserStore } from '@/stores/user.store'
import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:10000',
  timeout: 10000
})

export const $axios = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
}

function request(method) {
  return (url, body = {}, options = {}) => {
    let requestOptions = {
      url: url,
      method,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }
    if (body) {
      requestOptions.data = JSON.stringify(body)
    }
    if (options?.headers) {
      if (options.headers.includes('Content-Type')) {
        requestOptions.headers['Content-Type'] = options.headers['Content-Type']
        options.headers.remove('Content-Type')
        requestOptions.headers = { ...requestOptions.headers, ...options.headers }
      }
    }
    console.debug('Axios request sent.')
    return instance(requestOptions)
  }
}

instance.interceptors.request.use(
  (config) => {
    // const isToken = (config.headers || {}).isToken === false
    // const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    const token = useUserStore().getToken
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
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
    return config
  },
  (error) => {
    console.warn('Axios error : ', error)
    new Error(error)
    return error
  }
)

const errorCode = {
  401: '인증 실패, 시스템 리소스에 액세스할 수 없습니다.',
  403: '현재 작업에 권한이 없습니다.',
  404: '리소스가 존재하지 않습니다.',
  default: '알 수 없는 오류입니다.'
}

export let require = { reLogin: false }

instance.interceptors.response.use(
  (res) => {
    //default response code is 200
    const state = res.data.state || 200
    const msg = res.data.message || errorCode[state] || errorCode['default']
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }
    switch (true) {
      case state === 401:
        if (!require.reLogin) {
          require.reLogin = true

          //TODO access token 만료에대한 재 요청

          // 사용자 토큰 인증 실패후 메시지를 보여준후 초기화면으로 돌아감
          /*ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
                                                                confirmButtonText: '重新登录',
                                                                cancelButtonText: '取消',
                                                                type: 'warning'
                                                            }).then(() => {
                                                                require.show = false;
                                                                useUserStore().logOut().then(() => {
                                                                    location.href = '/index';
                                                                })
                                                            }).catch(() => {
                                                                require.show = false;
                                                            });*/
        }
        return Promise.reject(() => {
          new Error('로그인 세션 만료')
          return res.data
        })
      case state === 500:
        // ElMessage({message: msg, type: 'error'})
        return Promise.reject(new Error(msg))
      case state === 601:
        // ElMessage({message: msg, type: 'warning'})
        return Promise.reject(() => {
          new Error(msg)
          return res.data
        })
      case state !== 200:
        // ElNotification.error({title: msg})
        return Promise.reject('Unknown error')
      default:
        return Promise.resolve(res.data)
    }
  },
  (error) => {
    console.log('Unhandled Server Error : ', error)

    // ElMessage({message: message, type: 'error', duration: 5 * 1000})

    return Promise.reject(error)
  }
)

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
