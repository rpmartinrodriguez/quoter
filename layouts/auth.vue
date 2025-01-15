<template>
  <v-app>
    <v-main>
      <v-container fluid class="h-screen w-screen d-flex justify-center">
        <div class="w-100 h-100 d-flex flex-column justify-center">
          <slot />
          <Snackbar />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts" setup></script>
<style>
.form-wrapper {
  width: 500px;
  margin: 0 auto;
}
.gri {
  width: 30px;
}
@media (max-width: 530px) {
  .form-wrapper {
    width: 100%;
  }
}
</style>
