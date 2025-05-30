<template>
  <v-dialog v-model="props.show" persistent max-width="500">
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="closeExcelDialog" />
        <v-toolbar-title>Importar Excel</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <div class="py-3">
          <!-- Formulario de contraseña -->
          <form v-if="form.password">
            <v-text-field
              label="Ingrese contraseña de administrador"
              variant="outlined"
              density="compact"
              autocomplete="current-password"
              v-model="password"
              :type="type"
              :append-inner-icon="icon"
              :disabled="loadings.password"
              @click:append-inner="handleIconClick"
            />
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

          <!-- Formulario de carga de Excel -->
          <form v-else>
            <v-file-input
              clearable
              label="Escoger Excel"
              variant="outlined"
              density="compact"
              @change="handleFileChange"
              @click:clear="files = null"
            />
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

        <!-- Mensajes -->
        <div class="py-5" v-if="errorMessage">
          <v-alert type="warning" variant="outlined" class="text-center">
            {{ errorMessage }}
          </v-alert>
        </div>
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

const props = defineProps<{ show: boolean }>();
const emits = defineEmits(["finish", "reload"]);

const loadings = reactive<Sources>({ password: false, excel: false });
const form = reactive<Sources>({ password: true, excel: false });

const errorMessage = ref("");
const password = ref("");
const type = ref<"password" | "text">("password");
const icon = computed(() => (type.value === "password" ? "mdi-eye-off" : "mdi-eye"));
const handleIconClick = () => (type.value = type.value === "password" ? "text" : "password");

const files = ref<FileList | null>(null);
const noFile = computed(() => !files.value);
const success = ref(false);

const { checkPassword } = useActionPasswords();
const { getProducts } = useProducts();

// ✅ Validación de contraseña
const handleSubmit = async () => {
  loadings.password = true;
  errorMessage.value = "";

  const res = await checkPassword("uploads", password.value);
  loadings.password = false;

  if (res === 404) {
    errorMessage.value = "Contraseña incorrecta";
  } else {
    form.password = false;
  }
};

// ✅ Manejo del input de archivo
const handleFileChange = (e: Event) => {
  files.value = (e.target as HTMLInputElement).files;
};

// ✅ Subida del Excel y cierre del diálogo
const saveXls = async () => {
  if (!files.value || files.value.length === 0) return;

  loadings.excel = true;
  errorMessage.value = "";

  const fd = new FormData();
  Array.from(files.value).forEach((file) => fd.append("file", file));

  try {
    const res = await $fetch("/api/update-products", {
      method: "POST",
      body: fd,
    });

    if (res?.success) {
      success.value = true;
      await getProducts(); // 🔄 actualiza productos

      setTimeout(() => {
        emits("reload");
        emits("finish");
        resetForm();
      }, 1500);
    } else {
      errorMessage.value = "⚠️ El servidor respondió sin éxito.";
    }
  } catch (error: any) {
    console.error("🛑 Error real del backend:", error);
    errorMessage.value = `❌ Error inesperado: ${error?.statusMessage || error?.message || 'Sin mensaje'}`;
  } finally {
    loadings.excel = false;
    files.value = null;
  }
};

// ✅ Cierre manual del modal
const closeExcelDialog = () => {
  if (loadings.password || loadings.excel) return;
  emits("finish");
  resetForm();
};

// ✅ Limpieza completa
const resetForm = () => {
  loadings.password = false;
  loadings.excel = false;
  form.password = true;
  form.excel = false;
  password.value = "";
  type.value = "password";
  files.value = null;
  success.value = false;
  errorMessage.value = "";
};
</script>
