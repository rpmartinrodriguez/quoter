import { computed } from 'vue';
import { useReferrals, type IReferral } from '~/composables/useReferrals';
// ✅ 1. Importamos el gestor de ventas y su tipo
import { useSavedQuotes, type ISavedRecord } from '~/composables/useSavedQuotes';

export const useNotifications = () => {
  // Obtenemos los datos de ambas fuentes
  const { referrals } = useReferrals();
  const { savedRecords } = useSavedQuotes();

  // ✅ 2. Lógica para calcular la fecha de finalización
  const calculatePaymentEndDate = (record: ISavedRecord): Date | null => {
    if (record.type !== 'VENTA' || !record.installmentsInfo) return null;
    try {
      const installmentsMatch = record.installmentsInfo.match(/(\d+)/);
      if (!installmentsMatch) return null;
      const numberOfInstallments = parseInt(installmentsMatch[0], 10);
      const startDate = new Date(record.quoteDate);
      // Asumimos que la primera cuota es aprox. al mes siguiente
      return new Date(startDate.setMonth(startDate.getMonth() + numberOfInstallments));
    } catch {
      return null;
    }
  };

  // ✅ 3. Computada específica para las notificaciones de SEGUIMIENTO DE REFERIDOS
  const pendingFollowUpNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return referrals.value
      .filter(r => r.nextFollowUp && r.followUpCompleted !== true)
      .filter(r => {
        const followUpDate = new Date(r.nextFollowUp!);
        followUpDate.setUTCHours(0, 0, 0, 0);
        return followUpDate <= today;
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

  // ✅ 4. Computada específica para las notificaciones de OPORTUNIDAD DE REVENTA
  const pendingResaleNotifications = computed(() => {
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15); // Límite de 15 días a futuro

    return savedRecords.value
      .filter(r => r.type === 'VENTA')
      .map(r => ({ ...r, paymentEndDate: calculatePaymentEndDate(r) }))
      .filter(r => r.paymentEndDate !== null)
      // Notificar si la fecha de finalización es pasada o dentro de los próximos 15 días
      .filter(r => r.paymentEndDate! <= fifteenDaysFromNow)
      .map(r => ({
        id: `sale-${r.$id}`,
        date: r.paymentEndDate!,
        text: `Oportunidad de Reventa: ${r.clientName}`,
        subtitle: `Finaliza su pago aprox. en ${r.paymentEndDate!.toLocaleDateString('es-AR')}`,
        link: `/perfil-cliente?name=${encodeURIComponent(r.clientName)}`,
        icon: 'mdi-star-circle-outline'
      }));
  });

  // ✅ 5. Unimos ambas listas en una sola y la ordenamos por fecha
  const allNotifications = computed(() => {
    const combined = [
      ...pendingFollowUpNotifications.value,
      ...pendingResaleNotifications.value,
    ];
    // Ordenamos por fecha, de la más antigua a la más nueva
    return combined.sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  const notificationCount = computed(() => allNotifications.value.length);

  return {
    allNotifications, // Exportamos la lista unificada
    notificationCount,
  };
};
