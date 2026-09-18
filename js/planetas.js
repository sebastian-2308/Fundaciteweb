// ============================================================
// APUNTA AL PLANETA · FUNDACITE CARACAS — MOTOR V2
// Misión Sistema Solar: una odisea del Sol a Neptuno.
// Telescopio con física, ciencia real, efectos y desbloqueos.
// ============================================================

(() => {
    'use strict';

    // ---------------- Constantes base ----------------
    const VW = 960, VH = 640;
    const TAU = Math.PI * 2;
    const $ = (id) => document.getElementById(id);
    const canvas = $('game-canvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    const SAVE_KEY = 'fundacitePlanetas_v2';
    const LEGACY_TROFEOS = 'fundaciteApuntaTrofeos';
    const LEGACY_RECORD = 'fundaciteApuntaRecord';
    const SONIDO_KEY = 'fundaciteSonidoJuego';
    const DIFS = ['Fácil', 'Normal', 'Difícil'];

    // ---------------- Datos científicos reales ----------------
    const PLANETAS = [
        { nombre: 'Mercurio', color: [183, 176, 158], radio: 27, craters: 0.9, bandas: 0, casquete: 0, anillos: 0, luna: 0,
          diam: '4 879 km', masa: '3,30×10²³ kg', dia: '59 días', año: '88 días', lunas: '0', temp: '−180 a 430 °C', dist: '57,9 M km',
          c1: 'Es el planeta más pequeño y el más cercano al Sol.', c2: 'Un año mercuriano dura solo 88 días terrestres.', c3: 'Sus cráteres guardan hielo en los polos, siempre en sombra.' },
        { nombre: 'Venus', color: [232, 199, 143], radio: 33, craters: 0.15, bandas: 0.55, casquete: 0, anillos: 0, luna: 0,
          diam: '12 104 km', masa: '4,87×10²⁴ kg', dia: '243 días', año: '225 días', lunas: '0', temp: '≈ 460 °C', dist: '108,2 M km',
          c1: 'Gira al revés: su día dura más que su año.', c2: 'Es el planeta más caliente por su efecto invernadero extremo.', c3: 'Es el astro más brillante del cielo tras el Sol y la Luna.' },
        { nombre: 'Tierra', color: [70, 130, 220], radio: 33, craters: 0, bandas: 0, casquete: 0.55, anillos: 0, luna: 1,
          diam: '12 742 km', masa: '5,97×10²⁴ kg', dia: '24 horas', año: '365,25 días', lunas: '1 (la Luna)', temp: '≈ 15 °C', dist: '149,6 M km',
          c1: 'El único mundo conocido con vida y océanos.', c2: 'Su luna estabiliza el eje de giro del planeta.', c3: 'A 40 000 km orbita la Luna, nuestro centinela rocoso.' },
        { nombre: 'Marte', color: [214, 92, 55], radio: 30, craters: 0.6, bandas: 0, casquete: 0.85, anillos: 0, luna: 1,
          diam: '6 779 km', masa: '6,42×10²³ kg', dia: '24,6 horas', año: '687 días', lunas: '2 (Fobos y Deimos)', temp: '≈ −63 °C', dist: '227,9 M km',
          c1: 'Tiene el volcán más alto: el Monte Olimpo, 22 km.', c2: 'El óxido de hierro le da su color rojizo.', c3: 'Sus dos lunas son asteroides capturados.' },
        { nombre: 'Júpiter', color: [216, 168, 116], radio: 40, craters: 0, bandas: 0.85, casquete: 0, anillos: 0, luna: 1, mancha: 1,
          diam: '139 820 km', masa: '1,90×10²⁷ kg', dia: '9,9 horas', año: '11,9 años', lunas: '95 conocidas', temp: '≈ −110 °C', dist: '778,5 M km',
          c1: 'Cabrían unas 1 300 Tierras dentro de Júpiter.', c2: 'Su Gran Mancha Roja es una tormenta de siglos.', c3: 'Europa, su luna, esconde un océano bajo el hielo.' },
        { nombre: 'Saturno', color: [238, 218, 162], radio: 37, craters: 0, bandas: 0.4, casquete: 0, anillos: 1, luna: 1,
          diam: '116 460 km', masa: '5,68×10²⁶ kg', dia: '10,7 horas', año: '29,5 años', lunas: '146+', temp: '≈ −140 °C', dist: '1 434 M km',
          c1: 'Sus anillos de hielo alcanzan 280 000 km de ancho.', c2: 'Es tan ligero que podría flotar en agua.', c3: 'Titán tiene atmósfera y lagos de metano líquido.' },
        { nombre: 'Urano', color: [128, 212, 216], radio: 33, craters: 0, bandas: 0.2, casquete: 0, anillos: 1, luna: 1, inclinado: 1,
          diam: '50 724 km', masa: '8,68×10²⁵ kg', dia: '17,2 horas', año: '84 años', lunas: '28 conocidas', temp: '≈ −195 °C', dist: '2 871 M km',
          c1: 'Rota “tumbado”: su eje está inclinado 98 grados.', c2: 'Fue el primer planeta descubierto con telescopio (1781).', c3: 'Es un gigante de hielo teñido por el metano.' },
        { nombre: 'Neptuno', color: [82, 112, 224], radio: 32, craters: 0, bandas: 0.5, casquete: 0, anillos: 0, luna: 1, mancha: 1,
          diam: '49 244 km', masa: '1,02×10²⁶ kg', dia: '16,1 horas', año: '165 años', lunas: '16 conocidas', temp: '≈ −200 °C', dist: '4 495 M km',
          c1: 'Registra los vientos más rápidos: más de 2 000 km/h.', c2: 'Fue encontrado por las matemáticas antes que por el telescopio.', c3: 'Su gran mancha oscura va y viene con el tiempo.' }
    ];
    const POR_NOMBRE = PLANETAS.reduce((m, p) => (m[p.nombre] = p, m), {});

    // Etapas: odisea del Sol a las afueras heladas (10 escenarios).
    const ETAPAS = [
        { nombre: 'Salida del Sol', top: '#050b12', bot: '#0e2236', neb: ['38,72,120', '22,52,96', '52,94,150'], dens: 1.0, astros: 0, ast: 0.15, sol: true },
        { nombre: 'Mercurio', top: '#160f0c', bot: '#3a2a1c', neb: ['96,72,50', '128,96,64', '70,52,38'], dens: 1.0, astros: 0, ast: 0.35 },
        { nombre: 'Venus', top: '#170f08', bot: '#4a3016', neb: ['150,106,52', '184,128,60', '112,78,44'], dens: 1.05, astros: 0, ast: 0.2 },
        { nombre: 'Tierra', top: '#040c16', bot: '#0e2c44', neb: ['40,96,150', '28,64,118', '56,120,168'], dens: 1.15, astros: 0, ast: 0.2 },
        { nombre: 'Marte', top: '#12080a', bot: '#3c140e', neb: ['140,64,48', '96,44,36', '168,96,66'], dens: 1.0, astros: 0, ast: 0.2 },
        { nombre: 'Cinturón de Asteroides', top: '#0b0e12', bot: '#2a2f26', neb: ['92,102,78', '70,80,62', '118,122,96'], dens: 1.1, astros: 0, ast: 1.7 },
        { nombre: 'Júpiter', top: '#0d0a06', bot: '#3c2a10', neb: ['140,110,60', '180,140,74', '104,84,52'], dens: 1.1, astros: 0, ast: 0.2 },
        { nombre: 'Saturno', top: '#0c0b07', bot: '#3a3318', neb: ['170,160,110', '140,132,84', '196,186,128'], dens: 1.0, astros: 0, ast: 0.2 },
        { nombre: 'Urano', top: '#031015', bot: '#0c3340', neb: ['54,150,166', '40,120,140', '72,178,184'], dens: 1.1, astros: 0.4, ast: 0.15 },
        { nombre: 'Afueras Heladas', top: '#040615', bot: '#101a3c', neb: ['58,84,160', '38,58,130', '80,100,190'], dens: 1.2, astros: 0.7, ast: 0.2 }
    ];

    const DIFICULTADES = [
        { foco: 1.55, vida: 20, vel: 0.8, naves: 5, bala: 0.55, naveFuego: 7, bh: 7, salto: { planeta: 4, cometa: 7, nave: 9, ast: 6, bh: 10 } },
        { foco: 1.15, vida: 16, vel: 1.0, naves: 3, bala: 1.0, naveFuego: 5, bh: 5, salto: { planeta: 3.6, cometa: 6, nave: 7, ast: 5, bh: 8 } },
        { foco: 0.85, vida: 12, vel: 1.25, naves: 1, bala: 1.5, naveFuego: 4, bh: 3, salto: { planeta: 3, cometa: 5, nave: 6, ast: 4, bh: 6 } }
    ];

    const COSMETICOS = [
        { id: 'clasico', nombre: 'Clásico Fundacite', costo: 0, desc: 'Anillo verde oficial con cruces de mira.' },
        { id: 'dorado', nombre: 'Dorado institucional', costo: 50, desc: 'Doble aro dorado con puntos tricolor.' },
        { id: 'acero', nombre: 'Acero orbital', costo: 120, desc: 'Mira angular cian para veteranos.' },
        { id: 'tricolor', nombre: 'Tricolor nacional', costo: 220, desc: 'Arcos amarillo, azul y rojo rotatorios.' }
    ];

    const MEDALLAS = [
        { id: 'primera', nombre: 'Primera Luz', desc: 'Captura tu primer planeta', icono: '🔦' },
        { id: 'perfecto', nombre: 'Foco Perfecto', desc: 'Logra 5 capturas perfectas', icono: '⭕' },
        { id: 'cometa', nombre: 'Cazador de Cometas', desc: 'Atrapa 10 cometas', icono: '☄️' },
        { id: 'combo8', nombre: 'Imparable', desc: 'Alcanza un combo de 8', icono: '🔥' },
        { id: 'coleccion', nombre: 'Coleccionista', desc: 'Desbloquea los 8 planetas', icono: '📦' },
        { id: 'odisea', nombre: 'Odisea Completa', desc: 'Termina las 10 etapas', icono: '🌌' },
        { id: 'sombrero', nombre: 'Robacorazones', desc: 'Captura un planeta junto a un agujero negro', icono: '🕳️' },
        { id: 'metros', nombre: 'Viajero del Cielo', desc: 'Acumula 10 000 metros recorridos', icono: '🚀' }
    ];

    // ---------------- Persistencia ----------------
    function savePorDefecto() {
        return {
            version: 2,
            record: { 0: 0, 1: 0, 2: 0 },
            total: 0, partidas: 0, estrellas: 0, metros: 0,
            trofeos: {}, medallas: {}, cosmeticos: { clasico: true },
            elegido: 'clasico', mejorCombo: 0, cometas: 0, perfectas: 0
        };
    }
    function loadSave() {
        let s = savePorDefecto();
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) {
                const j = JSON.parse(raw);
                if (j && typeof j === 'object') {
                    s = Object.assign(s, j);
                    s.record = Object.assign({ 0: 0, 1: 0, 2: 0 }, j.record || {});
                    s.trofeos = j.trofeos || {};
                    s.medallas = j.medallas || {};
                    s.cosmeticos = Object.assign({ clasico: true }, j.cosmeticos || {});
                }
            }
        } catch (e) { /* guardado dañado: empezar de cero */ }
        // Migrar trofeos del juego clásico.
        try {
            const old = JSON.parse(localStorage.getItem(LEGACY_TROFEOS) || '{}');
            Object.keys(old).forEach((k) => { if (old[k]) s.trofeos[k] = true; });
            for (let i = 0; i < 3; i++) {
                const r = parseInt(localStorage.getItem(LEGACY_RECORD + i), 10) || 0;
                s.record[i] = Math.max(s.record[i], r);
            }
        } catch (e) { /* sin datos previos */ }
        return s;
    }
    let save = loadSave();
    function persistir() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* sin almacenamiento */ }
    }
    function darMedalla(id) {
        if (!save.medallas[id]) {
            save.medallas[id] = true;
            persistir();
            banner('Medalla obtenida: ' + (MEDALLAS.find((m) => m.id === id) || {}).nombre + ' ' + (MEDALLAS.find((m) => m.id === id) || {}).icono, [217, 183, 90]);
            return true;
        }
        return false;
    }
    function sincronizarColeccionDOM() {
        const grid = $('trophy-shelf-grid');
        if (!grid) return;
        grid.querySelectorAll('.trophy-planet-item').forEach((el) => {
            const nombre = el.getAttribute('data-planeta') || el.id.replace('trophy-', '');
            const ok = !!save.trofeos[nombre];
            el.classList.toggle('unlocked', ok);
            const st = el.querySelector('.trophy-planet-status');
            if (st) st.textContent = ok ? '¡Capturado!' : 'Bloqueado';
        });
        const line = $('game-stats');
        const libres = Object.values(save.trofeos).filter(Boolean).length;
        if (line) {
            line.innerHTML =
                '<span class="stat-pill">⭐ ' + save.estrellas + '</span>' +
                '<span class="stat-pill">📦 ' + libres + ' / ' + PLANETAS.length + '</span>' +
                '<span class="stat-pill">🚀 ' + (save.metros || 0).toLocaleString('es-VE') + ' m</span>' +
                '<span class="stat-pill">🏅 ' + Object.values(save.medallas).filter(Boolean).length + ' / ' + MEDALLAS.length + '</span>';
        }
    }

    // ---------------- Audio sintetizado ----------------
    let SND = localStorage.getItem(SONIDO_KEY) !== '0';
    let AC = null;
    function acSafe() {
        try {
            if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
            if (AC.state === 'suspended') AC.resume();
        } catch (e) { /* sin audio */ }
    }
    function tono(freq, dur, vol, slide, delay, tipo) {
        if (!SND) return;
        acSafe();
        try {
            const t = AC.currentTime + (delay || 0);
            const o = AC.createOscillator(), g = AC.createGain();
            o.type = tipo || 'sine';
            o.frequency.setValueAtTime(freq, t);
            if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(24, freq + slide), t + dur / 1000);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur / 1000);
            o.connect(g); g.connect(AC.destination);
            o.start(t); o.stop(t + dur / 1000 + 0.03);
        } catch (e) { /* ignorar */ }
    }
    function ruido(dur, vol, freqCorte) {
        if (!SND) return;
        acSafe();
        try {
            const t = AC.currentTime;
            const n = AC.sampleRate * dur / 1000 | 0;
            const buf = AC.createBuffer(1, Math.max(1, n), AC.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
            const src = AC.createBufferSource(); src.buffer = buf;
            const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freqCorte || 1200;
            const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / 1000);
            src.connect(f); f.connect(g); g.connect(AC.destination);
            src.start(t);
        } catch (e) { /* ignorar */ }
    }
    const S = {
        captura() { tono(523, 120, 0.4); tono(659, 130, 0.32, 0, 0.07); tono(784, 220, 0.3, 0, 0.14); },
        perfecto() { [587, 740, 880, 1175].forEach((f, i) => tono(f, 200, 0.3, 0, i * 0.06)); },
        fuga() { tono(320, 380, 0.4, -140); },
        devorado() { tono(130, 500, 0.5, -70); tono(60, 700, 0.4, -30, 0.05); },
        dano() { ruido(220, 0.5, 900); tono(160, 260, 0.45, -90); },
        clic() { tono(740, 45, 0.3); },
        acierto() { tono(560, 60, 0.25, 90); },
        aciertoHi() { tono(880, 60, 0.28, 120); },
        cometa() { tono(620, 120, 0.35, 260); tono(1240, 180, 0.28, 0, 0.07); },
        nave() { tono(200, 160, 0.4, -90); tono(420, 120, 0.25, 0, 0.06); },
        naveMuere() { tono(300, 260, 0.4, -220); },
        disparo() { tono(880, 90, 0.22, -320, 0, 'sawtooth'); },
        power() { [660, 990, 1320].forEach((f, i) => tono(f, 140, 0.3, 0, i * 0.05)); },
        cambio() { tono(220, 500, 0.35, 160); tono(330, 600, 0.25, 180, 0.12); },
        over() { [330, 262, 208, 156].forEach((f, i) => tono(f, 340, 0.4, 0, i * 0.22)); }
    };

    const soundBtn = $('game-sound');
    if (soundBtn) {
        soundBtn.textContent = SND ? '♪ Sonido' : '✕ Mudo';
        soundBtn.addEventListener('click', () => {
            SND = !SND;
            try { localStorage.setItem(SONIDO_KEY, SND ? '1' : '0'); } catch (e) { /* noop */ }
            soundBtn.textContent = SND ? '♪ Sonido' : '✕ Mudo';
            if (SND) acSafe();
        });
    }
    const fullBtn = $('game-fullscreen');
    if (fullBtn) fullBtn.addEventListener('click', toggledFull);

    function toggledFull() {
        if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
        else if (wrap.requestFullscreen) { wrap.requestFullscreen().catch(() => {}); }
    }

    // ---------------- Escala / vista ----------------
    let cssW = 0, cssH = 0, dpr = 1, scale = 1, ox = 0, oy = 0;
    let uiK = 1;
    function scl() { return uiK; }
    function fit() {
        const r = wrap.getBoundingClientRect();
        dpr = Math.min(2, window.devicePixelRatio || 1);
        cssW = Math.max(120, r.width); cssH = Math.max(120, r.height);
        canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
        scale = Math.min(cssW / VW, cssH / VH);
        ox = (cssW - VW * scale) / 2; oy = (cssH - VH * scale) / 2;
        uiK = Math.max(1, Math.min(2.0, 0.85 / Math.max(0.32, scale)));
    }
    function mundo() {
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
        if (sacudida > 0) {
            ctx.translate((Math.random() - 0.5) * sacudida, (Math.random() - 0.5) * sacudida);
        }
    }
    function toMundo(cx, cy) {
        const r = canvas.getBoundingClientRect();
        return { x: (cx - r.left - ox) / scale, y: (cy - r.top - oy) / scale };
    }
    function redondeado(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // ---------------- Entrada ----------------
    const puntero = { x: VW / 2, y: VH / 2, abajo: false, dentro: false, hoverX: 0, hoverY: 0 };
    const teclas = {};
    wrap.addEventListener('pointermove', (e) => {
        const m = toMundo(e.clientX, e.clientY);
        puntero.hoverX = m.x; puntero.hoverY = m.y;
        if (puntero.abajo) { puntero.x = m.x; puntero.y = m.y; }
    });
    wrap.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const m = toMundo(e.clientX, e.clientY);
        puntero.hoverX = m.x; puntero.hoverY = m.y;
        puntero.x = m.x; puntero.y = m.y;
        puntero.abajo = true;
        wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId);
    });
    ['pointerup', 'pointercancel'].forEach((ev) => wrap.addEventListener(ev, () => { puntero.abajo = false; }));
    window.addEventListener('keydown', (e) => {
        teclas[e.code] = true;
        if (e.code === 'Space') e.preventDefault();
        if (e.code === 'KeyF') toggledFull();
        if (e.code === 'KeyP' && estado === 'juego') estado = 'pausa';
        else if (e.code === 'KeyP' && estado === 'pausa') estado = 'juego';
        if (e.code === 'KeyM') toggleSonido();
        if (e.code === 'Escape' && estado === 'pausa') estado = 'juego';
    });
    window.addEventListener('keyup', (e) => { teclas[e.code] = false; });
    function toggleSonido() {
        SND = !SND;
        try { localStorage.setItem(SONIDO_KEY, SND ? '1' : '0'); } catch (e) { /* noop */ }
        if (soundBtn) soundBtn.textContent = SND ? '♪ Sonido' : '✕ Mudo';
        if (SND) acSafe();
    }

    // ---------------- Estado global ----------------
    let estado = 'menu';
    let menuPanel = 'main';
    let difIdx = 1;
    let tiempo = 0, ultimo = 0, frames = 0;
    let sacudida = 0;
    let partida = null;
    let estrellasFondo = [], nebulas = [], fugaces = [];
    let escenaIdx = 0;

    // ---------------- Particulas ----------------
    const particulas = [];
    function pfx(x, y, vx, vy, vida, tam, color, tipo) {
        particulas.push({ x, y, vx, vy, vida, max: vida, tam, color, tipo: tipo || 'punto', ag: Math.random() * TAU });
    }
    function explosion(x, y, n, colores, vel) {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * TAU, v = (40 + Math.random() * (vel || 220));
            pfx(x, y, Math.cos(a) * v, Math.sin(a) * v, 0.4 + Math.random() * 0.6, 1.5 + Math.random() * 3, colores[Math.floor(Math.random() * colores.length)]);
        }
    }
    function anilloOnda(x, y, radio, color, vida) {
        particulas.push({ x, y, vx: 0, vy: 0, vida: vida || 0.7, max: vida || 0.7, tam: radio, color, tipo: 'onda' });
    }
    function actualizarParticulas(dt) {
        for (let i = particulas.length - 1; i >= 0; i--) {
            const p = particulas[i];
            p.vida -= dt;
            if (p.vida <= 0) { particulas.splice(i, 1); continue; }
            if (p.tipo === 'onda') continue;
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.vx *= (1 - dt * 1.6); p.vy *= (1 - dt * 1.6);
        }
    }
    function dibujarParticulas() {
        for (const p of particulas) {
            const a = Math.max(0, p.vida / p.max);
            ctx.globalAlpha = a;
            if (p.tipo === 'onda') {
                const rr = p.tam + (1 - a) * 220;
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 3 * a + 1;
                ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.stroke();
            } else if (p.tipo === 'chispa') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045);
                ctx.stroke();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.tam * (0.4 + 0.6 * a), 0, TAU); ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    // ---------------- Textos flotantes ----------------
    let flotantes = [];
    function flotar(texto, color, x, y, tam) {
        flotantes.push({ texto, color, x, y, tam: tam || 22, vida: 1.5, max: 1.5 });
    }
    function actualizarFlotantes(dt) {
        for (let i = flotantes.length - 1; i >= 0; i--) {
            const f = flotantes[i];
            f.vida -= dt; f.y -= 34 * dt;
            if (f.vida <= 0) flotantes.splice(i, 1);
        }
    }
    function dibujarFlotantes() {
        ctx.textAlign = 'center';
        for (const f of flotantes) {
            const a = Math.min(1, f.vida / (f.max * 0.6));
            ctx.globalAlpha = a;
            ctx.font = '700 ' + f.tam + 'px "Space Grotesk", sans-serif';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 4;
            ctx.strokeText(f.texto, f.x, f.y);
            ctx.fillStyle = f.color;
            ctx.fillText(f.texto, f.x, f.y);
        }
        ctx.globalAlpha = 1;
    }

    // ---------------- Banner general ----------------
    let bannerTxt = '', bannerT = 0, bannerColor = [255, 255, 255];
    function banner(texto, color) {
        bannerTxt = texto; bannerT = 2.6; bannerColor = color || [255, 255, 255];
    }

    // ---------------- Fondo estelar ----------------
    function hacerEstrella() {
        return { x: Math.random() * VW, y: Math.random() * VH, r: Math.random() * 1.8 + 0.4, f: Math.random() * TAU, v: 1 + Math.random() * 2.2, capa: Math.random() };
    }
    function hacerNebula(esc) {
        const col = esc.neb[Math.floor(Math.random() * esc.neb.length)];
        return { x: Math.random() * VW, y: Math.random() * VH, r: 120 + Math.random() * 190, col, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4, f: Math.random() * TAU };
    }
    function aplicarEscena(idx) {
        escenaIdx = idx;
        const esc = ETAPAS[idx];
        estrellasFondo = [];
        for (let i = 0; i < Math.round(esc.dens * 170); i++) estrellasFondo.push(hacerEstrella());
        nebulas = [];
        for (let i = 0; i < 4; i++) nebulas.push(hacerNebula(esc));
    }
    function dibujarFondo() {
        const esc = ETAPAS[escenaIdx];
        const grad = ctx.createLinearGradient(0, 0, 0, VH);
        grad.addColorStop(0, esc.top); grad.addColorStop(1, esc.bot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, VW, VH);

        if (esc.sol) {
            const g = ctx.createRadialGradient(70, 160, 10, 70, 160, 240);
            g.addColorStop(0, 'rgba(255,214,120,0.35)');
            g.addColorStop(0.6, 'rgba(255,160,60,0.12)');
            g.addColorStop(1, 'rgba(255,140,40,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(70, 160, 240, 0, TAU); ctx.fill();
            ctx.fillStyle = '#ffd882';
            ctx.beginPath(); ctx.arc(70, 160, 26, 0, TAU); ctx.fill();
            ctx.fillStyle = '#fff2cf';
            ctx.beginPath(); ctx.arc(70, 160, 13, 0, TAU); ctx.fill();
        }

        for (const n of nebulas) {
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            g.addColorStop(0, 'rgba(' + n.col + ',0.24)');
            g.addColorStop(1, 'rgba(' + n.col + ',0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, TAU); ctx.fill();
        }
        for (const e of estrellasFondo) {
            const b = 0.55 + 0.45 * Math.sin(e.f + frames * 0.04 * e.v);
            ctx.globalAlpha = 0.35 + 0.65 * b;
            ctx.fillStyle = e.capa > 0.7 ? '#ffe9c4' : '#ffffff';
            ctx.beginPath(); ctx.arc(e.x, e.y, e.r * (0.65 + 0.45 * b), 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (const f of fugaces) {
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - f.vx * 0.12, f.y - f.vy * 0.12); ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(f.x, f.y, 1.8, 0, TAU); ctx.fill();
        }
    }
    function actualizarFondo(dt) {
        for (const n of nebulas) {
            n.x += n.dx * dt; n.y += n.dy * dt;
            if (n.x < -n.r) n.x += VW + n.r * 2; if (n.x > VW + n.r) n.x -= VW + n.r * 2;
            if (n.y < -n.r) n.y += VH + n.r * 2; if (n.y > VH + n.r) n.y -= VH + n.r * 2;
        }
        if (Math.random() < dt * 0.4) {
            fugaces.push({ x: VW * (0.3 + Math.random() * 0.6), y: Math.random() * VH * 0.4, vx: -(180 + Math.random() * 150), vy: 100 + Math.random() * 80, vida: 1 });
        }
        for (let i = fugaces.length - 1; i >= 0; i--) {
            const f = fugaces[i];
            f.x += f.vx * dt; f.y += f.vy * dt; f.vida -= dt;
            if (f.vida <= 0 || f.x < -40) fugaces.splice(i, 1);
        }
    }

    // ---------------- Asteroides decorativos ----------------
    let asteroides = [];
    function crearAsteroide() {
        const r = 3 + Math.random() * 8;
        const v = [];
        const n = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) {
            const a = i / n * TAU + Math.random() * 0.7;
            v.push({ x: Math.cos(a) * r * (0.7 + Math.random() * 0.5), y: Math.sin(a) * r * (0.7 + Math.random() * 0.5) });
        }
        return { x: Math.random() * VW, y: Math.random() * VH, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 1.6, vx: (Math.random() - 0.5) * 26, vy: (Math.random() - 0.5) * 26, r, v, tono: 96 + Math.floor(Math.random() * 50) };
    }
    function actualizarAsteroides(dt, peligros) {
        for (let i = asteroides.length - 1; i >= 0; i--) {
            const a = asteroides[i];
            a.x += a.vx * dt; a.y += a.vy * dt; a.rot += a.vr * dt;
            if (a.x < -30) a.x += VW + 60; if (a.x > VW + 30) a.x -= VW + 60;
            if (a.y < -30) a.y += VH + 60; if (a.y > VH + 30) a.y -= VH + 60;
            if (peligros && partida) {
                const dx = a.x - partida.tubo.x, dy = a.y - partida.tubo.y;
                const d = Math.hypot(dx, dy);
                if (d < a.r + 11) {
                    if (partida.inmune <= 0) { golpear(a.r > 8 ? 9 : 16); }
                    a.vx = (a.x - partida.tubo.x) * 6; a.vy = (a.y - partida.tubo.y) * 6;
                }
            }
        }
    }
    function dibujarAsteroides() {
        for (const a of asteroides) {
            ctx.save();
            ctx.translate(a.x, a.y); ctx.rotate(a.rot);
            ctx.beginPath();
            a.v.forEach((v, i) => { if (i) ctx.lineTo(v.x, v.y); else ctx.moveTo(v.x, v.y); });
            ctx.closePath();
            ctx.fillStyle = 'rgb(' + a.tono + ',' + Math.floor(a.tono * 0.85) + ',' + Math.floor(a.tono * 0.68) + ')';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,235,200,0.16)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();
        }
    }

    // ---------------- Telescopio / Sonda ----------------
    function dibujarVistaTelescopio(x, y) {
        const cosm = COSMETICOS.find((c) => c.id === save.elegido) || COSMETICOS[0];
        const id = cosm.id;
        const r = (34 + Math.sin(frames * 0.05) * 2) * Math.max(1, Math.min(1.5, uiK));
        if (id === 'clasico' || id === 'dorado') {
            ctx.strokeStyle = id === 'dorado' ? 'rgba(217,183,90,0.95)' : 'rgba(38,190,110,0.95)';
            ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
            if (id === 'dorado') {
                ctx.strokeStyle = 'rgba(232,184,75,0.5)';
                ctx.lineWidth = 1.4;
                ctx.beginPath(); ctx.arc(x, y, r + 7, frames * 0.02, TAU); ctx.stroke();
                const paso = TAU / 3;
                for (let i = 0; i < 3; i++) {
                    const a = i * paso + frames * 0.008;
                    ctx.fillStyle = ['#e8b84b', '#2e6fb0', '#c34a3c'][i];
                    ctx.beginPath(); ctx.arc(x + Math.cos(a) * (r + 3.5), y + Math.sin(a) * (r + 3.5), 2.4, 0, TAU); ctx.fill();
                }
            }
        } else if (id === 'acero') {
            ctx.strokeStyle = 'rgba(120,220,210,0.9)';
            ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
            for (let i = 0; i < 4; i++) {
                const a0 = i * (TAU / 4);
                const a1 = a0 + TAU / 16;
                ctx.strokeStyle = 'rgba(120,220,210,0.85)';
                ctx.lineWidth = 2.2;
                ctx.beginPath(); ctx.arc(x, y, r, a0 + frames * 0.01, a1 + frames * 0.01); ctx.stroke();
            }
        } else {
            const cols = ['#e8b84b', '#2e6fb0', '#c34a3c'];
            const an = (TAU / 3) * 0.85;
            for (let i = 0; i < 3; i++) {
                const a0 = i * (TAU / 3) + frames * 0.01;
                ctx.strokeStyle = cols[i];
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(x, y, r, a0, a0 + an); ctx.stroke();
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(x, y, r + 6, 0, TAU); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - r - 8, y); ctx.lineTo(x - r - 2, y);
        ctx.moveTo(x + r + 2, y); ctx.lineTo(x + r + 8, y);
        ctx.moveTo(x, y - r - 8); ctx.lineTo(x, y - r - 2);
        ctx.moveTo(x, y + r + 2); ctx.lineTo(x, y + r + 8);
        ctx.stroke();
        const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
        g.addColorStop(0, 'rgba(255,255,255,0.98)');
        g.addColorStop(1, 'rgba(120,255,200,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(190,255,220,0.95)';
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
    }

    // ---------------- Planeta (objetivo) ----------------
    function crearPlaneta(idxPlaneta) {
        const d = PLANETAS[Math.min(7, Math.max(0, idxPlaneta))];
        const vel = (34 + Math.random() * 22) * DIFICULTADES[difIdx].vel;
        const rumbo = Math.random() * TAU;
        const radioMul = partida && partida.etapa >= 9 ? 0.9 : 1;
        return {
            nombre: d.nombre, datos: d,
            x: VW * (0.15 + Math.random() * 0.7), y: VH * (0.18 + Math.random() * 0.64),
            vx: Math.cos(rumbo) * vel, vy: Math.sin(rumbo) * vel,
            radio: d.radio * radioMul * uiK, foco: 0, enfocando: 0,
            pulso: Math.random() * TAU, dfase: Math.random() * TAU,
            vida: Math.max(DIFICULTADES[difIdx].vida - (partida ? partida.etapa : 0) * 0.6, 4),
            estado: 'activo', perfecto: true
        };
    }
    function dibujarPlaneta(pl) {
        const { x, y, radio: r } = pl, d = pl.datos;
        const fugando = pl.estado === 'escapado';
        if (fugando) ctx.globalAlpha = Math.max(0, Math.min(1, (pl.fugaT || 0) * 0.85));
        // Resplandor exterior
        for (let i = 5; i >= 1; i--) {
            ctx.fillStyle = 'rgba(' + d.color[0] + ',' + d.color[1] + ',' + d.color[2] + ',' + (0.17 - i * 0.018) + ')';
            ctx.beginPath(); ctx.arc(x, y, r + i * 7 + Math.sin(pl.pulso * 3) * 2, 0, TAU); ctx.fill();
        }
        // Halo luminoso tipo Sol para que el planeta no pase desapercibido
        const halo = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.6);
        halo.addColorStop(0, 'rgba(' + d.color[0] + ',' + d.color[1] + ',' + d.color[2] + ',0.55)');
        halo.addColorStop(0.55, 'rgba(' + d.color[0] + ',' + d.color[1] + ',' + d.color[2] + ',0.16)');
        halo.addColorStop(1, 'rgba(' + d.color[0] + ',' + d.color[1] + ',' + d.color[2] + ',0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill();
        // Cuerpo: primero sólido (garantiza visibilidad si fallara el gradiente) y luego degradado
        ctx.fillStyle = 'rgb(' + d.color[0] + ',' + d.color[1] + ',' + d.color[2] + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        const grad = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.55)');
        grad.addColorStop(0.45, 'rgb(' + d.color[0] + ',' + d.color[1] + ',' + d.color[2] + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0.75)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();

        if (d.anillos) {
            const rx = r * 1.9, ry = r * 0.6;
            const incl = d.inclinado ? -0.25 : 0.42;
            const ca = Math.cos(incl), sa = Math.sin(incl);
            for (const f of [1.0, 0.84]) {
                ctx.fillStyle = 'rgba(230,214,170,0.85)';
                for (let i = 0; i < 54; i++) {
                    const a = i / 54 * TAU;
                    const ux = Math.cos(a) * rx * f, uy = Math.sin(a) * ry * f;
                    if (uy > 0) continue;
                    const px = x + ux * ca - uy * sa, py = y + ux * sa + uy * ca;
                    ctx.beginPath(); ctx.arc(px, py, f * 2.1, 0, TAU); ctx.fill();
                }
            }
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
            // Re-color body over shadow
            const g2 = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
            g2.addColorStop(0, 'rgba(255,255,255,0.5)');
            g2.addColorStop(0.5, 'rgb(' + d.color[0] + ',' + d.color[1] + ',' + d.color[2] + ')');
            g2.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = g2;
            ctx.beginPath(); ctx.arc(x, y, r * 0.96, 0, TAU); ctx.fill();
            for (const f of [1.0, 0.84]) {
                ctx.fillStyle = 'rgba(240,228,185,0.8)';
                for (let i = 0; i < 54; i++) {
                    const a = i / 54 * TAU;
                    const ux = Math.cos(a) * rx * f, uy = Math.sin(a) * ry * f;
                    if (uy < 0) continue;
                    const px = x + ux * ca - uy * sa, py = y + ux * sa + uy * ca;
                    ctx.beginPath(); ctx.arc(px, py, f * 2.1, 0, TAU); ctx.fill();
                }
            }
        }

        if (d.bandas) {
            ctx.strokeStyle = 'rgba(40,26,12,0.5)';
            for (const [yo, hi] of [[0.28, 0.16], [0.5, 0.12], [0.72, 0.12]]) {
                const off = r * yo, hw = Math.sqrt(Math.max(0, r * r - off * off));
                ctx.lineWidth = Math.max(1.6, r * hi);
                ctx.beginPath(); ctx.moveTo(x - hw, y + off); ctx.lineTo(x + hw, y + off); ctx.stroke();
            }
            ctx.strokeStyle = 'rgba(255,235,190,0.28)';
            for (const [yo, hi] of [[0.42, 0.08], [0.86, 0.07]]) {
                const off = r * yo, hw = Math.sqrt(Math.max(0, r * r - off * off));
                ctx.lineWidth = Math.max(1.3, r * hi);
                ctx.beginPath(); ctx.moveTo(x - hw, y + off); ctx.lineTo(x + hw, y + off); ctx.stroke();
            }
        }
        if (d.craters) {
            for (let i = 0; i < 7; i++) {
                const ca = pl.pulso * 0.3 + i * 2.7, cd = r * (0.25 + (i % 3) * 0.2);
                const cx = x + Math.cos(ca) * cd * 0.8, cy = y + Math.sin(ca * 1.3) * cd * 0.7;
                ctx.fillStyle = 'rgba(0,0,0,0.28)';
                ctx.beginPath(); ctx.arc(cx, cy, 1.3 + d.craters * 1.8, 0, TAU); ctx.fill();
            }
        }
        if (d.casquete) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath(); ctx.arc(x, y - r * 0.85, r * 0.4, 0, TAU); ctx.fill();
        }
        if (d.mancha) {
            const mx = x + r * 0.28, my = y + r * 0.4;
            ctx.fillStyle = d.nombre === 'Júpiter' ? 'rgba(180,70,40,0.9)' : 'rgba(20,20,70,0.9)';
            ctx.beginPath(); ctx.ellipse(mx, my, r * 0.22, r * 0.12, -0.2, 0, TAU); ctx.fill();
        }
        if (d.luna) {
            const la = pl.pulso * 1.4;
            const lx = x + Math.cos(la) * (r + 9), ly = y + Math.sin(la) * (r + 9);
            ctx.fillStyle = '#cfcfd4';
            ctx.beginPath(); ctx.arc(lx, ly, 3, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(90,90,100,0.5)';
            ctx.beginPath(); ctx.arc(lx + 1, ly + 1, 1, 0, TAU); ctx.fill();
        }
        // Borde atmosférico
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
        if (fugando) ctx.globalAlpha = 1;
    }
    function dibujarAnilloFoco(pl) {
        if (pl.estado !== 'activo') return;
        const rr = (pl.radio + 34) * uiK;
        const ag = frames * 0.025;
        ctx.strokeStyle = 'rgba(217,183,90,0.55)';
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(pl.x, pl.y, rr, 0, TAU); ctx.stroke();
        // Pulso expansivo para llamar la atención sobre el objetivo
        const pp = (frames / 60 + pl.dfase) % 1;
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * (1 - pp)).toFixed(3) + ')';
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(pl.x, pl.y, rr * 0.5 + pp * rr * 0.85, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(232,200,120,0.95)';
        ctx.lineWidth = 3.2;
        const prog = Math.max(0.06, pl.foco);
        ctx.beginPath(); ctx.arc(pl.x, pl.y, rr, -Math.PI / 2 + ag, -Math.PI / 2 + ag + TAU * prog); ctx.stroke();
        if (pl.foco > 0.12) {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(pl.x, pl.y, rr - 6 - (pl.foco > 0.5 ? 4 : 0), 0, TAU); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,245,210,0.95)';
        ctx.font = '800 ' + Math.round(15 * uiK) + 'px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pl.nombre.toUpperCase(), pl.x, pl.y - rr - 9);
        const vp = Math.max(0, pl.vida);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '600 ' + Math.round(11 * uiK) + 'px "IBM Plex Mono", monospace';
        ctx.fillText((vp).toFixed(1) + ' s', pl.x, pl.y + rr + 16);
    }
    function actualizarPlaneta(pl, dt) {
        pl.pulso += dt; pl.dfase += dt * 1.4;
        pl.vx += Math.sin(pl.dfase) * 260 * dt * DIFICULTADES[difIdx].vel;
        pl.vy += Math.cos(pl.dfase * 1.3) * 260 * dt * DIFICULTADES[difIdx].vel;
        const velMax = (DIFICULTADES[difIdx].vel * 160);
        const rap = Math.hypot(pl.vx, pl.vy);
        if (rap > velMax) { const f = velMax / rap; pl.vx *= f; pl.vy *= f; }
        pl.vx += (Math.random() - 0.5) * 30 * dt;
        for (const bh of partida.agujeros) {
            bhTirar(bh, pl, dt);
            const d = Math.hypot(pl.x - bh.x, pl.y - bh.y);
            if (pl.estado === 'activo' && d < bh.radio + pl.radio + 4) { pl.estado = 'devorado'; }
        }
        if (pl.estado === 'activo') {
            pl.vida -= dt;
            if (pl.vida <= 0) { pl.estado = 'escapado'; pl.fugaT = 1.2; S.fuga(); }
        } else {
            if (pl.foco > 0) pl.foco = Math.max(0, pl.foco - dt * 2);
            if (pl.fugaT > 0) pl.fugaT -= dt;
        }
        pl.x += pl.vx * dt; pl.y += pl.vy * dt;
        const mg = 58;
        if (pl.x < mg) { pl.x = mg; pl.vx = Math.abs(pl.vx); }
        else if (pl.x > VW - mg) { pl.x = VW - mg; pl.vx = -Math.abs(pl.vx); }
        if (pl.y < mg) { pl.y = mg; pl.vy = Math.abs(pl.vy); }
        else if (pl.y > VH - mg) { pl.y = VH - mg; pl.vy = -Math.abs(pl.vy); }
    }

    // ---------------- Agujeros negros ----------------
    function crearAgujero() {
        return { x: VW * (0.2 + Math.random() * 0.6), y: VH * (0.18 + Math.random() * 0.5), radio: 26, masa: 340, pullR: 230, pulso: Math.random() * TAU };
    }
    function bhTirar(b, o, dt) {
        const dx = b.x - o.x, dy = b.y - o.y;
        const d = Math.hypot(dx, dy);
        if (d < b.pullR && d > 0.01) {
            const f = b.masa * (1 - d / b.pullR * 0.86) * dt * 0.006 * DIFICULTADES[difIdx].vel;
            o.vx += (dx / d) * f;
            o.vy += (dy / d) * f;
            o.vx += (-dy / d) * f * 0.8;
            o.vy += (dx / d) * f * 0.8;
        }
    }
    function dibujarAgujero(b) {
        const r = b.radio, x = b.x, y = b.y;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.6);
        g.addColorStop(0, 'rgba(14,6,34,0.9)');
        g.addColorStop(1, 'rgba(120,40,160,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r * 3.6, 0, TAU); ctx.fill();
        for (let k = 0; k < 3; k++) {
            ctx.save();
            ctx.translate(x, y); ctx.rotate(b.pulso * (0.5 + k * 0.3) + k * 2);
            ctx.strokeStyle = k === 1 ? 'rgba(255,196,90,0.85)' : 'rgba(200,120,220,0.5)';
            ctx.lineWidth = 3 - k;
            ctx.beginPath(); ctx.ellipse(0, 0, r * (2.2 - k * 0.5), r * (0.8 - k * 0.2), 0, 0, TAU * 0.72); ctx.stroke();
            ctx.restore();
        }
        ctx.fillStyle = 'rgb(7,5,13)';
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(x - r * 0.22, y - r * 0.22, r * 0.28, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(220,155,255,0.85)';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(x, y, r + 10, 0, TAU); ctx.stroke();
    }

    // ---------------- Cometas ----------------
    function crearCometa() {
        const dir = Math.random() < 0.5 ? 1 : -1;
        return {
            x: dir === 1 ? -30 : VW + 30, y: VH * (0.14 + Math.random() * 0.6),
            vx: dir * (140 + Math.random() * 90), vy: Math.random() * 160 - 80,
            r: 9, vida: 7, pulso: Math.random() * TAU, capturado: false
        };
    }
    function dibujarCometa(c) {
        const a = Math.atan2(c.vy, c.vx);
        const lx = Math.cos(a + Math.PI), ly = Math.sin(a + Math.PI);
        const g = ctx.createLinearGradient(c.x + lx * 70, c.y + ly * 70, c.x, c.y);
        g.addColorStop(0, 'rgba(150,220,255,0)');
        g.addColorStop(1, 'rgba(205,242,255,0.9)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(c.x + lx * 70, c.y + ly * 70); ctx.lineTo(c.x, c.y); ctx.stroke();
        ctx.fillStyle = 'rgba(230,250,255,0.95)';
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, TAU); ctx.fill();
    }

    // ---------------- Naves hostiles ----------------
    function crearNave() {
        const dir = Math.random() < 0.5 ? 1 : -1;
        return {
            x: dir === 1 ? -40 : VW + 40, y: VH * (0.16 + Math.random() * 0.66),
            vx: dir * (90 + Math.random() * 50 + escenaIdx * 4), vy: 0,
            r: 11, pulso: Math.random() * TAU, fuegoT: 2 + Math.random() * 3, tipo: Math.random() < 0.35 ? 'nodriza' : 'caza'
        };
    }
    function dibujarNave(n) {
        const blink = (n.pulso * 5) % 1 < 0.55;
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(Math.sin(n.pulso * 1.4) * 0.12);
        const cuerpo = n.tipo === 'nodriza' ? 'rgb(150,184,196)' : 'rgb(132,72,94)';
        ctx.fillStyle = cuerpo;
        ctx.beginPath(); ctx.ellipse(0, 0, n.r * 1.7, n.r * 0.75, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = n.tipo === 'nodriza' ? 'rgb(52,104,128)' : 'rgb(40,58,86)';
        ctx.beginPath(); ctx.arc(0, 0, n.r * 0.7, Math.PI, TAU); ctx.fill();
        ctx.fillStyle = blink ? 'rgb(255,150,150)' : 'rgb(120,42,48)';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.arc(i * n.r * 0.9, n.r * 0.42, 3, 0, TAU); ctx.fill();
        }
        if (n.tipo === 'nodriza') {
            ctx.fillStyle = 'rgb(150,255,175)';
            ctx.beginPath(); ctx.arc(n.r * 0.55, 0, 3.5, 0, TAU); ctx.fill();
        }
        ctx.restore();
    }

    // ---------------- Balas enemigas ----------------
    const balas = [];
    function dispararBala(n) {
        const a = Math.atan2(partida.tubo.y - n.y, partida.tubo.x - n.x);
        balas.push({ x: n.x, y: n.y, vx: Math.cos(a) * 240 * DIFICULTADES[difIdx].bala, vy: Math.sin(a) * 240 * DIFICULTADES[difIdx].bala, r: 5, vida: 6 });
        S.disparo();
    }
    function dibujarBalas() {
        for (const b of balas) {
            ctx.fillStyle = 'rgba(255,120,140,0.4)';
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 5, 0, TAU); ctx.fill();
            ctx.fillStyle = '#ff9f33';
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, TAU); ctx.fill();
        }
    }

    // ---------------- Potenciadores ----------------
    const PODERES = [
        { id: 'turbo', icono: '⚡', color: '#cfc06a', nombre: 'Turbo-enfoque', desc: 'Enfoque ×3 durante 10 s', tiempo: 10 },
        { id: 'escudo', icono: '🛡️', color: '#3fae6a', nombre: 'Escudo', desc: '+1 vida inmediata', tiempo: 0 },
        { id: 'nova', icono: '💥', color: '#f06a4a', nombre: 'Nova', desc: 'Barre naves, balas y asteroides', tiempo: 0 },
        { id: 'congelar', icono: '❄️', color: '#5fb8d8', nombre: 'Criofreno', desc: 'El tiempo se congela 4 s', tiempo: 4 },
        { id: 'magnet', icono: '🧲', color: '#9a7fd0', nombre: 'Imán estelar', desc: 'Atrae cometas y bonificaciones', tiempo: 9 }
    ];
    const powerups = [];
    function soltarPotenciador(x, y) {
        const tipo = PODERES[Math.floor(Math.random() * PODERES.length)];
        powerups.push({ ...tipo, x, y, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, pulso: Math.random() * TAU, vida: 10 });
    }
    function dibujarPotenciador(pu) {
        const bob = Math.sin(pu.pulso * 3) * 4;
        ctx.fillStyle = pu.color + '33';
        ctx.beginPath(); ctx.arc(pu.x, pu.y + bob, 20, 0, TAU); ctx.fill();
        ctx.strokeStyle = pu.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pu.x, pu.y + bob, 13, pu.pulso * 2, pu.pulso * 2 + TAU * 0.75); ctx.stroke();
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(pu.icono, pu.x, pu.y + bob + 1);
        ctx.textBaseline = 'alphabetic';
    }

    // ---------------- Textos UI ----------
    function textoCentro(txt, x, y, tam, color, peso) {
        ctx.font = (peso || 700) + ' ' + tam + 'px "Space Grotesk", sans-serif';
        ctx.fillStyle = color || '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(txt, x, y);
    }

    // ---------------- Botones ----------------
    let botones = [];
    function boton(x, y, w, h, label, fn, opts) {
        botones.push({ x, y, w, h, label, fn, sub: opts && opts.sub, pequeno: (opts && opts.pequeno), activo: (opts && opts.activo) });
    }
    function dibujarBotones() {
        const hx = puntero.hoverX, hy = puntero.hoverY;
        for (const b of botones) {
            const sobre = hx >= b.x && hx <= b.x + b.w && hy >= b.y && hy <= b.y + b.h;
            ctx.save();
            if (!b.sub) {
                ctx.fillStyle = sobre ? 'rgba(120,160,140,0.28)' : 'rgba(255,255,255,0.07)';
                if (b.activo) ctx.fillStyle = 'rgba(184,135,26,0.32)';
                redondeado(b.x, b.y, b.w, b.h, 10); ctx.fill();
                ctx.strokeStyle = b.activo ? 'rgba(232,184,75,0.95)' : (sobre ? 'rgba(217,183,90,0.9)' : 'rgba(255,255,255,0.3)');
                ctx.lineWidth = 1.6;
                redondeado(b.x, b.y, b.w, b.h, 10); ctx.stroke();
            }
            ctx.textAlign = 'center';
            ctx.font = (b.pequeno ? 600 : 700) + ' ' + (b.pequeno ? 14 : 17) + 'px "Space Grotesk", sans-serif';
            ctx.fillStyle = (b.activo && !sobre) ? '#e8b84b' : (sobre ? '#fff' : 'rgba(255,255,255,0.92)');
            ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + (b.pequeno ? 5 : 6));
            ctx.restore();
        }
    }
    function pulsar(x, y) {
        for (const b of botones) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { S.clic(); b.fn(); return; }
        }
        if (estado === 'juego' && x > VW - 46 && y < 46) { estado = 'pausa'; }
    }

    // ---------------- Partida ----------------
    function nuevoJuego() {
        partida = {
            puntos: 0, vidas: 3, combo: 0, comboT: 0, comboMax: 0,
            capturasEtapa: 0, etapa: 0, cuota: 3 + (difIdx === 2 ? 1 : 0),
            planetas: [], cometas: [], naves: [], agujeros: [], powerupsSoltados: [],
            turboT: 0, congelarT: 0, magnetT: 0, inmune: 0,
            tubo: { x: VW / 2, y: VH / 2 },
            capturasTotales: 0, cometasAtrapados: 0, estrellasRun: 0,
            meteos: 0, etapasHechas: 0, pendienteEtapa: false,
            barca: 0
        };
        aplicarEscena(0);
        asteroides = [];
        for (let i = 0; i < Math.round(ETAPAS[0].ast * 26); i++) asteroides.push(crearAsteroide());
        banner('✦ Misión Sistema Solar · ¡Captura los planetas! ✦', [139, 176, 116]);
        for (let i = 0; i < 3; i++) spawnPlaneta(0);
    }

    const OBJETIVO = [0, 0, 1, 2, 3, 3, 4, 5, 6, 7];
    function spawnPlaneta(etapa) {
        const idx = OBJETIVO[Math.min(ETAPAS.length - 1, Math.max(0, etapa))];
        partida.planetas.push(crearPlaneta(idx));
    }
    function avanzarEtapa() {
        const nueva = partida.etapa + 1;
        if (nueva >= ETAPAS.length) { finVictoria(); return; }
        partida.etapa = nueva;
        partida.capturasEtapa = 0;
        partida.cuota = 3 + (difIdx === 2 ? 1 : 0);
        aplicarEscena(nueva);
        asteroides = [];
        for (let i = 0; i < Math.round(ETAPAS[nueva].ast * 26); i++) asteroides.push(crearAsteroide());
        partida.agujeros = [];
        partida.planetas = partida.planetas.filter((pl) => pl.estado === 'activo');
        partida.naves = [];
        balas.length = 0;
        partida.cometas.length = 0;
        powerups.length = 0;
        partida.pendienteEtapa = false;
        for (let i = 0; i < 2; i++) spawnPlaneta(nueva);
        banner('✦ Etapa ' + (nueva + 1) + ' · ' + ETAPAS[nueva].nombre.toUpperCase() + ' ✦', [217, 183, 90]);
        S.cambio();
        venOnda(nueva);
    }
    function venOnda(escIdx) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (estado === 'juego' && partida && partida.etapa === escIdx) {
                    anilloOnda(VW / 2, VH / 2, 60, 'rgba(217,183,90,0.8)', 0.8);
                }
            }, i * 150);
        }
    }

    // ---------------- Captura / daño ----------------
    function capturar(pl) {
        save.total++;
        partida.capturasTotales++;
        partida.capturasEtapa++;
        const mult = 1 + partida.combo * 0.5;
        const base = Math.round(100 * mult * (1 + partida.etapa * 0.14));
        const perfecto = pl.perfecto;
        const ganadas = base + (perfecto ? 60 : 0);
        partida.puntos += ganadas;
        save.estrellas += 1 + (perfecto ? 1 : 0);
        partida.estrellasRun += 1 + (perfecto ? 1 : 0);
        if (perfecto) save.perfectas++;
        partida.combo++;
        partida.comboT = 5;
        if (partida.combo > partida.comboMax) partida.comboMax = partida.combo;
        if (partida.combo >= 8) darMedalla('combo8');
        if (partida.combo > save.mejorCombo) save.mejorCombo = partida.combo;
        if (!save.trofeos[pl.nombre]) {
            save.trofeos[pl.nombre] = true;
            persistir();
            sincronizarColeccionDOM();
        }
        if (Object.values(save.trofeos).filter(Boolean).length >= PLANETAS.length) darMedalla('coleccion');
        darMedalla('primera');
        if (save.perfectas >= 5) darMedalla('perfecto');

        explosion(pl.x, pl.y, 26, ['#fff3c4', '#ffd882', '#ff9f33'], 260);
        anilloOnda(pl.x, pl.y, 8, 'rgba(255,214,120,0.9)', 0.7);
        sacudida = Math.max(sacudida, 5);
        if (perfecto) S.perfecto(); else S.captura();
        flotar('+' + ganadas, '#ffd882', pl.x, pl.y - pl.radio - 8, perfecto ? 28 : 24);
        if (perfecto) flotar('¡FOCO PERFECTO!', '#9ff0c0', pl.x, pl.y - pl.radio - 38, 17);

        partida.barca = { nombre: pl.nombre, t: 4.4, datos: pl.datos, perfecto };
        pl.estado = 'capturado';
        pl.foco = 1;
        if (Math.random() < 0.4) soltarPotenciador(pl.x, pl.y);

        if (partida.capturasEtapa >= partida.cuota) {
            if (!partida.pendienteEtapa) {
                partida.pendienteEtapa = true;
                setTimeout(() => { if (estado === 'juego' && partida && partida.pendienteEtapa) avanzarEtapa(); }, 900);
            }
        } else {
            const activos = partida.planetas.filter((x) => x.estado === 'activo').length;
            if (activos < 3) spawnPlaneta(partida.etapa);
        }
    }
    function golpear(grave) {
        if (partida.inmune > 0) return false;
        partida.vidas--;
        partida.inmune = 1.3;
        sacudida = Math.max(sacudida, grave || 12);
        S.dano();
        barraDaño = 1;
        if (partida.vidas <= 0) { finJuego(); }
        return true;
    }
    let barraDaño = 0;

    // ---------------- Fin de partida ----------------
    function finJuego() {
        estado = 'over';
        S.over();
        save.partidas++;
        if (partida.puntos > save.record[difIdx]) save.record[difIdx] = partida.puntos;
        save.metros = (save.metros || 0) + Math.round(partida.meteos);
        persistir();
        sincronizarColeccionDOM();
    }
    function finVictoria() {
        estado = 'over';
        partida.victoria = true;
        save.partidas++;
        if (partida.puntos > save.record[difIdx]) save.record[difIdx] = partida.puntos;
        save.metros = (save.metros || 0) + Math.round(partida.meteos);
        darMedalla('odisea');
        persistir();
        sincronizarColeccionDOM();
    }

    // ---------------- Actualización ----------------
    function actualizar(dt) {
        tiempo += dt;
        if (bannerT > 0) bannerT -= dt;
        barraDaño = Math.max(0, barraDaño - dt * 2.4);
        sacudida = Math.max(0, sacudida - dt * 30);
        actualizarFondo(dt);
        actualizarParticulas(dt);
        actualizarFlotantes(dt);
        if (estado !== 'juego') return;

        const P = partida;
        // Movimiento de la sonda: al apretar persigue el puntero; las flechas mandan.
        const antesX = P.tubo.x, antesY = P.tubo.y;
        if (puntero.abajo) {
            const lerp = Math.min(1, dt * 14);
            P.tubo.x += (puntero.x - P.tubo.x) * lerp;
            P.tubo.y += (puntero.y - P.tubo.y) * lerp;
        }
        if (teclas.ArrowLeft) P.tubo.x -= 340 * dt;
        if (teclas.ArrowRight) P.tubo.x += 340 * dt;
        if (teclas.ArrowUp) P.tubo.y -= 340 * dt;
        if (teclas.ArrowDown) P.tubo.y += 340 * dt;
        P.tubo.x = Math.max(26, Math.min(VW - 26, P.tubo.x));
        P.tubo.y = Math.max(26, Math.min(VH - 26, P.tubo.y));
        P.meteos += Math.hypot(P.tubo.x - antesX, P.tubo.y - antesY);
        if (P.meteos >= 300) { save.metros = (save.metros || 0) + 300; P.meteos -= 300; persistir(); }
        if (save.metros >= 10000) darMedalla('metros');

        // Estela de la sonda
        if (Math.random() < dt * 40) {
            pfx(P.tubo.x, P.tubo.y, (Math.random() - 0.5) * 20, 10 + Math.random() * 20, 0.5, 2.4, 'rgba(140,255,210,0.9)', 'chispa');
        }
        if (P.congelarT > 0) P.congelarT -= dt;
        if (P.turboT > 0) P.turboT -= dt;
        if (P.magnetT > 0) P.magnetT -= dt;
        if (P.inmune > 0) P.inmune -= dt;

        // Combo
        if (P.combo > 0) {
            P.comboT -= dt;
            if (P.comboT <= 0) P.combo = 0;
        }
        if (P.barca) { P.barca.t -= dt; if (P.barca.t <= 0) P.barca = null; }

        // Etapas = cuota ya supervisada en capturar

        // Planetas
        for (const pl of P.planetas) actualizarPlaneta(pl, dt);
        for (let i = P.planetas.length - 1; i >= 0; i--) {
            const pl = P.planetas[i];
            const muerto = pl.estado === 'escapado' ? (pl.fugaT || 0) <= 0
                : pl.estado === 'capturado' ? pl.foco <= 0
                : pl.estado === 'devorado' ? pl.foco <= 0
                : false;
            if (muerto) P.planetas.splice(i, 1);
        }
        if (P.planetas.length === 0) spawnPlaneta(P.etapa);

        // Cometas
        for (let i = P.cometas.length - 1; i >= 0; i--) {
            const c = P.cometas[i];
            c.x += c.vx * dt; c.y += c.vy * dt; c.pulso += dt; c.vida -= dt;
            if (c.vida <= 0 || c.x < -80 || c.x > VW + 80 || c.y < -80 || c.y > VH + 80) { P.cometas.splice(i, 1); continue; }
            const d = Math.hypot(c.x - P.tubo.x, c.y - P.tubo.y);
            if (!c.capturado && d < c.r + 12) {
                c.capturado = true;
                S.cometa();
                explosion(c.x, c.y, 16, ['#aee6ff', '#fff'], 150);
                flotar('¡COMETA! +250', '#aee6ff', c.x, c.y - 14, 20);
                P.puntos += 250;
                P.cometasAtrapados++;
                save.cometas++;
                save.estrellas += 1;
                if (save.cometas >= 10) darMedalla('cometa');
                if (Math.random() < 0.8) soltarPotenciador(c.x, c.y);
            }
        }

        // Naves
        const cfg = DIFICULTADES[difIdx];
        for (let i = P.naves.length - 1; i >= 0; i--) {
            const n = P.naves[i];
            n.x += n.vx * dt; n.pulso += dt; n.fuegoT -= dt;
            if (P.congelarT > 0) continue;
            if (n.fuegoT <= 0 && P.etapa >= cfg.naves) {
                n.fuegoT = cfg.naveFuego + Math.random() * 3;
                dispararBala(n);
            }
            if (n.x < -60 || n.x > VW + 60 || n.y < -60 || n.y > VH + 60) P.naves.splice(i, 1);
        }

        // Balas
        for (let i = balas.length - 1; i >= 0; i--) {
            const b = balas[i];
            if (P.congelarT > 0) continue;
            b.x += b.vx * dt; b.y += b.vy * dt; b.vida -= dt;
            if (b.vida <= 0 || b.x < -20 || b.x > VW + 20 || b.y < -20 || b.y > VH + 20) { balas.splice(i, 1); continue; }
            const d = Math.hypot(b.x - P.tubo.x, b.y - P.tubo.y);
            if (d < b.r + 9) { balas.splice(i, 1); golpear(14); }
        }

        // Agujeros negros
        for (let i = P.agujeros.length - 1; i >= 0; i--) P.agujeros[i].pulso += dt;

        // Asteroides
        actualizarAsteroides(dt, true);

        // Power-ups
        for (let i = powerups.length - 1; i >= 0; i--) {
            const pu = powerups[i];
            pu.pulso += dt; pu.vida -= dt;
            if (pu.vida <= 0) { powerups.splice(i, 1); continue; }
            if (P.magnetT > 0) {
                const dx = P.tubo.x - pu.x, dy = P.tubo.y - pu.y, d = Math.hypot(dx, dy);
                if (d < 220 && d > 0.1) { pu.x += dx / d * 260 * dt; pu.y += dy / d * 260 * dt; }
            }
            pu.x += pu.vx * dt; pu.y += pu.vy * dt;
            const d = Math.hypot(pu.x - P.tubo.x, pu.y - P.tubo.y);
            if (d < 22) {
                powerups.splice(i, 1);
                S.power();
                explosion(pu.x, pu.y, 14, ['#fff', pu.color], 140);
                flotar(pu.nombre, pu.color, pu.x, pu.y - 12, 17);
                aplicarPoder(pu);
            }
        }

        // Foco: manteniendo clic/espacio sobre un planeta activo
        const sujetando = puntero.abajo || teclas.Space;
        const focoT = P.turboT > 0 ? 3 : 1;
        if (sujetando) {
            let mejor = null, mejorD = 1e9;
            for (const pl of P.planetas) {
                if (pl.estado !== 'activo') continue;
                const d = Math.hypot(pl.x - P.tubo.x, pl.y - P.tubo.y);
                if (d < mejorD) { mejorD = d; mejor = pl; }
            }
            if (mejor && mejorD < mejor.radio + 34) {
                mejor.foco += DIFICULTADES[difIdx].foco * focoT * dt;
                mejor.enfocando += dt;
                if (Math.random() < dt * 30) {
                    const a = Math.random() * TAU;
                    pfx(mejor.x + Math.cos(a) * mejor.radio * 0.6, mejor.y + Math.sin(a) * mejor.radio * 0.6, Math.cos(a) * 40, Math.sin(a) * 40, 0.5, 2, 'rgba(255,220,140,0.9)');
                }
                if (mejor.foco >= 1) {
                    mejor.perfecto = mejor.enfocando * cfg.foco * focoT < 2.6;
                    capturar(mejor);
                }
            }
        } else {
            for (const pl of P.planetas) {
                if (pl.estado === 'activo' && pl.foco > 0) pl.foco = Math.max(0, pl.foco - dt * 0.8);
            }
        }

        // Spawns por etapa
        if (P.etapa >= 1 && P.cometas.filter((c) => !c.capturado).length < 1 && Math.random() < dt / 5) P.cometas.push(crearCometa());
        const activos = P.planetas.filter((x) => x.estado === 'activo').length;
        if (activos < 4 && Math.random() < dt * 0.9) spawnPlaneta(P.etapa);
        if (P.etapa >= cfg.naves && P.naves.length < 2 && Math.random() < dt * 0.5) P.naves.push(crearNave());
        if (P.etapa >= cfg.bh && P.agujeros.length < 1 && Math.random() < dt * 0.4) P.agujeros.push(crearAgujero());
    }

    function aplicarPoder(pu) {
        const P = partida;
        switch (pu.id) {
            case 'turbo': P.turboT = pu.tiempo; break;
            case 'escudo': if (P.vidas < 5) P.vidas++; break;
            case 'nova':
                P.naves = [];
                balas.length = 0;
                const centro = P.tubo;
                for (let i = asteroides.length - 1; i >= 0; i--) {
                    const a = asteroides[i];
                    if (Math.hypot(a.x - centro.x, a.y - centro.y) < 300) asteroides.splice(i, 1);
                }
                explosion(centro.x, centro.y, 50, ['#ff9f33', '#fff3c4', '#f06a4a'], 380);
                anilloOnda(centro.x, centro.y, 10, 'rgba(255,159,51,0.9)', 0.9);
                sacudida = Math.max(sacudida, 16);
                break;
            case 'congelar': P.congelarT = pu.tiempo; break;
            case 'magnet': P.magnetT = pu.tiempo; break;
        }
    }

    // ---------------- Dibujo -----------------
    function dibujarBarraSuperior() {
        const P = partida;
        ctx.fillStyle = 'rgba(5,12,20,0.55)';
        ctx.fillRect(0, 0, VW, 46);
        ctx.strokeStyle = 'rgba(217,183,90,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(VW, 46); ctx.stroke();

        // Etapa
        ctx.textAlign = 'left';
        ctx.font = '700 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#e8b84b';
        ctx.fillText('ETAPA ' + (P.etapa + 1), 14, 20);
        ctx.font = '600 11px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillText(ETAPAS[P.etapa].nombre.toUpperCase(), 14, 37);

        // Cuota
        ctx.textAlign = 'center';
        ctx.font = '600 12px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        const cuotaTxt = 'OBJ.: ' + P.capturasEtapa + ' / ' + P.cuota + ' capturas';
        ctx.fillText(cuotaTxt, VW * 0.32, 28);

        // Puntos
        ctx.textAlign = 'center';
        ctx.font = '700 22px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(P.puntos.toLocaleString('es-VE'), VW * 0.5, 30);

        // Combo
        if (P.combo >= 2) {
            const mult = 1 + P.combo * 0.5;
            ctx.font = '800 15px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#ffd882';
            ctx.fillText('x' + mult.toFixed(1), VW * 0.5 + 30, 30);
            ctx.font = '600 11px "Space Grotesk", sans-serif';
            ctx.fillStyle = 'rgba(255,216,130,0.8)';
            ctx.fillText('COMBO ' + P.combo, VW * 0.5 + 30, 44);
        } else {
            ctx.font = '600 11px "Space Grotesk", sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText('x' + (1).toFixed(1), VW * 0.5 + 30, 30);
        }

        // Vidas
        ctx.textAlign = 'right';
        for (let i = 0; i < 5; i++) {
            const x = VW - 26 - i * 22;
            const on = i < P.vidas;
            ctx.fillStyle = on ? (P.inmune > 0 && frames % 10 < 5 ? 'rgba(217,183,90,0.5)' : 'rgba(80,220,160,0.95)') : 'rgba(255,255,255,0.12)';
            ctx.beginPath(); ctx.arc(x, 24, 8, 0, TAU); ctx.strokeStyle = on ? 'rgba(217,183,90,0.9)' : 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fill();
        }
        // Botón pausa
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(VW - 24, 38); ctx.lineTo(VW - 24, 52);
        ctx.moveTo(VW - 33, 38); ctx.lineTo(VW - 33, 52);
        ctx.stroke();

        // Potenciadores activos
        let px = 10;
        const activos = [['⚡', P.turboT, 10], ['❄️', P.congelarT, 4], ['🧲', P.magnetT, 9]];
        ctx.textAlign = 'left';
        for (const [ic, t, mx] of activos) {
            if (t > 0) {
                ctx.font = '16px sans-serif';
                ctx.fillText(ic, px, VH - 14);
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fillRect(px + 22, VH - 20, 50, 4);
                ctx.fillStyle = '#e8b84b';
                ctx.fillRect(px + 22, VH - 20, 50 * Math.min(1, t / mx), 4);
                px += 84;
            }
        }

        // Barra de daño / escudo
        if (P.inmune > 0) {
            ctx.strokeStyle = 'rgba(120,255,200,0.85)';
            ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.arc(P.tubo.x, P.tubo.y, 40, 0, TAU); ctx.stroke();
        }
        if (barraDaño > 0) {
            ctx.fillStyle = 'rgba(194,59,46,' + barraDaño * 0.5 + ')';
            ctx.fillRect(0, 0, VW, VH);
        }
    }

    function dibujarFichaCientifica() {
        const barca = partida.barca;
        if (!barca) return;
        const d = barca.datos;
        const a = Math.min(1, barca.t / 0.4);
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(6,14,24,0.88)';
        const x = VW / 2 - 300, y = 62, w = 600, h = 118;
        redondeado(x, y, w, h, 12); ctx.fill();
        ctx.strokeStyle = 'rgba(217,183,90,0.7)';
        ctx.lineWidth = 1.4;
        redondeado(x, y, w, h, 12); ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '800 17px "Fraunces", serif';
        ctx.fillStyle = '#ffd882';
        ctx.fillText('📡 ' + barca.nombre.toUpperCase() + ' CAPTURADO' + (barca.perfecto ? ' · PERFECTO' : ''), x + 18, y + 26);

        const datos = [['Diámetro', d.diam], ['Masa', d.masa], ['Día', d.dia], ['Año', d.año], ['Lunas', d.lunas], ['Temp.', d.temp]];
        ctx.font = '600 12px "IBM Plex Mono", monospace';
        let cx = x + 18;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (const [k, v] of datos) {
            ctx.fillText(k, cx, y + 50);
            ctx.fillStyle = '#fff';
            ctx.fillText(v, cx + (k === 'Diámetro' ? 82 : k === 'Masa' ? 46 : k === 'Día' ? 46 : k === 'Año' ? 46 : k === 'Lunas' ? 64 : 66), y + 68);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            const widths = { 'Diámetro': 132, 'Masa': 132, 'Día': 104, 'Año': 120, 'Lunas': 110, 'Temp.': 92 };
            cx += widths[k];
        }
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'italic 400 13px "Fraunces", serif';
        const curioso = [d.c1, d.c2, d.c3][Math.floor(tiempo / 2) % 3];
        const txt = '★ ' + curioso;
        ctx.fillText(txt.length > 92 ? txt.slice(0, 92) + '…' : txt, x + 18, y + 104);
        ctx.globalAlpha = 1;
    }

    function dibujarMenuPanel() {
        const g = ctx.createLinearGradient(0, 0, 0, VH);
        g.addColorStop(0, '#04101c'); g.addColorStop(1, '#0a2233');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, VW, VH);
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.fillRect(0, 0, VW, VH);
        if (menuPanel === 'main') {
            textoCentro('APUNTA AL PLANETA', VW / 2, 96, 46, '#fff');
            textoCentro('Misión Sistema Solar · del Sol a Neptuno', VW / 2, 124, 16, 'rgba(217,183,90,0.95)', 600);
            textoCentro('Mueve el telescopio y mantén el foco sobre cada planeta para captarlo', VW / 2, 148, 13, 'rgba(255,255,255,0.7)', 500);

            const libres = Object.values(save.trofeos).filter(Boolean).length;
            ctx.textAlign = 'center';
            ctx.font = '600 13px "IBM Plex Mono", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('⭐ ' + save.estrellas + '   📦 ' + libres + '/' + PLANETAS.length + '   🏅 ' + Object.values(save.medallas).filter(Boolean).length + '/' + MEDALLAS.length + '   🚀 ' + (save.metros || 0).toLocaleString('es-VE') + ' m', VW / 2, 226);

            for (let i = 0; i < 3; i++) {
                boton(310 + i * 122, 250, 104, 40, DIFS[i], (() => { const idx = i; return () => difIdx = idx; })(), { pequeno: true, activo: difIdx === i });
            }
            ctx.textAlign = 'center';
            ctx.font = '600 11px "IBM Plex Mono", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillText('Récord (' + DIFS[difIdx].toUpperCase() + '): ' + save.record[difIdx].toLocaleString('es-VE'), VW / 2, 312);

            boton(VW / 2 - 150, 340, 300, 52, '▶  INICIAR MISIÓN', () => { estado = 'juego'; nuevoJuego(); });
            boton(VW / 2 - 150, 406, 145, 40, '️ Cómo jugar', () => { menuPanel = 'help'; }, { pequeno: true });
            boton(VW / 2 + 5, 406, 145, 40, 'Desbloqueos', () => { menuPanel = 'unlocks'; }, { pequeno: true });

            // Sonda decorativa
            dibujarVistaTelescopio(VW / 2, 560);
            ctx.textAlign = 'center';
            ctx.font = '600 11px "Space Grotesk", sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fillText('Corona elegida: ' + (COSMETICOS.find((c) => c.id === save.elegido) || COSMETICOS[0]).nombre, VW / 2, 596);
        } else if (menuPanel === 'help') {
            textoCentro('CÓMO JUGAR', VW / 2, 80, 34, '#fff');
            ctx.textAlign = 'left';
            const item = (txt, y) => { ctx.font = '500 15px "Space Grotesk", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(txt, VW / 2 - 300, y); };
            item('🖱️ / 📱  Muévete: arrastra el ratón o el dedo (o las flechas).', 130);
            item('🎯  Enfoca: mantén presionado (clic, toque o [Espacio]) sobre un planeta.', 160);
            item('🌍  Captura: llena el anillo dorado antes de que el planeta escape.', 190);
            item('☄️  Cometas: pásales por encima para puntos y potenciadores.', 220);
            item('👾  Naves: esqúivalas; disparan balas dirigidas. ¡“Nova” las barre!', 250);
            item('🕳️  Agujeros negros: chupan planetas y estrellas. Mantén distancia.', 280);
            item('✨  Capturas perfectas y combos multiplican tus puntos y estrellas.', 310);
            item('🛰️  Al completar una etapa viajas: 10 etapas, del Sol a Neptuno.', 340);
            item('⌨️  Atajos: [P] pausa · [F] pantalla completa · [M] sonido.', 370);
            item('🏆  Estrellas y medallas desbloquean coronas de telescopio.', 400);
            boton(VW / 2 - 90, 470, 180, 44, 'Volver', () => { menuPanel = 'main'; });
        } else {
            textoCentro('DESBLOQUEOS', VW / 2, 80, 34, '#fff');
            ctx.textAlign = 'center';
            ctx.font = '600 13px "IBM Plex Mono", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('Tienes ' + save.estrellas + ' estrellas. Gánalas capturando planetas, cometas y venciendo etapas.', VW / 2, 116);
            for (let i = 0; i < COSMETICOS.length; i++) {
                const c = COSMETICOS[i];
                const x = 120 + (i % 2) * 400, y = 170 + Math.floor(i / 2) * 130;
                const desbloqueado = save.cosmeticos[c.id];
                ctx.fillStyle = desbloqueado ? (save.elegido === c.id ? 'rgba(184,135,26,0.25)' : 'rgba(255,255,255,0.07)') : 'rgba(20,30,40,0.7)';
                redondeado(x, y, 360, 102, 12); ctx.fill();
                ctx.strokeStyle = save.elegido === c.id ? 'rgba(232,184,75,0.95)' : 'rgba(255,255,255,0.18)';
                ctx.lineWidth = 1.5;
                redondeado(x, y, 360, 102, 12); ctx.stroke();
                ctx.textAlign = 'left';
                ctx.font = '700 16px "Space Grotesk", sans-serif';
                ctx.fillStyle = '#fff';
                ctx.fillText(c.nombre, x + 18, y + 28);
                ctx.font = '500 12.5px "Space Grotesk", sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.65)';
                ctx.fillText(c.desc, x + 18, y + 50);
                ctx.font = '600 12px "IBM Plex Mono", monospace';
                ctx.fillStyle = desbloqueado ? 'rgba(120,255,200,0.9)' : 'rgba(255,214,130,0.9)';
                ctx.fillText(desbloqueado ? (save.elegido === c.id ? '✓ SELECCIONADA' : 'Desbloqueada · toca para elegir') : ('⭐ ' + c.costo + ' estrellas'), x + 18, y + 74);
                if (save.elegido === c.id) dibujarVistaTelescopio(x + 330, y + 50);
            }
            boton(VW / 2 - 90, 520, 180, 44, 'Volver', () => { menuPanel = 'main'; }, { pequeno: true });
            // Haz clic en tarjetas para seleccionar/comprar
        }
    }
    function pulsarMenu(x, y) {
        if (menuPanel === 'unlocks') {
            for (let i = 0; i < COSMETICOS.length; i++) {
                const c = COSMETICOS[i];
                const cx = 120 + (i % 2) * 400, cy = 170 + Math.floor(i / 2) * 130;
                if (x >= cx && x <= cx + 360 && y >= cy && y <= cy + 102) {
                    if (save.cosmeticos[c.id]) { save.elegido = c.id; S.acierto(); persistir(); }
                    else if (save.estrellas >= c.costo) {
                        save.estrellas -= c.costo;
                        save.cosmeticos[c.id] = true;
                        save.elegido = c.id;
                        S.power();
                        flotar(c.nombre + ' desbloqueado', '#ffd882', x, y - 10, 18);
                        persistir();
                    } else { S.fuga(); }
                    return;
                }
            }
        }
    }

    // ---------------- Pantallas ----------------
    function dibujarMenu() {
        botones = [];
        dibujarMenuPanel();
        dibujarBanerYExtras();
        dibujarBotones();
    }
    function dibujarJuego() {
        if (estado !== 'juego' && estado !== 'pausa') return;
        botones = [];
        dibujarFondo();
        dibujarAsteroides();
        for (const bh of partida.agujeros) dibujarAgujero(bh);
        for (const c of partida.cometas) dibujarCometa(c);
        for (const n of partida.naves) dibujarNave(n);
        for (const b of balas) dibujarBalas();
        for (const pu of powerups) dibujarPotenciador(pu);
        for (const pl of partida.planetas) {
            if (pl.estado !== 'devorado') { dibujarPlaneta(pl); dibujarAnilloFoco(pl); }
        }
        dibujarParticulas();
        dibujarVistaTelescopio(partida.tubo.x, partida.tubo.y);
        dibujarBarraSuperior();
        dibujarFichaCientifica();
        dibujarFlotantes();
        dibujarBanerYExtras();
    }
    function dibujarBanerYExtras() {
        if (bannerT > 0) {
            const a = Math.min(1, bannerT / 0.5);
            ctx.globalAlpha = a;
            ctx.textAlign = 'center';
            ctx.font = '800 21px "Space Grotesk", sans-serif';
            ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.lineWidth = 5;
            ctx.strokeText(bannerTxt, VW / 2, 96);
            ctx.fillStyle = 'rgb(' + bannerColor[0] + ',' + bannerColor[1] + ',' + bannerColor[2] + ')';
            ctx.fillText(bannerTxt, VW / 2, 96);
            ctx.globalAlpha = 1;
        }
        // Marco sobrio del mundo
        ctx.strokeStyle = 'rgba(217,183,90,0.35)';
        ctx.lineWidth = 2;
        redondeado(2, 2, VW - 4, VH - 4, 10); ctx.stroke();
    }
    function dibujarPausa() {
        ctx.fillStyle = 'rgba(4,10,18,0.72)';
        ctx.fillRect(0, 0, VW, VH);
        textoCentro('PAUSA', VW / 2, 220, 44, '#fff');
        ctx.textAlign = 'center';
        ctx.font = '600 14px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Etapa ' + (partida.etapa + 1) + ' · ' + ETAPAS[partida.etapa].nombre + ' · Puntos: ' + partida.puntos.toLocaleString('es-VE'), VW / 2, 258);
        boton(VW / 2 - 120, 300, 240, 48, 'Continuar', () => { estado = 'juego'; });
        boton(VW / 2 - 120, 362, 240, 48, 'Reiniciar misión', () => { estado = 'juego'; nuevoJuego(); });
        boton(VW / 2 - 120, 424, 240, 48, 'Abandonar al menú', () => { estado = 'menu'; menuPanel = 'main'; }, { pequeno: true });
    }
    function dibujarOver() {
        botones = [];
        ctx.fillStyle = 'rgba(3,8,14,0.85)';
        ctx.fillRect(0, 0, VW, VH);
        const SCTA = partida ? (partida.victoria ? '¡MISIÓN COMPLETA!' : 'FIN DE LA MISIÓN') : 'FIN';
        textoCentro(SCTA, VW / 2, 120, 46, partida && partida.victoria ? '#ffd882' : '#fff');
        if (partida && partida.victoria) {
            ctx.textAlign = 'center';
            ctx.font = '600 15px "Space Grotesk", sans-serif';
            ctx.fillStyle = 'rgba(120,255,200,0.95)';
            ctx.fillText('Recorriste las 10 etapas: del Sol a las Afueras Heladas. ¡Coleccionista del cielo!', VW / 2, 156);
        }
        ctx.textAlign = 'center';
        ctx.font = '700 40px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(partida ? partida.puntos.toLocaleString('es-VE') : '0', VW / 2, 212);
        ctx.font = '600 11px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('PUNTOS · RÉCORD ' + DIFS[difIdx].toUpperCase() + ': ' + save.record[difIdx].toLocaleString('es-VE'), VW / 2, 234);

        const stats = [
            ['📦', 'Planetas', partida.capturasTotales + ' / ' + PLANETAS.length],
            ['🔥', 'Combo máx.', 'x' + (1 + (partida.comboMax || 0) * 0.5).toFixed(1) + ' (' + (partida.comboMax || 0) + ')'],
            ['☄️', 'Cometas', partida.cometasAtrapados || 0],
            ['⭐', 'Estrellas', partida.estrellasRun || 0]
        ];
        ctx.font = '600 15px "Space Grotesk", sans-serif';
        for (let i = 0; i < stats.length; i++) {
            const x = 220 + i * 145;
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillText(stats[i][1], x, 280);
            ctx.fillStyle = '#fff';
            ctx.font = '700 18px "Space Grotesk", sans-serif';
            ctx.fillText(stats[i][2], x, 306);
            ctx.font = '600 15px "Space Grotesk", sans-serif';
        }

        boton(VW / 2 - 160, 350, 320, 50, '↻  JUGAR OTRA VEZ', () => { estado = 'juego'; nuevoJuego(); });
        boton(VW / 2 - 160, 416, 150, 42, 'Menú', () => { estado = 'menu'; menuPanel = 'main'; }, { pequeno: true });
        boton(VW / 2 + 10, 416, 150, 42, 'Desbloqueos', () => { estado = 'menu'; menuPanel = 'unlocks'; }, { pequeno: true });
    }

    // ---------------- Interacción menú ----------------
    function manejarPunteroMenu(x, y) {
        // Selector de corona en 'unlocks'
        if (menuPanel === 'unlocks' && estado === 'menu') {
            pulsarMenu(x, y);
        }
    }

    // ---------------- Bucle principal ----------------
    function bucle(ahora) {
        requestAnimationFrame(bucle);
        const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0);
        ultimo = ahora;
        frames++;
        actualizar(dt);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#02060c';
        ctx.fillRect(0, 0, cssW, cssH);
        mundo();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, VW, VH);
        ctx.clip();

        if (estado === 'menu') { dibujarMenu(); }
        else if (estado === 'juego') { dibujarJuego(); }
        else if (estado === 'pausa') { dibujarJuego(); dibujarPausa(); dibujarBotones(); }
        else { dibujarOver(); dibujarBotones(); }

        ctx.restore();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ---------------- Entradas al canvas ----------------
    wrap.addEventListener('pointerdown', (e) => {
        const m = toMundo(e.clientX, e.clientY);
        pulsar(m.x, m.y);
        if (estado === 'menu') manejarPunteroMenu(m.x, m.y);
    });

    // ---------------- Arranque ----------------
    window.addEventListener('resize', fit);
    if (typeof ResizeObserver !== 'undefined') { new ResizeObserver(fit).observe(wrap); }
    fit();
    sincronizarColeccionDOM();
    // Esparcir estrellas iniciales
    aplicarEscena(0);
    for (let i = 0; i < Math.round(ETAPAS[0].ast * 26); i++) asteroides.push(crearAsteroide());
    requestAnimationFrame(bucle);

    // Control de dif select (HTML)
    const difSelect = $('game-dif');
    if (difSelect) difSelect.addEventListener('change', () => { difIdx = parseInt(difSelect.value, 10) || 1; });

    // Fin del motor. El cielo nos espera.
})();