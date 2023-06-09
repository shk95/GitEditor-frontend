<script setup>
import {RouterView} from "vue-router";
import {useUserStore} from "stores/user";
import {ref} from "vue";
import {Dark} from "quasar";
import {useCurrentStore} from "stores/current";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";

const $q = useQuasar();

const leftDrawerOpen = ref(false);
const userStore = useUserStore();
const currentStore = useCurrentStore();
const router = useRouter();

setTimeout(() => userStore.refreshToken(), 2000)

console.log("Is user logged in?", userStore.isUserLogin);

const userPrfImgSrc = () => {
  return (
    userStore.getUserImg ||
    "https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg"
  );
};
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = () => {
  userStore.logout().then(() => {
    console.log("Logout Success");
    $q.notify({
      position: 'top',
      type: 'info',
      message: '로그아웃하였습니다'
    })
    router.push("/")
  }, (reject) => {
    $q.notify({
      position: 'top',
      type: 'warning',
      message: '에러가 발생하였습니다'
    })
    console.warn(reject)
  });
};

</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn
          v-if="userStore.isUserLogin"
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
        />
        <!--        <q-btn dense flat round @click="Dark.toggle()" icon="dark_mode"/>-->

        <q-toolbar-title>
          <!--          <q-avatar square>
                      <img v-bind:src="userPrfImgSrc()" width="20px" height="20px"
                           style="!important;padding-left: 0; padding-right: 0">
                    </q-avatar>-->
          <q-btn flat style="background: none;" label="Git Editor" to="/"></q-btn>
        </q-toolbar-title>
        <q-btn style="background: none;" outline no-shadow label="Menu">
          <q-menu transition-show="jump-down"
                  transition-hide="jump-up">
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup to="/">
                <q-item-section>Home</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="Dark.toggle()">
                <q-item-section>Dark Mode</q-item-section>
              </q-item>
              <q-separator/>
              <div v-if="!userStore.isUserLogin">
                <q-item clickable v-close-popup to="/login">
                  <q-item-section>Login</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/signup">
                  <q-item-section>Sign up</q-item-section>
                </q-item>
              </div>
              <div v-else>
                <q-item clickable v-close-popup to="/user/config">
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </div>
              <q-separator/>
              <q-item clickable v-close-popup>
                <q-item-section>Help &amp; Feedback</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="userStore.isUserLogin"
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="300"
      :breakpoint="400"
    >
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list padding>
          <q-item
            clickable
            v-ripple
            v-for="item in currentStore.getDrawerItems"
            :key="item.section"
            :to="item.router"
          >
            <q-item-section avatar>
              <q-icon :name="item.iconName"/>
            </q-item-section>

            <q-item-section>
              {{ item.section }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img
        class="absolute-top"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 150px"
      >
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img
              :src="userPrfImgSrc()"
              style="padding-left: 0; padding-right: 0"
              alt="profile-image"/>
          </q-avatar>
          <div class="text-weight-bold" v-text="userStore.getUserName"></div>
          <div v-text="userStore.getUserDefaultEmail"></div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>
