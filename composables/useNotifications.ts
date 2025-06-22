// composables/useNotifications.ts
import { computed } from 'vue';
import { useReferrals } from '~/composables/useReferrals';

export const useNotifications = () => {
  const { referrals } = useReferrals();

  const pendingNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return referrals.value
      .filter(r => r.nextFollowUp)
      // ✅ AÑADIMOS ESTE FILTRO para ignorar los ya completados
      .filter(r => r.followUpCompleted !== true) 
      .filter(r => {
        const followUpDate = new Date(r.nextFollowUp!);
        followUpDate.setUTCHours(0, 0, 0, 0);
        return followUpDate <= today;
      })
      .map(r => ({
        id: r.$id,
        text: `Hacer seguimiento a ${r.referralName}`,
        subtitle: `Sponsor: ${r.sponsor}`,
        link: `/perfil-cliente?name=${encodeURIComponent(r.sponsor)}`
      }));
  });

  const notificationCount = computed(() => pendingNotifications.value.length);

  return {
    pendingNotifications,
    notificationCount,
  };
};
