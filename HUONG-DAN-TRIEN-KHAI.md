# Triển khai Bảo tàng 3D lên sabandangvuhiep.vercel.app

Gói này dùng cho kho GitHub `ducluongtk0309-hue/bao-tang-so-dang-vu-hiep` (nhánh `main`), đang nối với Vercel.

## Các file trong gói

| File | Việc |
|---|---|
| `index.html` | Bảo tàng 3D mới, trở thành trang chính |
| `phong-tranh.html` | Trang cũ (thư viện ảnh, video sa bàn, câu đố), thêm nút “Về Bảo tàng 3D” |
| `assets/museum/img/*.webp` | 39 ảnh tư liệu đã nén cho web (~4 MB) |
| `api/thuyet-minh.js` | Hàm máy chủ cho nút “AI thuyết minh” |
| `vercel.json` | Bộ nhớ đệm cho ảnh và nhạc |

Trang mới dùng lại `assets/nhac-nen-mua-do.mp3` và `assets/media/SaBan_IaDrang_1080p.mp4` đã có sẵn trong kho, không cần tải lại.

## Các bước

1. Giải nén gói vào thư mục gốc của kho (ghi đè `index.html`).
2. Đẩy lên GitHub:
   ```bash
   git add index.html phong-tranh.html assets/museum api vercel.json HUONG-DAN-TRIEN-KHAI.md
   git commit -m "Bảo tàng 3D sáu không gian; trang cũ chuyển thành Phòng tranh tư liệu"
   git push origin main
   ```
3. Vercel tự triển khai sau khi đẩy. Mở https://sabandangvuhiep.vercel.app/ để kiểm tra.
4. Bật AI thuyết minh: Vercel → Project → Settings → Environment Variables, thêm
   - `ANTHROPIC_API_KEY` = khóa API của bạn (bắt buộc)
   - `ALLOWED_ORIGIN` = `https://sabandangvuhiep.vercel.app` (nên có, để trang khác không gọi ké)
   - `ANTHROPIC_MODEL` (tùy chọn) nếu muốn đổi model
   Sau đó bấm Redeploy. Khi chưa có khóa, nút AI vẫn chạy nhưng đọc nguyên văn dữ kiện của bảo tàng.

## Những chỗ cần điền sau

- **Kênh quyên góp Hội VAVA**: trong `index.html`, tìm `"vavaUrl":""` và điền đường link chính thức đã được Hội xác nhận. Nút ủng hộ chỉ hiện khi có link.
- **Phim “Hành trình cam”**: tải phim lên `assets/media/`, rồi điền đường dẫn vào `"agentFilm":""`. Màn chiếu ở Không gian 5 sẽ phát phim.
- **Ghi âm nhân chứng**: điền đường dẫn tệp âm thanh vào trường `audio` của từng địa điểm trong mảng `LOCS`.
- **Mô hình quét 3D vũ khí**: điền đường dẫn `.glb` vào `ASSETS` (ak, b40, mortar, dshk).
