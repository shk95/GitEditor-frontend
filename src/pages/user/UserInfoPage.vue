<script setup>
import {useUserStore} from "stores/user";
import {onBeforeUnmount, onMounted, ref} from "vue";
import {useQuasar} from "quasar";
import {api} from "boot/axios";

const $q = useQuasar();
const userStore = useUserStore();

let profileImg = ref(null);
let intervals = null;
let progress = ref({loading: false, percentage: 0});

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
      {file: profileImg.value},
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
  <div class="q-pa-md">
    <div class="row full-width text-h3 text-bold">Profile</div>
    <div class="row col-12 q-mt-md">
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12 q-pr-lg-md q-pr-md-md q-pr-sm-none q-pr-xs-none">
        <q-card class="q-pa-md card-item flex flex-center">
          <div class="row full-width justify-center">
            <q-avatar size="150px">
              <img :src="userStore.getUserImg"/>
            </q-avatar>
          </div>

          <q-separator/>

          <div class="row q-my-md full-width justify-center">
            <div class="text-h5 row justify-center full-width text-bold">
              {{ userStore.getUserName }}
            </div>
            <!--            <div class="text-subtitle1 row justify-center full-width">
                          Full Stack Developer
                        </div>-->
            <div class="row justify-center text-center full-width text-caption text-grey">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </div>
          </div>
        </q-card>
      </div>
      <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
        <div class="row full-width q-pl-lg-xs q-pl-md-xs q-mt-lg-none q-mt-md-none q-mt-sm-md q-mt-xs-md">
          <q-card class="q-pa-xs full-width">
            <q-card-section>
              <q-form class="q-mb-xs">
                <div class="row">
                  <div class="row col-12">
                    <label class="text-bold">ID</label>
                    <q-input
                      readonly
                      class="q-mt-sm full-width"
                      :class="
                        $q.dark.isActive ? 'input-custom-dark' : 'input-custom'
                      "
                      borderless
                      :label="userStore.getUserId"
                    />
                  </div>
                  <div class="row col-12 q-mt-md">
                    <label class="text-bold">Name</label>
                    <q-input
                      readonly
                      class="q-mt-sm full-width"
                      :class="
                        $q.dark.isActive ? 'input-custom-dark' : 'input-custom'
                      "
                      borderless
                      :label="userStore.getUserName"
                    />
                  </div>
                </div>
                <div class="row q-mt-md">
                  <div class="row col-12">
                    <label class="text-bold">Email</label>
                    <q-input
                      readonly
                      class="q-mt-sm full-width"
                      :class="
                        $q.dark.isActive ? 'input-custom-dark' : 'input-custom'
                      "
                      borderless
                      :label="userStore.getUserDefaultEmail"
                    />
                  </div>
                </div>
                <div class="row-cols-1 q-mt-md" style="height: 153px;">
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div class="q-pa-md example-row-horizontal-alignment">
      <div class="row justify-center">
        <div>
          <div class="q-pa-md q-gutter-sm row" style="position:relative; left: 35px;">
            <q-file
              color="purple-12"
              v-model="profileImg"
              label="Change Profile Image"
              accept=".jpg, image/*"
              @rejected="onRejected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file"/>
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  :loading="progress.loading"
                  :percentage="progress.percentage"
                  round
                  color="secondary"
                  @click="uploadImg()"
                  icon="cloud_upload"
                />
              </template>
            </q-file>
          </div>
          <div class="row">
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
    </div>
  </div>
</template>

<style scoped>
.card-item {
  height: 500px !important;
  border-radius: 5px;
}

.input-custom input {
  background-color: rgba(243, 244, 246);
  padding: 10px;
  border-radius: 5px;
}

.input-custom-dark input {
  background-color: rgb(0, 0, 0);
  padding: 10px;
  border-radius: 5px;
}
</style>
