import { VNPTHIS_FORM_DATA_STORAGE_KEY } from '../config/vnpthis-fields';
import { DEFAULT_PFM_SETTINGS, PFM_SETTINGS_STORAGE_KEY } from '../config/pfm-settings';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  void browser.storage.local.get(PFM_SETTINGS_STORAGE_KEY).then((raw) => {
    const current = raw[PFM_SETTINGS_STORAGE_KEY] as Record<string, string> | undefined;
    if (!current) {
      void browser.storage.local.set({ [PFM_SETTINGS_STORAGE_KEY]: DEFAULT_PFM_SETTINGS });
    }
  });

  // Mở side panel khi user bấm "Tạo QR" trên trang VNPT-HIS; lưu form data vào session.
  browser.runtime.onMessage.addListener(
    (message: { action: string; formData?: Record<string, string> }, sender) => {
      if (message.action !== 'vnpthis-open-sidepanel' || !sender.tab?.id) return;

      const tabId = sender.tab.id;
      const formData = message.formData ?? {};

      void browser.storage.session.set({
        [VNPTHIS_FORM_DATA_STORAGE_KEY]: { formData, tabId },
      });

      void browser.sidePanel.open({ tabId });
    }
  );
});
