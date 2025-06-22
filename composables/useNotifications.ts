// composables/useNotifications.ts
import { computed } from 'vue';
import { useReferrals } from '~/composables/useReferrals';

export const useNotifications = () => {
  // Usamos el gestor de referidos para obtener la lista
  const { referrals } = useReferrals();

  // Esta es la lógica principal. Es una propiedad computada que se recalcula
  // automáticamente si la lista de referidos cambia.
  const pendingNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecemos la hora a medianoche para comparar solo fechas

    return referrals.value
      // 1. Filtramos solo los referidos que tienen una fecha de seguimiento
      .filter(r => r.nextFollowUp)
      // 2. Filtramos los que están vencidos o son para hoy
      .filter(r => {
        const followUpDate = new Date(r.nextFollowUp!);
        followUpDate.setUTCHours(0, 0, 0, 0);
        return followUpDate <= today;
      })
      // 3. Los convertimos en un objeto de notificación fácil de usar
      .map(r => ({
        id: r.$id,
        text: `Hacer seguimiento a ${r.referralName}`,
        subtitle: `Sponsor: ${r.sponsor}`,
        // Creamos el enlace para navegar al perfil del sponsor
        link: `/perfil-cliente?name=${encodeURIComponent(r.sponsor)}`
      }));
  });

  const notificationCount = computed(() => pendingNotifications.value.length);

  return {
    pendingNotifications,
    notificationCount,
  };
};
