# PFM Reception Extension

Extension hỗ trợ lễ tân ở VNPT-HIS.
Tai lieu chuan ve flow va rang buoc:

- [PFM Technical Specification](/Users/thuanluuquang/Documents/pfm-dts/docs/OVERVIEW.md)

## Current scope

- Detect du lieu tu trang tiep nhan VNPT-HIS.
- Hien thi thong tin benh nhan tren sidepanel UI.
- Tao QR tu form da quet.
- Reset thong tin va in QR.
- Ghi payload tam vao session storage, khong persist PII vao localStorage.

## Current limitation

- Chua goi backend `POST /api/v1/patients`.
- QR hien tai la payload JSON co `QR_DTS: true`, khong phai QR business URI backend scan.
- Chi hoat dong trong context reception da whitelist.

## Configuration

Storage key:
- `pfm-extension-settings`

Giá trị mặc định:
```json
{
  "apiBaseUrl": "http://localhost:3000",
  "token": "",
  "roomId": "room_x_quang",
  "clinicTitle": "Phòng khám PFM"
}
```
