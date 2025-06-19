export default defineNuxtRouteMiddleware((to, from) => {
  // Usamos nuestro composable para saber si hay un usuario conectado
  const { user } = useAuth();

  // Regla 1: Proteger las páginas internas
  // Si NO hay un usuario conectado Y la página a la que se quiere ir NO es la de /login...
  if (!user.value && to.path !== '/login') {
    // ...lo mandamos a la página de login.
    console.log('Middleware: Acceso denegado. Redirigiendo a /login');
    return navigateTo('/login');
  }

  // Regla 2 (de conveniencia): Evitar que un usuario logueado vea el login de nuevo
  // Si SÍ hay un usuario conectado Y la página a la que quiere ir ES /login...
  if (user.value && to.path === '/login') {
    // ...lo mandamos a la página principal, porque ya no necesita loguearse.
    console.log('Middleware: Usuario ya logueado. Redirigiendo a la página principal /');
    return navigateTo('/');
  }
});
