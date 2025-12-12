export const environment = {
  production: true,
  
  app: {
    name: 'Kyranis Park',
    version: '1.0.0',
    adminEmail: 'admin@gmail.com',
    currency: 'TND',
    contactPhone: '+216 28 417 822',
    socials: {
      facebook: 'https://facebook.com/kyranispark',
      instagram: 'https://instagram.com/kyranispark'
    }
  },

  api: {
    baseUrl: 'https://api.kyranispark.tn',
    endpoints: {
      sendEmail: '/send-email',
      processPayment: '/process-payment'
    }
  },

  firebase: {
    apiKey: "AIzaSyBuvMf5s6xOvsbN44S2-EN8V_lAsr-vEYM",
    authDomain: "kyranisparck.firebaseapp.com",
    projectId: "kyranisparck",
    storageBucket: "kyranisparck.firebasestorage.app",
    messagingSenderId: "1088401257320",
    appId: "1:1088401257320:web:88b31ad76de2b2b3d89cdd",
    measurementId: "G-QMPCC1G74D"
  },

  supabase: {
    url: "https://[project].supabase.co",
    key: "sb_publishable_8_tG9l4XOlF4WbHAPo-gAg__mixJCel",
    bucket: "kyranispark-media"
  },

  googleMaps: {
    apiKey: "", 
    defaultCenter: { lat: 34.7406, lng: 11.2333 }
  }
};
