<script setup>
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
    section: "User Info",
    router: {
      path: "/user/info",
    },
    iconName: "info",
  },
  {
    section: "User Config",
    router: {
      path: "/user/config",
    },
    iconName: "build",
  },
  {
    section: "My Repos",
    router: {
      path: "/user/repo",
    },
    iconName: "folder",
  },
  {
    section: "My Stars",
    router: {
      path: "/user/stars",
    },
    iconName: "star",
  },
];

onMounted(() => {
  currentStore.setDrawerItems(defineDrawerItems);
});
</script>

<template>
  <h3>Hello</h3>
  <q-page class="flex flex-center"> </q-page>
</template>

<style scoped></style>
