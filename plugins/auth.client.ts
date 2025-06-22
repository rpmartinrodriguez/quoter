// plugins/auth.client.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  const { fetchCurrentUser } = useAuth();
  // Esto se ejecuta al arrancar la app y verifica si ya hay una sesión
  // antes de que cualquier otra cosa intente acceder a las páginas.
  await fetchCurrentUser();
});
