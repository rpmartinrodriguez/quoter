<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="surface" density="compact" elevation="2">
      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme"></v-btn>

      <v-menu location="bottom end" offset="10" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-badge :content="notificationCount" color="error" v-if="notificationCount > 0">
              <v-icon>mdi-bell</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-outline</v-icon>
          </v-btn>
        </template>

        <v-list elevation="2" density="compact" nav max-width="400">
          <v-list-subheader>SEGUIMIENTOS PENDIENTES</v-list-subheader>
          <v-divider></v-divider>
          
          <v-list-item
            v-for="notification in pendingNotifications"
            :key="notification.id"
            :to="notification.link"
            :title="notification.text"
            :subtitle="notification.subtitle"
            prepend-icon="mdi-calendar-clock"
          >
          </v-list-item>
          
          <v-list-item v-if="notificationCount === 0">
            <v-list-item-title class="text-grey text-caption pa-4 text-center">
              No tenés seguimientos pendientes. ¡Buen trabajo!
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <template v-if="user">
        <v-list-item :title="user.name" :subtitle="user.email" class="py-2"></v-list-item>
        <v-divider></v-divider>
      </template>

      <v-list nav>
        <v-list-item prepend-icon="mdi-calculator" title="Calculadora" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-account-box-multiple-outline" title="Clientes" to="/clientes"></v-list-item>
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
import { useSnackbar } from '~/composables/useSnackbar';
import { useAuth } from '~/composables/useAuth';
// ✅ Importamos el nuevo gestor de notificaciones de la campanita
import { useNotifications } from '~/composables/useNotifications';

const drawer = ref(false);
const { pageTitle } = usePageTitle();
const theme = useTheme();
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'miTemaClaro' : 'miTemaOscuro';
};
const snackbar = useSnackbar();
const { user, logout } = useAuth();
// ✅ Hacemos que la lista de notificaciones y su contador estén disponibles
const { pendingNotifications, notificationCount } = useNotifications();
</script>

<style>
/* Los estilos no cambian, ahora el fondo lo maneja el tema de Vuetify */
.main-content {
  min-height: 100vh;
}
</style>
