# คู่มือเชื่อม GitHub → Vercel → Supabase (Deploy อัตโนมัติทุกครั้งที่ push)

เป้าหมาย: หลังตั้งค่าเสร็จ ทุกครั้งที่แก้โค้ดแล้ว `git push` ขึ้น GitHub, Vercel จะ build และ deploy เวอร์ชันใหม่ให้เว็บ/แอพอัตโนมัติ โดยเชื่อมกับฐานข้อมูล Supabase ที่ตั้งไว้แล้ว (โปรเจ็กต์ `150hrs-2026`)

สิ่งที่ต้องมีก่อนเริ่ม: บัญชี GitHub, บัญชี Vercel (สมัครฟรีด้วยการ login ผ่าน GitHub ได้เลย), Node.js ติดตั้งในเครื่อง, ไฟล์ zip โค้ดแอพที่ได้รับ (`150hrs-mobile-app.zip`)

---

## ขั้นที่ 1 — เตรียมโค้ดในเครื่อง

1. แตกไฟล์ `150hrs-mobile-app.zip` ไปยังโฟลเดอร์ที่ต้องการ เช่น `~/projects/150hrs-app`
2. เปิด Terminal (Mac/Linux) หรือ PowerShell (Windows) แล้วเข้าไปในโฟลเดอร์นั้น:
   ```
   cd ~/projects/150hrs-app
   ```
3. ทดสอบว่าไฟล์ครบและรันได้ (ไม่บังคับ แต่แนะนำ):
   ```
   npm install
   npm run dev
   ```
   เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` ควรเห็นหน้า login ของแอพ ถ้าเห็นแปลว่าโค้ดพร้อมแล้ว กด Ctrl+C เพื่อหยุดเซิร์ฟเวอร์ทดสอบ

---

## ขั้นที่ 2 — สร้าง repository บน GitHub

1. ไปที่ [github.com](https://github.com) → คลิก **+** มุมขวาบน → **New repository**
2. ตั้งชื่อ เช่น `150hrs-mobile`
3. เลือก **Private** (แนะนำ เพราะเป็นระบบภายในคณะ) หรือ Public ก็ได้
4. **ห้ามติ๊ก** "Add a README file" — ปล่อย repo ว่างเปล่า เพราะเรามีโค้ดอยู่แล้ว
5. กด **Create repository**

หน้าที่ขึ้นมาจะมีคำสั่ง git ให้คัดลอก ให้ใช้ชุดคำสั่งด้านล่างแทน (เขียนไว้ให้ครบแล้ว)

---

## ขั้นที่ 3 — อัปโค้ดขึ้น GitHub

กลับไปที่ Terminal ในโฟลเดอร์โปรเจ็กต์ รันทีละบรรทัด:

```
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/<ชื่อบัญชีของคุณ>/150hrs-mobile.git
git push -u origin main
```

แทน `<ชื่อบัญชีของคุณ>` ด้วย GitHub username จริง (ดูได้จาก URL ของ repo ที่เพิ่งสร้าง)

**ถ้าเจอ error "Author identity unknown"** ให้รันก่อน แล้วค่อยรันชุดคำสั่งข้างบนใหม่:
```
git config --global user.email "อีเมลของคุณ"
git config --global user.name "ชื่อของคุณ"
```

**ถ้าเจอ error "remote origin already exists"** ให้รัน `git remote remove origin` ก่อนแล้วค่อยรัน `git remote add origin ...` ใหม่

**ถ้า push แล้วขึ้นให้ login** ปกติจะเปิดเบราว์เซอร์ให้ authorize อัตโนมัติ ถ้าไม่เปิด ให้ใช้ [GitHub CLI](https://cli.github.com) (`gh auth login`) หรือสร้าง Personal Access Token ตาม GitHub แนะนำ

หลัง push สำเร็จ รีเฟรชหน้า GitHub repo จะเห็นไฟล์ทั้งหมดขึ้นอยู่บนนั้น

---

## ขั้นที่ 4 — เชื่อม Vercel กับ repo

1. ไปที่ [vercel.com](https://vercel.com) → login (เลือก **Continue with GitHub** จะสะดวกสุด เพราะเชื่อมสิทธิ์อ่าน repo ให้อัตโนมัติ)
2. หน้า Dashboard → **Add New...** → **Project**
3. ในรายการ "Import Git Repository" หา `150hrs-mobile` — ถ้าไม่เห็น ให้กด **Adjust GitHub App Permissions** แล้วอนุญาตให้ Vercel เข้าถึง repo นี้
4. กด **Import**
5. หน้าตั้งค่า Vercel จะตรวจพบว่าเป็นโปรเจ็กต์ **Next.js** อัตโนมัติ — ไม่ต้องแก้ Build Command / Output Directory ปล่อยเป็นค่า default

**ก่อนกด Deploy ให้เพิ่ม Environment Variables ตรงนี้เลย** (กดขยายส่วน "Environment Variables"):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oefjzzexjzdnqaqiwzrv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_5jTOSXeV1BfbqvIm426PMw_EDVuw6ec` |

(โค้ดมีค่า fallback ฝังไว้อยู่แล้วถ้าลืมใส่ตรงนี้แอพก็ยังทำงานได้ แต่การตั้งผ่าน Environment Variables เป็นวิธีที่ถูกต้องกว่า และจำเป็นถ้าในอนาคตอยากเปลี่ยนไปใช้โปรเจ็กต์ Supabase อื่น)

6. กด **Deploy** — รอประมาณ 1-2 นาที
7. เสร็จแล้วจะได้ลิงก์แบบ `https://150hrs-mobile-xxxx.vercel.app` — กดเข้าไปทดสอบ ควรเห็นหน้า login ของแอพ

---

## ขั้นที่ 5 — ทดสอบระบบ deploy อัตโนมัติ

1. กลับไปแก้ไฟล์อะไรก็ได้เล็กน้อยในเครื่อง เช่น เปลี่ยนข้อความในไฟล์
2. รัน:
   ```
   git add .
   git commit -m "test auto deploy"
   git push
   ```
3. กลับไปที่ Vercel Dashboard → เข้าโปรเจ็กต์ → แท็บ **Deployments** จะเห็น deployment ใหม่กำลัง build เอง (ไม่ต้องสั่งอะไรเพิ่ม)
4. รอ build เสร็จ (ขึ้นสถานะ Ready) แล้วลิงก์เดิมจะอัปเดตเป็นเวอร์ชันล่าสุดทันที

จากนี้ทุกครั้งที่ `git push` ขึ้น branch `main`, Vercel จะ deploy ให้อัตโนมัติเสมอ — ไม่ต้องรันคำสั่ง `vercel` ด้วยมืออีก

---

## ขั้นที่ 6 (ไม่บังคับ) — ตั้ง custom domain

ถ้าอยากได้ลิงก์ที่จำง่ายกว่า `xxxx.vercel.app`:
1. ในโปรเจ็กต์ Vercel → Settings → **Domains**
2. พิมพ์ domain ที่มีอยู่แล้ว (เช่น domain ย่อยของคณะ) หรือซื้อ domain ใหม่ผ่าน Vercel ได้เลย
3. ทำตามขั้นตอนตั้งค่า DNS ที่ Vercel แจ้ง (ปกติแค่เพิ่ม CNAME record ที่ผู้ให้บริการ domain)

---

## สรุปภาพรวมความสัมพันธ์ของสามระบบ

- **Supabase** — เก็บฐานข้อมูล (ผู้ใช้, บันทึกชั่วโมง, แจ้งเตือน) พร้อมใช้งานอยู่แล้ว ไม่ต้องทำอะไรเพิ่มในขั้นตอนนี้
- **GitHub** — เก็บซอร์สโค้ดของแอพ เป็นจุดที่คุณแก้ไข/อัปเดตโค้ด
- **Vercel** — คอยดู GitHub repo นี้อยู่ พอมีการ push ใหม่ก็ build แอพจากโค้ดแล้วนำขึ้นเว็บให้อัตโนมัติ พร้อมดึงค่าเชื่อมต่อ Supabase จาก Environment Variables ที่ตั้งไว้

หากติดขั้นตอนไหน คัดลอกข้อความ error ทั้งหมดมาถามได้เลย
