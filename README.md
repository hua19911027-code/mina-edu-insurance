# mina-edu-insurance

雙品牌靜態網站專案，部署於 Cloudflare Pages。

## 品牌

| 品牌 | 資料夾 | 說明 |
|------|--------|------|
| 大誠保險經紀（陳芊樺） | `insurance/` | 家庭財務顧問，台中 |
| 徐薇英文 UP學 × 偉智數學 WISE | `education/` | 台中烏日，國小學生家長 |

## 資料夾結構

```
mina-edu-insurance/
├── insurance/
│   ├── index.html   # 保險品牌主頁
│   ├── style.css
│   └── assets/      # 圖片、圖示
├── education/
│   ├── index.html   # 補習班品牌主頁
│   ├── style.css
│   └── assets/      # 圖片、圖示
└── shared/
    ├── components/  # 共用 HTML 片段
    └── scripts/     # 共用 JS 腳本（表單、AI 問答）
```

## 部署

- `insurance/` → Cloudflare Pages project: `insurance-site`
- `education/` → Cloudflare Pages project: `education-site`
