<script setup>
import { useUserStore } from 'stores/user'
import {useRoute, useRouter} from "vue-router";

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const token = route.query.token
if (token) {
  console.log('token', token)
  userStore.loginOAuth(token)
  router.push('/')
} else {
  console.warn('oAuth login error.')
}

</script>
<template>
  <h1>Redirect...</h1>
</template>
