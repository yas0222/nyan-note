import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nyannote.prototype',
  appName: 'にゃん・ノート',
  webDir: '.',
  server: {
    androidScheme: 'https'
  }
};

export default config;
