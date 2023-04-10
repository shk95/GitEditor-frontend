<template>
    <div class="container public">
        <div class="row justify-content-center">
            <div class="form">
                <form @submit.prevent="submitForm">
                    <div v-show="errorMessage" class="alert alert-danger failed">{{ errorMessage }}</div>
                    <div class="form-group">
                        <label for="username">아이디</label>
                        <input type="text" class="form-control" id="username" v-model="form.username"
                            @blur="v$.form.username.$touch" />
                        <div class="field-error" v-if="v$.form.username.$dirty">
                            <p class="error" v-for="error of v$.form.username.$errors" :key="error.$uid"
                                v-text="error.$message"></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="emailAddress">이메일 주소</label>
                        <input type="email" class="form-control" id="emailAddress" v-model="form.emailAddress"
                            @blur="v$.form.emailAddress.$touch" />
                        <div class="field-error" v-if="v$.form.emailAddress.$dirty">
                            <p class="error" v-for="error of v$.form.emailAddress.$errors" :key="error.$uid"
                                v-text="error.$message"></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="password">비밀번호</label>
                        <input type="password" class="form-control" id="password" v-model="form.password"
                            @blur="v$.form.password.$touch" />
                        <div class="field-error" v-if="v$.form.password.$dirty">
                            <p class="error" v-for="error of v$.form.password.$errors" :key="error.$uid"
                                v-text="error.$message"></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">비밀번호 확인</label>
                        <input type="password" class="form-control" id="confirmPassword" v-model="form.confirmPassword"
                            @blur="v$.form.confirmPassword.$touch" />
                        <div class="field-error" v-if="v$.form.confirmPassword.$dirty">
                            <p class="error" v-for="error of v$.form.confirmPassword.$errors" :key="error.$uid"
                                v-text="error.$message"></p>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">회원가입</button>
                    <p class="text-center text-muted">로그인<router-link to="login" /></p>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
import { required, maxLength, minLength, email, alphaNum, sameAs } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'

export default {
    name: 'SignupPage',
    components: {},
    setup() {
        return {
            v$: useVuelidate()
        }
    },
    data() {
        return {
            form: {
                username: '',
                emailAddress: '',
                password: '',
                confirmPassword: ''
            },
            errorMessage: ''
        }
    },
    validations() {
        return {
            form: {
                username: {
                    required,
                    alphaNum,
                    minLength: minLength(7),
                    maxLength: maxLength(20)
                },
                emailAddress: {
                    required,
                    email
                },
                password: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(20)
                },
                confirmPassword: {
                    sameAsPassword: sameAs(this.form.password)
                }
            }
        }
    },
    created() { },
    mounted() { },
    unmounted() { },
    methods: {
        async submitForm() {
            if (!(await this.v$.$validate())) {
                this.errorMessage = '회원가입 양식을 확인해주세요'
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
