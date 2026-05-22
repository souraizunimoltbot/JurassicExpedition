# 侏羅紀遠征 Jurassic Expedition

可執行的 Low Poly 第三人稱載具射擊遊戲原型，使用 React、Three.js、@react-three/fiber 與 @react-three/drei 實作。

## 執行方式

```bash
npm install
npm run dev
```

建構檢查：

```bash
npm run build
```

## Cloudflare Pages 部署

Cloudflare Pages Git integration 設定：

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: `Vite`
- Deploy command: 留空，不要使用 `npx wrangler deploy`

如果 Cloudflare 介面一定要填 deploy command，請改用 Pages 指令：

```bash
npx wrangler pages deploy dist --project-name jurassic-expedition
```

也可以用 Wrangler 直接部署：

```bash
npm run deploy:cloudflare
```

專案包含 [wrangler.toml](wrangler.toml) 與 [public/_redirects](public/_redirects)，Cloudflare Pages 會在 build 後輸出靜態檔到 `dist`，並支援 SPA fallback。`wrangler.toml` 也包含 `[assets]` 設定，避免誤執行 `npx wrangler deploy` 時找不到 `dist` 資產目錄。

## 操作

- WASD / 方向鍵：駕駛橘色皮卡車
- 滑鼠移動：控制綠色準星與車頂機槍
- 滑鼠左鍵：機槍開火

遊戲包含開始畫面、第三人稱跟車攝影機、可旋轉車頂機槍、三種低多邊形恐龍、頭部/身體命中判定、傷害數字、血條、小地圖、計分、玩家血量與遊戲結束流程。
