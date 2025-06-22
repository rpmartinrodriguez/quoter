// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth();

  // Si NO hay usuario Y la página a la que se quiere ir NO es /login...
  if (!user.value && to.path !== '/login') {
    // ...lo mandamos a la página de login.
    return navigateTo('/login');
  }

  // Si SÍ hay usuario Y la página a la que quiere ir ES /login...
  if (user.value && to.path === '/login') {
    // ...lo mandamos a la página principal.
    return navigateTo('/');
  }
});
