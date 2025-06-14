<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-chart-bar</v-icon>
      Mi Estadística
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="success" variant="tonal">
            <div class="text-subtitle-1">NÚMERO DE VENTAS</div>
            <div class="text-h3 font-weight-bold mt-2">{{ numeroDeVentas }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="info" variant="tonal">
            <div class="text-subtitle-1">NÚMERO DE COTIZACIONES</div>
            <div class="text-h3 font-weight-bold mt-2">{{ numeroDeCotizaciones }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="primary" variant="tonal">
            <div class="text-subtitle-1">TASA DE CONVERSIÓN</div>
            <div class="text-h3 font-weight-bold mt-2">{{ tasaDeConversion }}%</div>
            <div class="text-caption mt-1">(Ventas / Total de Registros)</div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col>
          <v-card flat class="pa-4">
            <v-card-title>Ranking de Productos Populares</v-card-title>
            <v-card-text>
              <v-list lines="one">
                <v-list-item
                  v-for="(product, index) in rankingDeProductos"
                  :key="product.name"
                >
                  <template v-slot:prepend>
                    <span class="font-weight-bold mr-4 text-h6 text-primary">#{{ index + 1 }}</span>
                  </template>
                  
                  <v-list-item-title>{{ product.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Incluido en {{ product.count }} registros
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="rankingDeProductos.length === 0">
                  <v-list-item-title>Aún no hay suficientes datos para generar un ranking.</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';

const { getRecords, savedRecords, isLoading } = useSavedQuotes();

// --- LÓGICA PARA CALCULAR LAS ESTADÍSTICAS ---

const numeroDeVentas = computed(() => 
  savedRecords.value.filter(r => r.type === 'VENTA').length
);
const numeroDeCotizaciones = computed(() => 
  savedRecords.value.filter(r => r.type === 'COTIZACIÓN').length
);
const tasaDeConversion = computed(() => {
  const totalRegistros = numeroDeVentas.value + numeroDeCotizaciones.value;
  if (totalRegistros === 0) return 0;
  const rate = (numeroDeVentas.value / totalRegistros) * 100;
  return Math.round(rate * 10) / 10;
});

// ✅ --- INICIO: NUEVA LÓGICA PARA EL RANKING ---
const rankingDeProductos = computed(() => {
  // 1. Creamos un mapa para contar cuántas veces aparece cada producto.
  const productCounts = new Map<string, number>();

  // 2. Recorremos todos los registros guardados.
  for (const record of savedRecords.value) {
    // Dentro de cada registro, recorremos su array de productos.
    for (const productName of record.products) {
      // Obtenemos el conteo actual de ese producto, o 0 si no existe.
      const currentCount = productCounts.get(productName) || 0;
      // Lo incrementamos y lo volvemos a guardar en el mapa.
      productCounts.set(productName, currentCount + 1);
    }
  }

  // 3. Convertimos el mapa a un array para poder ordenarlo.
  const sortedProducts = Array.from(productCounts.entries()).map(([name, count]) => ({
    name,
    count
  }));

  // 4. Ordenamos el array de mayor a menor según la cantidad de veces que aparece.
  sortedProducts.sort((a, b) => b.count - a.count);

  // 5. Devolvemos los 10 productos más populares.
  return sortedProducts.slice(0, 10);
});
// ✅ --- FIN: NUEVA LÓGICA PARA EL RANKING ---

onMounted(() => {
  if (savedRecords.value.length === 0) {
    getRecords();
  }
});
</script>
