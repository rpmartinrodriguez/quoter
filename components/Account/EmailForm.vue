<template>
  <v-form
    validate-on="input lazy"
    v-model="validForm"
    :disabled="updateEmailLoading"
    @submit.prevent="handleSubmit"
  >
    <div class="d-flex align-center">
      <v-text-field
        label="Correo"
        variant="outlined"
        density="compact"
        :rules="emailRules"
        autocomplete="current-email"
        v-model="email"
      ></v-text-field>
      <br />
      <v-btn
        type="submit"
        color="success"
        class="ml-5 mb-5 text-uppercase"
        variant="plain"
        icon
        :disabled="invalid"
      >
        <v-icon>mdi-check-circle</v-icon>
      </v-btn>
    </div>
  </v-form>
</template>
<script lang="ts" setup>
const { loading: updateEmailLoading, toggleLoading: toggleUpdateEmail } =
  useLoadings();
const { email: sessionEmail } = useSession();
const { emailRules } = useEmailField();
const { actualPassword } = usePasswordField();
const { saveEmail } = useSession();
const email = ref<string>("");
const validForm = ref<boolean>(false);
const invalid = computed<boolean>(
  () =>
    !validForm.value ||
    actualPasswordVal.value.length === 0 ||
    actualPasswordVal.value.length < 8 ||
    email.value === sessionEmail.value!
);
const actualPasswordVal = computed<string>(() =>
  actualPassword.value ? actualPassword.value : ""
);
const handleSubmit = async () => {
  if (invalid.value) return;

  toggleUpdateEmail();
  await saveEmail(email.value, actualPassword.value!);
  actualPassword.value = undefined;
  toggleUpdateEmail();
};

onMounted(() => {
  email.value = sessionEmail.value!;
});
</script>
