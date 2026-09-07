function parseJsonBody(req) {
  if (req.body != null && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return null;
    }
  }
  return {};
}

function normalizeUtm(raw) {
  const utm = raw && typeof raw === "object" ? raw : {};
  return {
    source: String(utm.source || "").trim(),
    medium: String(utm.medium || "").trim(),
    campaign: String(utm.campaign || "").trim(),
    content: String(utm.content || "").trim(),
    term: String(utm.term || "").trim(),
    landing_page: String(utm.landing_page || "").trim(),
    referrer: String(utm.referrer || "").trim(),
  };
}

function formatUtmText(utm) {
  const orUnknown = (value) => value || "не определён";
  return [
    `Источник: ${orUnknown(utm.source)}`,
    `Канал: ${orUnknown(utm.medium)}`,
    `Кампания: ${orUnknown(utm.campaign)}`,
    `Контент: ${orUnknown(utm.content)}`,
    `Ключевое слово: ${orUnknown(utm.term)}`,
    `Страница заявки: ${orUnknown(utm.landing_page)}`,
    `Referrer: ${orUnknown(utm.referrer)}`,
  ].join("\n");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = parseJsonBody(req);
  if (body === null) {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  const name = String(body.name || "").trim();
  const contact = String(body.contact || "").trim();
  const goal = String(body.goal || "").trim();

  if (!name || !contact) {
    return res.status(400).json({ ok: false, error: "name and contact required" });
  }

  const utm = normalizeUtm(body.utm);
  const utm_text = formatUtmText(utm);

  const webhook = process.env.MAKE_CONTACT_WEBHOOK;
  if (!webhook) {
    console.error("MAKE_CONTACT_WEBHOOK is not set");
    return res.status(500).json({ ok: false, error: "Server misconfigured" });
  }

  try {
    const makeRes = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact, goal, utm, utm_text }),
    });
    if (!makeRes.ok) {
      console.error("Make webhook error:", makeRes.status);
      return res.status(502).json({ ok: false, error: "Upstream error" });
    }
  } catch (err) {
    console.error(err);
    return res.status(502).json({ ok: false, error: "Upstream error" });
  }

  return res.status(200).json({ ok: true });
};
