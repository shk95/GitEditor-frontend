<script setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { router } from "@/router";

const route = useRoute()
const userStore = useUserStore()

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
