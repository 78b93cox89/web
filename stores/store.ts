import { defineStore } from "pinia";

export const usePiniaStore = defineStore({
  id: "ManyACG",
  state: () => ({
    preferLight: false,
    r18: false,
  }),
  actions: {
    setpreferLight(preferLight: boolean) {
      this.preferLight = preferLight;
    },
    setR18(r18: boolean) {
      this.r18 = r18;
    },
  },
  persist: true,
});
