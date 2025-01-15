<template>
  <v-form
    validate-on="input lazy"
    v-model="valid"
    @click.prevent="handleSubmit"
  >
    <div class="d-flex align-center">
      <v-text-field
        label="Nueva contraseña"
        variant="outlined"
        density="compact"
        :append-inner-icon="psswdInnerIcon"
        :type="psswdInputType"
        :rules="passwordRules"
        autocomplete="current-password"
        v-model="password"
        @click:append-inner="togglePsswdShow"
        :disabled="updatePasswordLoading"
      ></v-text-field>
      <v-btn
        type="submit"
        color="success"
        class="ml-5 mb-5 text-uppercase"
        variant="plain"
        icon
        :disabled="!valid || updatePasswordLoading"
      >
        <v-icon>mdi-check-circle</v-icon>
      </v-btn>
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
const { loading: updatePasswordLoading, toggleLoading: toggleUpdatePassword } =
  useLoadings();
const { savePassword } = useSession();
const password = ref<string>();
const valid = ref<boolean>(false);

const actualPasswordVal = computed<string>(() =>
  actualPassword.value ? actualPassword.value : ""
);
const handleSubmit = async () => {
  if (!valid.value || actualPasswordVal.value.length === 0) return;

  toggleUpdatePassword();
  await savePassword(password.value!, actualPasswordVal.value);
  actualPassword.value = undefined;
  password.value = undefined;
  toggleUpdatePassword();
};
</script>
