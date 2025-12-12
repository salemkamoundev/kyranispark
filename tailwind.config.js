/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // Configuration des Polices
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Remplace la font par défaut par Poppins
        display: ['Inter', 'sans-serif'], // Pour les gros titres si besoin
      },
      // Configuration des Couleurs
      colors: {
        // Couleurs Principales demandées
        primary: {
          DEFAULT: '#008B8B', // DarkCyan (Couleur Mer Profonde)
          light: '#20B2AA',   // LightSeaGreen
          dark: '#006666',
        },
        secondary: {
          DEFAULT: '#FF6B6B', // Accent (Coral Red doux)
          light: '#FF8E8E',
          dark: '#E04F4F',
        },
        // Fonds
        dark: '#1F2937',  // Gray-800
        light: '#F9FAFB', // Gray-50
        
        // Custom Kerkennah Theme Colors
        kerkennah: {
          turquoise: '#40E0D0', // Eau cristalline
          sand: '#E6D2B5',      // Sable chaud
          coral: '#FF7F50',     // Corail vif
          palm: '#4A7c59',      // Vert palmier
          sea: '#006994'        // Bleu grand large
        }
      },
      // Animations personnalisées (optionnel)
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
