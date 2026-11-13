const { renderPage } = require('../kit.js');

const SUPABASE_URL = 'https://kwxutgeqexqqrwhgvebh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eHV0Z2VxZXhxcXJ3aGd2ZWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1ODYyMTQsImV4cCI6MjExMDE2MjIxNH0.a7zCa4MKeS4lXpjdbte2PbfwN1Yl5v4T8Qql9u5Oq7o';

module.exports = async (req, res) => {
  const slug = String(req.query.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/epks?slug=eq.${slug}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    });
    const rows = r.ok ? await r.json() : [];
    if (!rows[0]) {
      res.statusCode = 404;
      return res.end('<!DOCTYPE html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px"><h1>Press kit não encontrado</h1>');
    }
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.statusCode = 200;
    res.end(renderPage(rows[0].data, {
      slug,
      url: `https://${host}/${slug}`,
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_KEY
    }));
  } catch (e) {
    res.statusCode = 500;
    res.end('Erro ao carregar o press kit.');
  }
};
