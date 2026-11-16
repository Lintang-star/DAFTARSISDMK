# Dashboard Pendaftaran Akun SISDMK – Kabupaten Bogor

Situs statis (HTML/CSS/JS) untuk GitHub Pages, dengan Google Sheets + Apps Script sebagai penyimpanan data.

## Halaman
`index.html` beranda · `daftar.html` formulir 5 jenis faskes · `pantau.html` pelacakan status · `info.html` info SISDMK · `helpdesk.html` FAQ + form keluhan · `admin.html` panel admin

## 1. Pasang backend (Google Sheets)
1. Buat Google Sheet baru → **Extensions → Apps Script**.
2. Tempel isi `apps-script/Code.gs`. Ganti `ADMIN_TOKEN` dengan token rahasia Anda.
3. **Deploy → New deployment → Web app**. *Execute as:* Me, *Who has access:* Anyone. Salin URL `/exec`.
4. Buka `assets/config.js`, isi `API_URL` dengan URL tersebut.

Sheet `Pengajuan` dan `Helpdesk` dibuat otomatis saat data pertama masuk. Jangan bagikan Sheet ke publik karena berisi data pribadi (NIK, WA).

## 2. Upload ke GitHub
```bash
git init && git add . && git commit -m "SISDMK Kab. Bogor"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```
Di GitHub: **Settings → Pages → Deploy from a branch → main / (root)**. Situs aktif di `https://USERNAME.github.io/REPO/`.

## 3. Alur kerja admin
Buka `admin.html`, masukkan token → **Kelola** pada pengajuan → ubah status (Diterima → Verifikasi → Akun dibuat → SatuSehat → Selesai, atau Perlu perbaikan), isi User ID dan catatan, **Simpan**. Tombol WhatsApp membuat pesan balasan otomatis (akun dibuat, data tidak valid, nama berbeda). Saat status "Akun dibuat" disimpan, estimasi muncul di SatuSehat dihitung 24 jam sesudahnya.

## Catatan
- Tanpa `API_URL`, situs berjalan **mode demo** (data di browser, token admin `demo`).
- User ID dan password hanya dikirim lewat WhatsApp, tidak ditampilkan di halaman publik.
- Nomor kontak dan tautan bisa diubah di `assets/config.js`.
