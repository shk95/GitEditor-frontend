<script setup>
import {useUserStore} from "stores/user";
import socials from "../utils/socials";
import {useRouter, useRoute} from "vue-router";
import {reactive} from "vue";
import {formRegx} from "src/utils/form-regx";
import {useQuasar} from "quasar";

const $q = useQuasar();

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// redirect to home if already logged in
if (userStore.getUserId) {
  router.push("/");
}

const form = reactive({userId: '', password: ''})
const userIdRule = [userId => (userId && formRegx.userId['pattern'].test(userId) || formRegx.email['pattern'].test(userId)) || formRegx.userId['message']]
const passwordRule = [password => password && formRegx.password['pattern'].test(password) || formRegx.password['message']]

const onSubmit = () => {
  useUserStore()
    .login(form)
    .then(({message}) => {
      console.log(router, route);
      $q.notify({
        position:'top',
        type: 'positive',
        message: message
      })
      router.push(route.query.returnUrl || "/");
    }, (reject) => {
      $q.notify({
        position:'top',
        type: 'warning',
        message: reject
      })
    })
    .catch((error) => {
      $q.notify({
        position:'top',
        type: 'negative',
        message: error.message
      })
    });
}
</script>

<template>
  <q-page>
    <div>
      <div class="row" style="min-height: 110vh">
        <div class="col-lg-6 col-md-6 col-sm-0 col-xs-0 branding">
          <div class="full-height full-width">
            <img src="https://cdn.quasar.dev/img/mountains.jpg" class="full-height full-width" style="opacity: 0.7"
                 alt="background">
          </div>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 q-px-xl">
          <div v-if="!$q.platform.is.desktop" class="box">
          </div>
          <div class="text-h5 full-width text-weight-bold"
               :style="$q.platform.is.desktop ? 'padding-top: 4rem' : 'padding-top: 2rem'">
            <div class="full-width row justify-center">WELCOME</div>
          </div>
          <div class="q-px-lg-xl q-px-md-xl q-px-sm-lg q-px-xs-lg q-mx-lg-xl q-mx-md-xl" style="margin-top: 7rem">
            <label>Username or Email</label>
            <q-form @submit="onSubmit">
              <div class="row col-12">
                <q-input
                  v-model="form.userId"
                  class="full-width"
                  dense
                  lazy-rules
                  :rules="userIdRule"
                />
              </div>
              <div class="row col-10 q-mt-md">
                <label>Password</label>
                <q-input
                  type="password"
                  class="full-width"
                  dense
                  v-model="form.password"
                  lazy-rules
                  :rules="passwordRule"
                />
              </div>
              <div>
                <div class="row q-pt-lg q-pa-none">
                  <div class="col-12">
                    <q-btn
                      class="text-weight-bolder q-px-xl full-width custom-btn"
                      label="Log in"
                      type="submit"
                    >
                    </q-btn>
                  </div>
                  <div class="q-mt-sm text-blue-10 row full-width justify-end cursor-pointer">
                    Don't Have an Account?
                    <router-link to="/signup">Sign-up</router-link>
                  </div>
                  <div class="q-mt-sm text-blue-10 row full-width justify-end cursor-pointer">
                    <router-link to="/findPwd">Forgot Password?</router-link>
                  </div>
                </div>
              </div>
            </q-form>
          </div>
          <div class="q-pa-md">
            <div style="text-align: center;">
              <q-btn
                v-for="social in socials.socials"
                v-bind:key="social.socialType"
                class="social_login_container q-gutter-xs"
                flat
              >
                <a v-bind:href="socials.getSocialLoginUrl(social.socialType)">
                  <img
                    class="social_login"
                    v-bind:src="socials.getSocialImage(social.socialType)"
                    v-bind:style="{ width: social.width, height: social.height }"
                    alt="social-login-img"/>
                </a>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>

.custom-btn {
  border-radius: 5px;
  background: linear-gradient(145deg, rgb(47, 10, 93) 2%, rgb(45, 17, 123));
  color: white;
}

.branding {
  background-color: #2e3d57;
}

.custom-input-box input::placeholder {
  font-size: 15px;
  text-align: center;
  font-weight: 600;
}

.box {
  background: radial-gradient(200% 150px at 20% -30%, #2e3d57 -10%, transparent 120%);
  height: 4rem;
}
</style>
