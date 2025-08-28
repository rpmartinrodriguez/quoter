<template>
  <div ref="quoteRef" class="quote-container">
    <div class="header">
      <h2>Presupuesto</h2>
      <img src="/logo.png" alt="Logo" class="logo" v-if="logoExists" />
    </div>
    <div class="section">
      <div class="section-title">Cliente</div>
      <p>{{ clientName }}</p>
    </div>
    <div class="section">
      <div class="section-title">Productos Seleccionados</div>
      <ul>
        <li v-for="(product, index) in products" :key="index">{{ product }}</li>
      </ul>
    </div>
    <div class="section-inline">
      <div>
        <div class="section-title">Depósito Inicial</div>
        <p class="price">{{ deposit }}</p>
      </div>
      <div>
        <div class="section-title">Monto a Financiar</div>
        <p class="price">{{ toFinance }}</p>
      </div>
    </div>
    <div class="section-highlight">
      <div class="section-title">Plan de Pagos Seleccionado</div>
      <p class="quote-main">{{ installmentsInfo }}</p>
    </div>
    <div class="footer">
      <p>Gracias por confiar en nosotros.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const props = defineProps<{
  clientName: string;
  products: string[];
  deposit: string;
  toFinance: string;
  installmentsInfo: string;
}>();

const quoteRef = ref<HTMLElement | null>(null);
const logoExists = ref(true); // Podríamos hacer una lógica para chequear si existe /logo.png

// Exponemos la referencia al elemento principal para que el padre pueda acceder a él
defineExpose({ quoteRef });
</script>

<style scoped>
.quote-container {
  width: 400px;
  padding: 20px;
  background-color: white;
  border: 1px solid #eee;
  font-family: 'Inter', sans-serif;
  color: #333;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #1976D2;
  padding-bottom: 10px;
}
.logo {
  max-height: 50px;
}
.section {
  margin-top: 15px;
}
.section-title {
  font-size: 0.8rem;
  color: #546E7A;
  text-transform: uppercase;
  font-weight: 500;
}
p {
  margin: 5px 0 0 0;
  font-size: 1rem;
}
ul {
  padding-left: 20px;
  margin-top: 5px;
}
.section-inline {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
.price {
  font-size: 1.1rem;
  font-weight: bold;
}
.section-highlight {
  margin-top: 20px;
  padding: 15px;
  background-color: #F2F5F8;
  border-radius: 8px;
  text-align: center;
}
.quote-main {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976D2;
}
.footer {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 0.8rem;
  color: #999;
}
</style>
