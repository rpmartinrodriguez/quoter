// composables/usePerformance.ts
import { computed } from 'vue';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useReferrals } from '~/composables/useReferrals';

export const usePerformance = () => {
  const { savedRecords } = useSavedQuotes();
  const { referrals } = useReferrals();

  // --- MÉTRICA 1: Tasa de Cierre por Demo ---
  const demoToSaleRate = computed(() => {
    const demoReferrals = referrals.value.filter(r => r.status === 'Demo');
    const totalDemos = demoReferrals.length;
    if (totalDemos === 0) return 0;

    const clientsWhoBought = new Set(savedRecords.value.filter(r => r.type === 'VENTA').map(r => r.clientName.toLowerCase().trim()));
    const successfulDemos = demoReferrals.filter(r => clientsWhoBought.has(r.referralName.toLowerCase().trim())).length;
    
    return Math.round((successfulDemos / totalDemos) * 100);
  });

  // --- MÉTRICA 2: Tasa de Cumplimiento de Tareas ---
  const followUpCompletionRate = computed(() => {
    // Tareas son los referidos que tienen una fecha de seguimiento asignada
    const tasksWithDueDate = referrals.value.filter(r => r.nextFollowUp);
    if (tasksWithDueDate.length === 0) return 100; // Si no hay tareas, el cumplimiento es 100%

    const completedTasks = tasksWithDueDate.filter(r => r.followUpCompleted === true).length;
    
    return Math.round((completedTasks / tasksWithDueDate.length) * 100);
  });
  
  // --- MÉTRICA 3: Tasa de Conversión General (Venta / (Venta+Cotización)) ---
  const overallConversionRate = computed(() => {
    const sales = savedRecords.value.filter(r => r.type === 'VENTA').length;
    const quotes = savedRecords.value.filter(r => r.type === 'COTIZACIÓN').length;
    const total = sales + quotes;
    if (total === 0) return 0;
    return Math.round((sales / total) * 100);
  });

  // --- PONDERACIÓN Y PUNTAJE FINAL ---
  // Le damos un peso a cada métrica. La más importante es la tasa de cierre.
  const globalPerformanceScore = computed(() => {
    const score = 
      (demoToSaleRate.value * 0.5) +          // El cierre de demos vale el 50%
      (followUpCompletionRate.value * 0.25) + // El cumplimiento de tareas vale el 25%
      (overallConversionRate.value * 0.25);   // La conversión general vale el 25%
    return Math.round(score);
  });

  // --- LÓGICA DE COLOR Y TEXTO ---
  const performanceIndicator = computed(() => {
    const score = globalPerformanceScore.value;
    if (score < 30) {
      return { color: 'error', text: 'A Mejorar' };
    }
    if (score >= 30 && score < 66) {
      return { color: 'warning', text: 'Regular' };
    }
    return { color: 'success', text: 'Excelente' };
  });

  // Función para obtener el color de una métrica individual
  const getMetricColor = (score: number) => {
    if (score < 30) return 'error';
    if (score >= 30 && score < 66) return 'warning';
    return 'success';
  }

  return {
    globalPerformanceScore,
    performanceIndicator,
    metrics: {
      demoToSaleRate,
      followUpCompletionRate,
      overallConversionRate,
    },
    getMetricColor,
  };
};
