<template>
  <v-dialog v-model="props.show" persistent max-width="500">
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="closeExcelDialog"></v-btn>
        <v-toolbar-title>Importar Excel</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <!-- Forms -->

        <!-- Admin Password Form -->
        <div class="py-3">
          <form v-if="form.password">
            <v-text-field
              label="Ingrese contraseña de administrador"
              variant="outlined"
              density="compact"
              autocomplete="“current-password”"
              v-model="password"
              :type="type"
              :append-inner-icon="icon"
              :disabled="loadings.password"
              @click:append-inner="handleIconClick"
            ></v-text-field>

            <!-- Submit Button -->
            <v-btn
              variant="tonal"
              color="info"
              class="w-100"
              :disabled="password.length < 4 || loadings.password"
              @click="handleSubmit"
            >
              VERIFICAR
            </v-btn>
          </form>

          <form v-else>
            <v-file-input
              clearable
              label="Escoger excel"
              variant="outlined"
              density="compact"
              @change="handleFileChange"
              @click:clear="files = null"
            ></v-file-input>
            <v-btn
              variant="tonal"
              color="info"
              class="w-100"
              :disabled="noFile || loadings.excel || success"
              @click="saveXls"
            >
              CARGAR
            </v-btn>
          </form>
        </div>

        <!-- Error Status Messages -->
        <div class="py-5" v-if="errorMessage.length > 0">
          <v-alert type="warning" variant="outlined" class="text-center">
            {{ errorMessage }}
          </v-alert>
        </div>

        <!-- File upload success -->
        <div class="py-5" v-if="success">
          <v-alert type="success" variant="outlined" class="text-center">
            Excel cargado exitosamente!
          </v-alert>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
interface Sources {
  password: boolean;
  excel: boolean;
}
const props = defineProps<{
  show: boolean;
}>();
const emits = defineEmits(["finish", "reload"]);

const loadings = reactive<Sources>({
  password: false,
  excel: false,
});
const form = reactive<Sources>({
  password: true,
  excel: false,
});

const errorMessage = ref<string>("");
const password = ref<string>("");
const type = ref<string>("password");
const icon = computed<string>(() =>
  type.value === "password" ? "mdi-eye-off" : "mdi-eye"
);

const handleIconClick = () =>
  (type.value = type.value === "password" ? "text" : "password");

const { checkPassword } = useActionPasswords();
const handleSubmit = async () => {
  loadings.password = true;
  errorMessage.value = "";

  const res = await checkPassword("uploads", password.value);

  if (res === 404) {
    errorMessage.value = "Contraseña incorrecta";
  } else form.password = false;
  loadings.password = false;
};

const files = ref<FileList | null>(null);
const noFile = computed<boolean>(() => !files.value);
const success = ref<boolean>(false);

const handleFileChange = (e: Event) => {
  files.value = (e.target as HTMLInputElement).files;
};

const saveXls = async () => {
  loadings.excel = true;
  const fd = new FormData();
  if (files.value) {
    Array.from(files.value).forEach((file) => {
      fd.append("file", file);
    });
  }

  try {
  const res = await $fetch("/api/update-products", {
    method: "POST",
    body: fd,
  });

  // Si backend devuelve success: true
  if (res && res.success) {
    success.value = true;
    errorMessage.value = "";
    alert("✅ ¡Archivo Excel cargado exitosamente!");
    getProducts();
  } else {
    errorMessage.value = "❌ Error al procesar el archivo Excel.";
  }

  files.value = null;
} catch (error: any) {
  console.error("Error al subir archivo:", error);
  if (error.statusMessage === "Error in loop") {
    errorMessage.value = "⚠️ Excel con diferente estructura de data";
  } else {
    errorMessage.value = "❌ Error inesperado al subir archivo.";
  }
}

  loadings.excel = false;
};

const { getProducts } = useProducts();
const closeExcelDialog = () => {
  if (loadings.password || loadings.excel) return;

  loadings.password = false;
  loadings.excel = false;
  form.password = true;
  form.excel = false;
  errorMessage.value = "";
  password.value = "";
  type.value = "password";
  files.value = null;
  if (success.value) {
    emits("reload");
  }
  success.value = false;
  emits("finish");
};
</script>
