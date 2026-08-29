import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sahara.wellbeing',
  appName: 'SAHARA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#01575E',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#01575E',
    },
  },
};

export default config;
