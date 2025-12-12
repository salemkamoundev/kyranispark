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
    apiKey: "AIzaSyBuvMf5s6xOvsbN44S2-EN8V_lAsr-vEYM",
    authDomain: "kyranisparck.firebaseapp.com",
    databaseURL: "https://kyranisparck-default-rtdb.firebaseio.com",
    projectId: "kyranisparck",
    storageBucket: "kyranisparck.firebasestorage.app",
    messagingSenderId: "1088401257320",
    appId: "1:1088401257320:web:88b31ad76de2b2b3d89cdd",
    measurementId: "G-QMPCC1G74D"
  },
  supabase: {
    url: 'https://qailxxltsofkgtfkgzhv.supabase.co',
    key: "sb_secret_88sjaxofO-GqnWq1Hc4pPQ_lOvRbUBy",
    bucket: "propositionspourkerkennah"
  }
};
