<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="surface" density="compact" elevation="2">
      <v-toolbar-title>Calculadora de Cotizaciones</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme"></v-btn>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      </v-navigation-drawer>

    <v-main class="main-content">
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show.value" :color="snackbar.color.value" timeout="3000" location="top right">
      {{ snackbar.text.value }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show.value = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTheme } from 'vuetify'; // Importamos el gestor de temas de Vuetify

// Lógica del menú lateral
const drawer = ref(false);

// ✅ Lógica para el cambio de tema
const theme = useTheme();
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'miTemaClaro' : 'miTemaOscuro';
};

// ✅ Lógica para las notificaciones
import { useSnackbar } from '~/composables/useSnackbar';
const snackbar = useSnackbar();
</script>

<style>
.main-content {
  min-height: 100vh;
  /* El color de fondo ahora lo maneja el tema de Vuetify */
}
</style>
