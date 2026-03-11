import { VNPTHIS_FIELD_CONFIG } from '../config/vnpthis-fields';
import { extractFormDataFromDocument } from '../utils/extract-form-data';

export default defineContentScript({
  matches: ['https://yte-binhdinh.vnpthis.vn/*'],
  main(ctx) {
    const wrapper = document.createElement('div');
    wrapper.id = 'vnpthis-qr-button-wrapper';
    Object.assign(wrapper.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '2147483647',
      fontFamily: 'system-ui, sans-serif',
    });

    const btn = document.createElement('button');
    btn.textContent = 'Tạo QR';
    Object.assign(btn.style, {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#fff',
      backgroundColor: '#2563eb',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#1d4ed8';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '#2563eb';
    });

    btn.addEventListener('click', () => {
      if (!ctx.isValid) return;
      const formData = extractFormDataFromDocument(document, VNPTHIS_FIELD_CONFIG);
      browser.runtime.sendMessage({
        action: 'vnpthis-open-sidepanel',
        formData,
      });
    });

    wrapper.appendChild(btn);
    document.body.appendChild(wrapper);
  },
});
