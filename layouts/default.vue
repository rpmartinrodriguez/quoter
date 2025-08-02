<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="surface" density="compact" elevation="2">
      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-dialog v-model="performanceDialog" max-width="550px">
        <template v-slot:activator="{ props }">
          <v-chip
            v-bind="props"
            :color="performance.performanceIndicator.value.color"
            class="mx-2"
            label
            link
          >
            <v-icon start>mdi-chart-donut</v-icon>
            Rendimiento: <strong>{{ performance.performanceIndicator.value.text }}</strong>
          </v-chip>
        </template>
        <v-card>
          <v-card-title><span class="text-h5">Análisis de Rendimiento Global</span></v-card-title>
          <v-card-subtitle>Puntaje General Ponderado: {{ performance.globalPerformanceScore.value }}%</v-card-subtitle>
          <v-card-text>
            <p class="text-caption mb-4">Este puntaje se calcula en base a tu eficiencia en áreas clave de venta.</p>
            <v-list lines="two" density="compact">
              <v-list-item>
                <v-list-item-title class="d-flex justify-space-between">
                  <span>Tasa de Cierre por Demo</span>
                  <v-chip :color="performance.getMetricColor(performance.metrics.demoToSaleRate.value)" size="small">{{ performance.metrics.demoToSaleRate.value }}%</v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>De las demos que hacés, cuántas se convierten en venta. (Peso: 50%)</v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item>
                <v-list-item-title class="d-flex justify-space-between">
                  <span>Tasa de Cumplimiento de Tareas</span>
                   <v-chip :color="performance.getMetricColor(performance.metrics.followUpCompletionRate.value)" size="small">{{ performance.metrics.followUpCompletionRate.value }}%</v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>De los seguimientos agendados, cuántos has marcado como completados. (Peso: 25%)</v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item>
                <v-list-item-title class="d-flex justify-space-between">
                  <span>Tasa de Conversión General</span>
                   <v-chip :color="performance.getMetricColor(performance.metrics.overallConversionRate.value)" size="small">{{ performance.metrics.overallConversionRate.value }}%</v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>De todos tus registros, cuántos son ventas. (Peso: 25%)</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="performanceDialog = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme" variant="text"></v-btn>

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
          <v-list-subheader>CENTRO DE NOTIFICACIONES</v-list-subheader>
          <v-divider></v-divider>
          <v-list-item v-for="notification in allNotifications" :key="notification.id" :to="notification.link" :title="notification.text" :subtitle="notification.subtitle" :prepend-icon="notification.icon">
            <template v-if="notification.id.startsWith('ref-')" v-slot:append>
              <v-btn icon="mdi-check" variant="text" size="small" color="success" title="Marcar como completado" @click.prevent="handleMarkAsDone(notification.id)"></v-btn>
            </template>
          </v-list-item>
          <v-list-item v-if="notificationCount === 0">
            <v-list-item-title class="text-grey text-caption pa-4 text-center">No tenés notificaciones pendientes.</v-list-item-title>
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

      <!-- ✅ INICIO: NUEVA SECCIÓN CON EL WIDGET DEL DÓLAR -->
      <v-divider class="my-2"></v-divider>
      <v-list-subheader>COTIZACIÓN DÓLAR</v-list-subheader>
      <div class="pa-2">
        <iframe 
          style="width: 100%; height: 260px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.12);" 
          src="https://dolarhoy.com/i/cotizaciones/dolar-contado-con-liquidacion" 
          frameborder="0"
        ></iframe>
      </div>
      <!-- ✅ FIN: NUEVA SECCIÓN -->

      <template v-slot:append>
        <div class="pa-2" v-if="user">
          <v-btn block color="red" variant="tonal" @click="logout">Cerrar Sesión</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show.value" :color="snackbar.color.value" :timeout="3000" location="top right" variant="elevated">
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
import { useNotifications } from '~/composables/useNotifications';
import { useReferrals } from '~/composables/useReferrals';
import { usePerformance } from '~/composables/usePerformance';

const drawer = ref(false);
const { pageTitle } = usePageTitle();
const theme = useTheme();
const toggleTheme = () => { theme.global.name.value = theme.global.current.value.dark ? 'miTemaClaro' : 'miTemaOscuro'; };
const snackbar = useSnackbar();
const { user, logout } = useAuth();
const { allNotifications, notificationCount } = useNotifications();
const { markFollowUpAsDone } = useReferrals();
const performance = usePerformance();
const performanceDialog = ref(false);

const handleMarkAsDone = async (notificationId: string) => {
  const referralId = notificationId.substring(4);
  try {
    await markFollowUpAsDone(referralId);
    snackbar.showSnackbar({text: "Seguimiento completado.", color: "success"});
  } catch (error) {
    snackbar.showSnackbar({text: "Error al marcar como completado.", color: "error"});
  }
};
</script>

<style>
.main-content {
  min-height: 100vh;
}
</style>
