<template>
  <div class="form-wrapper">
    <h1>Nueva contraseña</h1>
    <br />
    <br />
    <v-form
      validate-on="submit lazy"
      v-model="valid"
      @submit.prevent="handleSubmit"
    >
      <v-text-field
        label="Contraseña"
        variant="outlined"
        density="compact"
        :append-inner-icon="psswdInnerIcon"
        :type="psswdInputType"
        :rules="passwordRules"
        autocomplete="current-password"
        v-model="password"
        @click:append-inner="togglePsswdShow"
      ></v-text-field>
      <v-btn type="submit" color="success" class="mt-5 text-uppercase" block>
        cambiar contraseña
      </v-btn>
    </v-form>
    <br />
    <div class="mt-5 d-flex align-center justify-space-around">
      <small class="text-uppercase">
        Este formulario está protegido por Google Recaptcha V3
      </small>
      <img src="@/assets/img/google-recaptcha-icon.png" class="gri" />
    </div>
  </div>
</template>
<script lang="ts" setup>
definePageMeta({
  layout: "auth",
  middleware: ["auth"],
});

const { psswdInnerIcon, psswdInputType, passwordRules, togglePsswdShow } =
  usePasswordField();
const password = ref<string>();
const valid = ref<boolean>(false);

const handleSubmit = () => {
  console.log("SUBMITTED!", valid.value);
};
</script>
