import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.colletro.app',
  appName: 'Colletro',
  webDir: 'capacitor-build',
  // Load site directly so the app opens faster (no local page + redirect).
  // Override with CAPACITOR_DEV_SERVER for local testing, e.g. http://192.168.1.1:3000
  server: process.env.CAPACITOR_DEV_SERVER
    ? {
        url: process.env.CAPACITOR_DEV_SERVER,
        cleartext: process.env.CAPACITOR_DEV_SERVER.startsWith('http://'),
      }
    : { url: 'https://colletro.com' },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // We hide from the web when the page is ready
    },
  },
}

export default config
