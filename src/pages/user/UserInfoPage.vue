<script setup>
import { useUserStore } from "stores/user";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const userStore = useUserStore();
const $q = useQuasar();

let profileImg = ref(null);

onMounted(() => {
  userStore.me();
});

const onRejected = (rejectedEntries) => {
  // Notify plugin needs to be installed
  // https://quasar.dev/quasar-plugins/notify#Installation
  $q.notify({
    type: "negative",
    message: `${rejectedEntries.length} file(s) did not pass validation constraints`,
  });
};

let progress = ref({ loading: false, percentage: 0 });
let intervals = null;

function uploadImg() {
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
}

onBeforeUnmount(() => {
  clearInterval(intervals);
});
</script>

<template>
  <h1>user info page</h1>
  <div class="q-pa-md example-row-horizontal-alignment">
    <div class="row justify-center">
      <div class="col-4" style="text-align: center">
        <q-img :src="userStore.getUserImg" style="max-width: 100px" fit="cover">
        </q-img>
        <q-file
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
          :loading="progress.loading"
          :percentage="progress.percentage"
          round
          color="secondary"
          @click="uploadImg()"
          icon="cloud_upload"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
