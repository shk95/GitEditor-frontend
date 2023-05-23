<script setup>
import {RouterView, RouterLink} from 'vue-router'
import {useUserStore} from 'stores/user'
import {Modal_1, Modal_1_btn} from './components'
import {UserConfig} from './modals'

const userStore = useUserStore()
</script>

<template>
  <!--  <router-view />-->

  <div class="app-container bg-light">
    <nav class="navbar navbar-expand navbar-dark bg-dark px-3">
      <div v-if="userStore.getToken" class="navbar-nav">
        <RouterLink class="nav-item nav-link" to="/">Home</RouterLink>
        <RouterLink class="nav-item nav-link" to="/:authStore.user/list">List</RouterLink>
        <button class="btn btn-link nav-item nav-link" @click="userStore.logout()">Logout</button>
        <Modal_1_btn modal-id="userConfig">User Config</Modal_1_btn>
      </div>
      <div v-else class="navbar-nav">
        <RouterLink class="nav-item nav-link" to="/">Home</RouterLink>
        <RouterLink class="nav-item nav-link" to="/login">Login</RouterLink>
        <RouterLink class="nav-item nav-link" to="/signup">Signup</RouterLink>
      </div>
    </nav>
    <div>
      <Modal_1 modal-id="userConfig" modal-title="User Config">
        <UserConfig></UserConfig>
      </Modal_1>
    </div>
    <div class="container pt-4 pb-4">
      <RouterView/>
    </div>
  </div>
</template>

<script>
import 'bootstrap'

import {defineComponent} from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<style scoped>
.app-container {
  min-height: 350px;
}
</style>

<style lang="scss">
html,
body {
  height: 100%;
  font-size: 14px;
  font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif !important;
}

#app,
.page {
  height: 100%;
  position: relative;
}

.page {
  display: flex;
  flex-direction: column;
}

.public.container {
  max-width: 900px;
}

input.form-control:focus,
textarea.form-control:focus {
  border: 1px solid #377ef6 !important;
}

.btn-cancel {
  color: #666 !important;
}

.public {
  .form {
    margin-top: 50px;
    width: 320px;

    .form-group {
      label {
        font-weight: bold;
        color: #555;
      }

      .error {
        line-height: 1;
        // display: none;
        margin-top: 5px;
      }
    }
  }
}

.field-error {
  .error {
    display: block;
    color: #ff0000;
  }
}

.modal {
  .modal-dialog {
    -webkit-transform: translate(0, -25%);
    -o-transform: translate(0, -25%);
    transform: translate(0, -25%);
    top: 25%;
    margin: 0 auto;

    .modal-header {
      border-bottom: none;
      padding: 1rem 1rem 0.5rem;

      .modal-title {
        font-size: 1rem;
      }

      .close {
        outline: none !important;
      }
    }

    .modal-body {
      padding-bottom: 0;

      textarea {
        resize: none;
        height: 100px;
      }
    }

    .modal-footer {
      justify-content: start;
      border-top: none;
      padding-top: 0;
      padding-bottom: 1.5rem;

      .btn-cancel {
        color: #666;
      }
    }
  }
}

.modal-open .modal-backdrop.show {
  opacity: 0.7;
}
</style>
