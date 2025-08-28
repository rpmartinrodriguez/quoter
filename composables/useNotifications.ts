import { computed } from 'vue';
import { useReferrals, type IReferral } from '~/composables/useReferrals';
import { useSavedQuotes, type ISavedRecord } from '~/composables/useSavedQuotes';
import { useGoals } from '~/composables/useGoals'; // Se importa el gestor de objetivos

export const useNotifications = () => {
  const { referrals } = useReferrals();
  const { savedRecords } = useSavedQuotes();
  const { goals } = useGoals(); // Se obtienen los objetivos

  const calculatePaymentEndDate = (record: ISavedRecord): Date | null => {
    if (record.type !== 'VENTA' || !record.installmentsInfo) return null;
    try {
      const installmentsMatch = record.installmentsInfo.match(/(\d+)/);
      if (!installmentsMatch) return null;
      const numberOfInstallments = parseInt(installmentsMatch[0], 10);
      const startDate = new Date(record.quoteDate);
      return new Date(startDate.setMonth(startDate.getMonth() + numberOfInstallments));
    } catch {
      return null;
    }
  };

  const pendingFollowUpNotifications = computed(() => {
    const todayString = new Date().toISOString().slice(0, 10);
    return referrals.value
      .filter(r => r.nextFollowUp && r.followUpCompleted !== true)
      .filter(r => {
        const followUpString = r.nextFollowUp!.slice(0, 10);
        return followUpString <= todayString;
      })
      .map(r => ({
        id: `ref-${r.$id}`,
        date: new Date(r.nextFollowUp!),
        text: `Hacer seguimiento a ${r.referralName}`,
        subtitle: `Sponsor: ${r.sponsor}`,
        link: `/perfil-cliente?name=${encodeURIComponent(r.sponsor)}`,
        icon: 'mdi-phone-forward'
      }));
  });

  const pendingResaleNotifications = computed(() => {
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    const fifteenDaysFromNowString = fifteenDaysFromNow.toISOString().slice(0, 10);

    return savedRecords.value
      .filter(r => r.type === 'VENTA')
      .map(r => ({ ...r, paymentEndDate: calculatePaymentEndDate(r) }))
      .filter(r => r.paymentEndDate !== null)
      .filter(r => {
        const endDateString = r.paymentEndDate!.toISOString().slice(0, 10);
        return endDateString <= fifteenDaysFromNowString;
      })
      .map(r => ({
        id: `sale-${r.$id}`,
        date: r.paymentEndDate!,
        text: `Oportunidad de Reventa: ${r.clientName}`,
        subtitle: `Finaliza su pago aprox. el ${r.paymentEndDate!.toLocaleDateString('es-AR')}`,
        link: `/perfil-cliente?name=${encodeURIComponent(r.clientName)}`,
        icon: 'mdi-star-circle-outline'
      }));
  });

  // ✅ Se añade una nueva computada para las notificaciones de OKR
  const okrCheckinNotification = computed(() => {
    const now = new Date();
    const activeGoal = goals.value.find(g => new Date(g.startDate) <= now && new Date(g.endDate) >= now);

    if (activeGoal) {
      return [{
        id: `okr-${activeGoal.$id}`,
        date: new Date(), // Se muestra siempre
        text: 'Revisión de tu Objetivo Actual',
        subtitle: `"${activeGoal.objective}". ¡Revisá tu progreso!`,
        link: `/proyeccion`,
        icon: 'mdi-flag-checkered'
      }];
    }
    return [];
  });

  const allNotifications = computed(() => {
    const combined = [
      ...pendingFollowUpNotifications.value,
      ...pendingResaleNotifications.value,
      ...okrCheckinNotification.value, // ✅ Se añade la nueva notificación a la lista
    ];
    return combined.sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  const notificationCount = computed(() => allNotifications.value.length);

  return {
    allNotifications,
    notificationCount,
  };
};
