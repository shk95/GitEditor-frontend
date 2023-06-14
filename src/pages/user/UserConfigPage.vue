<script setup>
import {api} from "boot/axios";
import {onMounted, reactive, ref, toRef} from "vue";
import {formRegx} from "src/utils/form-regx";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import {useUserStore} from "stores/user";
import socials from "src/utils/socials";

const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  userStore.me();
  placeholder.email = userStore.getUserDefaultEmail;
  placeholder.username = userStore.getUserName;
});

const showPassword = ref(false);
const placeholder = reactive({
  email: "",
  username: "",
});
const emailRef = ref(null);
const usernameRef = ref(null);
const passwordRef = ref(null);
const accessTokenRef = ref(null);
const form = reactive({
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  accessToken: "",
});
const rules = {
  email: [
    (email) =>
      (email && formRegx.email["pattern"].test(email)) ||
      formRegx.email["message"],
  ],
  username: [
    (name) =>
      (name && formRegx.username["pattern"].test(name)) ||
      formRegx.username["message"],
  ],
  password: [
    (password) =>
      (password && formRegx.password["pattern"].test(password)) ||
      formRegx.password["message"],
    (password) =>
      (password && form.password === form.confirmPassword) ||
      "비밀번호가 다릅니다.",
  ],
  confirmPassword: [
    (password) =>
      (password && form.password === form.confirmPassword) ||
      "비밀번호가 다릅니다.",
  ],
  accessToken: [(token) => token !== "" || "Token 을 입력해 주세요."],
};

const submitEmail = () => {
  emailRef.value.validate()
    ? updateUser({newEmail: form.email})
    : formAlert();
};

const submitUsername = () => {
  usernameRef.value.validate()
    ? updateUser({newUsername: form.username})
    : formAlert();
};
const submitPassword = () => {
  passwordRef.value.validate()
    ? updateUser({newPassword: form.password})
    : formAlert();
};

const formAlert = () => {
  $q.notify({
    position: "top",
    type: "warn",
    message: "입력을 확인해주세요.",
  });
};

const updateUser = (form) => {
  api
    .put("/user/profile", form)
    .then(
      (data) => {
        console.log(
          "update ok\nmessage : " + data?.message + "\nstatus : " + data?.status
        );
        $q.notify({
          position: "top",
          type: "info",
          message: "회원정보가 수정되었습니다.",
        });
      },
      (reject) =>
        $q.notify({
          position: "top",
          type: "warning",
          message: reject?.message,
        })
    )
    .catch((error) => {
      $q.notify({
        position: "top",
        type: "warning",
        message: error?.message,
      });
      console.log(error);
    });
};

const alertAccountDeletion = () => {
  $q.dialog({
    title: "경고",
    message: "계정을 삭제하시겠습니까?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => accountDeletion())
    .onCancel(() => {
      // console.log('Cancel')
    });
};

const accountDeletion = () => {
  api
    .delete("/user")
    .then((resolve) => {
      userStore.invalidateUser();
      console.log(resolve?.message);
      $q.notify({
        position: "top",
        type: "info",
        message: resolve?.message,
      });
      router.push({name: "home"});
    })
    .catch((error) => {
      $q.notify({
        position: "top",
        type: "warning",
        message: error.message,
      });
    });
};

const alertAddGithubService = () => {
  $q.dialog({
    title: "Github 연동",
    message: "서비스를 추가하시겠습니까?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => addGithubService())
    .onCancel(() => {
      console.log("Cancel");
    });
};

const addGithubService = () => {
  if (userStore.isGithubEnabled) {
    $q.notify({
      position: "top",
      type: "info",
      message: "이미 연동되어 있습니다.",
    });
    return;
  }
  api
    .post("/user/profile/github")
    .then(
      (resolve) => {
        console.debug("resolved");
        setTimeout(
          () => (window.location.href = socials.getSocialLoginUrl("github")),
          1000
        );
      },
      (reject) => {
        return new Error(reject?.message);
      }
    )
    .catch((error) => {
    });
};

const alertAddOpenAIService = () => {
  $q.dialog({
    title: "Chat GPT 연동",
    message: "서비스를 추가하시겠습니까?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => addOpenAIService())
    .onCancel(() => {
      console.log("Cancel");
    });
};

const addOpenAIService = () => {
  if (userStore.isOpenAIEnabled) {
    $q.notify({
      position: "top",
      type: "info",
      message: "이미 연동되어 있습니다.",
    });
    return;
  }
  if (!accessTokenRef.value.validate()) {
    return;
  }
  const data = {accessToken: form.accessToken};
  return api.post("/user/profile/openai", data).then((resolve) => {
    $q.notify({
      position: "top",
      type: "info",
      message: resolve?.message,
    });
  });
};
</script>

<template>
  <div
    class="col-lg-6 col-md-6 col-sm-12 col-xs-12 q-px-xl"
    style="margin-left: 250px; margin-right: 250px; margin-top: 100px"
  >
    <q-list class="q-gutter-md">
      <q-item>
        <q-item-section>
          <q-item-label class="q-pb-xs">Email</q-item-label>
          <q-input
            ref="emailRef"
            bottom-slots
            v-model="form.email"
            :label="placeholder.email"
            class="full-width"
            dense
            lazy-rules
            :rules="rules.email"
            type="email"
            clearable
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="send"
                type="submit"
                @click="submitEmail"
              />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="q-pb-xs">Name</q-item-label>
          <q-input
            ref="usernameRef"
            type="text"
            class="full-width"
            dense
            clearable
            v-model="form.username"
            :label="placeholder.username"
            lazy-rules
            :rules="rules.username"
          >
            <template v-slot:append>
              <q-btn round dense flat icon="send" @click="submitUsername"/>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="q-pb-xs">Password</q-item-label>
          <q-input
            ref="passwordRef"
            v-model="form.password"
            class="full-width"
            dense
            lazy-rules
            :rules="rules.password"
            :type="showPassword ? 'text' : 'password'"
            clearable
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
              <q-btn
                round
                dense
                flat
                icon="send"
                type="submit"
                @click="submitPassword"
              />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="q-pb-xs">Repeat Password</q-item-label>
          <q-input
            v-model="form.confirmPassword"
            class="full-width"
            dense
            lazy-rules
            type="password"
            :rules="rules.confirmPassword"
            clearable
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="q-pb-xs"
          >Add Open AI Service Api Key
          </q-item-label
          >
          <q-input
            ref="accessTokenRef"
            v-model="form.accessToken"
            class="full-width"
            dense
            type="password"
            :disable="userStore.isOpenAIEnabled"
            lazy-rules
            :rules="rules.accessToken"
            clearable
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="send"
                @click="alertAddOpenAIService"
                type="submit"
                :disable="userStore.isOpenAIEnabled"
              />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-list>
    <div class="col" style="margin-right: 50px; margin-left: 50px">
      <div class="row q-gutter-sm ">
        <q-btn
          color="transparent" outline
          class="col text-weight-bolder q-px-sm full-width custom-btn"
        >
        </q-btn>
        <q-separator vertical spaced color="transparent"></q-separator>
        <q-btn
          :disable="userStore.isGithubEnabled"
          color="transparent"
          unelevated
          @click="alertAddGithubService"
          label="Add GitHub"
          text-color="black"
          class="col text-weight-bolder q-px-sm full-width custom-btn"
          outline
        >
        </q-btn>
      </div>
      <q-separator spaced></q-separator>
      <div class="row q-gutter-sm">
        <q-btn
          ref="resetBtn"
          class="col text-weight-bolder q-px-sm full-width custom-btn"
          label="Reset"
          no-caps
          type="reset"
        >
        </q-btn>
        <q-separator vertical spaced color="transparent"></q-separator>
        <q-btn
          class="col text-weight-bolder q-px-sm full-width custom-btn"
          label="Account Deletion"
          no-caps
          @click="alertAccountDeletion"
        >
        </q-btn>
      </div>
    </div>
  </div>
  <div class="q-pa-md q-gutter-sm"></div>
</template>

<style scoped>
.custom-btn {
  border-radius: 5px;
  background: linear-gradient(145deg, rgb(47, 10, 93) 2%, rgb(45, 17, 123));
  color: white;
}

.custom-input-box input::placeholder {
  font-size: 15px;
  text-align: center;
  font-weight: 600;
}
</style>
