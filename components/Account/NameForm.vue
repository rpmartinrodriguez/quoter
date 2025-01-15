<template>
  <v-form
    validate-on="input lazy"
    v-model="validForm"
    :disabled="updateNameLoading"
    @submit.prevent="handleSubmit"
  >
    <div class="d-flex align-center">
      <v-text-field
        label="Nombre"
        variant="outlined"
        density="compact"
        :rules="nameRules"
        autocomplete="current-email"
        v-model="name"
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
const nameRules = [
  (value: string) => {
    if (!value) return "El nombre es requerido";

    const nameRegex = /^[a-zA-Z ¨´ ]+$/;
    if (!nameRegex.test(value)) return "Nombre inválido";

    return true;
  },
];

const { loading: updateNameLoading, toggleLoading: toggleUpdateName } =
  useLoadings();
const { name: sessionName } = useSession();
const { saveName } = useSession();
const name = ref<string>("");
const validForm = ref<boolean>(false);
const invalid = computed<boolean>(
  () => !validForm.value || name.value === sessionName.value!
);
const handleSubmit = async () => {
  if (invalid.value) return;

  toggleUpdateName();
  await saveName(name.value);
  toggleUpdateName();
};

onMounted(() => {
  name.value = sessionName.value!;
});
</script>
