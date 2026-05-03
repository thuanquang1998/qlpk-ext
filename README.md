# PFM Reception Extension

Extension hỗ trợ lễ tân:
- Detect dữ liệu HIS từ trang VNPT-HIS
- Hiển thị và chỉnh sửa nhanh trên sidepanel UI
- Gọi API backend `POST /api/v1/patients` để lưu lượt khám
- Search bệnh nhân đã thêm và xuất lại QR

## Cấu hình

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

Để save API thành công, cần cập nhật `token` trong `pfm-extension-settings` (token lấy từ backend `/api/auth/login`).
