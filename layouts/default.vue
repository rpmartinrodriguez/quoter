<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="surface" density="compact" elevation="2">
      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme"></v-btn>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <template v-if="user">
        <v-list-item :title="user.name" :subtitle="user.email" class="py-2"></v-list-item>
        <v-divider></v-divider>
      </template>

      <v-list nav>
        <v-list-item prepend-icon="mdi-calculator" title="Calculadora" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-chart-bar" title="Mi Estadística" to="/estadisticas"></v-list-item>
        <v-list-item prepend-icon="mdi-finance" title="Proyección" to="/proyeccion"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Programa 4/14" to="/programa414"></v-list-item>
        <v-list-item prepend-icon="mdi-format-list-checks" title="Cotizaciones" to="/cotizaciones"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Configuración" to="/settings"></v-list-item>
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

    <v-snackbar
      v-model="snackbar.show.value"
      :color="snackbar.color.value"
      timeout="3000"
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
import { useSnackbar } from '~/composables/useSnackbar';
import { useAuth } from '~/composables/useAuth'; // ✅ Se importa la lógica de autenticación

// Lógica del menú lateral
const drawer = ref(false);

// Lógica para el título dinámico
const { pageTitle } = usePageTitle();

// Lógica para el cambio de tema
const theme = useTheme();
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'miTemaClaro' : 'miTemaOscuro';
};

// Lógica para las notificaciones
const snackbar = useSnackbar();

// ✅ Obtenemos el usuario y la función de logout para usar en el template
const { user, logout } = useAuth();
</script>

<style>
.main-content {
  min-height: 100vh;
  /* El color de fondo ahora lo maneja el tema de Vuetify */
}
</style>
