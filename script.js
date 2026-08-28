// Ambil semua data konten dan render ke halaman.
// Kalau ada file yang gagal dimuat, bagian itu dilewati tanpa mematikan seluruh halaman.

async function getJSON(path) {
  try {
    const res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) throw new Error('gagal memuat ' + path);
    return await res.json();
  } catch (err) {
    console.warn('Konten tidak dimuat:', path, err);
    return null;
  }
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

async function renderSite() {
  const site = await getJSON('content/site.json');
  if (site) {
    document.getElementById('stat-guru').textContent = site.stat_guru || '—';
    document.getElementById('stat-tahun').textContent = site.stat_tahun || '—';

    const profil = document.getElementById('profil-text');
    profil.innerHTML = '';
    if (site.profil_1) profil.appendChild(el(`<p>${site.profil_1}</p>`));

    if (site.visi) {
      profil.appendChild(el(`<h3 class="sub">Visi</h3>`));
      profil.appendChild(el(`<p>${site.visi}</p>`));
    }
    if (Array.isArray(site.misi) && site.misi.length) {
      profil.appendChild(el(`<h3 class="sub">Misi</h3>`));
      const ul = el(`<ul class="misi-list"></ul>`);
      site.misi.forEach(m => ul.appendChild(el(`<li>${m}</li>`)));
      profil.appendChild(ul);
    }

    const timeline = document.getElementById('timeline-list');
    timeline.innerHTML = '';
    (site.timeline || []).forEach(item => {
      timeline.appendChild(el(`
        <div class="timeline-item">
          <span class="yr">${item.tahun || ''}</span>
          <h4>${item.judul || ''}</h4>
          <p>${item.deskripsi || ''}</p>
        </div>
      `));
    });
  }
}

async function renderPengurus() {
  const data = await getJSON('content/pengurus.json');
  if (!data) return;
  const grid = document.getElementById('org-grid');
  grid.innerHTML = '';
  (data.anggota || []).forEach(p => {
    grid.appendChild(el(`
      <div class="org-card reveal">
        <div class="org-avatar">${(p.inisial || (p.nama || '?').charAt(0)).toUpperCase()}</div>
        <h4>${p.nama || ''}</h4>
        <div class="role">${p.jabatan || ''}</div>
      </div>
    `));
  });
  attachReveal(grid);
}

async function renderSekolah() {
  const data = await getJSON('content/sekolah.json');
  if (!data) return;
  const daftar = data.daftar || [];
  const statEl = document.getElementById('stat-sekolah');
  if (statEl) statEl.textContent = daftar.length + ' unit';
  const grid = document.getElementById('school-grid');
  grid.innerHTML = '';
  daftar.forEach(s => {
    grid.appendChild(el(`
      <div class="school-card reveal">
        <div class="school-top"></div>
        <div class="school-body">
          <span class="tag">${s.tag || ''}</span>
          <h4>${s.nama || ''}</h4>
          <p>${s.deskripsi || ''}</p>
        </div>
      </div>
    `));
  });
  attachReveal(grid);
}

async function renderBerita() {
  const data = await getJSON('content/berita.json');
  if (!data) return;
  const grid = document.getElementById('news-grid');
  grid.innerHTML = '';
  (data.daftar || []).forEach(n => {
    const featClass = n.unggulan ? ' feature' : '';
    grid.appendChild(el(`
      <div class="news-card${featClass} reveal">
        <div>
          <span class="date">${n.tanggal || ''}</span>
          <h4>${n.judul || ''}</h4>
          <p>${n.ringkasan || ''}</p>
        </div>
      </div>
    `));
  });
  attachReveal(grid);
}

async function renderKontak() {
  const data = await getJSON('content/kontak.json');
  if (!data) return;
  const list = document.getElementById('contact-list');
  list.innerHTML = '';
  const rows = [
    ['📍', 'Alamat', data.alamat],
    ['✉️', 'Email', data.email],
    ['📞', 'Telepon / WhatsApp', data.telepon],
    ['🕘', 'Jam Layanan', data.jam],
  ];
  rows.forEach(([icon, label, value]) => {
    if (!value) return;
    list.appendChild(el(`
      <li>
        <div class="contact-icon">${icon}</div>
        <div><h5>${label}</h5><p>${value}</p></div>
      </li>
    `));
  });
}

function attachReveal(container) {
  if (!window.__io) {
    window.__io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); window.__io.unobserve(e.target); } });
    }, { threshold: 0.15 });
  }
  container.querySelectorAll('.reveal').forEach(elm => window.__io.observe(elm));
}

renderSite();
renderPengurus();
renderSekolah();
renderBerita();
renderKontak();
