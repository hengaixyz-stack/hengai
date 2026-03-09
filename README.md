# HENG AI Protocol — Vercel Deployment

## Deploy in 3 Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "HENG AI Protocol"
git remote add origin https://github.com/YOUR_USERNAME/heng-ai-protocol.git
git push -u origin main
```

### 2. Import on Vercel
- Go to https://vercel.com/new
- Import your GitHub repo
- Framework: **Vite** (auto-detected)
- Build command: `npm run build`
- Output directory: `dist`
- Click **Deploy**

### 3. Add your API Key ⚠️ REQUIRED
Vercel Dashboard → Your Project → **Settings → Environment Variables**
| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-xxxxx...` |

Then go to **Deployments → Redeploy** (latest deployment → ⋯ menu → Redeploy).

---

## Cost Optimizations Active
- **Model**: `claude-haiku-4-5` (~20× cheaper than Sonnet)
- **max_tokens**: 380 (trimmed from 1000)
- **temperature**: 0 (deterministic, no wasted sampling)
- **System prompts**: server-side only (browser sends ~60 tokens instead of ~300)
- **Client cache**: identical queries within a session skip the API entirely
