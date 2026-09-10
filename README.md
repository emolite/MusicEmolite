## Desktop Application (Tauri)

Run the desktop application in development mode:

```bash
npx tauri dev
```

Build the desktop application:

```bash
npx tauri build
```

The generated installers can be found in:

```text
src-tauri/target/release/bundle
```

## Mobile Application (Capacitor)

Build the Angular application:

```bash
ng build
```

Sync web assets with native projects:

```bash
npx cap sync
```

Open the Android project:

```bash
npx cap open android
```

Open the iOS project:

```bash
npx cap open ios
```

Lệnh này sẽ tự động mở **Xcode**. Từ đó bạn có thể:
- Chọn thiết bị giả lập hoặc thiết bị thật, nhấn ▶️ **Run**
- Vào menu **Product > Archive** để build và đẩy lên App Store

---

## 🛠️ Các lệnh thường dùng

| Lệnh | Mục đích |
|---|---|
| `npm install` | Cài đặt toàn bộ thư viện của dự án |
| `npm start` / `ng serve` | Chạy web app ở chế độ development |
| `ng build` | Build web app cho production |
| `npx tauri dev` | Chạy desktop app ở chế độ development |
| `npx tauri build` | Build file cài đặt desktop app |
| `npx cap sync` | Đồng bộ code web vào Android/iOS |
| `npx cap open android` | Mở project Android bằng Android Studio |
| `npx cap open ios` | Mở project iOS bằng Xcode |

---

## 🐞 Xử lý lỗi thường gặp

<details>
<summary><b>❌ Lỗi: Không chạy được lệnh (npm/ng) trong Terminal của VS Code (PowerShell báo lỗi đỏ)</b></summary>

Đây là lỗi rất hay gặp trên **Windows**, do PowerShell **chặn chạy script** theo mặc định. Thường sẽ thấy dòng lỗi kiểu:

```
... cannot be loaded because running scripts is disabled on this system ...
```

**Cách khắc phục:**

1. Mở **PowerShell với quyền Administrator** (nhấn phím Windows → gõ "PowerShell" → chuột phải chọn **"Run as administrator"**)
2. Gõ lệnh sau rồi nhấn **Enter**:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. Khi được hỏi xác nhận, gõ `Y` rồi nhấn **Enter**
4. **Đóng và mở lại VS Code** (hoặc mở lại Terminal trong VS Code)
5. Thử chạy lại `npm start` hoặc `ng serve` — lúc này sẽ chạy bình thường

> 💡 Lệnh trên chỉ cho phép chạy các script đã được ký (hoặc script bạn tự tạo trên máy), an toàn hơn so với việc tắt hoàn toàn bảo mật bằng `Unrestricted`.
</details>

<details>
<summary><b>❌ Lỗi: "ng: command not found"</b></summary>

Bạn chưa cài Angular CLI toàn cục. Chạy lệnh:

```bash
npm install -g @angular/cli
```
</details>

<details>
<summary><b>❌ Lỗi: "cargo: command not found" khi chạy tauri dev</b></summary>

Bạn chưa cài Rust — bắt buộc phải có để build Tauri. Cài tại: https://www.rust-lang.org/tools/install, sau đó khởi động lại terminal.
</details>

<details>
<summary><b>❌ Lỗi khi npx cap open android không mở được</b></summary>

Kiểm tra lại:
- Đã cài **Android Studio** chưa
- Biến môi trường `ANDROID_HOME` / `ANDROID_SDK_ROOT` đã được thiết lập chưa
</details>

<details>
<summary><b>❌ Cổng 4200 đã bị chiếm dụng</b></summary>

Chạy ở cổng khác bằng lệnh:

```bash
ng serve --port 4300
```
</details>

---

## 📁 Cấu trúc thư mục

```
├── src/                    # Source code Angular
├── src-tauri/              # Cấu hình & source code Tauri (desktop)
│   └── target/release/bundle/   # Nơi chứa file cài đặt sau khi build
├── android/                # Project native Android (Capacitor)
├── ios/                    # Project native iOS (Capacitor)
├── dist/                   # Kết quả build web (sau khi chạy `ng build`)
├── angular.json
├── package.json
└── README.md
```

---

<div align="center">

Made with Emolite❤️

</div>
