import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nyannote.prototype',
  appName: 'にゃん・ノート',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
