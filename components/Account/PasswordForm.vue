<template>
  <v-form validate-on="input" novalidate>
    <div class="d-flex align-center">
      <v-text-field
        label="Contraseña actual"
        variant="outlined"
        density="compact"
        :append-inner-icon="psswdInnerIcon"
        :type="psswdInputType"
        :rules="passwordRules"
        autocomplete="current-password"
        v-model="actualPassword"
        @click:append-inner="togglePsswdShow"
      ></v-text-field>
    </div>
  </v-form>
</template>
<script lang="ts" setup>
const {
  psswdInnerIcon,
  psswdInputType,
  passwordRules,
  togglePsswdShow,
  actualPassword,
} = usePasswordField();
</script>
