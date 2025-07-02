// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth();
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }
  if (user.value && to.path === '/login') {
    return navigateTo('/');
  }
});
