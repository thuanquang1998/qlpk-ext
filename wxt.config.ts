import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage'],
    name: 'QR DTS Extension',
    description: 'Detect HIS data, save patient flow, and reprint QR.',
    icons: {
      '16': '/icon/16.png',
      '32': '/icon/32.png',
      '48': '/icon/48.png',
      '96': '/icon/96.png',
      '128': '/icon/128.png',
    },
    action: {
      default_title: 'QR DTS Extension',
      default_icon: {
        '16': '/icon/16.png',
        '32': '/icon/32.png',
        '48': '/icon/48.png',
        '96': '/icon/96.png',
        '128': '/icon/128.png',
      },
    },
  },
});
