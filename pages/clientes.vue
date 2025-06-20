<template>
  <v-card flat>
    <v-card-title class="d-flex align-center">
      <v-icon start>mdi-account-box-multiple-outline</v-icon>
      Directorio de Clientes
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="openAddDialog" prepend-icon="mdi-plus">
        Añadir Cliente
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-text-field
        v-model="search"
        label="Buscar cliente por nombre..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-4"
      ></v-text-field>

      <v-data-table
        :headers="headers"
        :items="clients"
        :loading="isLoading"
        :search="search"
        item-value="$id"
        hover
        no-data-text="No hay clientes guardados."
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" title="Editar Cliente"></v-btn>
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="openDeleteDialog(item)" title="Eliminar Cliente"></v-btn>
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="addEditDialog" persistent max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Editar' : 'Añadir Nuevo' }} Cliente</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-text-field
              v-model="editedClient.clientName"
              label="Nombre y Apellido*"
              :rules="[v => !!v || 'El nombre es requerido']"
              required
            ></v-text-field>
            <v-text-field
              v-model="editedClient.phone"
              label="Teléfono"
            ></v-text-field>
            <v-text-field
              v-model="editedClient.address"
              label="Dirección"
            ></v-text-field>
            <v-textarea
              v-model="editedClient.notes"
              label="Notas Adicionales"
              rows="3"
            ></v-textarea>
          </v-container>
          <small>*indica campo requerido</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="closeAddEditDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveClient" :disabled="!editedClient.clientName">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" persistent max-width="400">
      <v-card class="text-center pa-4">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h3 class="text-h5 font-weight-bold mb-2">Confirmar Eliminación</h3>
        <p v-if="clientToDelete" class="body-1 text-medium-emphasis">
          ¿Estás seguro de que querés eliminar a <strong>{{ clientToDelete.clientName }}</strong>? Esta acción no se puede deshacer.
        </p>
        <v-card-actions class="d-flex justify-center ga-3 mt-4">
          <v-btn color="grey" variant="tonal" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">Sí, Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useClients, type IClient } from '~/composables/useClients';
import { useSnackbar } from '~/composables/useSnackbar';

const { clients, isLoading, addClient, updateClient, deleteClient, getClients } = useClients();
const { setTitle } = usePageTitle();
const { showSnackbar } = useSnackbar();

// --- ESTADO ---
const search = ref('');
const addEditDialog = ref(false);
const deleteDialog = ref(false);
const editedClient = ref<Partial<IClient>>({});
const clientToDelete = ref<IClient | null>(null);
const isEditing = computed(() => !!editedClient.value.$id);

// --- CONFIGURACIÓN DE LA TABLA ---
const headers = [
  { title: 'Nombre del Cliente', key: 'clientName' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Dirección', key: 'address' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];

// --- MÉTODOS ---
const openAddDialog = () => {
  editedClient.value = { clientName: '', phone: '', address: '', notes: '' };
  addEditDialog.value = true;
};

const openEditDialog = (client: IClient) => {
  editedClient.value = { ...client }; // Clonamos para no editar el original directamente
  addEditDialog.value = true;
};

const closeAddEditDialog = () => {
  addEditDialog.value = false;
  editedClient.value = {};
};

const saveClient = async () => {
  if (!editedClient.value.clientName) return;

  try {
    if (isEditing.value) {
      // Editar cliente existente
      await updateClient(editedClient.value.$id!, editedClient.value);
      showSnackbar({ text: 'Cliente actualizado con éxito.' });
    } else {
      // Añadir nuevo cliente
      await addClient(editedClient.value as Omit<IClient, '$id'>);
      showSnackbar({ text: 'Cliente añadido con éxito.' });
    }
  } catch (error) {
    showSnackbar({ text: 'Error al guardar el cliente.', color: 'error' });
  } finally {
    closeAddEditDialog();
  }
};

const openDeleteDialog = (client: IClient) => {
  clientToDelete.value = client;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!clientToDelete.value) return;
  try {
    await deleteClient(clientToDelete.value.$id);
    showSnackbar({ text: 'Cliente eliminado.' });
  } catch (error) {
    showSnackbar({ text: 'Error al eliminar el cliente.', color: 'error' });
  } finally {
    deleteDialog.value = false;
  }
};

onMounted(() => {
  setTitle('Directorio de Clientes');
  getClients();
});
</script>
