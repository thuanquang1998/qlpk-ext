import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage'],
    name: 'PFM Reception Extension',
    description: 'Detect HIS data, save patient flow, and reprint QR.',
    action: {
      default_title: 'PFM Reception Active',
    },
  },
});
