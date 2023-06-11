<script setup>
import {onBeforeMount, ref} from "vue";
import {RouterView} from "vue-router";
import {useCurrentStore} from "stores/current";
import {useUserStore} from "stores/user";
import {useChatStore} from "stores/chat";
import {Dark} from "quasar";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {api} from "boot/axios";
import {formattedDate} from "./utils/formatter";

const $q = useQuasar();

const userStore = useUserStore();
const currentStore = useCurrentStore();
const chatStore = useChatStore();
const router = useRouter();
const leftDrawerOpen = ref(false);

const fabPos = ref([18, 18])
const draggingFab = ref(false)
const enableFab = userStore.isOpenAIEnabled
const chatBox = ref(null)

const chatMessages = ref([])

const chatScrollArea = ref(null)

setTimeout(() => console.debug('chatStore.getChatMessages : ', chatMessages), 3000)
//FIXME: chat data 를 store 에서 getter 로 가져올시 생기는 반응성의 문제 => 임시로 ref 객체를 더 만듬

onBeforeMount(() => {
  chatStore.clear()
  api
    .get("/chat", {
      params: {
        pageAt: 0,
        pageSize: 4
      }
    })
    .then(resolve => {
      console.debug("onBeforeMount state : messages : ", resolve.data)
      const {messages} = resolve.data

      chatStore.addChatMessagesBefore(messages)
      chatMessages.value.splice(0, 0, ...(messages.reverse()))

      console.debug("onBeforeMount state : last : ", resolve.data.last)
      chatStore.setLast(resolve.data.last)
    })
})
const onLoad = (index, done) => {
  if (chatStore.isLast) {
    done()
    return
  }
  chatStore.nextPage()
  api
    .get('/chat', {
      params: chatStore.getNext
    })
    .then(resolve => {
      console.debug("onLoad : get Messages : ", resolve.data)
      const {messages} = resolve.data

      chatStore.addChatMessagesBefore(messages)
      chatMessages.value.splice(0, 0, ...(messages.reverse()))

      console.debug("onLoad : get last : ", resolve.data.last)
      console.debug(chatStore.getChatMessages)
      setTimeout(() => console.debug(chatStore.getChatMessages), 3000)
      chatStore.setLast(resolve.data.last)
      done()
    })
}

const promptInput = ref(null)
const chatPrompt = ref('')
const promptBtn = ref(null)
const disablePromptBtn = ref(false)

const sendMessage = () => {
  const get = v => api
    .post('/chat', {prompt: v})
    .then(resolve => {
      console.debug("send message resolved: ", resolve)
      chatPrompt.value = '';
      const {data} = resolve
      console.debug("###### send message data : ", data)

      chatStore.addChatMessageAfter(data)
      chatMessages.value.push(data)

      chatStore.plusOffset()
      disablePromptBtn.value = false
    })
    .catch(e => disablePromptBtn.value = false)

  if (promptInput.value.validate()) {
    disablePromptBtn.value = true
    get(chatPrompt.value)
  } else {
    $q.notify({
      position: 'top',
      type: 'info',
      message: "메시지를 입력해주세요"
    })
  }
}

const onClick = (event) => chatBox.value.show()

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const userPrfImgSrc = () => {
  return (
    userStore.getUserImg ||
    "https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg"
  );
};

const logout = () => {
  userStore.logout().then(() => {
    console.log("Logout Success");
    $q.notify({
      position: 'top',
      type: 'info',
      message: '로그아웃하였습니다'
    })
    router.push("/")
  }, (reject) => {
    $q.notify({
      position: 'top',
      type: 'warning',
      message: '에러가 발생하였습니다'
    })
    console.warn(reject)
  });
};

const moveFab = (ev) => {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

  fabPos.value = [
    fabPos.value[0] - ev.delta.x,
    fabPos.value[1] - ev.delta.y
  ]
}

console.log("Is user logged in?", userStore.isUserLogin);
setTimeout(() => userStore.refreshToken(), 2000)

</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn
          v-if="userStore.isUserLogin"
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-btn flat style="background: none;" label="Git Editor" to="/"></q-btn>
        </q-toolbar-title>
        <q-btn style="background: none;" outline no-shadow label="Menu">
          <q-menu transition-show="jump-down"
                  transition-hide="jump-up">
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup to="/">
                <q-item-section>Home</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="Dark.toggle()">
                <q-item-section>Dark Mode</q-item-section>
              </q-item>
              <q-separator/>
              <div v-if="!userStore.isUserLogin">
                <q-item clickable v-close-popup to="/login">
                  <q-item-section>Login</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/signup">
                  <q-item-section>Sign up</q-item-section>
                </q-item>
              </div>
              <div v-else>
                <q-item clickable v-close-popup to="/user/config">
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </div>
              <q-separator/>
              <q-item clickable v-close-popup>
                <q-item-section>Help &amp; Feedback</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="userStore.isUserLogin"
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="240"
      :breakpoint="400"
    >
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list padding>
          <q-item
            clickable
            v-ripple
            v-for="item in currentStore.getDrawerItems"
            :key="item.section"
            :to="item.router"
          >
            <q-item-section avatar>
              <q-icon :name="item.iconName"/>
            </q-item-section>

            <q-item-section>
              {{ item.section }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img
        class="absolute-top"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 150px"
      >
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img
              :src="userPrfImgSrc()"
              style="padding-left: 0; padding-right: 0"
              alt="profile-image"/>
          </q-avatar>
          <div class="text-weight-bold" v-text="userStore.getUserName"></div>
          <div v-text="userStore.getUserDefaultEmail"></div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view/>

      <!--      <q-page-sticky position="bottom-right" :offset="fabPos" v-if="enableFab">-->
      <q-page-sticky position="bottom-right" :offset="fabPos">
        <q-fab
          icon="keyboard_arrow_left"
          direction="left"
          color="accent"
          :disable="draggingFab"
          v-touch-pan.prevent.mouse="moveFab"
        >
          <template v-slot:label="{ opened }">
            <div :class="{ 'fab-animate--hover': opened !== true }">
              {{ opened !== true ? '' : 'Close' }}
            </div>
          </template>

          <div class="fixed-bottom-right" style="margin-bottom: 90px; ">
            <q-menu
              anchor="bottom middle"
              self="top left"
              :offset="[ 0, 8 ]"
              ref="chatBox"
            >

              <div class="q-p"
                   style="width: 100%; max-width: 400px; margin-right: 9px; margin-left:9px; margin-bottom: 8px;">
                <q-infinite-scroll ref="chatScrollArea" @load="onLoad" :offset="150" reverse scroll-target="chatScroll">
                  <template v-slot:loading>
                    <div class="text-center q-my-md">
                      <q-spinner-dots color="primary" size="30px"/>
                    </div>
                  </template>

                  <div v-for="item in chatMessages" :key="item.createdDate" class="caption q-py-sm" ref="chatScroll">
                    <q-chat-message
                      name="GPT"
                    >
                      <div>{{ item.completion }}</div>
                      <template v-slot:label>{{ item.createdDate.value }}</template>
                      <template v-slot:avatar>
                        <img
                          class="q-message-avatar q-message-avatar--sent"
                          src="https://cdn.quasar.dev/img/avatar1.jpg"
                        >
                      </template>
                    </q-chat-message>
                    <q-chat-message
                      sent
                    >
                      <div>{{ item.prompt }}</div>
                      <template v-slot:name>{{ userStore.getUserName }}</template>
                      <template v-slot:label>{{ item.createdDate.value }}</template>
                      <template v-slot:avatar>
                        <img
                          class="q-message-avatar q-message-avatar--sent"
                          :src="userStore.getUserImg"
                        >
                      </template>
                    </q-chat-message>
                  </div>

                </q-infinite-scroll>
                <q-input filled ref="promptInput" v-model="chatPrompt" :rules="[v=>v.length>0||'Cannot be empty']"
                         lazy-rules type="text" maxlength="500">
                  <template v-slot:prepend>
                    <q-icon name="lightbulb"/>
                  </template>
                  <template v-slot:after>
                    <q-btn ref="promptBtn" @click="sendMessage" outline color="secondary" round flat icon="send"
                           :disable="disablePromptBtn"/>
                  </template>
                </q-input>
              </div>

            </q-menu>
          </div>

          <q-fab-action @click="onClick" color="primary" icon="question_answer" :disable="draggingFab"/>
        </q-fab>
      </q-page-sticky>

    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
.fab-animate,
.q-fab:hover .fab-animate--hover
  animation: fab-animate 0.82s cubic-bezier(.36, .07, .19, .97) both
  transform: translate3d(0, 0, 0)
  backface-visibility: hidden
  perspective: 1000px

@keyframes fab-animate
  10%, 90%
    transform: translate3d(-1px, 0, 0)

  20%, 80%
    transform: translate3d(2px, 0, 0)

  30%, 50%, 70%
    transform: translate3d(-4px, 0, 0)

  40%, 60%
    transform: translate3d(4px, 0, 0)
</style>
