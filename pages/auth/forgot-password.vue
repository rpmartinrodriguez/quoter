<template>
  <div class="form-wrapper">
    <h1>Cambio de contraseña</h1>
    <br />
    <v-alert border="start" title="ATENCIÓN" color="info" variant="tonal">
      <br />
      Para cambiar la contraseña debe enviar el correo electrónico para
      confirmar que es un usuario de la plataforma.<br />
      <b
        >Recibirá un correo electrónico con los pasos a seguir para continuar
        con el proceso.</b
      >
    </v-alert>
    <br />
    <br />
    <v-form
      validate-on="submit lazy"
      v-model="valid"
      @submit.prevent="handleSubmit"
    >
      <v-text-field
        label="Correo"
        variant="outlined"
        density="compact"
        :rules="emailRules"
        autocomplete="current-email"
        v-model="email"
      ></v-text-field>
      <v-btn type="submit" color="success" class="mt-5 text-uppercase" block>
        iniciar proceso
      </v-btn>
      <v-btn
        variant="plain"
        density="compact"
        color="info"
        class="mt-3 px-0"
        to="/auth/sign-in"
      >
        <b>volver</b>
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

const email = ref<string>();

const valid = ref<boolean>(false);

const emailRules = [
  (value: string) => {
    if (!value) return "El correo es requerido";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Correo inválido";

    return true;
  },
];

const handleSubmit = () => {
  console.log("SUBMITTED!", valid.value);
};
</script>
