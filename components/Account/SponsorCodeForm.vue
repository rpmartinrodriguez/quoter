<template>
  <v-form
    validate-on="input lazy"
    v-model="validForm"
    :disabled="sponsorCodeLoading"
    @submit.prevent="handleSubmit"
  >
    <div class="d-flex align-center">
      <v-text-field
        label="Código de Sponsor"
        variant="outlined"
        density="compact"
        :rules="sponsorCodeRules"
        autocomplete="current-email"
        v-model="sponsorCode"
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
const { code } = defineProps<{
  code: string;
}>();

const sponsorCodeRules = [
  (value: string) => {
    if (!value) return "El código de sponsor es requerido";

    const sponsorCodeRegex = /^\d+$/;
    if (!sponsorCodeRegex.test(value)) return "Código de sponsor inválido";

    return true;
  },
];

const { loading: sponsorCodeLoading, toggleLoading: toggleSponsorCode } =
  useLoadings();
const { saveSponsorCode } = useSession();
const sponsorCode = ref<string>("");
const validForm = ref<boolean>(false);
const invalid = computed<boolean>(
  () => !validForm.value || sponsorCode.value === code
);
const { mdId } = useMetaData();
const handleSubmit = async () => {
  if (invalid.value) return;

  toggleSponsorCode();
  await saveSponsorCode(sponsorCode.value, mdId.value);
  toggleSponsorCode();
};

onMounted(() => {
  sponsorCode.value = code;
});
</script>
