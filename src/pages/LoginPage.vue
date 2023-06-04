<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useUserStore } from "stores/user";
import socials from "../utils/socials";
import { useRouter, useRoute } from "vue-router";

const userStore = useUserStore(); // TODO 전역으로 사용자 정보 감시

const router = useRouter();
const route = useRoute();

// redirect to home if already logged in
if (userStore.getUserId) {
  router.push("/");
}

const schema = Yup.object().shape({
  userId: Yup.string().required("User id is required"),
  password: Yup.string().required("Password is required"),
});

async function onSubmit(values, { setErrors }) {
  const { userId, password } = values;
  const error = await useUserStore()
    .login({ userId, password })
    .then(() => {
      console.log(router, route);
      router.push(route.query.returnUrl || "/");
    })
    .catch((error) => error);
  if (error) {
    // true : 로그인 실패, false : 로그인 성패
    console.log(error);
    alert(error.message);
    if (error) {
      setErrors({ apiError: error });
    }
  }
}
</script>

<template>
  <div class="col-md-6 offset-md-3 mt-5">
    <h2>Login</h2>
    <Form
      v-slot="{ errors, isSubmitting }"
      :validation-schema="schema"
      @submit="onSubmit"
    >
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
          <span
            v-show="isSubmitting"
            class="spinner-border spinner-border-sm me-1"
          ></span>
          Login
        </button>
      </div>
      <div v-if="errors.apiError" class="alert alert-danger mt-3 mb-0">
        {{ errors.apiError }}
      </div>
    </Form>
    <div class="links">
      <p class="sign-up text-muted">
        Don't Have a Account?
        <router-link class="link-sign-up" to="signup">Sign-up</router-link>
      </p>
      <p>
        <router-link to="findPwd">Find Password</router-link>
      </p>
    </div>
  </div>
  <div>
    <div>
      <div
        v-for="social in socials.socials"
        v-bind:key="social.socialType"
        class="social_login_container"
      >
        <a v-bind:href="socials.getSocialLoginUrl(social.socialType)">
          <img
            class="social_login"
            v-bind:src="socials.getSocialImage(social.socialType)"
            v-bind:style="{ width: social.width, height: social.height }"
          />
          {{ social.comment }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.social_login_container {
  text-align: center;
}
</style>
