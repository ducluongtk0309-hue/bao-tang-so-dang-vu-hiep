// Hàm máy chủ Vercel: /api/thuyet-minh
// Nhận { id, title, facts } từ trang bảo tàng, gọi Claude để viết lời thuyết minh,
// trả về { text }. Khóa API chỉ nằm ở máy chủ (biến môi trường ANTHROPIC_API_KEY).
//
// Biến môi trường trên Vercel (Project → Settings → Environment Variables):
//   ANTHROPIC_API_KEY  (bắt buộc)  khóa API của Anthropic
//   ANTHROPIC_MODEL    (tùy chọn)  mặc định "claude-sonnet-5-5"
//   ALLOWED_ORIGIN     (tùy chọn)  ví dụ "https://sabandangvuhiep.vercel.app" để chặn trang khác gọi ké

const ID_RE = /^(st|img|loc|wpn|relic|book)-[a-z0-9_]{1,32}$/;
const hits = new Map(); // giới hạn tần suất đơn giản theo IP (trong một phiên bản hàm)

function prompt(title, facts) {
  return `Bạn là thuyết minh viên của Bảo tàng số Thượng tướng Đặng Vũ Hiệp (1928 – 2008). Viết lời thuyết minh bằng tiếng Việt cho mục dưới đây để đọc thành tiếng cho khách tham quan.

Quy tắc bắt buộc:
- Chỉ dùng dữ kiện được cung cấp. Không thêm ngày tháng, số liệu, tên người, địa danh hay lời trích dẫn nào không có trong dữ kiện.
- Nếu dữ kiện ghi "chờ xác minh", "tái hiện", "phục dựng AI" hoặc "minh họa", hãy nói rõ điều đó với khách.
- Giọng trang trọng, ấm áp, dễ nghe; 90 đến 140 từ; văn xuôi liền mạch, không gạch đầu dòng, không markdown, không tiêu đề.

Mục: ${title}
Dữ kiện:
${facts}`;
}

module.exports = async (req, res) => {
  const origin = process.env.ALLOWED_ORIGIN;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    if (req.headers.origin && req.headers.origin !== origin) return res.status(403).json({ error: 'origin_not_allowed' });
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'not_configured' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (list.length >= 12) return res.status(429).json({ error: 'rate_limited' });
  list.push(now); hits.set(ip, list);

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const id = String((body && body.id) || '');
  const title = String((body && body.title) || '').slice(0, 160);
  const facts = String((body && body.facts) || '').slice(0, 1600);
  if (!ID_RE.test(id) || title.length < 2 || facts.length < 10) return res.status(400).json({ error: 'bad_request' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt(title, facts) }]
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'upstream_' + r.status });
    const j = await r.json();
    const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!text) return res.status(502).json({ error: 'empty' });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'upstream_error' });
  }
};
