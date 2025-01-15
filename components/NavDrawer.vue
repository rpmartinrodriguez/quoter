<template>
  <v-navigation-drawer v-model="drawer">
    <template v-slot:prepend>
      <v-list-item
        lines="two"
        prepend-avatar="@/assets/img/user-circle.svg"
        :title="name"
        :subtitle="role"
      >
        <template v-slot:append>
          <v-btn icon variant="plain" @click="toggleTheme">
            <v-tooltip activator="parent" location="end">{{
              themeTooltipBtn
            }}</v-tooltip>
            <v-icon>{{ themeIcon }}</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </template>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-for="module in options"
        :key="module.name.toLowerCase().replaceAll(' ', '-')"
        :prepend-icon="module.icon"
        :title="module.name"
        :to="module.url"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn block prepend-icon="mdi-logout" @click="handleLogout">
          Cerrar Sesión
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>
<script lang="ts" setup>
import { useTheme } from "vuetify";

const theme = useTheme();
const activeTheme = computed<string>(() => theme.global.name.value);
const themeIcon = computed<string>(() =>
  activeTheme.value === "light"
    ? "mdi-moon-waxing-crescent"
    : "mdi-white-balance-sunny"
);
const themeTooltipBtn = computed<string>(() =>
  activeTheme.value === "light"
    ? "Cambiar a tema oscuro"
    : "Cambiar a tema claro"
);

const { name, role, logout, updateTheme } = useSession();
const toggleTheme = async () => {
  theme.global.name.value = activeTheme.value === "light" ? "dark" : "light";
  localStorage.setItem("theme", theme.global.name.value);
  await updateTheme(theme.global.name.value);
};

const { drawer, options } = useNavDrawer();
const { deposits } = useDeposit();
const { quotes } = useQuote();

const handleLogout = async () => {
  deposits.value = [];
  quotes.value = [];
  await logout();
};
</script>
