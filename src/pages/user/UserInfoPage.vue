<script setup>
import { useUserStore } from "stores/user";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const userStore = useUserStore();

let profileImg = ref(null);
let intervals = null;
let progress = ref({ loading: false, percentage: 0 });

const isGithubEnabled = userStore.isGithubEnabled;
const isOpenAIEnabled = userStore.isOpenAIEnabled;

onMounted(() => {
  userStore.me();
});

onBeforeUnmount(() => {
  clearInterval(intervals);
});

const uploadImg = () => {
  progress.value.loading = true;
  progress.value.percentage = 0;

  intervals = setInterval(() => {
    progress.value.percentage += Math.floor(Math.random() * 8 + 10);
    if (progress.value.percentage >= 100) {
      clearInterval(intervals);
      progress.value.loading = false;
    }
  }, 700);

  const formData = new FormData();
  formData.append("file", profileImg.value);
  console.log(profileImg.value);
  api
    .post(
      "/user/profile/img",
      { file: profileImg.value },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((resolve) => {
      clearInterval(intervals);
      progress.value.loading = false;
      progress.value.percentage = 100;
      console.info(resolve?.message);

      userStore.me();
    })
    .catch((error) => {
      console.error(error);
    });
};

const onRejected = (rejectedEntries) => {
  $q.notify({
    type: "negative",
    message: "올바르지 않은 형식의 파일 입니다.",
  });
};
</script>

<template>
  <div class="q-pa-md example-row-horizontal-alignment">
    <div class="row justify-center">
      <div class="col-8" style="text-align: center">
        <div class="q-pa-md q-gutter-sm">
          <q-img
            class="col"
            :src="userStore.getUserImg"
            style="max-width: 100px"
            fit="cover"
          >
          </q-img>
          <q-file
            class="col"
            color="purple-12"
            v-model="profileImg"
            label="Change Profile Image"
            accept=".jpg, image/*"
            @rejected="onRejected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <q-btn
            class="col"
            :loading="progress.loading"
            :percentage="progress.percentage"
            round
            color="secondary"
            @click="uploadImg()"
            icon="cloud_upload"
            dense
          />
        </div>
        <q-toggle
          v-model="isGithubEnabled"
          color="green"
          label="Github 계정 활성화 여부"
          left-label
        />
        <q-toggle
          v-model="isOpenAIEnabled"
          color="green"
          label="Chat GPT 사용 여부"
          left-label
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
