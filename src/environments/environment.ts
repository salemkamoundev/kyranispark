export const environment = {
  production: false,
  
  // URL de VOTRE serveur Node.js (pas Firebase)
  api: {
    baseUrl: 'http://localhost:3000', 
    endpoints: {
      sendEmail: '/send-email'
    }
  },

  firebase: {
    apiKey: "VOTRE_API_KEY",
    authDomain: "kyranisparck.firebaseapp.com",
    projectId: "kyranisparck",
    storageBucket: "kyranisparck.firebasestorage.app",
    messagingSenderId: "1088401257320",
    appId: "1:1088401257320:web:88b31ad76de2b2b3d89cdd",
    measurementId: "G-QMPCC1G74D"
  },
  
  supabase: {
    url: "https://[project].supabase.co",
    key: "VOTRE_SUPABASE_ANON_KEY",
    bucket: "kyranispark-media"
  }
};
