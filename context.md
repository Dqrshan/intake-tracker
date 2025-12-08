# AGENT CONTEXT – MINIMAL FREE INTAKE-TRACKER PWA

Generate a **complete, runnable codebase** that satisfies **every** item below.  
Use **only** free, open-source, CPU-friendly components.  
Keep total weight < 50 MB (code + models).  
Emit **full file contents**—no placeholders, no “TODO”.

---

## 1. NON-FUNCTIONAL
- Zero cost stack (no paid tiers, no DockerHub pulls, no enterprise features).  
- First-load JS ≤ 70 kB gzipped.  
- Works offline after first visit (camera still needs HTTPS).  
- iOS 15 + Chrome 110 + Android WebAPK.  
- Single command to run both sides (concurrently via `npm-run-all` or equivalent).  

---

## 2. STACK
| Layer      | Tech                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| Front-end  | Next.js 14 (App Router, TS, Tailwind 3)                                    |
| PWA        | `next-pwa` (Workbox inside)                                                |
| DB         | MySQL                                                                      |
| ORM        | Prisma 5                                                                   |
| ML service | Python 3.11, FastAPI, **ONNX-runtime CPU**, royalty-free quantized weights |
| Auth       | none (hard-coded user `"demo"`)                                            |
| Secrets    | one `.env` file, not committed                                             |

---

## 3. MODELS (light-weight, open weights)
- **Food classification**: YOLOv8n-cls **INT8** (`yolov8n-cls.onnx` ≈ 6 MB) – Ultralytics AGPL, permissible.  
- **Calorie regression**: Custom 3-layer CNN trained on USDA **open data**, quantized to **INT8** (`calorie.onnx` ≈ 400 kB).  
- **Scale weight**: mocked at 150 g (real Bluetooth scale optional later).  

---

## 4. SCHEMA (Prisma)
```prisma
model Meal {
  id        String   @id @default(cuid())
  name      String
  weight_g  Int
  kcal      Int
  protein_g Int
  carbs_g   Int
  fat_g     Int
  createdAt DateTime @default(now())
}

model Medicine {
  id      String   @id @default(cuid())
  name    String
  dosage  String
  time    String   // "HH:MM"
  takenAt DateTime[]
}
```

---

## 5. URL CONTRACT
- `POST /api/infer` – Next.js route handler, forwards JPEG to Python, returns `{ dishes: [{ name, weight_g, kcal, protein_g, carbs_g, fat_g }] }`  
- `POST /api/meal` – body = above dish → Prisma create  
- `GET  /api/meal` – list today meals  
- `POST /api/medicine` – create med  
- `GET  /api/medicine` – list all  
- `PATCH /api/medicine/:id/take` – push current timestamp into `takenAt`  

---

## 6. UI (reuse earlier glassmorphism)
- Dashboard: calorie ring, macros bars, med tile, recent meals.  
- Camera page: shutter → base64 JPEG → loader → confirmation card.  
- Meds page: list + toggle taken (checkbox), add button.  
- Contraindication modal: hard-coded grapefruit vs atorvastatin check (can extend later).  
- Report page: generate PDF **in browser** with `pdf-lib` (MIT), encrypted with static password `"0000"` for now.  

---

## 7. DIRECTORY TREE (emit every leaf)
```
apps/web/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── capture/page.tsx
│   ├── meds/page.tsx
│   ├── report/page.tsx
│   ├── api/infer/route.ts
│   ├── api/meal/route.ts
│   ├── api/medicine/route.ts
│   └── globals.css
├── src/lib/
│   ├── prisma.ts
│   └── pdf.ts
├── public/
│   └── icon-512.png
├── prisma/
│   └── schema.prisma
├── next.config.js
├── tailwind.config.js
├── package.json
└── .env.example

services/ml/
├── ml.py
├── yolov8n-cls.onnx   (download link in README)
├── calorie.onnx       (included)
└── requirements.txt
```

---

## 8. PYTHON SERVICE (single file)
- FastAPI, `POST /infer`, accepts `UploadFile` JPEG.  
- Returns JSON exactly like section 5.  
- ≤ 30 lines, no extra folders.  

---

## 9. NEXT-PWA CONFIG
```js
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});
module.exports = withPWA({ reactStrictMode: true });
```

---

## 10. OUTPUT INSTRUCTIONS
1. Emit **all** files above with real code (no stubs).  
2. Inline small assets (base64 PNG icon if needed).  
3. No Docker, no Jest, no CI, no Fly.io, no Vercel pro.  


**End of context – generate the full repo.**