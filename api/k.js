const EPK = (() => {
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = u => /^https?:\/\//i.test(u || '') ? u : '';
const img = u => safe(u) || (/^data:image\//.test(u || '') ? u : '');
const cssUrl = u => "url('" + String(u).replace(/['"()\\\s<>]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')) + "')";
const lines = t => (t || '').split('\n').map(s => s.trim()).filter(Boolean);
const list = t => (t || '').split(/[\n,]/).map(s => s.trim()).filter(Boolean);
const kv = l => { if (l.includes('|')) { const i = l.indexOf('|'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; } const m = l.match(/^(.*?)\s*(https?:\/\/\S+)\s*$/); return m ? [m[1].replace(/[\s:|\-–—]+$/, '').trim(), m[2]] : [l, '']; };
const pair = l => { const i = l.indexOf('|'); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; };
const slugify = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const p2 = n => String(n).padStart(2, '0');
const isoDate = s => {
  s = (s || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return m[1] + '-' + p2(m[2]) + '-' + p2(m[3]);
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2}|\d{4}))?$/);
  if (!m) return '';
  const y = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : String(new Date().getFullYear());
  const r = y + '-' + p2(m[2]) + '-' + p2(m[1]);
  return !m[3] && r < today() ? (+y + 1) + '-' + p2(m[2]) + '-' + p2(m[1]) : r;
};
const today = () => { const d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };

const T = {
  en: { bio: 'Biography', music: 'Music', dates: 'Upcoming dates', hi: 'Highlights', rel: 'Released on', play: 'Played at', sup: 'Supported by', press: 'Press', photos: 'Photos', dl: 'Downloads', contact: 'Booking & Contact', book: 'Booking request', vip: 'Join my VIP list', name: 'Name', email: 'E-mail', wa: 'WhatsApp', date: 'Event date', city: 'City / Venue', msg: 'Message', send: 'Send', ok: 'Thank you! We will be in touch.', err: 'Something went wrong. Please try again.', listen: 'Listen ↗' },
  pt: { bio: 'Biografia', music: 'Música', dates: 'Próximas datas', hi: 'Destaques', rel: 'Lançado em', play: 'Tocou em', sup: 'Apoiado por', press: 'Imprensa', photos: 'Fotos', dl: 'Downloads', contact: 'Booking e Contato', book: 'Pedido de booking', vip: 'Entre na minha lista VIP', name: 'Nome', email: 'E-mail', wa: 'WhatsApp', date: 'Data do evento', city: 'Cidade / Local', msg: 'Mensagem', send: 'Enviar', ok: 'Obrigado! Entraremos em contato.', err: 'Algo deu errado. Tente novamente.', listen: 'Ouvir ↗' }
};

const KIT_CSS = `
.kit{--a:#7c5cff;--bg:#0b0b10;--fg:#ececf5;--mu:#9a9ab5;--cd:#14141c;background:var(--bg);color:var(--fg);font-family:Inter,system-ui,sans-serif;line-height:1.7}
.kit.light{--bg:#fafafc;--fg:#14141c;--mu:#666680;--cd:#fff}
.kit *{box-sizing:border-box}
.kit .hero{min-height:78vh;display:flex;flex-direction:column;justify-content:flex-end;padding:8vw 7vw 6vw;background:linear-gradient(180deg,#0000 20%,var(--bg) 98%),var(--img,linear-gradient(135deg,var(--a),#111)) center/cover}
.kit .chip{display:inline-block;align-self:flex-start;border:1px solid var(--a);color:var(--a);padding:4px 14px;border-radius:99px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-bottom:16px;background:#0006}
.kit h1{font:900 clamp(44px,9vw,120px)/.95 'Playfair Display',serif;margin:0 0 14px;letter-spacing:-1px}
.kit .tag{font-size:clamp(16px,2vw,22px);color:var(--mu);max-width:720px;margin:0}
.kit section{padding:52px 7vw;max-width:1200px;margin:auto}
.kit h2{font:700 13px Inter;letter-spacing:3px;text-transform:uppercase;color:var(--a);margin:0 0 24px;display:flex;align-items:center;gap:12px}
.kit h2:after{content:"";flex:1;height:1px;background:var(--mu);opacity:.3}
.kit .lang{margin-bottom:16px}.kit .lang button{background:none;border:1px solid var(--mu);color:var(--fg);border-radius:99px;padding:3px 12px;margin-right:6px;cursor:pointer;font:600 12px Inter}
.kit [data-l]{display:none}.kit[data-lang=en] [data-l=en],.kit[data-lang=pt] [data-l=pt]{display:block}
.kit .bio p{font-size:18px;max-width:780px;margin:0 0 16px}
.kit .gal{columns:3 220px;gap:12px}.kit .gal img{width:100%;margin-bottom:12px;border-radius:10px;display:block}
.kit .trk{margin-bottom:18px}.kit iframe{width:100%;border:0;border-radius:12px}.kit .trk b{display:block;margin-bottom:8px}
.kit .btn{display:inline-block;background:var(--a);color:#fff;text-decoration:none;padding:11px 20px;border-radius:99px;font-weight:600;font-size:14px;margin:0 8px 8px 0;border:0;cursor:pointer;font-family:inherit}
.kit .btn.o{background:none;border:1px solid var(--a);color:var(--a)}
.kit .ev{display:grid;grid-template-columns:110px 1fr auto;gap:14px;padding:14px 0;border-bottom:1px solid #8883}
.kit .ev b{color:var(--a)}.kit .ev span{color:var(--mu)}
.kit .hl h4{margin:18px 0 8px;font:600 12px Inter;letter-spacing:2px;text-transform:uppercase;color:var(--mu)}
.kit .hl span{display:inline-block;background:var(--cd);border-radius:99px;padding:5px 14px;margin:0 6px 6px 0;font-size:14px;border:1px solid #8883}
.kit blockquote{margin:0 0 20px;font:italic 700 clamp(20px,3vw,32px)/1.35 'Playfair Display',serif}
.kit blockquote cite{display:block;font:600 13px Inter;color:var(--mu);margin-top:8px;font-style:normal}
.kit footer{text-align:center;padding:64px 7vw;background:var(--cd)}
.kit footer h3{font:900 clamp(28px,5vw,52px) 'Playfair Display',serif;margin:0 0 20px}
.kit .forms{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;max-width:900px;margin:36px auto 0;text-align:left}
.kit form{background:var(--bg);padding:20px;border-radius:14px;border:1px solid #8883}
.kit form h4{margin:0 0 12px;font:700 15px Inter}
.kit input,.kit textarea{width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid #8885;background:var(--cd);color:var(--fg);font:inherit;font-size:14px}
.kit .trks{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
.kit .trk{margin:0;background:var(--cd);border:1px solid #8883;border-radius:16px;padding:16px}
.kit .trk b{font:700 14px Inter;letter-spacing:.3px;margin-bottom:10px}
.kit .yt{position:relative;padding-top:56.25%}.kit .yt iframe{position:absolute;inset:0;height:100%}
.kit .lnk{display:flex;align-items:center;justify-content:space-between;gap:12px;text-decoration:none;color:var(--fg);border:1px solid var(--a);border-radius:12px;padding:16px 18px;font-weight:700}.kit .lnk small{color:var(--a);font-weight:600;font-size:13px}
.kit .lnk:hover{background:var(--a);color:#fff}.kit .lnk:hover small{color:#fff}
.kit footer .btn{margin:0 6px 10px}
@media print{.kit .hero{min-height:auto}.kit section{break-inside:avoid}.kit .forms,.kit .lang{display:none}}`;

function platform(u) {
  let h = ''; try { h = new URL(u).hostname.replace(/^www\./, ''); } catch (e) {}
  const m = [['soundcloud', 'SoundCloud'], ['beatport', 'Beatport'], ['music.apple', 'Apple Music'], ['deezer', 'Deezer'], ['bandcamp', 'Bandcamp'], ['tidal', 'Tidal'], ['youtu', 'YouTube'], ['spotify', 'Spotify'], ['instagram', 'Instagram'], ['traxsource', 'Traxsource']].find(x => h.includes(x[0]));
  return m ? m[1] : h;
}
function embed(u, t) {
  u = safe(u); if (!u) return '';
  let m = u.match(/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist|artist)\/(\w+)/);
  if (m) return `<iframe loading="lazy" src="https://open.spotify.com/embed/${m[1]}/${m[2]}" height="${m[1] === 'track' ? 152 : 352}" allow="encrypted-media"></iframe>`;
  m = u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  if (m) return `<div class="yt"><iframe loading="lazy" src="https://www.youtube.com/embed/${m[1]}" allowfullscreen></iframe></div>`;
  if (/^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+/i.test(u)) return `<iframe loading="lazy" scrolling="no" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;visual=false" height="166"></iframe>`;
  return `<a class="lnk" href="${esc(u)}" target="_blank" rel="noopener"><span>${esc(platform(u))}</span><small>${t.listen}</small></a>`;
}

function renderKit(k) {
  const L = k.lang === 'pt' ? 'pt' : 'en', t = T[L], cover = img(k.cover);
  const tr = lines(k.tracks).map(kv), qu = lines(k.quotes).map(pair), fi = lines(k.files).map(kv), so = lines(k.socials).map(kv);
  const td = today();
  const ev = lines(k.agenda).map(l => l.split(/\s*[|–—]\s*|\s+-\s+/).map(s => s.trim())).map(a => [isoDate(a[0]), a[1], a[2]]).filter(a => a[0] && a[0] >= td).sort((a, b) => a[0] < b[0] ? -1 : 1);
  const imgs = (k.photos || []).filter(img);
  const sec = (h, b) => b ? `<section><h2>${h}</h2>${b}</section>` : '';
  const hl = [['rel', 'rel'], ['play', 'play'], ['sup', 'sup']].map(([f, key]) => { const a = list(k[f]); return a.length ? `<h4>${t[key]}</h4>${a.map(x => `<span>${esc(x)}</span>`).join('')}` : ''; }).join('');
  const bl = k['bio_' + L] ? L : (k.bio_en ? 'en' : 'pt'), both = k.bio_en && k.bio_pt;
  const bio = ['en', 'pt'].map(l => k['bio_' + l] ? `<div class="bio" data-l="${l}">${k['bio_' + l].split(/\n\s*\n/).map(p => `<p>${esc(p.trim())}</p>`).join('')}</div>` : '').join('');
  const wa0 = (k.phone || '').replace(/\D/g, ''), wa = /^\d{10,11}$/.test(wa0) ? '55' + wa0 : wa0;
  const field = (n, ph, type = 'text', req = '') => `<input name="${n}" type="${type}" placeholder="${ph}" ${req}>`;
  const hp = '<input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px">';
  return `<div class="kit ${k.theme === 'light' ? 'light' : ''}" data-lang="${bl}" style="--a:${/^#[0-9a-f]{6}$/i.test(k.accent) ? k.accent : '#7c5cff'}">
<div class="hero" ${cover ? `style="--img:${cssUrl(cover)}"` : ''}>
${k.genre ? `<span class="chip">${esc(k.genre)}${k.city ? ' · ' + esc(k.city) : ''}</span>` : ''}
<h1>${esc(k.name) || 'Artist Name'}</h1>${k.tagline ? `<p class="tag">${esc(k.tagline)}</p>` : ''}</div>
${sec(t.bio, bio ? `${both ? `<div class="lang"><button onclick="this.closest('.kit').dataset.lang='en'">EN</button><button onclick="this.closest('.kit').dataset.lang='pt'">PT</button></div>` : ''}${bio}` : '')}
${sec(t.hi, hl ? `<div class="hl">${hl}</div>` : '')}
${sec(t.dates, ev.length ? ev.map(a => `<div class="ev"><b>${esc(a[0].split('-').reverse().join('/'))}</b><div>${esc(a[1] || '')}</div><span>${esc(a[2] || '')}</span></div>`).join('') : '')}
${sec(t.music, tr.length ? '<div class="trks">' + tr.map(([n, u]) => `<div class="trk">${n ? `<b>${esc(n)}</b>` : ''}${embed(u, t)}</div>`).join('') + '</div>' : '')}
${sec(t.press, qu.length ? qu.map(([q, s]) => `<blockquote>“${esc(q)}”${s ? `<cite>— ${esc(s)}</cite>` : ''}</blockquote>`).join('') : '')}
${sec(t.photos, imgs.length ? `<div class="gal">${imgs.map(p => `<a href="${esc(p)}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(p)}" alt="${esc(k.name)}"></a>`).join('')}</div>` : '')}
${sec(t.dl, fi.length ? fi.map(([n, u]) => safe(u) ? `<a class="btn o" href="${esc(u)}" target="_blank" rel="noopener">⬇ ${esc(n)}</a>` : '').join('') : '')}
<footer><h3>${t.contact}</h3>
${k.email ? `<a class="btn" href="mailto:${esc(k.email)}">${esc(k.email)}</a>` : ''}
${wa ? `<a class="btn o" href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
<div>${so.map(([n, u]) => safe(u) ? `<a class="btn o" href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>` : '').join('')}</div>
<div class="forms">
<form data-kind="booking" onsubmit="return false"><h4>${t.book}</h4>${hp}${field('name', t.name, 'text', 'required')}${field('email', t.email, 'email', 'required')}${field('whatsapp', t.wa)}${field('event_date', t.date, 'date')}${field('city', t.city)}<textarea name="message" rows="3" placeholder="${t.msg}"></textarea><button class="btn">${t.send}</button></form>
<form data-kind="vip" onsubmit="return false"><h4>${t.vip}</h4>${hp}${field('name', t.name, 'text', 'required')}${field('email', t.email, 'email', 'required')}${field('whatsapp', t.wa)}<button class="btn">${t.send}</button></form>
</div></footer></div>`;
}

function renderPage(k, o) {
  const t = T[k.lang === 'pt' ? 'pt' : 'en'], title = esc(k.name) + ' — Press Kit';
  const d = esc((k.tagline || k.bio_en || k.bio_pt || '').replace(/\s+/g, ' ').slice(0, 160)), cv = safe(k.cover);
  const cfg = JSON.stringify({ s: o.slug || k.slug || '', u: o.supabaseUrl || '', k: o.supabaseKey || '', ok: t.ok, err: t.err }).replace(/</g, '\\u003c');
  return `<!DOCTYPE html><html lang="${k.lang === 'pt' ? 'pt-BR' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${d}"><meta property="og:title" content="${title}"><meta property="og:description" content="${d}"><meta property="og:type" content="website">${o.url ? `<meta property="og:url" content="${esc(o.url)}">` : ''}${cv ? `<meta property="og:image" content="${esc(cv)}">` : ''}<meta name="twitter:card" content="summary_large_image"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"><style>${KIT_CSS}body{margin:0}</style></head><body>${renderKit(k)}<script>
const C=${cfg};
document.querySelectorAll('form[data-kind]').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const b=Object.fromEntries(new FormData(f));if(b.website){f.innerHTML='<p>'+C.ok+'</p>';return}delete b.website;b.slug=C.s;b.kind=f.dataset.kind;if(!b.event_date)delete b.event_date;
try{const r=await fetch(C.u+'/rest/v1/leads',{method:'POST',headers:{apikey:C.k,Authorization:'Bearer '+C.k,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(b)});f.innerHTML='<p>'+(r.ok?C.ok:C.err)+'</p>'}catch(_){f.innerHTML='<p>'+C.err+'</p>'}});
<\/script></body></html>`;
}

return { renderKit, renderPage, KIT_CSS, slugify, cssUrl, esc };
})();

const SUPABASE_URL = 'https://kwxutgeqexqqrwhgvebh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eHV0Z2VxZXhxcXJ3aGd2ZWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1ODYyMTQsImV4cCI6MjExMDE2MjIxNH0.a7zCa4MKeS4lXpjdbte2PbfwN1Yl5v4T8Qql9u5Oq7o';

module.exports = async (req, res) => {
  const slug = String(req.query.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const r = slug ? await fetch(`${SUPABASE_URL}/rest/v1/epks?slug=eq.${encodeURIComponent(slug)}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    }) : null;
    const rows = r && r.ok ? await r.json() : [];
    if (!rows[0]) {
      res.statusCode = 404;
      return res.end('<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;padding:40px"><h1>Press kit não encontrado</h1>');
    }
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.statusCode = 200;
    res.end(EPK.renderPage(rows[0].data, {
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
