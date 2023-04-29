<template>
  <div class="container public">
    <div class="row justify-content-center">
      <div class="form">
        <form @submit.prevent="submitForm">
          <div v-show="errorMessage" class="alert alert-danger failed">{{ errorMessage }}</div>
          <div class="form-group">
            <label for="userId">아이디</label>
            <input
              id="userId"
              v-model="form.userId"
              class="form-control"
              type="text"
              @blur="v$.form.userId.$touch"
            />
            <div v-if="v$.form.userId.$dirty" class="field-error">
              <p
                v-for="error of v$.form.userId.$errors"
                :key="error.$uid"
                class="error"
                v-text="error.$message"
              ></p>
            </div>
          </div>
          <div class="form-group">
            <label for="username">닉네임</label>
            <input
              id="username"
              v-model="form.username"
              class="form-control"
              type="text"
              @blur="v$.form.username.$touch"
            />
            <div v-if="v$.form.username.$dirty" class="field-error">
              <p
                v-for="error of v$.form.username.$errors"
                :key="error.$uid"
                class="error"
                v-text="error.$message"
              ></p>
            </div>
          </div>
          <div class="form-group">
            <label for="defaultEmail">이메일 주소</label>
            <input
              id="defaultEmail"
              v-model="form.defaultEmail"
              class="form-control"
              type="email"
              @blur="v$.form.defaultEmail.$touch"
            />
            <div v-if="v$.form.defaultEmail.$dirty" class="field-error">
              <p
                v-for="error of v$.form.defaultEmail.$errors"
                :key="error.$uid"
                class="error"
                v-text="error.$message"
              ></p>
            </div>
          </div>
          <div class="form-group">
            <label for="password">비밀번호</label>
            <input
              id="password"
              v-model="form.password"
              class="form-control"
              type="password"
              @blur="v$.form.password.$touch"
            />
            <div v-if="v$.form.password.$dirty" class="field-error">
              <p
                v-for="error of v$.form.password.$errors"
                :key="error.$uid"
                class="error"
                v-text="error.$message"
              ></p>
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">비밀번호 확인</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              class="form-control"
              type="password"
              @blur="v$.form.confirmPassword.$touch"
            />
            <div v-if="v$.form.confirmPassword.$dirty" class="field-error">
              <p
                v-for="error of v$.form.confirmPassword.$errors"
                :key="error.$uid"
                class="error"
                v-text="error.$message"
              ></p>
            </div>
          </div>
          <button class="btn btn-primary btn-block" type="submit">회원가입</button>
          <p class="text-center text-muted">
            <RouterLink to="/login">로그인</RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { required, maxLength, minLength, email, alphaNum, sameAs } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import { $axios } from '@/utils/axios-custom'
import { RouterLink } from 'vue-router'

export default {
  name: 'SignupPage',
  components: { RouterLink },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  data() {
    return {
      form: {
        userId: '',
        username: '',
        defaultEmail: '',
        password: '',
        confirmPassword: ''
      },
      errorMessage: ''
    }
  },
  validations() {
    return {
      form: {
        userId: {
          required,
          alphaNum
        },
        username: {
          required,
          alphaNum,
          minLength: minLength(1),
          maxLength: maxLength(20)
        },
        defaultEmail: {
          required,
          email
        },
        password: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(20)
        },
        confirmPassword: {
          sameAsPassword: sameAs(this.form.password)
        }
      }
    }
  },
  created() {},
  mounted() {},
  unmounted() {},
  methods: {
    async submitForm() {
      if (!(await this.v$.$validate())) {
        this.errorMessage = '회원가입 양식을 확인해주세요'
        alert('내용을 입력해주세요.')
        return
      }
      $axios
        .post('/auth/signup', this.form)
        .then(({ data }) => {
          console.debug('signup ok\ndata : ' + data + '\nstatus : ' + data.status)
          alert('가입되었습니다.')
          // this.$router.push({ name: 'home' })
        })
        .catch((error) => {
          alert('에러발생.')
          console.log(error)
        })
    }
  }
}
</script>
