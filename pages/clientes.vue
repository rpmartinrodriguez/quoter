<template>
  <v-card flat>
    <v-card-title class="d-flex align-center">
      <v-icon start>mdi-account-box-multiple-outline</v-icon>
      Directorio de Clientes
    </v-card-title>
    <v-card-text>
      <p class="text-center text-grey pa-4">
        Próximamente: Tabla con la lista de todos tus clientes.
      </p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';

const { setTitle } = usePageTitle();

onMounted(() => {
  setTitle('Clientes');
});
</script>
