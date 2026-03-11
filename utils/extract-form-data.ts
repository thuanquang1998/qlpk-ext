import type { FieldConfig } from '../config/vnpthis-fields';

export type ExtractedFormData = Record<string, string>;

/**
 * Đọc giá trị từ một element theo kiểu getValue.
 * selectedText: với <select> lấy text của option đang chọn (bỏ option "Chọn tỉnh/huyện/xã" nếu value="0").
 */
function getElementValue(el: Element, getValue: FieldConfig['getValue'] = 'value'): string {
  if (getValue === 'selectedText') {
    const select = el as HTMLSelectElement;
    const opt = select?.options?.[select.selectedIndex];
    if (!opt) return '';
    const text = opt.textContent?.trim() ?? '';
    const val = (opt as HTMLOptionElement).value?.trim();
    if (val === '0' && /Chọn\s*(tỉnh|huyện|xa)/i.test(text)) return '';
    return text;
  }
  if (getValue === 'text' || getValue === 'innerText') {
    return (el as HTMLElement)[getValue]?.trim() ?? '';
  }
  const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  return input?.value?.trim() ?? '';
}

/**
 * Trích xuất dữ liệu form từ document theo config (CSS selectors).
 * - Nếu config có selectors: query lần lượt từng selector, lấy giá trị rồi ghép bằng ", ".
 * - Nếu chỉ có selector: thử từng phần (cách nhau dấu phẩy), lấy element đầu tiên tìm được.
 */
export function extractFormDataFromDocument(
  doc: Document,
  fieldConfigs: FieldConfig[]
): ExtractedFormData {
  const result: ExtractedFormData = {};
  for (const config of fieldConfigs) {
    const getVal = config.getValue ?? 'value';

    if (config.selectors?.length) {
      const parts = config.selectors
        .map((sel) => {
          const el = doc.querySelector(sel.trim());
          return el ? getElementValue(el, getVal) : '';
        })
        .filter((s) => s.length > 0);
      result[config.key] = parts.join(', ');
      continue;
    }

    const selectors = config.selector.split(',').map((s) => s.trim());
    let value = '';
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el) {
        value = getElementValue(el, getVal);
        break;
      }
    }
    result[config.key] = value;
  }
  return result;
}
