<script setup>
import { onBeforeMount, onMounted, reactive, ref } from "vue";
import { RouterView } from "vue-router";
import { useCurrentStore } from "stores/current";
import { useUserStore } from "stores/user";
import { useChatStore } from "stores/chat";
import { Dark } from "quasar";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();

const userStore = useUserStore();
const currentStore = useCurrentStore();
const chatStore = useChatStore();
const router = useRouter();
const leftDrawerOpen = ref(false);

const fabPos = ref([18, 18]);
const draggingFab = ref(false);
const enableFab = userStore.isOpenAIEnabled;
const chatBox = ref(null);
const chatMessages = ref([]);
const chatScrollArea = ref(null);

onBeforeMount(() => {
  console.log("App Mounted");
  loadChatMessages();
});

const loadChatMessages = () => {
  chatMessages.value = [];
  if (!userStore.isOpenAIEnabled) return;
  console.log("Chat Messages Loading...");
  if (chatStore.getMessages.length > 0) {
    chatMessages.value = chatStore.getMessages;
    return;
  }
  api
    .get("/chat", {
      params: {
        pageAt: 0,
        pageSize: 4,
      },
    })
    .then((resolve) => {
      console.debug("onBeforeMount state : messages : ", resolve.data);
      let { messages } = resolve.data;
      chatStore.addMessagesBefore(messages);
      chatStore.setLast(resolve.data.last);
    })
    .catch((e) => console.info(e));
};

const onLoad = (index, done) => {
  if (chatStore.isLast) {
    done();
    return;
  }
  chatStore.nextPage();
  api
    .get("/chat", {
      params: chatStore.getNext,
    })
    .then((resolve) => {
      setTimeout(() => {
        console.debug("Chat Loaded : Messages : ", resolve.data);
        const { messages } = resolve.data;

        chatStore.addMessagesBefore(messages);
        chatMessages.value = chatStore.getMessages;
        chatStore.setLast(resolve.data.last);
        done();
      }, 1500);
    });
};

const promptInput = ref(null);
const promptBtn = ref(null);
const chatPrompt = ref("");
const disablePromptBtn = ref(false);

const sendMessage = () => {
  const get = (v) =>
    api
      .post("/chat", { prompt: v })
      .then((resolve) => {
        chatPrompt.value = "";
        const { data } = resolve;

        chatStore.addMessageAfter(data);
        chatMessages.value = chatStore.getMessages;
        chatStore.plusOffset();
        disablePromptBtn.value = false;
      })
      .catch((e) => (disablePromptBtn.value = false));

  if (promptInput.value.validate()) {
    disablePromptBtn.value = true;
    get(chatPrompt.value);
  } else {
    $q.notify({
      position: "top",
      type: "info",
      message: "메시지를 입력해주세요",
    });
  }
};

const onClick = (event) => chatBox.value.show();

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
  userStore.logout().then(
    () => {
      console.log("Logout Success");
      $q.notify({
        position: "top",
        type: "info",
        message: "로그아웃하였습니다",
      });
      router.push("/");
    },
    (reject) => {
      $q.notify({
        position: "top",
        type: "warning",
        message: "에러가 발생하였습니다",
      });
      console.warn(reject);
    }
  );
};

const moveFab = (ev) => {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true;

  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y];
};

console.log("Is user logged in?", userStore.isUserLogin);
setTimeout(() => userStore.refreshToken(), 2000);

// section: message
const unreadMsgCount = ref(0);
const getUnreadMsgCount = () =>
  api.get("/user/messages/unread/count").then((resolve) => {
    unreadMsgCount.value = resolve.data;
  });
const unreadMsgScheduler = () => {
  if (userStore.isUserLogin) {
    getUnreadMsgCount();
    getUnreadMsg();
  }
  setTimeout(() => {
    unreadMsgScheduler();
  }, 5000);
};
onMounted(() => {
  unreadMsgScheduler();
});
const unreadMsgData = reactive([
  /*{senderId: "", content: "", senderProfileImg: "", timestamp: ""}*/
]);

const getUnreadMsg = () => {
  unreadMsgData.length = 0;
  api.get("/user/messages/unread").then((resolve) => {
    if (!resolve.data.length) return;
    resolve.data.map((l) => {
      unreadMsgData.push({
        senderId: `${l.senderUserIdProviderType},${l.senderUserIdUserLoginId}`,
        content: l.content,
        senderProfileImg: l.senderProfileImg,
        timestamp: l.timestamp,
      });
    });
  });
};
const msgDialogStatus = ref(false);
const markAsRead = () => {};
// end section: message

// section: friend
const friendList = reactive([
  /*{id: "", profileImg: "", username: "", status: "", email:""}*/
]);
const getMyFriends = () => {
  friendList.length = 0;
  api.get("/user/friend/all").then((resolve) => {
    if (!resolve.data) return;
    resolve.data.map((l) => {
      friendList.push({
        id: `${l.addresseeUserIdProviderType},${l.addresseeUserIdUserLoginId}`,
        profileImg: l.profileImg,
        username: l.addresseeUsername,
        email: l.addresseeDefaultEmail,
        status: l.status,
      });
    });
  });
};
const msgComponent = ref(false);
const inputSearchUser = ref("");
const searchByUsername = () => {
  foundUserList.length = 0;
  api.get(`/search/user/username/${inputSearchUser.value}`).then((resolve) => {
    if (!resolve.data) return;
    resolve.data.map((u) => {
      foundUserList.push({
        userId: u.userId,
        username: u.username,
        profileImage: u.profileImageUrl,
        email: u.defaultEmail,
      });
    });
  });
};
const foundUserList = reactive([
  /*{ userId: "", username: "", profileImage: "", email: "" }*/
]); // userId:prvTyp+","+id
const addToFriend = (userId) => {
  api
    .post("/user/friend/request", {
      addresseeId: userId,
    })
    .then((resolve) => {});
};

// section: friend

// section: send message
const selectedFriend = ref(""); // 현재 선택된 친구
const msgToFriend = ref(""); // 현재 보낼 메시지
const currentMsg = reactive([
  /*{
    senderId: "", senderUsername: "", senderProfileImg: "",
    recipientId: "", recipientName: "", recipientProfileImg: "", content: "", timestamp: ""
  }*/
]); // 현재 보고있는 메시지
const selectFriend = (id) => {
  // 친구목록 창에서 친구 선택시 해당 친구에게 메시지 보낼 준비를함.
  currentMsg.length = 0;
  selectedFriend.value = id;
  getFriendMsg(id);
};
const sendMsgToFriend = () => {
  if (!selectedFriend.value || !msgToFriend.value) return;
  const id = selectedFriend.value.split(",");
  api
    .post("/user/messages/send", {
      recipientUserIdProviderType: id[0],
      recipientUserIdUserLoginId: id[1],
      content: msgToFriend.value,
    })
    .then((resolve) => {
      msgToFriend.value = "";
      selectFriend(selectedFriend.value);
    })
    .catch((reject) => {
      msgToFriend.value = "";
    });
};
const getFriendMsg = (id) => {
  api
    .get("/user/messages/conversation", {
      params: {
        recipientId: id,
      },
    })
    .then((resolve) => {
      resolve.data.map((m) => {
        currentMsg.push({
          senderId: `${m.senderUserIdProviderType},${m.senderUserIdUserLoginId}`,
          senderUsername: m.senderName,
          senderProfileImg: m.senderProfileImg,
          recipientId: `${m.recipientUserIdProviderType},${m.recipientUserIdUserLoginId}`,
          recipientName: m.recipientName,
          recipientProfileImg: m.recipientProfileImg,
          content: m.content,
          timestamp: m.timestamp,
        });
      });
    });
};
// end section: send message
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
          <q-btn
            flat
            style="background: none"
            label="Git Editor"
            to="/"
          ></q-btn>
        </q-toolbar-title>

        <!--        section: friend-->
        <q-btn
          v-if="userStore.isUserLogin"
          dense
          color="purple"
          round
          icon="people"
          class="q-ml-md"
          size="12px"
          style="right: 11px"
          @click="msgComponent = true"
        />

        <q-dialog v-model="msgComponent">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-center">Search User</div>
            </q-card-section>
            <q-separator />

            <q-card-section>
              <div>
                <q-input
                  v-model="inputSearchUser"
                  filled
                  type="search"
                  :rules="[(v) => v.length > 0 || 'Cannot be empty']"
                  lazy-rules
                  maxlength="50"
                >
                  <template v-slot:append>
                    <q-btn flat @click="searchByUsername">
                      <q-icon name="search" />
                    </q-btn>
                  </template>
                </q-input>
              </div>
            </q-card-section>
            <q-separator />

            <!--            검색된 사용자 목록-->
            <q-card-section style="height: 50vh; width: 500px" class="scroll">
              <q-list bordered class="rounded-borders" style="max-width: 600px">
                <div v-for="u in foundUserList" :key="u.userId">
                  <!--                <q-item-label header>Google Inbox style</q-item-label>-->
                  <q-item>
                    <q-item-section avatar top>
                      <q-avatar>
                        <img :src="u.profileImage" alt="no image" />
                      </q-avatar>
                    </q-item-section>

                    <q-item-section top>
                      <q-item-label lines="1">
                        <span class="text-weight-medium">{{ u.username }}</span>
                        <!--                        <span class="text-grey-8"> - GitHub repository</span>-->
                      </q-item-label>
                      <q-item-label caption lines="1">
                        {{ u.email ? u.email : "..." }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section top side>
                      <div class="text-grey-8 q-gutter-xs">
                        <q-btn
                          class="gt-xs"
                          size="12px"
                          flat
                          dense
                          round
                          icon="add"
                          @click="
                            () => {
                              addToFriend(u.userId);
                            }
                          "
                        />
                        <!--                        <q-btn class="gt-xs" size="12px" flat dense round icon="done"/>-->
                        <q-btn size="12px" flat dense round icon="more_vert" />
                      </div>
                    </q-item-section>
                  </q-item>
                  <q-separator spaced />
                </div>
              </q-list>
            </q-card-section>
            <q-separator />

            <!--            <q-card-actions align="right">-->
            <!--              <q-btn flat label="Decline" color="primary" v-close-popup/>-->
            <!--              <q-btn flat label="Accept" color="primary" v-close-popup/>-->
            <!--            </q-card-actions>-->
          </q-card>
        </q-dialog>
        <!--        end section: friend-->

        <!--        section: message-->
        <q-btn
          v-if="userStore.isUserLogin"
          dense
          color="purple"
          round
          icon="message"
          class="q-ml-md"
          size="12px"
          style="right: 11px"
        >
          <!--          안읽은 메시지 카운트-->
          <q-badge
            v-if="unreadMsgCount > 0"
            color="red"
            rounded
            floating
            v-bind:label="unreadMsgCount"
          ></q-badge>
          <q-menu>
            <!--            읽지않은 메시지 목록-->
            <div class="q-pa-md" style="width: 350px">
              <q-list>
                <div v-for="msg in unreadMsgData" :key="msg.timestamp">
                  <q-item>
                    <q-item-section>
                      <q-item-label>
                        <q-avatar>
                          <img :src="msg.senderProfileImg" alt="profile" />
                        </q-avatar>
                      </q-item-label>
                      <q-item-label caption lines="2">{{
                        msg.content
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <q-item-label caption>{{ msg.timestamp }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator spaced inset />
                </div>
              </q-list>
            </div>

            <!--            메시지 창-->
            <div class="q-pa-md q-gutter-sm">
              <q-btn
                label="Message"
                flat
                color="primary"
                @click="
                  () => {
                    msgDialogStatus = true;
                    getMyFriends();
                  }
                "
              />

              <q-dialog v-model="msgDialogStatus">
                <div class="row" style="width: 500px">
                  <!--                  친구목록-->
                  <div class="col-4">
                    <q-card style="width: 100%; height: 100%">
                      <q-card-section>
                        <div class="text-h6">Friends List</div>
                      </q-card-section>

                      <q-separator />

                      <q-card-section style="height: 56.2vh" class="scroll">
                        <div v-for="f in friendList" :key="f.id">
                          <q-item
                            clickable
                            v-ripple
                            @click="
                              () => {
                                selectFriend(f.id);
                              }
                            "
                          >
                            <q-item-section side>
                              <q-avatar rounded size="48px">
                                <img
                                  :src="f.profileImg"
                                  alt="friend_prof_img"
                                />
                                <!--                                <q-badge floating color="teal">new</q-badge>-->
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ f.username }}</q-item-label>
                              <!--                              <q-item-label caption>2 new messages</q-item-label>-->
                            </q-item-section>
                          </q-item>
                        </div>
                      </q-card-section>

                      <q-separator />
                    </q-card>
                  </div>

                  <!--                  메시지-->
                  <div class="col-8">
                    <q-card style="width: 300px; height: 100%">
                      <q-card-section>
                        <div class="text-h6">Message</div>
                      </q-card-section>

                      <q-separator />

                      <q-card-section style="height: 50vh" class="scroll">
                        <!--                        채팅-->
                        <div class="q-pa-md row justify-center">
                          <div style="width: 100%; max-width: 400px">
                            <div
                              v-for="chat in currentMsg"
                              :key="chat.timestamp"
                            >
                              <q-chat-message
                                :name="chat.senderUsername"
                                :avatar="chat.senderProfileImg"
                                :text="[chat.content]"
                                :stamp="chat.timestamp"
                                :sent="
                                  chat.senderId ===
                                  userStore.getProviderTypeAndLoginId
                                "
                                bg-color="amber-7"
                              />
                            </div>
                          </div>
                        </div>
                      </q-card-section>

                      <q-input
                        filled
                        ref="msgInput"
                        v-model="msgToFriend"
                        type="text"
                        maxlength="500"
                      >
                        <template v-slot:prepend>
                          <q-icon name="message" />
                        </template>
                        <template v-slot:after>
                          <q-btn
                            ref="msgBtn"
                            @click="sendMsgToFriend"
                            outline
                            color="secondary"
                            round
                            flat
                            icon="send"
                          />
                        </template>
                      </q-input>
                    </q-card>
                  </div>
                </div>
              </q-dialog>
            </div>
          </q-menu>
        </q-btn>
        <!--        end section: message-->

        <q-btn style="background: none" outline no-shadow label="Menu">
          <q-menu transition-show="jump-down" transition-hide="jump-up">
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup to="/">
                <q-item-section>Home</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="Dark.toggle()">
                <q-item-section>Dark Mode</q-item-section>
              </q-item>
              <q-separator />
              <div v-if="!userStore.isUserLogin">
                <q-item clickable v-close-popup to="/login">
                  <q-item-section>Login</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/signup">
                  <q-item-section>Sign up</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/findPwd">
                  <q-item-section>Find Password</q-item-section>
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
              <q-separator />
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
              <q-icon :name="item.iconName" />
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
              alt="profile-image"
            />
          </q-avatar>
          <div class="text-weight-bold" v-text="userStore.getUserName"></div>
          <div v-text="userStore.getUserDefaultEmail"></div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />

      <q-page-sticky position="bottom-right" :offset="fabPos" v-if="enableFab">
        <q-fab
          icon="keyboard_arrow_left"
          direction="left"
          color="accent"
          :disable="draggingFab"
          v-touch-pan.prevent.mouse="moveFab"
        >
          <template v-slot:label="{ opened }">
            <div :class="{ 'fab-animate--hover': opened !== true }">
              {{ opened !== true ? "" : "Close" }}
            </div>
          </template>

          <div class="fixed-bottom-right" style="margin-bottom: 90px">
            <q-menu
              anchor="bottom middle"
              self="top left"
              :offset="[0, 8]"
              ref="chatBox"
            >
              <div
                class="q-p"
                style="
                  width: 400px;
                  max-width: 400px;
                  margin-right: 9px;
                  margin-left: 9px;
                  margin-bottom: 8px;
                "
              >
                <q-infinite-scroll
                  ref="chatScrollArea"
                  @load="onLoad"
                  :offset="850"
                  reverse
                  scroll-target="chatScroll"
                >
                  <template v-slot:loading>
                    <div class="text-center q-my-md">
                      <q-spinner-dots color="primary" size="30px" />
                    </div>
                  </template>

                  <div
                    v-for="item in chatMessages"
                    :key="item.createdDate"
                    class="caption q-py-sm"
                    ref="chatScroll"
                  >
                    <q-chat-message name="GPT">
                      <div>{{ item.completion }}</div>
                      <template v-slot:label
                        >{{ item.createdDate.value }}
                      </template>
                      <template v-slot:avatar>
                        <img
                          class="q-message-avatar q-message-avatar--sent"
                          src="https://cdn.quasar.dev/img/avatar1.jpg"
                        />
                      </template>
                    </q-chat-message>
                    <q-chat-message sent>
                      <div>{{ item.prompt }}</div>
                      <template v-slot:name
                        >{{ userStore.getUserName }}
                      </template>
                      <template v-slot:label
                        >{{ item.createdDate.value }}
                      </template>
                      <template v-slot:avatar>
                        <img
                          class="q-message-avatar q-message-avatar--sent"
                          :src="userStore.getUserImg"
                        />
                      </template>
                    </q-chat-message>
                  </div>
                </q-infinite-scroll>
                <q-input
                  filled
                  ref="promptInput"
                  v-model="chatPrompt"
                  :rules="[(v) => v.length > 0 || 'Cannot be empty']"
                  lazy-rules
                  type="text"
                  maxlength="500"
                >
                  <template v-slot:prepend>
                    <q-icon name="lightbulb" />
                  </template>
                  <template v-slot:after>
                    <q-btn
                      ref="promptBtn"
                      @click="sendMessage"
                      outline
                      color="secondary"
                      round
                      flat
                      icon="send"
                      :disable="disablePromptBtn"
                    />
                  </template>
                </q-input>
              </div>
            </q-menu>
          </div>

          <q-fab-action
            @click="onClick"
            color="primary"
            icon="question_answer"
            :disable="draggingFab"
          />
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
