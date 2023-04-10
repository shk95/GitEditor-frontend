
<template>
  <div>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/login">login</RouterLink>
  </div>
  <RouterView />
  <div>
    <Modal modal-id="userConfig" modal-title="사용자 설정">
      <UserConfig></UserConfig>
    </Modal>
    <Modal_btn modal-id="userConfig">
      사용자 설정
    </Modal_btn>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router'
import "bootstrap/dist/css/bootstrap.min.css";

</script>

<script>
import UserConfig from './modals/UserConfig.vue';
import Modal from './components/Modal-1.vue';
import Modal_btn from './components/Modal-1-btn.vue';


export default {
  name: 'MainView',
  components: { UserConfig, Modal, Modal_btn },
  data() {
    return {
      something: ''
    };
  },
  setup() { },
  created() { },
  mounted() { },
  unmounted() { },
  methods: {}
}
</script>

<style scoped></style>
<style lang="scss">
html,
body {
  height: 100%;
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, Helvetica, sans-serif !important;
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
  border: 1px solid #377EF6 !important;
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
      padding: 1rem 1rem .5rem;

      .modal-title {
        font-size: 1rem;
      }

      .close {
        outline: none !important
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
  opacity: .7;
}
</style>
