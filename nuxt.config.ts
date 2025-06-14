export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  // El build ahora es manejado por el módulo de Vuetify
  build: {
    transpile: ["vuetify"],
  },
  
  // Se usa el módulo oficial de Vuetify
  modules: [
    '@nuxtjs/vuetify',
  ],
  vuetify: {
    useVuetifyLabs: true, 
    // La configuración detallada de colores y estilos ahora vive en nuestro plugin
    // para mantener este archivo más limpio.
  },

  // Cargamos nuestro archivo de estilos globales para toda la app
  css: ['~/assets/css/main.css'],
  
  // La configuración de runtimeConfig se mantiene como la corregimos
  runtimeConfig: {
    // Clave secreta, solo accesible en el servidor
    projectApiKey: process.env.PROJECT_API_KEY,

    // Claves públicas, seguras para el navegador
    public: {
      endpoint: process.env.ENDPOINT,
      project: process.env.PROJECT,
      database: process.env.DATABASE,
      cProducts: process.env.C_PRODUCTS,
      cDeposits: process.env.C_DEPOSITS,
      cQuotes: process.env.C_QUOTES,
      cActionPasswords: process.env.C_ACTION_PASSWORDS,
      cRecords: process.env.C_RECORDS,
    },
  },

  // Se mantiene el bloque para importar la tipografía "Inter"
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap', rel: 'stylesheet' }
      ]
    }
  },

  ssr: false,
});
