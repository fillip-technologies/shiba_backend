import db from '../util/db.js';

export const submitQuote = async (req, res) => {
  const { name, email, phone, service, message, source } = req.body;
  if (!name || !email || !phone || !service)
    return res.status(400).json({ success: false, message: 'Name, email, phone, and service are required' });

  const validSources = ['Quote Modal', 'Contact Form'];
  const resolvedSource = validSources.includes(source) ? source : 'Quote Modal';

  await db.query(
    'INSERT INTO quote_requests (name, email, phone, service, message, source) VALUES ($1, $2, $3, $4, $5, $6)',
    [name.trim(), email.trim().toLowerCase(), phone.trim(), service, (message || '').trim(), resolvedSource]
  );

  res.status(201).json({ success: true, message: 'Quote request submitted successfully' });
};

export const getQuotes = async (req, res) => {
  const { status, service, source, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions = [];
  const params = [];
  let idx = 1;

  if (status)  { conditions.push(`status = $${idx++}`);  params.push(status); }
  if (service) { conditions.push(`service = $${idx++}`); params.push(service); }
  if (source)  { conditions.push(`source = $${idx++}`);  params.push(source); }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  const [quotesResult, countResult] = await Promise.all([
    db.query(
      `SELECT * FROM quote_requests${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, Number(limit), offset]
    ),
    db.query(`SELECT COUNT(*) AS count FROM quote_requests${where}`, params),
  ]);

  res.json({
    success: true,
    quotes: quotesResult.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
};

export const updateQuoteStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['new', 'contacted', 'closed'].includes(status))
    return res.status(400).json({ success: false, message: 'Status must be new, contacted, or closed' });

  await db.query('UPDATE quote_requests SET status = $1 WHERE id = $2', [status, id]);
  res.json({ success: true, message: 'Status updated' });
};

export const deleteQuote = async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM quote_requests WHERE id = $1', [id]);
  res.json({ success: true, message: 'Quote deleted' });
};
