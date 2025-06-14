<template>
  <v-app>
    <v-app-bar app color="primary" density="compact">
      <v-toolbar-title>Calculadora de Cotizaciones</v-toolbar-title>
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

// ✅ 4. AÑADIMOS LA LÓGICA PARA CONTROLAR EL MENÚ
const drawer = ref(false);
</script>

<style>
/* ✅ 5. USAMOS Y MEJORAMOS TUS ESTILOS */
.main-content {
  min-height: 100vh;
  /* Usamos tu color de fondo original, es una buena elección */
  background-color: #f5f5f5;
}
</style>

