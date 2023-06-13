<script setup>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

const $q = useQuasar();

const email = ref(null);
const disableBtn = ref(false);

const changeEmail = (email) => {
  disableBtn.value = true;
  const data = { defaultEmail: email };
  console.debug(data);
  return api
    .post("/user/password", data)
    .then((resolve) => {
      console.debug(resolve);
      $q.notify({
        position: "top",
        type: "positive",
        message: "비밀번호가 변경되었습니다. 이메일을 확인해주세요.",
      });
      disableBtn.value = false;
    })
    .catch(() => (disableBtn.value = false));
};

const changeEmailHandler = () => {
  changeEmail(email.value);
};
</script>

<template>
  <div class="q-pa-md absolute-center">
    <div>
      <h5 class="text-center text-h">Find Password</h5>
    </div>
    <div class="q-gutter-y-md" style="max-width: 500px">
      <div class="row" style="text-align: center">
        <div class="row-cols-auto" style="text-align: center"></div>
        <div class="q-pl-lg q-pr-md col-8">
          <q-input label="Input Email" v-model="email" :dense="false" />
        </div>
        <div class="q-pl-md q-pr-md col-4">
          <q-btn
            color="primary"
            icon-right="send"
            @click="changeEmailHandler"
            :disable="disableBtn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
