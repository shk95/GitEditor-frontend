<script setup>
import {ref} from "vue";
import {api} from "boot/axios";

const email = ref(null);

const changeEmail = (email) => {
  const data = {defaultEmail: email};
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
    <div class="q-gutter-y-md" style="max-width: 300px">
      <div class="row">
        <div class="q-pl-md q-pr-md col-8">
          <q-input label="Change Email" v-model="email" :dense="false"/>
        </div>
        <div class="q-pl-md q-pr-md col-4">
          <q-btn
            color="primary"
            icon-right="send"
            @click="changeEmailHandler"
          />
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped></style>
