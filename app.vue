<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script lang="ts" setup>
import { useTheme } from "vuetify";

const theme = useTheme();
onMounted(() => {
  const localTheme = localStorage.getItem("theme");
  theme.global.name.value = localTheme || "light";
});
</script>
