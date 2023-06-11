import {defineStore} from "pinia";
import {api} from "boot/axios";

export const useChatStore = defineStore("chat", {
  state: () => ({
    chat: [/* {"id" : "", prompt" : "", "completion" : "", "createdAt" : "", "lastModifiedDate" : ""} */],
    offset: 0, // 메시지 실시간 추가시 이동할 변위
    pageAt: 0,
    pageSize: 4,
    last: false,
  }),
  persist: true,
  getters: {
    getChatMessages(state) {
      return state.chat
    },
    getNext(state) {
      return {
        pageAt: state.pageAt + state.offset,
        pageSize: state.pageSize
      }
    },
    isLast(state) {
      return state.last
    }
  },
  actions: {
    plusOffset() {
      this.offset++
    },
    nextPage() {
      this.pageAt++
    },
    addChatMessageAfter(chatMessage) { // chatMessages : {}, 리스트 끝 에 추가. 리스트의 끝이 최신.
      this.chat.push(chatMessage)
    },
    addChatMessagesBefore(chatMessages) { // chatMessages : [{}]
      this.chat.splice(0, 0, ...(chatMessages.reverse()))
    },
    setLast(last) {
      this.last = last
    },
    clear() {
      this.chat = []
      this.offset = 0
      this.pageAt = 0
      this.pageSize = 4
      this.last = false
    }
  }
});
