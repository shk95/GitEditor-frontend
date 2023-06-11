<script setup>
import { RouterView } from "vue-router";
import { useCurrentStore } from "stores/current";
import { onMounted } from "vue";

const currentStore = useCurrentStore();
const defineDrawerItems = [
  {
    section: "Home",
    router: {
      path: "/",
    },
    iconName: "home",
  },
  {
    section: "Repo List",
    router: {
      path: "/user/repo",
    },
    iconName: "folder",
  },
  {
    section: "Repo Edit",
    router: {
      path: "/user/repo/edit",
    },
    iconName: "edit",
  },
];
onMounted(() => {
  currentStore.setDrawerItems(defineDrawerItems);
});
</script>

<template>
  <q-layout>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
