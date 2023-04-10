<template>
    <div class="container public">
        <div class="row justify-content-center">
            <div class="form">
                <Logo />
                <form @submit.prevent="submitForm">
                    <div v-show="errorMessage" class="alert alert-danger failed">{{ errorMessage }}</div>
                    <div class="form-group">
                        <label for="username">아이디</label>
                        <input type="text" class="form-control" id="username" v-model="form.username"
                            @blur="v$.form.username.$touch">
                        <div class="field-error" v-if="v$.form.username.$dirty">
                            <p class="error" v-for="error of v$.form.username.$errors" :key="error.$uid"
                                v-text="error.$message"></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="password">비밀번호</label>
                        <input type="password" class="form-control" id="password" v-model="form.password">
                        <div class="field-error" v-if="v$.form.password.$dirty" @blur="v$.form.password.$touch">
                            <p class="error" v-for="error of v$.form.password.$errors" :key="error.$uid"
                                v-text="error.$message"></p>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">로그인</button>
                    <div class="links">
                        <p class="sign-up text-muted">계정이 없나요?<router-link to="signup"
                                class="link-sign-up">회원가입하기</router-link></p>
                        <p>
                            <Modal_btn modal-id="userFindPwd">비밀번호 찾기</Modal_btn>
                        </p>
                    </div>
                    <Modal modal-id="userFindPwd" modal-title="비밀번호 찾기">
                        <UserFindPwd></UserFindPwd>
                    </Modal>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { required } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import UserFindPwd from '../modals/UserFindPwd.vue'
import Modal from '../components/Modal-1.vue'
import Modal_btn from '../components/Modal-1-btn.vue'

export default {
    name: 'LoginPage',
    components: { UserFindPwd, Modal, Modal_btn },
    data() {
        return {
            form: {
                username: '',
                password: ''
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
                username: { required },
                password: { required }
            }
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
    }
}
</script>
