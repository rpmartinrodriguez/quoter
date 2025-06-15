<template>
  <v-app>
    <v-app-bar app color="primary" density="compact">
      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
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
          prepend-icon="mdi-account-group"
          title="Programa 4/14"
          to="/programa414"
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
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
// ✅ Importamos nuestro nuevo gestor de títulos
import { usePageTitle } from '~/composables/usePageTitle';

// Estado para controlar el menú lateral
const drawer = ref(false);
// ✅ Obtenemos la variable reactiva del título para usarla en el template
const { pageTitle } = usePageTitle();
</script>

<style>
/* Estilos globales */
.main-content {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
