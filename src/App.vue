<script setup>
import { RouterView } from "vue-router";
import { useUserStore } from "stores/user";
import { ref } from "vue";
import { Dark } from "quasar";
import { useCurrentStore } from "stores/current";
import { useRouter } from "vue-router";

const leftDrawerOpen = ref(false);
const userStore = useUserStore();
const currentStore = useCurrentStore();
const router = useRouter();

userStore.refreshToken();

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
  console.log("33333333333");
  userStore.logout().then(() => router.push("/"));
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
        <q-btn dense flat round @click="Dark.toggle()" icon="dark_mode" />

        <q-toolbar-title>
          <!--          <q-avatar square>
                      <img v-bind:src="userPrfImgSrc()" width="20px" height="20px"
                           style="!important;padding-left: 0; padding-right: 0">
                    </q-avatar>-->
          Hello
        </q-toolbar-title>
      </q-toolbar>

      <div v-if="!userStore.isUserLogin">
        <q-tabs align="justify" dense>
          <q-route-tab to="/" label="Home" />
          <q-route-tab to="/login" label="Login" />
          <q-route-tab to="/signup" label="Sign Up" />
        </q-tabs>
      </div>
      <div v-else>
        <q-tabs align="justify" dense>
          <q-route-tab to="/" label="Home" />
          <q-route-tab @click="logout" label="Logout" />
        </q-tabs>
      </div>
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
              <q-icon :name="item.iconName" />
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
            />
          </q-avatar>
          <div class="text-weight-bold" v-text="userStore.getUserName"></div>
          <div v-text="userStore.getUserDefaultEmail"></div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
