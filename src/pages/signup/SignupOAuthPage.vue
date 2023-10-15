<script setup>
import { api } from "boot/axios";
import { reactive, ref } from "vue";
import { formRegx } from "src/utils/form-regx";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const $q = useQuasar();
const router = useRouter();

const formData = reactive({
  username: "",
});
const disableBtn = ref(false);

const nameRule = [
  (name) =>
    (name && formRegx.username["pattern"].test(name)) ||
    formRegx.username["message"],
];

const onSubmit = () => {
  disableBtn.value = true;
  api
    .post("/user/signup/oauth", formData)
    .then(
      (data) => {
        console.debug(
          "signup ok\nmessage : " + data?.message + "\nstatus : " + data?.status
        );
        $q.notify({
          position: "top",
          type: "info",
          message: "회원가입되었습니다.",
        });
        router.push({ name: "redirect" });
      },
      (reject) => {
        $q.notify({
          position: "top",
          type: "warning",
          message: reject?.message,
        });
      }
    )
    .catch((error) => {
      $q.notify({
        position: "top",
        type: "warning",
        message: "에러가 발생하였습니다",
      });
      console.log(error);
    });
};

const onReset = () => {
  Object.keys(formData).forEach((key) => (formData[key] = ""));
};
</script>

<template>
  <div
    class="col-lg-6 col-md-6 col-sm-12 col-xs-12 q-px-xl"
    style="margin-left: 250px; margin-right: 250px; margin-top: 100px"
  >
    <h4 class="text-center" style="position: relative; right: 15px">Signup</h4>
    <q-form class="q-gutter-md" @submit="onSubmit" @reset="onReset">
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label class="q-pb-xs">Name</q-item-label>
            <q-input
              v-model="formData.username"
              class="full-width"
              dense
              lazy-rules
              :rules="nameRule"
              type="text"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div
        class="row q-gutter-sm"
        style="margin-right: 50px; margin-left: 50px"
      >
        <q-btn
          class="col text-weight-bolder q-px-sm full-width custom-btn"
          label="Signup"
          no-caps
          type="submit"
          :disable="disableBtn"
        >
        </q-btn>
        <q-separator vertical spaced color="transparent"></q-separator>
        <q-btn
          class="col text-weight-bolder q-px-sm full-width custom-btn"
          label="Reset"
          no-caps
          type="reset"
          color=""
        >
        </q-btn>
      </div>
    </q-form>
  </div>
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
  background: radial-gradient(
    200% 150px at 20% -30%,
    #2e3d57 -10%,
    transparent 120%
  );
  height: 4rem;
}
</style>
