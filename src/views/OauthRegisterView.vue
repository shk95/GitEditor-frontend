<script setup>
import { Field, Form } from 'vee-validate'
import * as Yup from 'yup'
import { $axios } from '@/utils'
import { router } from '@/router'

const schema = Yup.object().shape({
  userId: Yup.string().required('User id is required'),
  username: Yup.string().required('User name is required')
})

async function onSubmit(values, { setErrors }) {
  const { userId, username } = values
  $axios
    .post('/auth/signup/oauth', { userId, username })
    .then(
      () => {
        alert('회원가입되었습니다.')
        router.push('/')
      },
      (reject) => {
        setErrors({ apiError: reject.data.message })
      }
    )
    .catch()
}
</script>

<template>
  <div class="container public">
    <div class="row justify-content-center">
      <h2>Register</h2>
      <div class="form">
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
            <label class="form-label">User Name</label>
            <Field
              :class="{ 'is-invalid': errors.username }"
              class="form-control"
              name="username"
              type="username"
            />
            <div class="invalid-feedback">{{ errors.username }}</div>
          </div>
          <div class="mb-3">
            <button :disabled="isSubmitting" class="btn btn-primary">
              <span v-show="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              Login
            </button>
          </div>
          <div v-if="errors.apiError" class="alert alert-danger mt-3 mb-0">
            {{ errors.apiError }}
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
