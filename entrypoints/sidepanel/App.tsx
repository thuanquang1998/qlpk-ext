import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { VNPTHIS_FORM_DATA_STORAGE_KEY } from '../../config/vnpthis-fields';
import {
  DEFAULT_PFM_SETTINGS,
  PFM_SAVED_PATIENTS_STORAGE_KEY,
  PFM_SETTINGS_STORAGE_KEY,
  type PfmSettings,
  type SavedPatient,
} from '../../config/pfm-settings';
import type { ExtractedFormData } from '../../utils/extract-form-data';

type StoredPayload = { formData: ExtractedFormData; tabId?: number } | null;

interface PatientForm {
  full_name: string;
  his_id: string;
  dob: string;
  address: string;
}

const EMPTY_FORM: PatientForm = {
  full_name: '',
  his_id: '',
  dob: '',
  address: '',
};

function App() {
  const [clock, setClock] = useState(new Date());
  const [settings, setSettings] = useState<PfmSettings>(DEFAULT_PFM_SETTINGS);
  const [form, setForm] = useState<PatientForm>(EMPTY_FORM);
  const [statusText, setStatusText] = useState('Sẵn sàng quét HIS');
  const [isBusy, setIsBusy] = useState(false);
  const [savedPatients, setSavedPatients] = useState<SavedPatient[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<SavedPatient | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadSavedPatients();
  }, []);

  async function loadSettings() {
    const raw = await browser.storage.local.get(PFM_SETTINGS_STORAGE_KEY);
    const fromStore = raw[PFM_SETTINGS_STORAGE_KEY] as Partial<PfmSettings> | undefined;
    const merged = { ...DEFAULT_PFM_SETTINGS, ...(fromStore || {}) };
    setSettings(merged);
    await browser.storage.local.set({ [PFM_SETTINGS_STORAGE_KEY]: merged });
  }

  async function loadSavedPatients() {
    const raw = await browser.storage.local.get(PFM_SAVED_PATIENTS_STORAGE_KEY);
    const items = (raw[PFM_SAVED_PATIENTS_STORAGE_KEY] || []) as SavedPatient[];
    setSavedPatients(items);
  }

  async function handleScanFromHis() {
    setIsBusy(true);
    setStatusText('Đang đọc dữ liệu HIS...');
    const raw = await browser.storage.session.get(VNPTHIS_FORM_DATA_STORAGE_KEY);
    const stored = raw[VNPTHIS_FORM_DATA_STORAGE_KEY] as StoredPayload;
    const data = stored?.formData;

    if (!data) {
      setStatusText('Chưa có dữ liệu HIS. Hãy bấm "Tạo QR" trên trang HIS trước.');
      setIsBusy(false);
      return;
    }

    const mapped: PatientForm = {
      full_name: data.hoten || '',
      his_id: data.socmt || data.sobhyt || `HIS-${Date.now()}`,
      dob: data.namsinh || '',
      address: data.diachi || data.diachi_cv30 || '',
    };
    setForm(mapped);
    setStatusText(`Đã quét: ${mapped.full_name || 'Không rõ tên'} · ${mapped.his_id}`);
    setIsBusy(false);
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setSelected(null);
    setQrDataUrl('');
    setStatusText('Đã reset thông tin');
  }

  async function handleSaveToApi() {
    if (!settings.token) {
      setStatusText('Thiếu token. Cập nhật token trong storage local key pfm-extension-settings.');
      return;
    }
    if (!form.full_name || !form.his_id || !form.dob) {
      setStatusText('Thiếu dữ liệu bắt buộc: Họ tên, Mã HIS, Năm sinh.');
      return;
    }

    setIsBusy(true);
    setStatusText('Đang lưu bệnh nhân lên hệ thống...');
    try {
      const res = await fetch(`${settings.apiBaseUrl}/api/v1/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.token}`,
        },
        body: JSON.stringify({
          his_id: form.his_id,
          full_name: form.full_name,
          dob: form.dob,
          address: form.address,
          is_priority: false,
          is_online_booking: false,
          room_id: settings.roomId,
        }),
      });

      const json = (await res.json()) as {
        ok?: boolean;
        patient_id?: string;
        queue_id?: string;
        queue_number?: number;
      };

      if (!res.ok || !json.patient_id || !json.queue_id || json.queue_number === undefined) {
        throw new Error('save_failed');
      }

      const newItem: SavedPatient = {
        patient_id: json.patient_id,
        queue_id: json.queue_id,
        queue_number: json.queue_number,
        his_id: form.his_id,
        full_name: form.full_name,
        dob: form.dob,
        address: form.address,
        room_id: settings.roomId,
        created_at: new Date().toISOString(),
      };

      const next = [newItem, ...savedPatients.filter((x) => x.patient_id !== newItem.patient_id)];
      setSavedPatients(next);
      await browser.storage.local.set({ [PFM_SAVED_PATIENTS_STORAGE_KEY]: next });
      setSelected(newItem);
      await generateQrByPatientId(newItem.patient_id);
      setStatusText(`Đã lưu thành công. STT: ${newItem.queue_number}`);
    } catch {
      setStatusText('Lưu thất bại. Kiểm tra API baseUrl/token/room_id.');
    } finally {
      setIsBusy(false);
    }
  }

  async function generateQrByPatientId(patientId: string) {
    if (!settings.token) return;
    try {
      const res = await fetch(`${settings.apiBaseUrl}/api/v1/patients/${patientId}/qr`, {
        headers: { Authorization: `Bearer ${settings.token}` },
      });
      const json = (await res.json()) as { qr_base64?: string };
      if (!res.ok || !json.qr_base64) throw new Error();
      setQrDataUrl(json.qr_base64);
    } catch {
      const fallback = `pfm://checkin/${patientId}`;
      const url = await QRCode.toDataURL(fallback, { width: 180, margin: 1 });
      setQrDataUrl(url);
    }
  }

  const filtered = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return savedPatients;
    return savedPatients.filter(
      (p) => p.his_id.toLowerCase().includes(keyword) || p.full_name.toLowerCase().includes(keyword)
    );
  }, [searchText, savedPatients]);

  async function onSelectPatient(item: SavedPatient) {
    setSelected(item);
    setForm({
      full_name: item.full_name,
      his_id: item.his_id,
      dob: item.dob,
      address: item.address,
    });
    await generateQrByPatientId(item.patient_id);
    setStatusText(`Đã chọn ${item.full_name} để xuất lại QR`);
  }

  const hh = String(clock.getHours()).padStart(2, '0');
  const mm = String(clock.getMinutes()).padStart(2, '0');
  const ss = String(clock.getSeconds()).padStart(2, '0');
  const dateString = `${String(clock.getDate()).padStart(2, '0')}/${String(clock.getMonth() + 1).padStart(2, '0')}/${clock.getFullYear()}`;

  return (
    <div className="layout">
      <header className="header">
        <div>
          <h1>{settings.clinicTitle}</h1>
          <p>Tiếp nhận HIS · Save API · Reprint QR</p>
        </div>
        <div className="clock">
          <div className="clock-time">{`${hh}:${mm}:${ss}`}</div>
          <div className="clock-date">{dateString}</div>
        </div>
      </header>

      <section className="card">
        <div className="card-title">Detect dữ liệu HIS</div>
        <div className="status">{statusText}</div>
        <div className="action-row">
          <button className="btn btn-primary" onClick={handleScanFromHis} disabled={isBusy}>
            Quét HIS
          </button>
          <button className="btn btn-ghost" onClick={handleReset} disabled={isBusy}>
            Reset
          </button>
        </div>

        <div className="form-grid">
          <label>Họ tên</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
          />

          <label>Mã HIS</label>
          <input
            className="mono"
            value={form.his_id}
            onChange={(e) => setForm((s) => ({ ...s, his_id: e.target.value }))}
          />

          <label>Năm sinh</label>
          <input
            className="mono"
            value={form.dob}
            onChange={(e) => setForm((s) => ({ ...s, dob: e.target.value }))}
          />

          <label>Địa chỉ</label>
          <input
            value={form.address}
            onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
          />
        </div>

        <button className="btn btn-save" onClick={handleSaveToApi} disabled={isBusy}>
          Save bệnh nhân (POST /v1/patients)
        </button>
      </section>

      <section className="card">
        <div className="card-title">Search bệnh nhân đã thêm</div>
        <input
          placeholder="Tìm theo mã HIS hoặc họ tên..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="list">
          {filtered.length === 0 ? (
            <div className="empty">Chưa có dữ liệu bệnh nhân đã lưu.</div>
          ) : (
            filtered.slice(0, 8).map((item) => (
              <button key={item.patient_id} className="list-item" onClick={() => void onSelectPatient(item)}>
                <strong>{item.full_name}</strong>
                <span>{`${item.his_id} · STT ${item.queue_number}`}</span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-title">Xuất lại QR</div>
        {selected ? (
          <div className="selected-meta">{`${selected.full_name} · ${selected.his_id}`}</div>
        ) : (
          <div className="empty">Chọn bệnh nhân từ Search để xuất lại QR.</div>
        )}

        {qrDataUrl ? (
          <div className="qr-wrap">
            <img src={qrDataUrl} alt="qr-code" />
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default App;
