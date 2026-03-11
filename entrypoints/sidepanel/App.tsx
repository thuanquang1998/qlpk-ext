import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { VNPTHIS_FIELD_CONFIG, VNPTHIS_FORM_DATA_STORAGE_KEY } from '../../config/vnpthis-fields';
import type { ExtractedFormData } from '../../utils/extract-form-data';

type StoredPayload = { formData: ExtractedFormData; tabId?: number } | null;

const labelByKey = Object.fromEntries(VNPTHIS_FIELD_CONFIG.map((f) => [f.key, f.label]));

function App() {
  const [formData, setFormData] = useState<ExtractedFormData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    void browser.storage.session.get(VNPTHIS_FORM_DATA_STORAGE_KEY).then((raw) => {
      const stored = raw[VNPTHIS_FORM_DATA_STORAGE_KEY] as StoredPayload;
      if (stored?.formData) setFormData(stored.formData);
    });
  }, []);

  const handleCreateQR = () => {
    if (!formData) return;
    const text = JSON.stringify(formData, null, 0);
    QRCode.toDataURL(text, { width: 280, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  };

  const entries = formData ? Object.entries(formData) : [];

  return (
    <>
      <h1>Dữ liệu form (VNPT-HIS)</h1>

      <div className="section">
        <div className="section-title">Các field đã đọc từ trang tiếp nhận</div>
        {entries.length === 0 ? (
          <p className="empty">Chưa có dữ liệu. Hãy bấm &quot;Tạo QR&quot; trên trang bệnh nhân trước.</p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="field-row">
              <span className="field-key">{labelByKey[key] ?? key}:</span>
              <span className="field-value">{value || '—'}</span>
            </div>
          ))
        )}
      </div>

      <div className="section qr-section">
        <button type="button" className="btn" onClick={handleCreateQR} disabled={entries.length === 0}>
          Tạo QR từ dữ liệu
        </button>
        {qrDataUrl && (
          <p style={{ marginTop: 12 }}>
            <img src={qrDataUrl} alt="QR code" />
          </p>
        )}
      </div>
    </>
  );
}

export default App;
