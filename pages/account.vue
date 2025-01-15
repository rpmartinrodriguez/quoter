<template>
  <!-- Sponsor data -->
  <v-row>
    <v-col>
      <v-card>
        <template v-slot:title>
          <div class="w-100 px-1">Datos de patrocinador</div>
        </template>
        <v-card-text>
          <v-row>
            <!-- Name -->
            <v-col cols="12" sm="6">
              <v-text-field
                label="Nombre"
                variant="outlined"
                density="compact"
                readonly
                :model-value="sponsorName"
              ></v-text-field>
            </v-col>

            <!-- Code -->
            <v-col cols="12" sm="6">
              <v-text-field
                label="Código"
                variant="outlined"
                density="compact"
                readonly
                :model-value="sponsorCode"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Account data -->
  <v-row>
    <v-col>
      <v-card>
        <template v-slot:title>
          <div class="w-100 px-1">Datos de la cuenta</div>
        </template>
        <v-card-text>
          <v-row>
            <!-- Update info -->
            <v-col cols="12" sm="7" md="6">
              <v-alert
                border="end"
                color="info"
                variant="tonal"
                type="info"
                density="compact"
              >
                <b>
                  Para poder cambiar el valor de las configuraciones de su
                  cuenta debe ingresar su contraseña actual.
                </b>
              </v-alert>
            </v-col>

            <!-- Actual password -->
            <v-col cols="12" sm="5" md="6">
              <AccountPasswordForm />
            </v-col>
          </v-row>

          <v-row>
            <!-- Email form -->
            <v-col cols="12" sm="6"><AccountEmailForm /></v-col>

            <!-- Password form -->
            <v-col cols="12" sm="6"><AccountUpdatePasswordForm /></v-col>
          </v-row>

          <v-row>
            <!-- Name form -->
            <v-col cols="12" sm="6"><AccountNameForm /></v-col>

            <!-- Sponsor code form -->
            <v-col cols="12" sm="6"
              ><AccountSponsorCodeForm :code="myCode.toString()"
            /></v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: ["app"],
});
const sponsorName = ref<string>("");
const sponsorCode = ref<string>("");
const myCode = ref<string>("");
const { mdId, getMetaData } = useMetaData();
const md: any = await getMetaData();
if (md.result === "success") {
  mdId.value = md.id;
  sponsorName.value = md.sponsor.name;
  sponsorCode.value = md.sponsor.code;
  myCode.value = md.my_code;
}
</script>
