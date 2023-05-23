<script setup>
// import { storeToRefs } from 'pinia'
import {useUserStore} from 'stores/user'
import {EditMode} from '../components'

const userStore = useUserStore()
// const user = storeToRefs(userStore)
</script>
<template>
  <div>
    <h1>Hi {{ userStore.getUserName }}!</h1>
    <!-- <ul v-if="users.length">
          <li v-for="user in users" :key="user.id">{{ user.firstName }} {{ user.lastName }}</li>
        </ul> -->
    <!-- <div v-if="users.loading" class="spinner-border spinner-border-sm"></div>
        <div v-if="users.error" class="text-danger">Error loading users: {{ users.error }}</div> -->
  </div>
  <div class="container">
    <div class="col-md-6 offset-md-3 mt-5">
      <EditMode/>
    </div>
  </div>
</template>
