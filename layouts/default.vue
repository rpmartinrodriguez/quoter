<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="surface" density="compact" elevation="2">
      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme"></v-btn>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list nav>
        <v-list-item prepend-icon="mdi-calculator" title="Calculadora" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-chart-bar" title="Mi Estadística" to="/estadisticas"></v-list-item>
        <v-list-item prepend-icon="mdi-finance" title="Proyección" to="/proyeccion"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Programa 4/14" to="/programa414"></v-list-item>
        <v-list-item prepend-icon="mdi-format-list-checks" title="Cotizaciones" to="/cotizaciones"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Configuración" to="/settings"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="main-content">
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar.show.value"
      :color="snackbar.color.value"
      :timeout="3000"
      location="top right"
      variant="elevated"
    >
      <v-icon start>mdi-check-circle</v-icon>
      {{ snackbar.text.value }}
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show.value = false"></v-btn>
      </template>
    </v-snackbar>

  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import { usePageTitle } from '~/composables/usePageTitle';
// ✅ Importamos el nuevo gestor de notificaciones
import { useSnackbar } from '~/composables/useSnackbar';

// Lógica del menú lateral
const drawer = ref(false);
const { pageTitle } = usePageTitle();

// Lógica para el cambio de tema (si la tenías, si no la añadimos ahora)
const theme = useTheme();
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'miTemaClaro' : 'miTemaOscuro';
};

// ✅ Hacemos que las variables del snackbar estén disponibles en el template
const snackbar = useSnackbar();
</script>

<style>
/* Los estilos no cambian, ahora el fondo lo maneja el tema de Vuetify */
.main-content {
  min-height: 100vh;
}
</style>
