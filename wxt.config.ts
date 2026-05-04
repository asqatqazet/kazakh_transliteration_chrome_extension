import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDesc__',
    default_locale: 'en_US',
    minimum_chrome_version: '102',
    permissions: ['activeTab', 'scripting', 'contextMenus', 'storage'],
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    icons: {
      16: 'images/kazakh_16.png',
      32: 'images/kazakh_32.png',
      48: 'images/kazakh_48.png',
      128: 'images/kazakh_128.png',
    },
    action: {
      default_icon: {
        16: 'images/kazakh_16.png',
        32: 'images/kazakh_32.png',
        48: 'images/kazakh_48.png',
        128: 'images/kazakh_128.png',
      },
    },
  },
});
