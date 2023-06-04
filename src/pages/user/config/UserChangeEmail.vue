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
  <div class="q-pa-md">
    <div class="q-gutter-y-md column" style="max-width: 300px">
      <q-input v-model="email" :dense="false" />
    </div>
    <q-btn
      color="red"
      icon="mail"
      icon-right="send"
      label="Submit"
      @click="changeEmailHandler"
    />
  </div>
</template>

<style scoped></style>
