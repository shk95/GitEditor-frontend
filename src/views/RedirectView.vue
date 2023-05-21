<script setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'

const route = useRoute()
const userStore = useUserStore()

const token = route.query.token
if (token) {
  console.log('token', token)
  userStore.loginOAuth(token)
} else {
  console.warn('oAuth login error.')
}
</script>
<template>
  <h1>hello</h1>
</template>
