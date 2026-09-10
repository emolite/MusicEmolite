<div align="center">

# 🎵 MusicEmolite

**Ứng dụng đa nền tảng được xây dựng bằng Angular — chạy trên Web, Desktop (Tauri) và Mobile (Capacitor)**

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Chạy ứng dụng Web (Development)](#-chạy-ứng-dụng-web-development)
- [Build ứng dụng Web (Production)](#-build-ứng-dụng-web-production)
- [Ứng dụng Desktop (Tauri)](#-ứng-dụng-desktop-tauri)
- [Ứng dụng Mobile (Capacitor)](#-ứng-dụng-mobile-capacitor)
- [Các lệnh thường dùng](#-các-lệnh-thường-dùng)
- [Xử lý lỗi thường gặp](#-xử-lý-lỗi-thường-gặp)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

---

## 📖 Giới thiệu

Đây là dự án được xây dựng trên nền tảng **Angular**, cho phép đóng gói thành:

- 🌐 **Web app** — chạy trực tiếp trên trình duyệt
- 🖥️ **Desktop app** — dùng [Tauri](https://tauri.app/) (Windows, macOS, Linux)
- 📱 **Mobile app** — dùng [Capacitor](https://capacitorjs.com/) (Android, iOS)

Chỉ với **một codebase Angular duy nhất**, bạn có thể build ra ứng dụng chạy trên hầu hết mọi nền tảng.

---

## ⚙️ Yêu cầu hệ thống

Trước khi bắt đầu, hãy chắc chắn máy bạn đã cài đặt các công cụ sau:

| Công cụ | Phiên bản khuyến nghị | Kiểm tra bằng lệnh |
|---|---|---|
| **Node.js** | >= 18.x (LTS) | `node -v` |
| **npm** | >= 9.x (đi kèm Node.js) | `npm -v` |
| **Angular CLI** | >= 17.x | `ng version` |
| **Rust** (chỉ cần cho Tauri) | bản mới nhất | `rustc --version` |
| **Git** | bất kỳ | `git --version` |

> 💡 **Ghi chú:**
> - Nếu chưa có Node.js, tải tại: https://nodejs.org/
> - Nếu chưa có Angular CLI, cài bằng lệnh: `npm install -g @angular/cli`
> - Nếu muốn build app **Desktop (Tauri)**, cần cài thêm Rust: https://www.rust-lang.org/tools/install
> - Nếu muốn build app **Mobile (Capacitor)**:
>   - Android → cần cài **Android Studio**
>   - iOS → cần máy **macOS** + **Xcode**

---

## 📥 Cài đặt

### Bước 1 — Clone (hoặc tải) dự án về máy

```bash
git clone https://github.com/ANM-EMOLITE/MusicEmolite.git
```

Sau khi clone xong, bạn sẽ thấy một thư mục tên **`MusicEmolite`** được tạo ra. Hãy mở thư mục đó lên:

1. Vào thư mục **`MusicEmolite`** vừa được tải về
2. Click vào **thanh địa chỉ (URL)** trên cùng của cửa sổ File Explorer/Finder
3. Gõ `code .` rồi nhấn **Enter**

> 💡 Lệnh `code .` sẽ mở toàn bộ thư mục dự án bằng **VS Code** ngay tại vị trí hiện tại — cách này nhanh hơn nhiều so với việc mở VS Code rồi tìm và chọn thư mục thủ công.
>
> ⚠️ Nếu gõ `code .` mà không có tác dụng, nghĩa là VS Code chưa được thêm vào PATH. Cách khắc phục: mở VS Code → nhấn `Ctrl+Shift+P` → gõ **"Shell Command: Install 'code' command in PATH"** → chọn nó → khởi động lại terminal/File Explorer.

### Bước 2 — Cài đặt các gói phụ thuộc (dependencies)

```bash
npm install
```

Lệnh này sẽ đọc file `package.json` và tự động tải toàn bộ thư viện cần thiết cho dự án (bao gồm Angular, Tauri CLI, Capacitor...).

> ⏳ Lần cài đầu tiên có thể mất vài phút tùy vào tốc độ mạng.

---

## 💻 Chạy ứng dụng Web (Development)

Sau khi cài xong dependencies, bạn có thể chạy thử ứng dụng ngay trên trình duyệt bằng 1 trong 2 lệnh sau (tương đương nhau):

```bash
npm start
```

hoặc

```bash
ng serve
```

Sau khi chạy, mở trình duyệt và truy cập:

```
http://localhost:4200
```

✅ Ứng dụng sẽ tự động **reload lại** mỗi khi bạn lưu thay đổi trong code (hot reload).

---

## 📦 Build ứng dụng Web (Production)

Khi muốn build bản chính thức để deploy lên hosting/server:

```bash
ng build
```

File build sẽ nằm trong thư mục:

```
dist/
```

---

## 🖥️ Ứng dụng Desktop (Tauri)

### Chạy ở chế độ Development (có hot reload)

```bash
npx tauri dev
```

Lệnh này sẽ mở lên một cửa sổ ứng dụng desktop, dữ liệu lấy từ Angular dev server, hỗ trợ hot reload y như chạy web.

### Build ứng dụng Desktop (tạo file cài đặt .exe/.dmg/.deb...)

```bash
npx tauri build
```

Sau khi build xong, file cài đặt (installer) sẽ nằm ở:

```
src-tauri/target/release/bundle
```

Tùy hệ điều hành đang build mà bạn sẽ thấy:
- **Windows** → file `.exe` hoặc `.msi`
- **macOS** → file `.dmg` hoặc `.app`
- **Linux** → file `.deb`, `.AppImage`, hoặc `.rpm`

> ⚠️ **Lưu ý:** Ứng dụng chỉ build được ra định dạng cài đặt tương ứng với hệ điều hành bạn đang chạy lệnh build (ví dụ: build trên Windows sẽ ra `.exe`, không thể ra `.dmg` cho macOS).

---

## 📱 Ứng dụng Mobile (Capacitor)

### Bước 1 — Build phần web của Angular trước

```bash
ng build
```

### Bước 2 — Đồng bộ code web vào project native (Android/iOS)

```bash
npx cap sync
```

Lệnh này sẽ copy toàn bộ code đã build từ thư mục `dist/` vào project Android và iOS, đồng thời cập nhật các plugin native cần thiết.

> 💡 Mỗi khi bạn sửa code Angular và muốn cập nhật vào app mobile, hãy chạy lại **cả 2 lệnh trên** (`ng build` rồi `npx cap sync`).

### Bước 3a — Mở project Android

```bash
npx cap open android
```

Lệnh này sẽ tự động mở **Android Studio**. Từ đó bạn có thể:
- Nhấn nút ▶️ **Run** để chạy thử trên máy ảo (emulator) hoặc điện thoại thật
- Vào menu **Build > Generate Signed Bundle/APK** để build file `.apk`/`.aab`

### Bước 3b — Mở project iOS (chỉ dùng được trên macOS)

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

## 📁 Cấu trúc thư mục (rút gọn)

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

Made with ❤️ using Angular

</div>
