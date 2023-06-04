<script setup>
import { useCurrentStore } from "stores/current";
import { onMounted } from "vue";
const currentStore = useCurrentStore();
const defineDrawerItems = [
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
    iconName: "config",
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
  <h1>home</h1>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />
  </q-page>
</template>

<style scoped></style>
