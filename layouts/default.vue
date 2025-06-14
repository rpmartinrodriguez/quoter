<template>
  <v-app>
    <v-app-bar app color="primary" density="compact">
      <v-toolbar-title>Calculadora de Cotizaciones</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <template v-if="user">
        <v-list-item :title="user.name" :subtitle="user.email"></v-list-item>
        <v-divider></v-divider>
      </template>

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

      <template v-slot:append>
        <div class="pa-2" v-if="user">
          <v-btn block color="red" variant="tonal" @click="logout">
            Cerrar Sesión
          </v-btn>
        </div>
      </template>
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
// Importamos el estado del usuario y la función de logout
const { user, logout } = useAuth(); 
const drawer = ref(false);
</script>

<style>
/* Estilos globales */
.main-content {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
