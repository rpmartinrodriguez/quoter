// plugins/auth.client.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  const { fetchCurrentUser } = useAuth();

  // Se ejecuta una sola vez en el lado del cliente cuando la app se inicializa.
  // El 'await' asegura que esperamos a tener una respuesta de Appwrite
  // antes de que el resto de la app (como el middleware) continúe.
  await fetchCurrentUser();
});
