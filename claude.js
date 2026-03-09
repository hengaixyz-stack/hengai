// HENG AI Protocol — Vercel Serverless API Route
// System prompts live server-side → browser sends only {module, userMessage}
// Model: claude-haiku-4-5 | max_tokens: 380 | temperature: 0

const SYSTEM_PROMPTS = {
  studio: `You are HENG AI Studio (MUD Network NFT generator). Output ONLY a compact JSON object — no prose, no markdown fences.
Schema: {"title":str,"description":str(2 sentences max),"style":str,"palette":["#hex","#hex","#hex"],"nft_traits":[{"trait":str,"value":str},{"trait":str,"value":str},{"trait":str,"value":str}],"mint_ready":true,"estimated_floor":str,"ipfs_cid":str,"resolution":str}`,

  auditor: `You are HENG AI Smart Contract Auditor (MUD Network). Output ONLY a compact JSON object — no prose, no markdown fences.
Schema: {"security_score":int(0-100),"risk_level":"Low"|"Medium"|"High"|"Critical","contract_name":str,"issues":[{"severity":"Critical"|"High"|"Medium"|"Low"|"Info","title":str,"description":str,"line":str}],"gas_suggestions":[str,str],"rug_pull_signals":[str],"liquidity_safety":"Locked"|"Unlocked"|"Unknown","recommendation":"SAFE TO DEPLOY"|"REVIEW REQUIRED"|"DO NOT DEPLOY","summary":str}`,

  intelligence: `You are HENG AI Token Intelligence (MUD Network). Output ONLY a compact JSON object — no prose, no markdown fences.
Schema: {"token_name":str,"ticker":str,"contract":str,"price_usd":str,"price_change_24h":str,"market_cap":str,"volume_24h":str,"liquidity":str,"chart_points":[10 ints 30-100],"whale_activity":[{"wallet":str,"action":"BUY"|"SELL"|"ACCUMULATE","amount":str,"time":str}],"rug_signals":[str],"sell_pressure":"Low"|"Medium"|"High","ai_signal":"BUY"|"HOLD"|"SELL"|"CAUTION","signal_reasons":[str,str,str],"sentiment":str}`,
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY not set. Go to Vercel → Project → Settings → Environment Variables and add it, then redeploy.",
    });
  }

  const { module: mod, userMessage } = req.body || {};

  const systemPrompt = SYSTEM_PROMPTS[mod];
  if (!systemPrompt) {
    return res.status(400).json({ error: `Unknown module: "${mod}". Must be studio, auditor, or intelligence.` });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",  // ~20x cheaper than Sonnet
        max_tokens: 380,                       // JSON never exceeds this — no wasted budget
        temperature: 0,                        // Deterministic + better JSON reliability
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach Anthropic API: " + err.message });
  }
}
