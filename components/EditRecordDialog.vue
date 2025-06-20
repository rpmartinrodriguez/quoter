// components/EditRecordDialog.vue
<template>
  <v-dialog :model-value="show" @update:model-value="close" persistent max-width="600">
    <v-card>
      <v-card-title>
        <span class="text-h5">Editar Registro</span>
      </v-card-title>
      <v-card-text>
        <v-container v-if="editableRecord">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editableRecord.clientName"
                label="Nombre y Apellido*"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editableRecord.clientAddress"
                label="Dirección"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editableRecord.clientPhone"
                label="Celular"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <small>*indica campo requerido</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text @click="close">Cancelar</v-btn>
        <v-btn 
          color="primary" 
          variant="flat" 
          @click="save" 
          :disabled="!editableRecord?.clientName"
        >
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { ISavedRecord } from '~/composables/useSavedQuotes';

const props = defineProps<{
  show: boolean;
  record: ISavedRecord | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', updatedRecord: Partial<ISavedRecord>): void;
}>();

const editableRecord = ref<Partial<ISavedRecord> | null>(null);

// Cuando la prop 'record' cambia, clonamos el objeto para editarlo de forma segura
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    editableRecord.value = { ...newRecord };
  } else {
    editableRecord.value = null;
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const save = () => {
  if (editableRecord.value) {
    // Extraemos solo los campos que queremos actualizar
    const dataToUpdate = {
      clientName: editableRecord.value.clientName,
      clientAddress: editableRecord.value.clientAddress,
      clientPhone: editableRecord.value.clientPhone,
    };
    emit('save', dataToUpdate);
  }
};
</script>
