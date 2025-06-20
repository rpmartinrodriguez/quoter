<template>
  <v-dialog :model-value="show" @update:model-value="close" persistent max-width="600">
    <v-card>
      <v-card-title>
        <span class="text-h5">Editar Referido</span>
      </v-card-title>
      <v-card-text>
        <v-container v-if="editableReferral">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editableReferral.referralName"
                label="Nombre y Apellido*"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editableReferral.phone"
                label="Teléfono"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editableReferral.occupation"
                label="Ocupación"
                variant="outlined"
              ></v-text-field>
            </v-col>
             <v-col cols="12" md="6">
              <v-text-field
                v-model.number="editableReferral.peopleCount"
                label="Cantidad de Personas"
                type="number"
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
          :disabled="!editableReferral?.referralName"
        >
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { IReferral } from '~/composables/useReferrals';

const props = defineProps<{
  show: boolean;
  referral: IReferral | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', updatedData: Partial<IReferral>): void;
}>();

const editableReferral = ref<Partial<IReferral> | null>(null);

watch(() => props.referral, (newReferral) => {
  if (newReferral) {
    editableReferral.value = { ...newReferral };
  } else {
    editableReferral.value = null;
  }
}, { immediate: true, deep: true });

const close = () => emit('close');

const save = () => {
  if (editableReferral.value) {
    // Extraemos solo los campos que permitimos editar en este formulario
    const dataToUpdate = {
      referralName: editableReferral.value.referralName,
      phone: editableReferral.value.phone,
      occupation: editableReferral.value.occupation,
      peopleCount: editableReferral.value.peopleCount,
    };
    emit('save', dataToUpdate);
  }
};
</script>
