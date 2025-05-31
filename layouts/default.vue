<template>
  <v-app>
    <v-main class="main-content">
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// No hace falta lógica acá si es sólo layout
</script>

<style scoped>
.main-content {
  min-height: 100vh;
  background-color: #f5f5f5; /* Fondo gris claro */
}
</style>
