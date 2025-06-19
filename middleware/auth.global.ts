export default defineNuxtRouteMiddleware((to, from) => {
  // Usamos nuestro composable para saber si hay un usuario conectado
  const { user } = useAuth();

  // Condición 1: Si el usuario NO está conectado Y la página a la que quiere ir NO es la de login...
  if (!user.value && to.path !== '/login') {
    // ...lo redirigimos forzosamente a la página de login.
    // Este console.log te ayudará a ver en la consola del navegador que el guardia está funcionando.
    console.log('MIDDLEWARE: Usuario no logueado. Redirigiendo a /login...');
    return navigateTo('/login');
  }

  // Condición 2 (Opcional pero recomendada): Si el usuario YA está conectado e intenta ir a /login de nuevo...
  if (user.value && to.path === '/login') {
    // ...lo redirigimos a la página principal para que no vea el login otra vez.
    console.log('MIDDLEWARE: Usuario ya logueado. Redirigiendo a la página principal...');
    return navigateTo('/');
  }
});
