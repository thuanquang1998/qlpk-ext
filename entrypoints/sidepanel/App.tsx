import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import logoDts from '../../assets/logo_dts.png';
import { VNPTHIS_FORM_DATA_STORAGE_KEY } from '../../config/vnpthis-fields';
import type { ExtractedFormData } from '../../utils/extract-form-data';

type StoredPayload = { formData: ExtractedFormData; tabId?: number } | null;

interface ScannedData {
  hoten: string;
  socmt: string;
  namsinh: string;
  diachi_cv30: string;
  diachi: string;
  mayte: string;
  sobhyt: string;
}

const EMPTY_DATA: ScannedData = {
  hoten: '',
  socmt: '',
  namsinh: '',
  diachi_cv30: '',
  diachi: '',
  mayte: '',
  sobhyt: '',
};

function App() {
  const [clock, setClock] = useState(new Date());
  const [status, setStatus] = useState('Sẵn sàng quét dữ liệu bệnh nhân');
  const [data, setData] = useState<ScannedData>(EMPTY_DATA);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function scanFromStorage() {
    setStatus('Đang quét thông tin bệnh nhân...');
    const raw = await browser.storage.session.get(VNPTHIS_FORM_DATA_STORAGE_KEY);
    const stored = raw[VNPTHIS_FORM_DATA_STORAGE_KEY] as StoredPayload;
    const formData = stored?.formData;

    if (!formData) {
      setStatus('Không có dữ liệu. Hãy bấm "Tạo QR" trên trang tiếp nhận.');
      return;
    }

    setData({
      hoten: formData.hoten || '',
      socmt: formData.socmt || '',
      namsinh: formData.namsinh || '',
      diachi_cv30: formData.diachi_cv30 || '',
      diachi: formData.diachi || '',
      mayte: formData.mayte || '',
      sobhyt: formData.sobhyt || '',
    });
    setStatus('Đã quét và hiển thị thông tin bệnh nhân');
  }

  async function createQr() {
    const text = JSON.stringify(data);
    const hasData = Object.values(data).some((x) => x.trim() !== '');
    if (!hasData) {
      setStatus('Chưa có dữ liệu để tạo QR');
      return;
    }
    const url = await QRCode.toDataURL(text, { width: 220, margin: 1 });
    setQrDataUrl(url);
    setStatus('Đã tạo QR từ thông tin quét');
  }

  function resetAll() {
    setData(EMPTY_DATA);
    setQrDataUrl('');
    setStatus('Đã reset thông tin và QR');
  }

  function printQr() {
    if (!qrDataUrl) {
      setStatus('Chưa có QR để in');
      return;
    }
    const w = window.open('', '_blank', 'width=420,height=520');
    if (!w) return;
    w.document.write(`
      <html>
        <head><title>In QR</title></head>
        <body style="font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px;">
          <h3 style="margin:0;">Phòng khám Đa khoa ĐTS</h3>
          <img src="${qrDataUrl}" alt="qr" style="width:260px;height:260px;" />
          <div style="font-size:14px;">${data.hoten || ''} - ${data.mayte || ''}</div>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  }

  const hh = String(clock.getHours()).padStart(2, '0');
  const mm = String(clock.getMinutes()).padStart(2, '0');
  const ss = String(clock.getSeconds()).padStart(2, '0');
  const date = `${String(clock.getDate()).padStart(2, '0')}/${String(clock.getMonth() + 1).padStart(2, '0')}/${clock.getFullYear()}`;

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <img src={logoDts} alt="DTS logo" className="header-logo" />
          <div>
          <h1>Phòng khám Đa khoa ĐTS</h1>
          <p>Quét thông tin tiếp nhận và tạo QR</p>
          </div>
        </div>
        <div className="clock">
          <div className="clock-time">{`${hh}:${mm}:${ss}`}</div>
          <div className="clock-date">{date}</div>
        </div>
      </header>

      <section className="card">
        <div className="card-title">Trạng thái</div>
        <div className="status">{status}</div>
        <div className="action-row">
          <button className="btn btn-primary" onClick={scanFromStorage}>
            Quét
          </button>
          <button className="btn btn-ghost" onClick={resetAll}>
            Reset
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-title">Thông tin quét được</div>
        <div className="form-grid">
          <label>Họ tên (*)</label><input value={data.hoten} readOnly />
          <label>CMT/CCCD</label><input value={data.socmt} readOnly />
          <label>Ngày sinh (*)</label><input value={data.namsinh} readOnly />
          <label>Địa chỉ (CV30) (*)</label><input value={data.diachi_cv30} readOnly />
          <label>Địa chỉ (*)</label><input value={data.diachi} readOnly />
          <label>Mã y tế</label><input value={data.mayte} readOnly />
          <label>Số BHYT</label><input value={data.sobhyt} readOnly />
        </div>
      </section>

      <section className="card">
        <div className="card-title">QR</div>
        <div className="action-row">
          <button className="btn btn-primary" onClick={() => void createQr()}>
            Tạo QR
          </button>
          <button className="btn btn-ghost" onClick={printQr}>
            In QR
          </button>
        </div>

        {qrDataUrl ? (
          <div className="qr-wrap">
            <img src={qrDataUrl} alt="qr-code" />
          </div>
        ) : (
          <div className="empty">Chưa có QR</div>
        )}
      </section>
    </div>
  );
}

export default App;
