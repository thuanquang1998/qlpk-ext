/**
 * Cấu hình các field cần đọc từ trang VNPT-HIS (yte-binhdinh.vnpthis.vn).
 * Tham chiếu từ docs/tiepnhan.html – form tiếp nhận bệnh nhân.
 */
export interface FieldConfig {
  /** Tên field (key trong object kết quả) */
  key: string;
  /** Nhãn hiển thị */
  label: string;
  /** CSS selector để tìm element (dùng khi không dùng selectors) */
  selector: string;
  /** Nhiều selector: lấy giá trị từng element rồi ghép bằng ", " (vd: Địa chỉ CV30 = Tỉnh, Huyện, Xã) */
  selectors?: string[];
  /** Cách lấy giá trị: 'value' | 'text' | 'innerText' | 'selectedText' (option đã chọn của select) */
  getValue?: 'value' | 'text' | 'innerText' | 'selectedText';
}

/**
 * Cấu hình field theo đúng element trong trang tiếp nhận (tiepnhan.html).
 * - Họ tên, CMT/CCCD, Số BHYT, Ngày sinh, Tuổi, Số ĐT: input theo id/name.
 * - Địa chỉ (CV30): 3 select matinh_cu_tru, mahuyen_cu_tru, maxa_cu_tru (text option đã chọn).
 * - Địa chỉ: input #diachi.
 */
export const VNPTHIS_FIELD_CONFIG: FieldConfig[] = [
  { key: 'hoten', label: 'Họ tên (*)', selector: '#hoten, input[name="hoten"]', getValue: 'value' },
  { key: 'socmt', label: 'CMT/CCCD', selector: '#socmt, input[name="socmt"]', getValue: 'value' },
  { key: 'namsinh', label: 'Ngày sinh (*)', selector: '#namsinh, input[name="namsinh"]', getValue: 'value' },
  {
    key: 'diachi_cv30',
    label: 'Địa chỉ (CV30) (*)',
    selector: '#matinh_cu_tru',
    selectors: ['#matinh_cu_tru', '#mahuyen_cu_tru', '#maxa_cu_tru'],
    getValue: 'selectedText',
  },
  { key: 'diachi', label: 'Địa chỉ (*)', selector: '#diachi, input[name="diachi"]', getValue: 'value' },
  { key: 'mayte', label: 'Mã y tế', selector: '#mayte, input[name="mayte"]', getValue: 'value' },
  { key: 'sobhyt', label: 'Số BHYT', selector: '#sobhyt, input[name="sobhyt"]', getValue: 'value' },
];

/** URL pattern để content script chỉ chạy trên trang VNPT-HIS */
export const VNPTHIS_URL_PATTERN = 'https://yte-binhdinh.vnpthis.vn/*';

/** Storage key dùng để truyền form data từ content/background sang side panel */
export const VNPTHIS_FORM_DATA_STORAGE_KEY = 'vnpthis-sidepanel-form-data';
