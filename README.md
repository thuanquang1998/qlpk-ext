# PFM Reception Extension

Extension hỗ trợ lễ tân:
- Detect dữ liệu HIS từ trang VNPT-HIS
- Hiển thị thông tin bệnh nhân trên sidepanel UI
- Tạo QR từ thông tin quét được
- Reset thông tin và in QR

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

Phiên bản hiện tại chưa gọi API backend; tập trung vào quét HIS + tạo/in QR.
