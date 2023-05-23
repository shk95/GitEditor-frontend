<template>
  <div class="container public">
    <div class="row justify-content-center">
      <div class="form">
        <form @submit.prevent="submitForm">
          <div v-show="errorMessage" class="alert alert-danger failed">{{ errorMessage }}</div>
          <div class="form-group">
            <label for="username">아이디</label>
            <input
              type="text"
              class="form-control"
              id="username"
              v-model="form.username"
              readonly
            />
          </div>
          <div class="form-group">
            <label for="emailAddress">이메일 주소</label>
            <input
              type="email"
              class="form-control"
              id="emailAddress"
              v-model="form.emailAddress"
              readonly
            />
          </div>
          <div class="form-group">
            <label for="password">비밀번호 재설정</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="form.password"
              @blur="v$.form.password.$touch"
            />
            <div class="field-error" v-if="v$.form.password.$dirty">
              <p
                class="error"
                v-for="error of v$.form.password.$errors"
                :key="error.$uid"
                v-text="error.$message"
              ></p>
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              class="form-control"
              id="confirmPassword"
              v-model="form.confirmPassword"
              @blur="v$.form.confirmPassword.$touch"
            />
            <div class="field-error" v-if="v$.form.confirmPassword.$dirty">
              <p
                class="error"
                v-for="error of v$.form.confirmPassword.$errors"
                :key="error.$uid"
                v-text="error.$message"
              ></p>
            </div>
          </div>
          <div class="form-group">
            <label for="chatGPT">chatGPT token</label>
            <input type="password" class="form-control" id="chatGPT" v-model="form.chatGPT" />
          </div>
          <div class="form-group">
            <label for="gitToken">GitHub token</label>
            <input type="password" class="form-control" id="gitToken" v-model="form.gitToken" />
          </div>
          <div>
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault-github"
              />
              <label class="form-check-label" for="flexSwitchCheckDefault-github"
                >Using Github</label
              >
            </div>
          </div>
          <div>
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault-chat"
              />
              <label class="form-check-label" for="flexSwitchCheckDefault-chat"
                >Using ChatGPT</label
              >
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">변경</button>
          <button type="button" class="btn btn-primary btn-block">돌아가기</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core'
import { required, sameAs } from '@vuelidate/validators'

export default {
  name: 'UserConfig',
  components: {},
  data() {
    return {
      form: {
        username: '',
        emailAddress: '',
        password: '',
        confirmPassword: '',
        useGithub: '' /* boolen */,
        gitToken: '',
        useGpt: '' /* boolen */,
        gptToken: ''
      },
      errorMessage: ''
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  validations() {
    return {
      form: {
        username: {
          required
        },
        emailAddress: {
          required
        },
        password: {},
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
        this.errorMessage = ''
        alert('내용을 입력해주세요.')
        return
      }
      /* this.$axios
          .put('/notice/' + this.form.noticeSeq, this.form)
          .then(() => {
              console.log('ok\n' + this.form)
              alert('수정되었습니다.')
              this.$router.push({ name: 'noticeList' })
          })
          .catch((error) => {
              alert('에러발생.')
              console.log(error)
          }) */
    }
  }
}
</script>

<style></style>
