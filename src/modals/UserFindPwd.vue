<template>
  <div class="container public">
    <div class="row justify-content-center">
      <div class="form">
        <Logo />
        <form @submit.prevent="submitForm">
          <div v-show="errorMessage" class="alert alert-danger failed">{{ errorMessage }}</div>
          <div class="form-group">
            <label for="findpwd-email">이메일 입력</label>
            <input type="email" class="form-control" id="findpwd-email" v-model="form.email" @blur="v$.form.email.$touch">
            <div class="field-error" v-if="v$.form.email.$dirty">
              <p class="error" v-for="error of v$.form.email.$errors" :key="error.$uid" v-text="error.$message"></p>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">제출</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { required, email } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'

export default {
  name: 'UserFindPwd',
  components: {},
  data() {
    return {
      form: {
        email: ''
      },
      errorMessage: ''
    };
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  created() { },
  mounted() { },
  unmounted() { },
  methods: {
    async submitForm() {
      if (!(await this.v$.$validate())) {
        alert('입력을 확인해주세요.')
        this.errorMessage = '아이디 또는 비밀번호를 확인해주세요'
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
  },
  validations() {
    return {
      form: {
        email: { required, email }
      }
    }
  }
}
</script>