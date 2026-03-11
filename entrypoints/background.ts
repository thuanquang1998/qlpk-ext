import { VNPTHIS_FORM_DATA_STORAGE_KEY } from '../config/vnpthis-fields';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Mở side panel khi user bấm "Tạo QR" trên trang VNPT-HIS; lưu form data vào session.
  browser.runtime.onMessage.addListener(
    (
      message: { action: string; formData?: Record<string, string> },
      sender: { tab?: { id: number } }
    ) => {
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
