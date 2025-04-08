
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6018703f980f4d6ba20ec1aebec6da7a',
  appName: 'budget-buddy-ai-coach',
  webDir: 'dist',
  server: {
    url: "https://6018703f-980f-4d6b-a20e-c1aebec6da7a.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      keystorePassword: null,
      keystoreAliasPassword: null,
      signingType: null,
    }
  }
};

export default config;
