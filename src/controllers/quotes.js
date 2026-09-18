import QuoteRequest from '../models/QuoteRequest.js';

export const submitQuote = async (req, res) => {
  const { name, email, phone, service, message, source } = req.body;
  if (!name || !email || !phone || !service)
    return res.status(400).json({ success: false, message: 'Name, email, phone, and service are required' });

  const validSources = ['Quote Modal', 'Contact Form'];
  const resolvedSource = validSources.includes(source) ? source : 'Quote Modal';

  await QuoteRequest.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    service,
    message: (message || '').trim(),
    source: resolvedSource,
  });

  res.status(201).json({ success: true, message: 'Quote request submitted successfully' });
};

export const getQuotes = async (req, res) => {
  const { status, service, source, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (service) filter.service = service;
  if (source) filter.source = source;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [quotes, total] = await Promise.all([
    QuoteRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    QuoteRequest.countDocuments(filter),
  ]);

  res.json({ success: true, quotes, total, page: pageNum, limit: limitNum });
};

export const updateQuoteStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['new', 'contacted', 'closed'].includes(status))
    return res.status(400).json({ success: false, message: 'Status must be new, contacted, or closed' });

  await QuoteRequest.findByIdAndUpdate(id, { status });
  res.json({ success: true, message: 'Status updated' });
};

export const deleteQuote = async (req, res) => {
  const { id } = req.params;
  await QuoteRequest.findByIdAndDelete(id);
  res.json({ success: true, message: 'Quote deleted' });
};
