<template>
  <v-app>
    <!-- Navigation Drawer -->
    <NavDrawer />

    <!-- Application Bar -->
    <v-app-bar>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <!-- Main Section -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts" setup>
const { toggleDrawer } = useNavDrawer();
</script>
