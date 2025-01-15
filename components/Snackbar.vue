<template>
  <v-snackbar v-model="show" color="error">
    {{ text }}

    <template v-slot:actions>
      <v-btn :color="color" variant="text" icon @click="clear">
        <v-icon color="white">mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script lang="ts" setup>
const { show, color, text, clear } = useSnackbar();
</script>
