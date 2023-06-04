<script setup>
import { RouterView } from "vue-router";
import { useCurrentStore } from "stores/current";
import { onMounted } from "vue";

const currentStore = useCurrentStore();
const defineDrawerItems = [
  {
    section: "Stars List",
    router: {
      path: "/user/stars",
    },
    iconName: "folder",
  },
  {
    section: "Stars Search",
    router: {
      path: "/user/stars/search",
    },
    iconName: "search",
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
