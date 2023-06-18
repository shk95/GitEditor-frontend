<script setup>
import { ref } from "vue";
import { api } from "boot/axios";

const email = ref(null);

const changeEmail = (email) => {
  const data = { defaultEmail: email };
  console.debug(data);
  return api.put("/user/email", data).then((resolve) => {
    console.debug(resolve);
  });
};

const changeEmailHandler = () => {
  changeEmail(email.value);
};
</script>

<template>
  <div class="q-pa-md absolute-center">
    <div class="row q-gutter-y-md justify-center" style="max-width: 500px">
      <div class="q-pl-lg q-pr-md col">
        <q-input label="Change Email" v-model="email" :dense="false">
          <template v-slot:append>
            <q-btn
              color="primary"
              icon-right="send"
              @click="changeEmailHandler"
            />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
