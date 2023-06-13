import { defineStore } from "pinia";

export const useCurrentStore = defineStore("current", {
  state: () => ({
    drawerItems: [
      {
        section: null,
        router: null,
        iconName: null,
      },
    ],
  }),
  persist: true,
  getters: {
    getDrawerItems(state) {
      return state.drawerItems;
    },
  },
  actions: {
    setDrawerItems(drawerItems) {
      this.drawerItems = drawerItems;
    },
  },
});
