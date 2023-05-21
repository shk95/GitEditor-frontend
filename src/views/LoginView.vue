<script setup>
import { Form, Field } from 'vee-validate'
import * as Yup from 'yup'
import { router } from '@/router'
import { useUserStore } from '@/stores/user.store'
import { useRoute } from 'vue-router'

const route = useRoute()
const userStore = useUserStore() // TODO 전역으로 사용자 정보 감시

// redirect to home if already logged in
if (userStore.getUserId) {
  router.push('/')
}

const schema = Yup.object().shape({
  userId: Yup.string().required('User id is required'),
  password: Yup.string().required('Password is required')
})

async function onSubmit(values, { setErrors }) {
  const { userId, password } = values
  const result = await useUserStore().login({ userId, password })
  if (result) {
    // true : 로그인 실패, false : 로그인 성패
    console.log(result)
    if (result.message) {
      setErrors({ apiError: result.message })
    }
  }
  console.log(router, route)
  await router.push(route.query.returnUrl || '/')
}
</script>

<script>
import { UserFindPwd } from '@/modals'
import { Modal_1, Modal_1_btn } from '@/components'

export default {
  name: 'LoginView',
  components: { UserFindPwd, Modal_1, Modal_1_btn },
  data() {
    return {}
  },
  setup() {},
  created() {},
  mounted() {},
  unmounted() {},
  methods: {}
}
</script>

<template>
  <div class="col-md-6 offset-md-3 mt-5">
    <h2>Login</h2>
    <Form v-slot="{ errors, isSubmitting }" :validation-schema="schema" @submit="onSubmit">
      <div class="mb-3">
        <label class="form-label">User Id</label>
        <Field
          :class="{ 'is-invalid': errors.userId }"
          class="form-control"
          name="userId"
          type="text"
        />
        <div class="invalid-feedback">{{ errors.userId }}</div>
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <Field
          :class="{ 'is-invalid': errors.password }"
          class="form-control"
          name="password"
          type="password"
        />
        <div class="invalid-feedback">{{ errors.password }}</div>
      </div>
      <div class="mb-3">
        <button :disabled="isSubmitting" class="btn btn-primary">
          <span v-show="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
          Login
        </button>
      </div>
      <div v-if="errors.apiError" class="alert alert-danger mt-3 mb-0">{{ errors.apiError }}</div>
    </Form>
    <div class="links">
      <p class="sign-up text-muted">
        Don't Have a Account?
        <router-link class="link-sign-up" to="signup">Sign-up</router-link>
      </p>
      <p>
        <Modal_1_btn modal-id="userFindPwd">Find Password</Modal_1_btn>
      </p>
    </div>
    <Modal_1 modal-id="userFindPwd" modal-title="Find Password">
      <UserFindPwd></UserFindPwd>
    </Modal_1>
  </div>
  <a
    href="http://localhost:10000/oauth2/authorization/github?redirect_uri=http://localhost:4000/oauth/redirect"
    >깃허브</a
  >
</template>
