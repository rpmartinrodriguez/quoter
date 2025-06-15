<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="surface" density="compact" elevation="2">
      <v-toolbar-title>Calculadora de Cotizaciones</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme"></v-btn>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list nav>
        <v-list-item
          prepend-icon="mdi-calculator"
          title="Calculadora"
          to="/"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="Mi Estadística"
          to="/estadisticas"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-finance"
          title="Proyección"
          to="/proyeccion"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-format-list-checks"
          title="Cotizaciones"
          to="/cotizaciones"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Configuración"
          to="/settings"
        ></v-list-item>
      </v-list>
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
import { useTheme } from 'vuetify';

// Lógica del menú lateral
const drawer = ref(false);

// Lógica para el cambio de tema
const theme = useTheme();
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'miTemaClaro' : 'miTemaOscuro';
};

// Lógica para las notificaciones
import { useSnackbar } from '~/composables/useSnackbar';
const snackbar = useSnackbar();
</script>

<style>
.main-content {
  min-height: 100vh;
  /* El color de fondo ahora es controlado por el tema de Vuetify
     que definimos en plugins/vuetify.ts */
}
</style>
