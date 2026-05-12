# mina-edu-insurance 專案說明

## 品牌
- 保險：大誠保險經紀，負責人陳芊樺，家庭財務顧問，台中 25-55 歲有家庭族群
- 補習班：徐薇英文 UP學 × 偉智數學 WISE，台中分校，目標 3 公里內國小學生家長

## 技術架構
- 純 HTML + CSS，無前端框架
- 部署：Cloudflare Pages
- insurance/ → Cloudflare project: insurance-site
- education/ → Cloudflare project: education-site

## API 佔位符（待填入真實值）
- OPENCLAW_ENDPOINT_INSURANCE=
- OPENCLAW_ENDPOINT_EDUCATION=
- N8N_WEBHOOK_INSURANCE=
- N8N_WEBHOOK_EDUCATION=
- NOTION_API_KEY=
- NOTION_DB_INSURANCE=
- NOTION_DB_EDUCATION=

## 修改規則
- 視覺問題 → 回 Claude Design 修改後覆蓋對應 index.html
- 功能問題 → 在 shared/scripts/ 修改腳本
- 兩個網站互不影響
- 合規：保險不用「保證」「一定賠」；補習班不用「保證進步X分」

## Git Commit 規範
- insurance: 說明改了什麼
- education: 說明改了什麼
- shared: 說明改了什麼
