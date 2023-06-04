<script setup>
import { useUserStore } from "stores/user";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const redirectType = Object.freeze({
  emailVerification: {
    url: "user/email",
    method: "get",
    param: "code",
  },
});

const queriedParam = redirectType[route.query.type];

//TODO: 리다이렉트 통합
const token = route.query.token;

if (token) {
  console.log("token", token);
  userStore.loginOAuth(token).then(() => router.push("/"));
} else if (queriedParam) {
  const code = route.query.code;
  console.log("redirect invoked. code : ", code);
  api({
    method: queriedParam.method,
    url: `${import.meta.env.VITE_SERVER_API_URL}/${queriedParam.url}?${
      queriedParam.param
    }=${code}`,
  }).then(() => setTimeout(() => router.push("/"), 2000));
} else {
  // console.warn('oAuth login error.')
}

setTimeout(() => router.push("/"), 2000);
</script>
<template>
  <h2>
    Redirect...
    <q-spinner color="primary" size="3em" :thickness="10" />
  </h2>
</template>
