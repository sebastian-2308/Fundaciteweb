// =============================================
// APUNTA AL PLANETA · Fundacite Caracas
// Port web del juego (original en Python/pygame).
// Jugable con ratón y con dedo (táctil).
// =============================================

(() => {
    'use strict';

    const LW = 900, LH = 650;
    const TAU = Math.PI * 2;
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const RADIO_MIRA = 55;
    const FOCO_BASE = 1.15, FOCO_MIN = 0.65;
    const VIDA_BASE = 12, VIDA_MIN = 6;
    const VIDAS_INI = 3, VIDAS_MAX = 8;
    const COMBO_T = 6, VIDA_PTS = 600;
    const MAX_PLANETAS = 5, NIVEL_MAX = 20;
    const RECORD_KEY = 'fundaciteApuntaRecord';

    const PLANETAS = [
        { nombre: 'Mercurio', color: [190, 178, 150], radio: 19, anillos: false, bandas: false, casquete: false, luna: false,
          datos: ['Su año dura solo 88 días terrestres.', 'El planeta más cercano al Sol y el más pequeño.', 'Sus temperaturas pasan de 430 °C a -180 °C.'] },
        { nombre: 'Venus', color: [235, 200, 140], radio: 24, anillos: false, bandas: false, casquete: false, luna: false,
          datos: ['Gira al revés que la Tierra y su día dura más que su año.', 'El más caliente del sistema solar: unos 460 °C.', 'Es el objeto más brillante del cielo tras el Sol y la Luna.'] },
        { nombre: 'Tierra', color: [78, 148, 235], radio: 24, anillos: false, bandas: false, casquete: false, luna: true,
          datos: ['Es el único planeta conocido con vida y agua líquida.', 'Es una «canica azul»: el 70 % de su superficie es océano.', 'Su luna estabiliza su giro y regala los eclipses.'] },
        { nombre: 'Marte', color: [215, 90, 55], radio: 21, anillos: false, bandas: false, casquete: true, luna: false,
          datos: ['Tiene el volcán más alto del sistema: el Olympus Mons.', 'Es el planeta rojo por el óxido de hierro de su suelo.', 'Guarda el cañón más grande: Valles Marineris.'] },
        { nombre: 'Júpiter', color: [215, 168, 112], radio: 29, anillos: false, bandas: true, casquete: false, luna: false,
          datos: ['El mayor planeta: cabrían 1300 Tierras dentro.', 'Su Gran Mancha Roja es una tormenta que dura siglos.', 'Su luna Europa esconde un océano bajo el hielo.'] },
        { nombre: 'Saturno', color: [238, 218, 160], radio: 26, anillos: true, bandas: false, casquete: false, luna: false,
          datos: ['Sus anillos de hielo miden 280.000 km de ancho.', 'Es tan ligero que flotaría en el agua.', 'Tiene la mayor luna del sistema: Titán, con atmósfera propia.'] },
        { nombre: 'Urano', color: [130, 215, 220], radio: 23, anillos: true, bandas: false, casquete: false, luna: false,
          datos: ['Roda tumbado: su eje está inclinado 98 grados.', 'El primer planeta descubierto con telescopio, en 1781.', 'Es un gigante de hielo de color verde-azulado.'] },
        { nombre: 'Neptuno', color: [92, 120, 235], radio: 22, anillos: false, bandas: false, casquete: false, luna: true,
          datos: ['Sus vientos superan los 2000 km/h, los más rápidos.', 'Fue hallado con matemáticas antes que con telescopio.', 'Está tan lejos que su año dura 165 años terrestres.'] }
    ];

    const ESTADOS = { INICIO: 'inicio', JUGANDO: 'jugando', PAUSA: 'pausa', TIENDA: 'tienda', FIN: 'fin' };

    const DIFICULTADES = [
        { nombre: 'Fácil', focoBase: 2.2, focoMin: 1.4, velBonus: 3, vidaBase: 16, vidaMin: 11, planetaMax: 3, spawn: 0.7, cometas: true, naves: false, bhDesde: 999, bhInt: 60 },
        { nombre: 'Normal', focoBase: 1.15, focoMin: 0.65, velBonus: 6, vidaBase: 12, vidaMin: 6.5, planetaMax: 5, spawn: 0.55, cometas: true, naves: true, bhDesde: 17, bhInt: 42 },
        { nombre: 'Difícil', focoBase: 0.82, focoMin: 0.5, velBonus: 12, vidaBase: 9, vidaMin: 4.5, planetaMax: 7, spawn: 0.42, cometas: true, naves: true, bhDesde: 3, bhInt: 26 }
    ];
    let difIdx = 1;
    const dificultad = () => DIFICULTADES[difIdx];

    const ESCENAS = [
        { nombre: 'Órbita terrestre', corto: 'ÓRBITA', min: 1, top: '#0a0f26', bot: '#1d3a6e', neb: ['42,80,140', '24,60,120', '60,90,150'], dens: 1.0, ast: 0.4 },
        { nombre: 'Cinturón de asteroides', corto: 'ASTEROIDES', min: 5, top: '#180f08', bot: '#4a2c14', neb: ['110,72,34', '70,46,22', '140,96,46'], dens: 1.1, ast: 1.6 },
        { nombre: 'Gigantes helados', corto: 'HELADOS', min: 9, top: '#071326', bot: '#1e5170', neb: ['20,90,120', '26,60,110', '16,110,140'], dens: 1.2, ast: 0.4 },
        { nombre: 'Afueras del sistema', corto: 'AFUERAS', min: 13, top: '#05050c', bot: '#17223c', neb: ['24,24,64', '10,36,66', '34,28,76'], dens: 0.8, ast: 0.1 },
        { nombre: 'Corazón galáctico', corto: 'GALAXIA', min: 17, top: '#1a0a20', bot: '#531d6b', neb: ['110,30,130', '60,16,90', '170,90,40'], dens: 1.7, ast: 0.2 }
    ];
    let escenaIdx = 0;
    const CAPTA_RAD = 175, CAPTA_EAT = 26;

    const TIENDA = [
        { icono: '🕳️', color: '#7a4fd0', nombre: 'Agujero captador', costo: 250, desc: 'El próximo planeta que escape queda atrapado en él', aplicar: (part) => { if (part.bhCatch >= 3) return false; part.bhCatch++; return true; } },
        { icono: '🛡️', color: '#3fae6a', nombre: 'Escudo', costo: 300, desc: '+1 vida (máximo 8)', aplicar: (part) => { if (part.vidas >= VIDAS_MAX) return false; part.vidas++; return true; } },
        { icono: '☄️', color: '#f2a54a', nombre: 'Lluvia de cometas', costo: 180, desc: '3 cometas cruzan el cielo en este momento', aplicar: () => { for (let i = 0; i < 3; i++) { const c = crearCometa(); c.x = -30 - i * 90; c.y = LH * (0.12 + i * 0.26); cometas.push(c); } return true; } },
        { icono: '⚡', color: '#f2d24a', nombre: 'Turbo-enfoque', costo: 220, desc: 'Enfoque 3× más rápido durante 10 s', aplicar: (part) => { part.turboT = 10; return true; } },
        { icono: '💫', color: '#5ad0c8', nombre: 'Combo estable', costo: 220, desc: 'Tu combo no decae durante 20 s', aplicar: (part) => { part.comboEstT = 20; return true; } },
        { icono: '🔭', color: '#4a9bd0', nombre: 'Telescopio', costo: 320, desc: 'El planeta en apuros se enfoca solo por 12 s', aplicar: (part) => { part.autoT = 12; return true; } }
    ];

    // ---------- Sonido sintetizado (WebAudio) ----------
    let SND = true, AC = null;
    const soundBtn = document.getElementById('game-sound');

    function acSafe() {
        try {
            if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
            if (AC.state === 'suspended') AC.resume();
        } catch (e) { /* sin audio */ }
    }
    function tono(freq, dur, vol, slide, delay) {
        if (!SND) return;
        acSafe();
        try {
            const t = AC.currentTime + (delay || 0);
            const o = AC.createOscillator(), g = AC.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, t);
            if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur / 1000);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur / 1000);
            o.connect(g); g.connect(AC.destination);
            o.start(t); o.stop(t + dur / 1000 + 0.02);
        } catch (e) { /* ignorar */ }
    }
    const SONIDOS = {
        captura(i) { tono([523, 659, 784][i % 3], 130, 0.5, 0, 0); tono([1047, 1319, 1568][i % 3], 200, 0.25, 0, 0.09); },
        fuga() { tono(300, 420, 0.45, 120); },
        tick() { tono(1500, 60, 0.3); },
        vida() { tono(880, 180, 0.4, 220); },
        clic() { tono(700, 40, 0.4); },
        cometa() { tono(620, 120, 0.4, 240); tono(1240, 160, 0.3, 0, 0.07); },
        colapso() { tono(95, 320, 0.55, -35); tono(65, 460, 0.5, 0, 0.05); },
        nave() { tono(220, 140, 0.45, -90); tono(440, 110, 0.3, 0, 0.06); },
        portal() { tono(520, 500, 0.28, -380); tono(160, 520, 0.22, -70, 0.1); }
    };
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            SND = !SND;
            soundBtn.textContent = SND ? '🔊' : '🔇';
            soundBtn.setAttribute('aria-label', SND ? 'Silenciar sonido' : 'Activar sonido');
            if (SND) acSafe();
        });
    }

    // ---------- Estado global ----------
    let estado = ESTADOS.INICIO;
    let tiempo = 0, ultimo = 0;
    let partida = null;
    let record = cargarRecord();
    let puntero = { x: LW / 2, y: LH / 2, abajo: false };
    let sacudida = 0, spawnFugaz = 4;
    let flashItem = -1, flashT = 0;
    let estrellas = [], nebulosas = [], fugaces = [], cometas = [], naves = [], agujeros = [], asteroides = [];
    let cometaT = 9, naveT = 12, bhT = 30;

    function recordKey() { return 'fundaciteApuntaRecord' + difIdx; }
    function cargarRecord() {
        try { return parseInt(localStorage.getItem(recordKey()), 10) || 0; }
        catch (e) { return 0; }
    }
    function guardarRecord(v) {
        try { localStorage.setItem(recordKey(), String(v)); } catch (e) { /* almacenamiento no disponible */ }
    }

    function nuevoJuego() {
        partida = {
            puntos: 0, vidas: VIDAS_INI, capturas: 0, planetas: [],
            espera: 0.5, combo: 0, comboT: 0, flotantes: [],
            banner: '✦ Captura planetas, destruye naves y caza cometas ✦',
            bannerT: 2.8, bannerColor: [255, 220, 90],
            galeria: PLANETAS.reduce((m, p) => (m[p.nombre] = false, m), {}),
            bhCatch: 0, turboT: 0, comboEstT: 0, autoT: 0
        };
    }
    const p = () => partida;

    function capturasTotal(g) { return Object.values(g).filter(Boolean).length; }
    function nivelDe(part) { return Math.min(NIVEL_MAX, 1 + Math.floor(part.capturas / 3)); }
    function activos(part) { return part.planetas.filter((pl) => pl.estado === 'activo'); }

    // ---------- Vitrina de Trofeos del Sistema Solar ----------
    const TROFEOS_KEY = 'fundaciteApuntaTrofeos';
    function cargarTrofeos() {
        try {
            const raw = localStorage.getItem(TROFEOS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }
    function actualizarTrofeoUI(nombre) {
        if (!nombre) return;
        try {
            const el = document.getElementById('trophy-' + nombre);
            if (el) {
                el.classList.add('unlocked');
                const st = el.querySelector('.trophy-planet-status');
                if (st) st.textContent = '¡Capturado!';
            }
        } catch (e) { /* noop */ }
    }
    function registrarTrofeo(nombre) {
        if (!nombre) return;
        try {
            const trofeos = cargarTrofeos();
            trofeos[nombre] = true;
            localStorage.setItem(TROFEOS_KEY, JSON.stringify(trofeos));
        } catch (e) { /* noop */ }
        actualizarTrofeoUI(nombre);
    }
    function sincronizarTrofeosUI() {
        try {
            const trofeos = cargarTrofeos();
            Object.keys(trofeos).forEach(k => {
                if (trofeos[k]) actualizarTrofeoUI(k);
            });
        } catch (e) { /* noop */ }
    }

    // ---------- Fondo: estrellas, nebulosas, fugaces ----------
    function hacerEstrella(capa) {
        return {
            x: Math.random() * LW, y: Math.random() * LH,
            tam: Math.random() * (capa ? 2.3 : 1.1) + 0.5,
            fase: Math.random() * TAU, vel: 1 + Math.random() * 2,
            dx: (Math.random() * 6 - 3) * (capa ? 0.35 : 1.1),
            dy: (Math.random() * 4 - 2) * (capa ? 0.35 : 1.1) - 2
        };
    }
    function estrellaMover(e, dt) {
        e.x += e.dx * dt; e.y += e.dy * dt;
        if (e.x < 0) e.x += LW; else if (e.x > LW) e.x -= LW;
        if (e.y < 0) e.y += LH; else if (e.y > LH) e.y -= LH;
    }
    function estrellaDibujar(e, t) {
        const b = 0.55 + 0.45 * Math.sin(e.fase + t * e.vel);
        const a = Math.floor(90 + 165 * ((b + 1) / 2));
        const r = Math.max(0.6, e.tam * (0.5 + 0.5 * b));
        ctx.fillStyle = 'rgb(' + a + ',' + a + ',' + a + ')';
        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, TAU); ctx.fill();
    }
    function nebulosaDibujar(n, i) {
        const esc = ESCENAS[escenaIdx];
        const col = esc.neb[i % esc.neb.length];
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, 'rgba(' + col + ',0.18)');
        g.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, TAU); ctx.fill();
    }
    function hacerFugaz() {
        const f = {};
        f.x = LW * (0.3 + Math.random() * 0.6);
        f.y = LH * (0.05 + Math.random() * 0.35);
        f.vx = -(200 + Math.random() * 160);
        f.vy = 120 + Math.random() * 90;
        f.vida = 0.7 + Math.random() * 0.5;
        return f;
    }
    function fugazDibujar(f) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - f.vx * 0.14, f.y - f.vy * 0.14);
        ctx.stroke();
        ctx.fillStyle = '#fffbf5';
        ctx.beginPath(); ctx.arc(f.x, f.y, 2, 0, TAU); ctx.fill();
    }

    function crearCometa() {
        const dir = Math.random() < 0.5 ? 1 : -1;
        return {
            x: dir === 1 ? -30 : LW + 30,
            y: LH * (0.12 + Math.random() * 0.6),
            vx: dir * (110 + Math.random() * 90),
            vy: Math.random() * 140 - 70,
            radio: 9, vida: 6, foco: 0, pulso: Math.random() * TAU
        };
    }
    function cometaDibujar(c) {
        const a = Math.atan2(c.vy, c.vx);
        const lx = Math.cos(a + Math.PI), ly = Math.sin(a + Math.PI);
        const len = 64;
        const g = ctx.createLinearGradient(c.x + lx * len, c.y + ly * len, c.x, c.y);
        g.addColorStop(0, 'rgba(150,220,255,0)');
        g.addColorStop(1, 'rgba(205,242,255,0.85)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(c.x + lx * len, c.y + ly * len); ctx.lineTo(c.x, c.y); ctx.stroke();
        ctx.fillStyle = 'rgba(230,250,255,0.95)';
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radio, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(150,230,255,0.55)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radio + 10, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(190,245,255,0.95)';
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radio + 10, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, c.foco)); ctx.stroke();
    }

    // ---------- Asteroides decorativos ----------
    function crearAsteroide() {
        const r = 3 + Math.random() * 7;
        const verts = [];
        const nv = 6 + Math.floor(Math.random() * 3);
        for (let i = 0; i < nv; i++) {
            const a = (i / nv) * TAU + Math.random() * 0.6;
            verts.push({ x: Math.cos(a) * r * (0.7 + Math.random() * 0.5), y: Math.sin(a) * r * (0.7 + Math.random() * 0.5) });
        }
        return {
            x: Math.random() * LW, y: Math.random() * LH, rot: Math.random() * TAU,
            vr: (Math.random() - 0.5) * 1.4, vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.5) * 14,
            r, verts, tono: 96 + Math.floor(Math.random() * 46)
        };
    }
    function asteroideDibujar(a) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.beginPath();
        a.verts.forEach((v, i) => { if (i) ctx.lineTo(v.x, v.y); else ctx.moveTo(v.x, v.y); });
        ctx.closePath();
        ctx.fillStyle = 'rgb(' + a.tono + ',' + Math.floor(a.tono * 0.86) + ',' + Math.floor(a.tono * 0.66) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,200,0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
    function escenaDe(nivel) {
        let idx = 0;
        ESCENAS.forEach((e, i) => { if (nivel >= e.min) idx = i; });
        return idx;
    }
    function aplicarEscena(idx, inicial) {
        escenaIdx = idx;
        const esc = ESCENAS[idx];
        estrellas = [];
        for (let capa = 0; capa < 2; capa++) {
            for (let i = 0; i < Math.round(esc.dens * 140); i++) estrellas.push(hacerEstrella(capa));
        }
        asteroides = [];
        for (let i = 0; i < Math.round(esc.ast * 26); i++) asteroides.push(crearAsteroide());
        if (!inicial && partida) {
            partida.banner = '✦ Escena: ' + esc.nombre.toUpperCase() + ' ✦';
            partida.bannerColor = [255, 220, 90];
            partida.bannerT = 2.0;
        }
    }

    // ---------- Naves espaciales hostiles ----------
    function crearNave(nivel, tipo) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const n = { tipo, radio: 11, x: 0, y: 0, vx: 0, vy: 0, ang: 0, pulso: Math.random() * TAU, foco: 0 };
        if (tipo === 'nodriza') {
            n.radio = 20;
            n.x = LW * (0.25 + Math.random() * 0.5);
            n.y = -40;
            n.vx = Math.cos(Math.random() * TAU) * 26;
            n.vy = 26 + nivel * 1.2;
        } else {
            n.x = dir === 1 ? -34 : LW + 34;
            n.y = LH * (0.18 + Math.random() * 0.64);
            n.vx = dir * (96 + Math.random() * 50 + nivel * 3);
            n.vy = 0;
        }
        return n;
    }
    function naveDibujar(n) {
        const blink = (n.pulso * 5) % 1 < 0.55;
        ctx.fillStyle = 'rgba(255,60,90,0.12)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radio * 2.6, 0, TAU); ctx.fill();
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.ang);
        ctx.fillStyle = n.tipo === 'nodriza' ? 'rgb(150,184,196)' : 'rgb(128,70,90)';
        ctx.beginPath(); ctx.ellipse(0, 0, n.radio * 1.7, n.radio * 0.8, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = n.tipo === 'nodriza' ? 'rgb(56,110,132)' : 'rgb(36,58,84)';
        ctx.beginPath(); ctx.arc(0, 0, n.radio * 0.7, Math.PI, TAU); ctx.fill();
        ctx.fillStyle = blink ? 'rgb(255,140,140)' : 'rgb(110,40,44)';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.arc(i * n.radio * 0.9, n.radio * 0.42, 3, 0, TAU); ctx.fill();
        }
        if (n.tipo === 'nodriza') {
            ctx.fillStyle = 'rgb(150,255,175)';
            ctx.beginPath(); ctx.arc(n.radio * 0.55, 0, 3.5, 0, TAU); ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,120,120,0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radio + 11, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,90,90,0.95)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radio + 11, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, n.foco)); ctx.stroke();
    }

    // ---------- Agujeros negros ----------
    function crearAgujero() {
        return {
            x: LW * (0.2 + Math.random() * 0.6),
            y: LH * (0.25 + Math.random() * 0.4),
            radio: 26, masa: 300, pullR: 215,
            pulso: Math.random() * TAU, foco: 0
        };
    }
    function bhTirar(b, o, dt) {
        let dx = b.x - o.x, dy = b.y - o.y;
        let d = Math.hypot(dx, dy);
        if (d < b.pullR && d > 0.5) {
            const f = b.masa * (1 - d / b.pullR * 0.82) * dt * 0.5;
            o.dx += (dx / d) * f;
            o.dy += (dy / d) * f;
            o.dx += (-dy / d) * f * 0.75;
            o.dy += (dx / d) * f * 0.75;
        }
    }
    function agujeroDibujar(b) {
        const r = b.radio, x = b.x, y = b.y;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
        g.addColorStop(0, 'rgba(20,10,40,0.85)');
        g.addColorStop(1, 'rgba(120,40,160,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill();
        for (let k = 0; k < 3; k++) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(b.pulso * (0.6 + k * 0.3) + k);
            ctx.strokeStyle = k === 1 ? 'rgba(255,190,90,0.85)' : 'rgba(200,120,220,0.5)';
            ctx.lineWidth = 3 - k;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * (2.1 - k * 0.5), r * (0.75 - k * 0.2), 0, 0, TAU * 0.7);
            ctx.stroke();
            ctx.restore();
        }
        ctx.fillStyle = 'rgb(8,6,14)';
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(220,150,255,0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(x, y, r + 12, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(230,180,255,0.95)';
        ctx.beginPath(); ctx.arc(x, y, r + 12, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, b.foco)); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.28, 0, TAU); ctx.fill();
    }

    // ---------- Texto flotante ----------
    function textFlotante(texto, color, x, y, tam) {
        return { texto, color, x, y, tam: tam || 26, vida: 1.4, vidaMax: 1.4 };
    }

    // ---------- Planeta ----------
    function crearPlaneta(nivel) {
        const d = PLANETAS[Math.floor(Math.random() * PLANETAS.length)];
        const pl = {
            nombre: d.nombre, color: d.color,
            dato: d.datos[Math.floor(Math.random() * d.datos.length)],
            radio: Math.max(14, d.radio - Math.max(0, nivel - 3)),
            anillos: d.anillos, bandas: d.bandas, casquete: d.casquete, luna: d.luna,
            x: LW * (0.11 + Math.random() * 0.78),
            y: LH * (0.15 + Math.random() * 0.7),
            pulso: 0, dfase: Math.random() * TAU,
            angOrbit: Math.random() * TAU, foco: 0, milestonia: {},
            vida: Math.max(dificultad().vidaMin, dificultad().vidaBase - nivel * 0.8),
            estado: 'activo'
        };
        const vel = (38 + Math.random() * 20) + nivel * dificultad().velBonus;
        const rumbo = Math.random() * TAU;
        pl.dx = Math.cos(rumbo) * vel;
        pl.dy = Math.sin(rumbo) * vel;
        pl.velMax = vel * 1.9;
        return pl;
    }
    function enRetirada(pl) { return pl.estado !== 'activo' && pl.foco <= 0; }
    function enAprieto(pl) { return pl.estado === 'activo' && pl.vida < 2.5; }

    function plActualizar(pl, dt, nivel) {
        pl.pulso += dt;
        pl.angOrbit += dt * 2.2;
        pl.dfase += dt * 1.5;
        pl.dx += Math.sin(pl.dfase) * 300 * dt;
        pl.dy += Math.cos(pl.dfase * 1.3) * 300 * dt;
        const rap = Math.hypot(pl.dx, pl.dy);
        if (rap > pl.velMax) { const f = pl.velMax / rap; pl.dx *= f; pl.dy *= f; }
        pl.x += pl.dx * dt; pl.y += pl.dy * dt;
        const mg = 70;
        if (pl.x < mg) { pl.x = mg; pl.dx = Math.abs(pl.dx); }
        else if (pl.x > LW - mg) { pl.x = LW - mg; pl.dx = -Math.abs(pl.dx); }
        if (pl.y < mg) { pl.y = mg; pl.dy = Math.abs(pl.dy); }
        else if (pl.y > LH - mg) { pl.y = LH - mg; pl.dy = -Math.abs(pl.dy); }
        for (const b of agujeros) {
            bhTirar(b, pl, dt);
            if (pl.estado === 'activo' && Math.hypot(b.x - pl.x, b.y - pl.y) < b.radio + pl.radio + 6) {
                pl.estado = 'devorado';
                pl.foco = 0;
            }
        }
        if (pl.estado === 'activo') {
            pl.vida -= dt;
            if (pl.vida <= 0) pl.estado = 'escapado';
        } else {
            pl.foco = Math.max(0, pl.foco - dt * 2);
        }
    }

    function col(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

    function plGlow(pl) {
        for (let i = 6; i > 0; i--) {
            const r = pl.radio + i * 5 + Math.sin(pl.pulso * 3) * 2;
            ctx.fillStyle = col(pl.color, (60 - i * 8) / 255);
            ctx.beginPath(); ctx.arc(pl.x, pl.y, r, 0, TAU); ctx.fill();
        }
    }
    function plAnillos(pl, frente) {
        const rx = pl.radio * 1.85, ry = pl.radio * 0.65;
        const ca = Math.cos(0.42), sa = Math.sin(0.42);
        const color = frente ? 'rgb(232,204,152)' : 'rgb(128,108,82)';
        for (const escala of [1.0, 0.82]) {
            const gros = escala > 0.9 ? 3 : 2;
            ctx.fillStyle = color;
            for (let i = 0; i < 48; i++) {
                const a = i / 48 * TAU;
                const ux = Math.cos(a) * rx * escala, uy = Math.sin(a) * ry * escala;
                if ((uy < 0) === frente) continue;
                const px = pl.x + ux * ca - uy * sa;
                const py = pl.y + ux * sa + uy * ca;
                ctx.beginPath(); ctx.arc(px, py, gros, 0, TAU); ctx.fill();
            }
        }
    }
    function plCuerpo(pl) {
        const { x, y, r } = pl;
        ctx.fillStyle = col(pl.color, 1);
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();

        if (pl.bandas) {
            ctx.strokeStyle = 'rgb(140,105,75)';
            for (const [yo, hi] of [[0.30, 0.15], [0.55, 0.11], [0.78, 0.09]]) {
                const off = r * yo;
                const hw = Math.max(2, Math.sqrt(Math.max(0, r * r - off * off)));
                ctx.lineWidth = Math.max(2, r * hi);
                ctx.beginPath(); ctx.moveTo(x - hw, y + off); ctx.lineTo(x + hw, y + off); ctx.stroke();
            }
            ctx.fillStyle = 'rgb(210,120,85)';
            ctx.beginPath();
            ctx.ellipse(x + r * 0.18, y + r * 0.5, r * 0.22, r * 0.075, 0, 0, TAU);
            ctx.fill();
        }
        // Sombra en media luna
        ctx.save();
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(x - r * 0.5, y - r * 0.5, r * 0.85, 0, TAU); ctx.fill();
        ctx.restore();

        if (pl.casquete) {
            ctx.fillStyle = 'rgb(240,240,235)';
            ctx.beginPath();
            ctx.ellipse(x, y - r * 0.12, r * 0.6, r * 0.2, 0, 0, TAU);
            ctx.fill();
        }
        if (pl.luna) {
            const mx = x + Math.cos(pl.angOrbit) * r * 1.8;
            const my = y + Math.sin(pl.angOrbit) * r * 1.5;
            ctx.fillStyle = 'rgb(208,208,214)';
            ctx.beginPath(); ctx.arc(mx, my, 4, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#05070f'; ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, Math.max(2, r * 0.22), 0, TAU); ctx.fill();
    }
    function plDibujar(pl) {
        plGlow(pl);
        if (pl.anillos) plAnillos(pl, false);
        plCuerpo(pl);
        if (pl.anillos) plAnillos(pl, true);
    }
    function plEtiqueta(pl) {
        if (pl.estado !== 'activo') return;
        texto(pl.nombre.toUpperCase(), pl.x, pl.y - pl.radio - 22, 17, enAprieto(pl) ? [255, 90, 90] : [255, 255, 255]);
    }
    function portalAtraer(part, dt) {
        const on = part.bhCatch > 0 || part.planetas.some((pl) => pl.estado === 'atraido');
        if (!on) return;
        const px = portalCaptadorX(), py = portalCaptadorY();
        const nivel = nivelDe(part);
        const tragar = (arr, premio, sonido, color, icono) => {
            for (let i = arr.length - 1; i >= 0; i--) {
                const o = arr[i];
                const dx = px - o.x, dy = py - o.y;
                const d = Math.hypot(dx, dy) || 1;
                if (d < CAPTA_EAT) {
                    const g = Math.floor(premio);
                    part.puntos += g;
                    part.flotantes.push(textFlotante(icono + ' +' + g, color, px, py - 50));
                    SONIDOS[sonido]();
                    sacudida = 2 + g / 40;
                    arr.splice(i, 1);
                    continue;
                }
                if (d < CAPTA_RAD) {
                    const f = (1 - d / CAPTA_RAD) * 340;
                    o.x += dx / d * f * dt;
                    o.y += dy / d * f * dt;
                }
            }
        };
        tragar(cometas, 25 + nivel * 8, 'cometa', [210, 240, 255], '☄️');
        tragar(naves, 40 + nivel * 15, 'nave', [255, 160, 120], '🛸');
        tragar(agujeros, 80 + nivel * 25, 'colapso', [255, 220, 90], '🕳');
    }
    function portalCaptador(part) {
        const enUso = part.bhCatch > 0 || part.planetas.some((pl) => pl.estado === 'atraido');
        if (!enUso) return;
        const px = portalCaptadorX(), py = portalCaptadorY();
        const pulso = 1 + Math.sin(tiempo * 5) * 0.05;
        ctx.save();
        const g = ctx.createRadialGradient(px, py, 2, px, py, 68);
        g.addColorStop(0, 'rgba(210,160,255,0.5)');
        g.addColorStop(1, 'rgba(210,160,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 68, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,220,90,0.85)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.arc(px, py, 30 * pulso, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
        if (part.bhCatch > 0) {
            ctx.strokeStyle = 'rgba(200,150,255,0.18)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 12]);
            ctx.beginPath(); ctx.arc(px, py, CAPTA_RAD, 0, TAU); ctx.stroke();
            ctx.setLineDash([]);
        }
        const h = ctx.createRadialGradient(px - 8, py - 8, 2, px, py, 24 * pulso);
        h.addColorStop(0, '#000'); h.addColorStop(0.7, '#13091f'); h.addColorStop(1, '#3a2a5a');
        ctx.fillStyle = h;
        ctx.beginPath(); ctx.arc(px, py, 22 * pulso, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,200,120,0.85)';
        ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(px, py, 15 * pulso, tiempo * 2.6, tiempo * 2.6 + 4.4); ctx.stroke();
        ctx.restore();
        if (part.bhCatch > 0) texto('CAPTURADOR ×' + part.bhCatch, px, py - 58, 14, [255, 220, 90]);
    }
    function portalCaptadorX() { return LW / 2; }
    function portalCaptadorY() { return LH - 108; }
    function plAnilloFoco(pl, color) {
        const r = pl.radio + 12;
        const angulo = Math.max(2, TAU * Math.min(1, pl.foco));
        ctx.strokeStyle = col(color, 0.25);
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(pl.x, pl.y, r, 0, TAU); ctx.stroke();
        ctx.strokeStyle = col(color, 0.95);
        ctx.beginPath(); ctx.arc(pl.x, pl.y, r, -Math.PI / 2, -Math.PI / 2 + angulo); ctx.stroke();
        if (enAprieto(pl) && (pl.pulso * 6) % 1.0 < 0.6) {
            ctx.strokeStyle = 'rgba(255,90,90,0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(pl.x, pl.y, r + 7, 0, TAU); ctx.stroke();
        }
    }

    // ---------- Mira del telescopio ----------
    function dibujarMira() {
        const { x, y } = puntero;
        const color = puntero.abajo ? [120, 255, 140] : [90, 200, 255];
        ctx.strokeStyle = col(color, 0.95);
        ctx.fillStyle = col(color, 0.95);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, RADIO_MIRA, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, RADIO_MIRA - 6, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - RADIO_MIRA - 14, y); ctx.lineTo(x - RADIO_MIRA - 4, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + RADIO_MIRA + 4, y); ctx.lineTo(x + RADIO_MIRA + 14, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - RADIO_MIRA - 14); ctx.lineTo(x, y - RADIO_MIRA - 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + RADIO_MIRA + 4); ctx.lineTo(x, y + RADIO_MIRA + 14); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
    }

    // ---------- Tabla / álbum de planetas ----------
    function tablaPlanetas(y, capturados, resaltar, hoverY) {
        const n = PLANETAS.length;
        const paso = LW / (n + 1);
        let hover = null;
        for (let i = 0; i < n; i++) {
            const p = PLANETAS[i];
            const x = paso * (i + 1);
            const capt = capturados ? capturados[p.nombre] : false;
            const res = resaltar ? resaltar.has(p.nombre) : false;
            ctx.fillStyle = capt ? col(p.color, 1) : 'rgb(70,72,84)';
            ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
            ctx.strokeStyle = res ? [255, 220, 90] : '#05070f';
            ctx.lineWidth = res ? 3 : 2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath(); ctx.arc(x - 7, y - 7, 5, 0, TAU); ctx.fill();
            texto(p.nombre, x, y + 32, 14, [255, 255, 255]);
            if (Math.hypot(x - puntero.x, y - puntero.y) <= 30) hover = p.nombre;
        }
        return hover;
    }

    function infoEnApunta(pl) {
        const ancho = Math.min(430, LW - 32);
        const x = (LW - ancho) / 2, y = LH - 116;
        ctx.fillStyle = 'rgba(12,18,40,0.92)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, ancho, 52, 10);
        else ctx.rect(x, y, ancho, 52);
        ctx.fill();
        ctx.strokeStyle = 'rgb(70,100,150)'; ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = col(pl.color, 1);
        ctx.beginPath(); ctx.arc(x + 30, y + 18, 10, 0, TAU); ctx.fill();
        texto(pl.nombre, x + 52, y + 10, 20, pl.color, false);
        const dato = pl.dato.length > 48 ? pl.dato.slice(0, 47) + '…' : pl.dato;
        texto(dato, x + 52, y + 35, 15, [200, 210, 225], false);
    }

    // ---------- Texto con contorno ----------
    function texto(t, x, y, tam, color, centro) {
        ctx.font = Math.round(tam * 1.05) + "px 'Segoe UI', Arial, sans-serif";
        ctx.textBaseline = 'middle';
        ctx.textAlign = centro === false ? 'left' : 'center';
        ctx.lineWidth = Math.max(1, tam * 0.08);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#05070f';
        ctx.strokeText(t, x, y);
        ctx.fillStyle = col(color || [255, 255, 255], 1);
        ctx.fillText(t, x, y);
    }
    function flotanteDibujar(f) {
        ctx.globalAlpha = Math.min(1, (f.vida / f.vidaMax) * 2);
        texto(f.texto, f.x, f.y, f.tam, f.color);
        ctx.globalAlpha = 1;
    }

    // ---------- Dibujado de pantallas ----------
    function dibujarInicio() {
        ctx.save();
        ctx.shadowColor = 'rgba(120,180,255,0.85)';
        ctx.shadowBlur = 26;
        texto('APUNTA AL PLANETA', LW / 2, 56, 52, [170, 220, 255]);
        ctx.restore();
        ctx.fillStyle = 'rgb(228,232,240)';
        ctx.font = '17px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Astronomías del mundo · Fundacite', LW / 2, 92);

        ctx.fillStyle = 'rgb(170,180,200)';
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Elige tu dificultad — cada una guarda su propio récord', LW / 2, 115);

        const cw = 266, ch = 118, gap = 22;
        const total = cw * 3 + gap * 2;
        const x0 = (LW - total) / 2;
        const cy = 186;
        const DESC = [
            ['Velocidad relajada, sin naves', 'Enfoque suave, sobra tiempo'],
            ['Balance clásico con naves', 'El modo de la NASA'],
            ['Rápido: naves y agujeros negros', 'Solo para astrónomos']
        ];
        DIFICULTADES.forEach((d, i) => {
            const x = x0 + cw / 2 + (cw + gap) * i;
            const hover = punteroDentro(x, cy, cw / 2 + 4, ch / 2 + 4);
            const sel = i === difIdx;
            ctx.fillStyle = hover ? 'rgb(42,56,102)' : (sel ? 'rgb(34,44,86)' : 'rgb(26,34,66)');
            if (hover && !sel) ctx.fillStyle = 'rgb(38,50,92)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x - cw / 2, cy - ch / 2, cw, ch, 13);
            else ctx.rect(x - cw / 2, cy - ch / 2, cw, ch);
            ctx.fill();
            ctx.strokeStyle = sel ? 'rgb(255,220,90)' : 'rgb(96,118,158)';
            ctx.lineWidth = sel ? 3 : 2;
            ctx.stroke();
            ctx.fillStyle = sel ? 'rgb(255,220,90)' : 'rgb(216,224,238)';
            ctx.font = '20px "Segoe UI", Arial, sans-serif';
            ctx.fillText((sel ? '★ ' : '') + d.nombre.toUpperCase(), x, cy - 36);
            ctx.fillStyle = 'rgb(172,182,202)';
            ctx.font = '14px "Segoe UI", Arial, sans-serif';
            ctx.fillText(DESC[i][0], x, cy - 6);
            ctx.fillText(DESC[i][1], x, cy + 16);
            ctx.fillStyle = 'rgb(255,225,150)';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillText('🏆 Récord: ' + recordIdx(i), x, cy + 42);
        });

        const hJ = punteroDentro(LW / 2, 324, 190, 31);
        boton('▶  JUGAR', LW / 2, 324, 380, 58, 28, hJ);
        texto('o presiona ESPACIO', LW / 2, 362, 15, [170, 180, 200]);

        ctx.fillStyle = 'rgb(205,212,226)';
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        const fil1 = ['👆 Mantén presionado para enfocar', '⭐ Captura y gana puntos', '☄️ Cada planeta enseña 3 datos'];
        const fil2 = ['🛸 Destruye naves enemigas', '🕳️ No dejes que devoren planetas', '💎 La tienda salva a los que escapan'];
        fil1.forEach((t, i) => ctx.fillText(t, LW / 2 + (i - 1) * 300, 408));
        fil2.forEach((t, i) => ctx.fillText(t, LW / 2 + (i - 1) * 300, 432));

        const hover = tablaPlanetas(LH - 60, partida.galeria, null);
        if (hover) texto(hover, LW / 2, LH - 100, 16, [255, 220, 90]);
        texto('Álbum de planetas — captúralos todos', LW / 2, LH - 16, 15, [150, 160, 180]);
    }
    function recordIdx(i) {
        try { return parseInt(localStorage.getItem('fundaciteApuntaRecord' + i), 10) || 0; }
        catch (e) { return 0; }
    }
    function difBotonPulso() {
        const cw = 266, ch = 118, gap = 22;
        const total = cw * 3 + gap * 2;
        const x0 = (LW - total) / 2;
        const cy = 186;
        if (Math.abs(puntero.y - cy) > ch / 2 + 6) return null;
        for (let i = 0; i < DIFICULTADES.length; i++) {
            const cx = x0 + cw / 2 + (cw + gap) * i;
            if (Math.abs(puntero.x - cx) <= cw / 2 + 4) return i;
        }
        return null;
    }
    function boton(label, cx, cy, w, h, tam, hover) {
        ctx.fillStyle = hover ? 'rgb(60,90,140)' : 'rgb(40,60,100)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 14);
        else ctx.rect(cx - w / 2, cy - h / 2, w, h);
        ctx.fill();
        ctx.strokeStyle = 'rgb(120,170,230)'; ctx.lineWidth = 3;
        ctx.stroke();
        texto(label, cx, cy, tam, [255, 255, 255]);
    }
    function punteroDentro(cx, cy, mitadAncho, mitadAlto) {
        return Math.abs(puntero.x - cx) <= mitadAncho && Math.abs(puntero.y - cy) <= mitadAlto;
    }

    function dibujarHUD() {
        ctx.fillStyle = 'rgb(10,14,30)';
        ctx.fillRect(0, 0, LW, 70);
        ctx.strokeStyle = 'rgb(70,90,130)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 70); ctx.lineTo(LW, 70); ctx.stroke();
        const part = p();
        const nivel = nivelDe(part);
        texto('PUNTAJE  ' + part.puntos, 70, 26, 28, [255, 255, 255], false);
        texto('NIVEL ' + nivel + '   ·   ÁLBUM ' + capturasTotal(part.galeria) + '/8', 70, 54, 18, [200, 205, 220], false);
        const m = 1 + (part.comboT > 0 ? part.combo - 1 : 0) * 0.5;
        if (part.combo > 1 && part.comboT > 0) {
            texto('COMBO x' + m.toFixed(1), LW / 2, 26, 24, [255, 220, 90]);
        }
        const efectos = [];
        if (part.turboT > 0) efectos.push('⚡' + Math.ceil(part.turboT) + 's');
        if (part.comboEstT > 0) efectos.push('💫' + Math.ceil(part.comboEstT) + 's');
        if (part.autoT > 0) efectos.push('🔭' + Math.ceil(part.autoT) + 's');
        if (efectos.length) texto(efectos.join('   '), LW / 2, 54, 17, [255, 210, 120]);
        const vidas = '\u2665 '.repeat(Math.min(part.vidas, VIDAS_MAX)).trim();
        ctx.textAlign = 'right';
        ctx.font = '24px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = 'rgb(255,120,120)';
        ctx.strokeStyle = '#05070f'; ctx.lineWidth = 3;
        ctx.strokeText(vidas, LW - 20, 24);
        ctx.fillText(vidas, LW - 20, 24);
        ctx.textAlign = 'right';
        ctx.font = '20px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = 'rgb(120,255,140)';
        const enOrbita = activos(part).length;
        let hudDerecha = 'óRB ' + enOrbita + ' · 🛸 ' + naves.length + ' · 🕳 ' + agujeros.length;
        if (part.bhCatch > 0) hudDerecha += ' · ' + part.bhCatch + ' en reserva';
        ctx.fillText(hudDerecha + ' · ' + dificultad().nombre.toUpperCase(), LW - 20, 48);
        // Botón pausa + tienda
        const pausaX = LW - 45, pausaY = 90;
        ctx.fillStyle = 'rgba(40,60,100,0.85)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pausaX - 65, pausaY - 14, 130, 28, 8);
        else ctx.rect(pausaX - 65, pausaY - 14, 130, 28);
        ctx.fill();
        ctx.strokeStyle = 'rgb(120,170,230)'; ctx.lineWidth = 2;
        ctx.stroke();
        texto(estado === ESTADOS.PAUSA ? '▶ CONTINUAR' : '⏸ PAUSA', pausaX, pausaY, 15, [220, 228, 240]);

        const shopX = LW - 165, shopY = 90;
        ctx.fillStyle = 'rgba(96,70,20,0.9)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(shopX - 55, shopY - 14, 110, 28, 8);
        else ctx.rect(shopX - 55, shopY - 14, 110, 28);
        ctx.fill();
        ctx.strokeStyle = 'rgb(255,200,90)'; ctx.lineWidth = 2;
        ctx.stroke();
        texto('💎 TIENDA', shopX, shopY, 15, [255, 225, 150]);
    }
    function botonPausaClick() {
        const px = LW - 45, py = 90;
        return Math.abs(puntero.x - px) <= 65 && Math.abs(puntero.y - py) <= 14;
    }
    function botonTiendaClick() {
        const px = LW - 165, py = 90;
        return Math.abs(puntero.x - px) <= 55 && Math.abs(puntero.y - py) <= 14;
    }
    function dibujarAlbumYEstado() {
        const part = p();
        const resaltar = new Set(activos(part).map((pl) => pl.nombre));
        const hover = tablaPlanetas(LH - 40, part.galeria, resaltar);
        if (hover) texto(hover, LW / 2, LH - 40 - 48, 18, [255, 220, 90]);
        const n = activos(part).length;
        texto(capturasTotal(part.galeria) + '/8 planetas del álbum  ·  apunta a ' + n + ' planeta' + (n !== 1 ? 's' : ''),
            LW / 2, LH - 4, 15, [170, 180, 200]);
    }
    function dibujarBanner(part) {
        if (!part.banner) return;
        const alpha = Math.min(1, part.bannerT / 0.4);
        ctx.globalAlpha = alpha;
        texto(part.banner, LW / 2, 120, 40, part.bannerColor);
        ctx.globalAlpha = 1;
    }

    function dibujarPausa() {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, LW, LH);
        texto('PAUSA', LW / 2, LH / 2, 66, [255, 255, 255]);
        texto('Presiona P para continuar, o toca la pantalla', LW / 2, LH / 2 + 52, 22, [200, 210, 225]);
    }

    function dibujarFin() {
        const part = p();
        texto('FIN DE LA OBSERVACIÓN', LW / 2, 105, 50, [255, 160, 160]);
        texto('Puntaje final: ' + part.puntos, LW / 2, 175, 38, [255, 255, 255]);
        const nuevo = part.puntos >= record && part.puntos > 0;
        if (nuevo) texto('★ NUEVO RÉCORD ★', LW / 2, 220, 28, [255, 220, 90]);
        else texto('Mejor puntaje: ' + record, LW / 2, 220, 26, [230, 200, 120]);
        texto('Álbum completado: ' + capturasTotal(part.galeria) + '/8', LW / 2, 268, 24, [200, 205, 220]);
        const hover = tablaPlanetas(360, part.galeria, null);
        if (hover) texto(hover, LW / 2, 322, 18, [255, 220, 90]);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgb(190,200,215)';
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Álbum: los planetas capturados quedan iluminados', LW / 2, 412);
        const hoverM = punteroDentro(LW / 2, 442, 150, 27);
        boton('REINTENTAR  (R)', LW / 2, 442, 300, 54, 24, hoverM);
    }

    // ---------- Actualización ----------
    function actualizar(dt) {
        tiempo += dt;
        estrellas.forEach((e) => estrellaMover(e, dt));
        asteroides.forEach((a) => {
            a.x += a.vx * dt; a.y += a.vy * dt; a.rot += a.vr * dt;
            if (a.x < -20) a.x += LW + 40; else if (a.x > LW + 20) a.x -= LW + 40;
            if (a.y < -20) a.y += LH + 40; else if (a.y > LH + 20) a.y -= LH + 40;
        });

        if (estado === ESTADOS.JUGANDO || estado === ESTADOS.PAUSA || estado === ESTADOS.INICIO) {
            spawnFugaz -= dt;
            if (spawnFugaz <= 0) { fugaces.push(hacerFugaz()); spawnFugaz = 5 + Math.random() * 6; }
            fugaces = fugaces.filter((f) => { f.vida -= dt; f.x += f.vx * dt; f.y += f.vy * dt; return f.vida > 0; });
        }

        if (estado !== ESTADOS.JUGANDO) {
            sacudida *= Math.exp(-dt * 6);
            if (flashT > 0) flashT -= dt;
            return;
        }

        const part = p();
        if (part.comboEstT > 0) {
            part.comboEstT -= dt;
            part.combo = Math.max(part.combo, 1);
            part.comboT = COMBO_T;
        } else {
            part.comboT -= dt;
            if (part.comboT <= 0) part.combo = 0;
        }
        if (part.turboT > 0) part.turboT -= dt;
        if (part.autoT > 0) part.autoT -= dt;
        const turbo = part.turboT > 0 ? 3 : 1;
        const nivel = nivelDe(part);
        const objetivo = Math.min(dificultad().planetaMax, 1 + Math.floor((nivel - 1) / 3));

        const cntAct = activos(part);
        let autoTgt = null;
        if (part.autoT > 0 && cntAct.length) {
            autoTgt = cntAct.reduce((a, b) => (b.vida < a.vida ? b : a), cntAct[0]);
        }

        if (cntAct.length < objetivo) {
            part.espera -= dt;
            if (part.espera <= 0) {
                part.planetas.push(crearPlaneta(nivel));
                part.espera = Math.max(0.12, dificultad().spawn - nivel * 0.03);
            }
        }

        cometaT -= dt;
        if (cometaT <= 0) { cometas.push(crearCometa()); cometaT = 12 + Math.random() * 8; }
        for (const c of cometas.slice()) {
            c.pulso += dt;
            c.vida -= dt;
            agujeros.forEach((b) => bhTirar(b, c, dt));
            c.x += c.vx * dt; c.y += c.vy * dt;
            if (c.vida <= 0) { cometas.splice(cometas.indexOf(c), 1); continue; }
            if (agujeros.some((b) => Math.hypot(b.x - c.x, b.y - c.y) < b.radio + c.radio + 4)) {
                cometas.splice(cometas.indexOf(c), 1);
                continue;
            }
            const ddc = Math.hypot(c.x - puntero.x, c.y - puntero.y);
            if (ddc <= RADIO_MIRA + c.radio * 0.5 && puntero.abajo) {
                c.foco = Math.min(1, c.foco + dt / 0.9 * turbo);
                if (c.foco >= 1) {
                    const mult = 1 + (part.comboT > 0 ? part.combo - 1 : 0) * 0.5;
                    const bonus = Math.floor((120 + nivel * 40) * Math.max(1, mult));
                    part.puntos += bonus;
                    part.combo = part.comboT > 0 ? part.combo + 1 : 1;
                    part.comboT = COMBO_T;
                    part.flotantes.push(textFlotante('¡COMETA! +' + bonus, [150, 230, 255], c.x, c.y - 16));
                    SONIDOS.cometa();
                    sacudida = 3;
                    cometas.splice(cometas.indexOf(c), 1);
                }
            } else {
                c.foco = Math.max(0, c.foco - dt);
            }
        }

        // ----- Naves espaciales -----
        if (dificultad().naves && nivel >= 2) {
            naveT -= dt;
            if (naveT <= 0) {
                naves.push(crearNave(nivel, Math.random() < 0.18 && nivel >= 6 ? 'nodriza' : 'combate'));
                naveT = 7 + Math.random() * 9;
            }
        }
        for (const n of naves.slice()) {
            n.pulso += dt;
            agujeros.forEach((b) => bhTirar(b, n, dt));
            if (n.tipo === 'combate') {
                n.x += n.vx * dt;
                n.y += Math.sin(n.pulso * 2.2) * 55 * dt;
                n.y = Math.max(78, Math.min(LH - 78, n.y));
                n.ang = Math.atan2(Math.sin(n.pulso * 2.2) * 55, n.vx);
            } else {
                n.x += n.vx * dt + Math.sin(n.pulso * 0.8) * 22 * dt;
                n.y += n.vy * dt;
                n.ang = Math.atan2(n.vy, n.vx + Math.sin(n.pulso * 0.8) * 22);
            }
            if (agujeros.some((b) => Math.hypot(b.x - n.x, b.y - n.y) < b.radio + n.radio + 4)) {
                part.flotantes.push(textFlotante('nave devorada', [160, 190, 220], n.x, n.y));
                naves.splice(naves.indexOf(n), 1);
                continue;
            }
            const exitX = (n.vx > 0 && n.x > LW + 40) || (n.vx < 0 && n.x < -40);
            const exitY = n.tipo === 'nodriza' && n.y > LH + 50;
            if (exitX || exitY) {
                const perd = n.tipo === 'nodriza' ? 2 : 1;
                part.vidas -= perd;
                part.flotantes.push(textFlotante(n.tipo === 'nodriza' ? '★ NODRIZA ESCAPÓ' : 'NAVE ESCAPÓ', [255, 90, 90], n.x, n.y));
                SONIDOS.fuga();
                sacudida = 4;
                naves.splice(naves.indexOf(n), 1);
                continue;
            }
            const dn = Math.hypot(n.x - puntero.x, n.y - puntero.y);
            if (dn <= RADIO_MIRA + n.radio * 0.5 && puntero.abajo) {
                n.foco = Math.min(1, n.foco + dt / 0.85 * turbo);
                if (n.foco >= 1) {
                    const mult = 1 + (part.comboT > 0 ? part.combo - 1 : 0) * 0.5;
                    const ganancia = Math.floor((n.tipo === 'nodriza' ? 200 : 80 + nivel * 30) * Math.max(1, mult));
                    part.puntos += ganancia;
                    part.combo = part.comboT > 0 ? part.combo + 1 : 1;
                    part.comboT = COMBO_T;
                    part.flotantes.push(textFlotante((n.tipo === 'nodriza' ? '★ NODRIZA +' : '✦ NAVE +') + ganancia, n.tipo === 'nodriza' ? [150, 200, 255] : [150, 255, 170], n.x, n.y - 18));
                    SONIDOS.nave();
                    sacudida = 3;
                    naves.splice(naves.indexOf(n), 1);
                }
            } else {
                n.foco = Math.max(0, n.foco - dt);
            }
        }

        // ----- Agujeros negros -----
        if (nivel >= dificultad().bhDesde && agujeros.length < 2) {
            bhT -= dt;
            if (bhT <= 0) {
                agujeros.push(crearAgujero());
                part.banner = '🕳️ ¡AGUJERO NEGRO! Destrúyelo';
                part.bannerColor = [200, 120, 255];
                part.bannerT = 1.8;
                SONIDOS.fuga();
                bhT = dificultad().bhInt + Math.random() * 14;
            }
        }
        for (const b of agujeros.slice()) {
            b.pulso += dt;
            b.x += Math.cos(b.pulso * 0.37) * 14 * dt;
            b.y += Math.sin(b.pulso * 0.5) * 16 * dt;
            b.x = Math.max(88, Math.min(LW - 88, b.x));
            b.y = Math.max(92, Math.min(LH - 118, b.y));
            const db = Math.hypot(b.x - puntero.x, b.y - puntero.y);
            if (db <= RADIO_MIRA + b.radio + 10 && puntero.abajo) {
                b.foco = Math.min(1, b.foco + dt / 1.4 * turbo);
                if (b.foco >= 1) {
                    const mult = 1 + (part.comboT > 0 ? part.combo - 1 : 0) * 0.5;
                    const bonus = Math.floor((220 + nivel * 60) * Math.max(1, mult));
                    part.puntos += bonus;
                    part.combo = part.comboT > 0 ? part.combo + 1 : 1;
                    part.comboT = COMBO_T;
                    part.flotantes.push(textFlotante('🕳️ COLAPSADO +' + bonus, [200, 150, 255], b.x, b.y - 22, 30));
                    SONIDOS.colapso();
                    sacudida = 7;
                    for (const o of part.planetas.concat(cometas, naves)) {
                        const dx = o.x - b.x, dy = o.y - b.y;
                        const d = Math.hypot(dx, dy) || 1;
                        const f = 420 / d;
                        o.dx += dx * f; o.dy += dy * f;
                    }
                    agujeros.splice(agujeros.indexOf(b), 1);
                }
            } else {
                b.foco = Math.max(0, b.foco - dt);
            }
        }

        for (const pl of part.planetas.slice()) {
            plActualizar(pl, dt, nivel);
            if (pl.estado === 'activo') {
                const dx = pl.x - puntero.x, dy = pl.y - puntero.y;
                const dentro = Math.hypot(dx, dy) <= RADIO_MIRA + pl.radio * 0.5;
                const autoEnfocando = part.autoT > 0 && pl === autoTgt;
                if ((dentro && puntero.abajo) || autoEnfocando) {
                    const tiempoFoco = Math.max(dificultad().focoMin, dificultad().focoBase - nivel * 0.03);
                    const antes = pl.foco;
                    pl.foco = Math.min(1, pl.foco + dt / tiempoFoco * turbo);
                    for (const m of [0.33, 0.66]) {
                        if (antes < m && pl.foco >= m && !pl.milestonia[m]) {
                            pl.milestonia[m] = true;
                            SONIDOS.tick();
                        }
                    }
                    if (pl.foco >= 1) {
                        part.combo = part.comboT > 0 ? part.combo + 1 : 1;
                        part.comboT = COMBO_T;
                        const mult = 1 + (part.combo - 1) * 0.5;
                        const ganancia = Math.floor((50 + nivel * 25) * mult);
                        part.puntos += ganancia;
                        part.capturas += 1;
                        part.galeria[pl.nombre] = true;
                        registrarTrofeo(pl.nombre);
                        const nidx = escenaDe(nivelDe(part));
                        if (nidx !== escenaIdx) aplicarEscena(nidx, false);
                        const etiqueta = '+' + ganancia + (part.combo > 1 ? '  x' + part.combo : '');
                        part.flotantes.push(textFlotante(etiqueta, [255, 220, 90], pl.x, pl.y - pl.radio - 6));
                        part.flotantes.push(textFlotante(pl.nombre + ': ' + pl.dato, [190, 220, 255], pl.x, pl.y + pl.radio + 16, 20));
                        part.banner = '★  ' + pl.nombre.toUpperCase() + ' CAPTURADO  ★';
                        part.bannerColor = [255, 220, 90];
                        part.bannerT = 1.6;
                        SONIDOS.captura(part.combo);
                        sacudida = 6;
                        if (part.puntos >= VIDA_PTS && part.vidas < VIDAS_MAX) {
                            part.vidas += 1;
                            part.flotantes.push(textFlotante('+1 VIDA', [120, 255, 140], LW / 2, LH * 0.4));
                            SONIDOS.vida();
                        }
                        pl.estado = 'capturado';
                        pl.foco = 0;
                        pl.radioIni = pl.radio;
                        pl.capT = 0;
                        part.espera = Math.min(part.espera, 0.7);
                    }
                } else if (pl.foco > 0) {
                    pl.foco = Math.max(0, pl.foco - dt);
                }
            } else if (enRetirada(pl)) {
                if (pl.estado === 'atraido') {
                    pl.at += dt / 0.6;
                    const k = 1 - Math.pow(1 - Math.min(1, pl.at), 3);
                    pl.x = pl.oX + (portalCaptadorX() - pl.oX) * k;
                    pl.y = pl.oY + (portalCaptadorY() - pl.oY) * k;
                    pl.radio = Math.max(3, pl.radio - pl.radioAc * dt * 1.4);
                    if (pl.at >= 1) {
                        part.capturas += 1;
                        part.galeria[pl.nombre] = true;
                        registrarTrofeo(pl.nombre);
                        const bonus = Math.floor(80 + nivel * 20);
                        part.puntos += bonus;
                        part.flotantes.push(textFlotante('🕳️ ' + pl.nombre + ' atrapado +' + bonus, [200, 150, 255], portalCaptadorX(), portalCaptadorY() - 40));
                        part.banner = '🕳  ' + pl.nombre.toUpperCase() + ' SALVADO POR EL CAPTADOR  🕳';
                        part.bannerColor = [200, 150, 255];
                        part.bannerT = 1.8;
                        SONIDOS.colapso();
                        sacudida = 3;
                        const nidx = escenaDe(nivelDe(part));
                        if (nidx !== escenaIdx) aplicarEscena(nidx, false);
                        part.planetas.splice(part.planetas.indexOf(pl), 1);
                        part.espera = Math.min(part.espera, 0.7);
                    }
                } else if (pl.estado === 'escapado') {
                    if (part.bhCatch > 0) {
                        part.bhCatch -= 1;
                        pl.estado = 'atraido';
                        pl.at = 0;
                        pl.oX = pl.x; pl.oY = pl.y;
                        pl.radioAc = pl.radio;
                        SONIDOS.portal();
                    } else {
                        part.vidas -= 1;
                        part.flotantes.push(textFlotante(pl.nombre + ' escapó', [255, 90, 90], pl.x, pl.y));
                        SONIDOS.fuga();
                        sacudida = 4;
                        part.planetas.splice(part.planetas.indexOf(pl), 1);
                        part.espera = Math.min(part.espera, 0.7);
                    }
                } else if (pl.estado === 'capturado') {
                    pl.capT += dt;
                    const k = Math.min(1, pl.capT / 0.45);
                    const pop = 1 + Math.sin(k * Math.PI) * 0.5;
                    pl.radio = Math.max(2, pl.radioIni * (1 - k * 0.75) * pop);
                    if (k >= 1) {
                        part.planetas.splice(part.planetas.indexOf(pl), 1);
                        part.espera = Math.min(part.espera, 0.7);
                    }
                } else if (pl.estado === 'devorado') {
                    part.vidas -= 1;
                    part.flotantes.push(textFlotante('🕳️ ' + pl.nombre + ' devorado', [200, 150, 255], pl.x, pl.y));
                    SONIDOS.fuga();
                    sacudida = 5;
                    part.planetas.splice(part.planetas.indexOf(pl), 1);
                    part.espera = Math.min(part.espera, 0.7);
                }
            }
        }

        portalAtraer(part, dt);

        if (part.vidas <= 0) {
            if (part.puntos > record) { record = part.puntos; guardarRecord(record); }
            estado = ESTADOS.FIN;
        }

        part.bannerT -= dt;
        if (part.bannerT <= 0) part.banner = null;
        part.flotantes = part.flotantes.filter((f) => {
            f.vida -= dt; f.y -= 42 * dt; return f.vida > 0;
        });
        sacudida *= Math.exp(-dt * 6);
    }

    // ---------- Dibujado ----------
    function dibujar() {
        // Fondo del espacio
        const fino = ESCENAS[escenaIdx];
        const g = ctx.createLinearGradient(0, 0, 0, LH);
        g.addColorStop(0, fino.top);
        g.addColorStop(1, fino.bot);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, LW, LH);

        let ox = 0, oy = 0;
        if (sacudida > 0.4) {
            ox = Math.floor(Math.random() * (sacudida + 1)) * (Math.random() < 0.5 ? -1 : 1);
            oy = Math.floor(Math.random() * (sacudida + 1)) * (Math.random() < 0.5 ? -1 : 1);
        }
        ctx.save();
        ctx.translate(ox, oy);
        nebulosas.forEach((n, i) => nebulosaDibujar(n, i));
        asteroides.forEach(asteroideDibujar);
        estrellas.forEach((e) => estrellaDibujar(e, tiempo));
        fugaces.forEach(fugazDibujar);
        agujeros.forEach(agujeroDibujar);

        if (estado === ESTADOS.JUGANDO || estado === ESTADOS.PAUSA || estado === ESTADOS.TIENDA) {
            const part = p();
            let apuntado = null;
            const cntAct = activos(part);
            let autoTgtActual = null;
            if (part.autoT > 0 && cntAct.length) {
                autoTgtActual = cntAct.reduce((a, b) => (b.vida < a.vida ? b : a), cntAct[0]);
            }
            for (const pl of part.planetas) {
                plDibujar(pl);
                plEtiqueta(pl);
                if (pl.estado === 'activo') {
                    const dentro = Math.hypot(pl.x - puntero.x, pl.y - puntero.y) <= RADIO_MIRA + pl.radio * 0.5;
                    const color = dentro && puntero.abajo ? [120, 255, 140] : [255, 220, 90];
                    plAnilloFoco(pl, color);
                    if (dentro) apuntado = pl;
                    if (pl === autoTgtActual) {
                        ctx.strokeStyle = 'rgba(120,200,255,0.9)';
                        ctx.lineWidth = 3;
                        ctx.setLineDash([4, 6]);
                        ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.radio + 24, 0, TAU); ctx.stroke();
                        ctx.setLineDash([]);
                        texto('🔭', pl.x, pl.y - pl.radio - 52, 15, [120, 200, 255]);
                    }
                    if (part.bhCatch > 0 && enAprieto(pl) && pl !== autoTgtActual) {
                        ctx.strokeStyle = 'rgba(255,220,90,0.85)';
                        ctx.lineWidth = 3;
                        ctx.setLineDash([6, 6]);
                        ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.radio + 17 + Math.sin(pl.pulso * 3) * 2, 0, TAU); ctx.stroke();
                        ctx.setLineDash([]);
                        texto('🕳', pl.x, pl.y - pl.radio - 52, 17, [255, 220, 90]);
                    }
                }
            }
            cometas.forEach(cometaDibujar);
            naves.forEach(naveDibujar);
            part.flotantes.forEach(flotanteDibujar);
            portalCaptador(part);
            ctx.restore();

            dibujarHUD();
            if (apuntado) infoEnApunta(apuntado);
            dibujarBanner(part);
            dibujarAlbumYEstado();
            if (estado === ESTADOS.PAUSA) dibujarPausa();
            if (estado === ESTADOS.TIENDA) dibujarTienda();
            dibujarMira();
        } else if (estado === ESTADOS.INICIO) {
            ctx.restore();
            dibujarInicio();
        } else {
            ctx.restore();
            dibujarFin();
        }
    }

    function dibujarTienda() {
        ctx.fillStyle = 'rgba(10,6,24,0.82)';
        ctx.fillRect(0, 0, LW, LH);
        const cw = 680, ch = 470;
        const cx = (LW - cw) / 2, cy = (LH - ch) / 2 + 6;
        ctx.fillStyle = 'rgb(16,12,34)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(cx, cy, cw, ch, 16);
        else ctx.rect(cx, cy, cw, ch);
        ctx.fill();
        ctx.strokeStyle = 'rgb(255,200,90)'; ctx.lineWidth = 3;
        ctx.stroke();
        texto('💎 TIENDA DE SUPERVIVENCIA', LW / 2, cy + 32, 24, [255, 225, 150]);
        texto('Compra al instante · toca afuera para cerrar', LW / 2, cy + 54, 14, [190, 196, 220]);
        texto('PUNTOS: ' + p().puntos, LW / 2, cy + 76, 20, [255, 255, 255]);

        const iw = 300, ih = 96, gap = 16;
        const ty0 = cy + 88;
        TIENDA.forEach((it, i) => {
            const ix = cx + 18 + (i % 2) * (iw + gap);
            const iy = ty0 + Math.floor(i / 2) * (ih + gap);
            const sePuede = p().puntos >= it.costo;
            const hover = punteroDentro(ix + iw / 2, iy + ih / 2, iw / 2, ih / 2);
            ctx.fillStyle = hover ? 'rgb(42,34,74)' : 'rgb(24,20,44)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(ix, iy, iw, ih, 12);
            else ctx.rect(ix, iy, iw, ih);
            ctx.fill();
            ctx.strokeStyle = sePuede ? 'rgb(160,130,70)' : 'rgb(84,72,96)';
            ctx.lineWidth = hover ? 3 : 2;
            ctx.stroke();
            ctx.fillStyle = it.color;
            ctx.beginPath(); ctx.arc(ix + 30, iy + 30, 22, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.beginPath(); ctx.arc(ix + 24, iy + 24, 6, 0, TAU); ctx.fill();
            ctx.textAlign = 'left';
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillText(it.icono, ix + 24 - 12, iy + 36);
            ctx.fillStyle = sePuede ? 'rgb(255,255,255)' : 'rgb(150,148,160)';
            ctx.font = '17px "Segoe UI", Arial, sans-serif';
            ctx.fillText(it.nombre, ix + 64, iy + 22);
            ctx.fillStyle = 'rgb(180,186,210)';
            ctx.font = '13px "Segoe UI", Arial, sans-serif';
            const desc = it.desc.length > 46 ? it.desc.slice(0, 45) + '…' : it.desc;
            ctx.fillText(desc, ix + 64, iy + 46);
            ctx.fillStyle = sePuede ? 'rgb(255,200,90)' : 'rgb(230,120,120)';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillText('💠 ' + it.costo + ' pts', ix + 64, iy + 74);
            if (!sePuede) {
                ctx.fillStyle = 'rgba(90,30,48,0.4)';
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(ix, iy, iw, ih, 12);
                else ctx.rect(ix, iy, iw, ih);
                ctx.fill();
            }
            if (flashItem === i && flashT > 0) {
                ctx.fillStyle = 'rgba(255,60,60,0.4)';
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(ix, iy, iw, ih, 12);
                else ctx.rect(ix, iy, iw, ih);
                ctx.fill();
            }
        });

        const by = cy + ch - 40;
        ctx.fillStyle = 'rgb(60,90,140)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(LW / 2 - 62, by - 15, 124, 30, 8);
        else ctx.rect(LW / 2 - 62, by - 15, 124, 30);
        ctx.fill();
        ctx.strokeStyle = 'rgb(120,170,230)'; ctx.lineWidth = 2;
        ctx.stroke();
        texto('✕ CERRAR', LW / 2, by, 17, [230, 235, 245]);
    }
    function tiendaItemPulso() {
        const cw = 680, ch = 470, cx = (LW - cw) / 2, cy = (LH - ch) / 2 + 6;
        const iw = 300, ih = 96, gap = 16;
        const ty0 = cy + 88;
        for (let i = 0; i < TIENDA.length; i++) {
            const ix = cx + 18 + (i % 2) * (iw + gap);
            const iy = ty0 + Math.floor(i / 2) * (ih + gap);
            if (punteroDentro(ix + iw / 2, iy + ih / 2, iw / 2 + 4, ih / 2 + 4)) return i;
        }
        const by = cy + ch - 40;
        if (punteroDentro(LW / 2, by, 62, 15)) return -2;
        return -1;
    }

    // ---------- Bucle ----------
    function bucle(now) {
        requestAnimationFrame(bucle);
        const dt = Math.min(0.05, (now - ultimo) / 1000 || 0.016);
        ultimo = now;
        actualizar(dt);
        dibujar();
    }

    // ---------- Entrada: ratón + táctil (pointer events) ----------
    function aLog(e) {
        const r = canvas.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * LW;
        const y = (e.clientY - r.top) / r.height * LH;
        return { x, y };
    }
    function alClic() {
        if (estado === ESTADOS.INICIO) {
            const b = difBotonPulso();
            if (b !== null) {
                difIdx = b;
                record = cargarRecord();
                if (selectDif !== null) selectDif.value = String(difIdx);
                SONIDOS.clic();
            } else if (punteroDentro(LW / 2, 324, 190, 31)) {
                nuevoJuego();
                estado = ESTADOS.JUGANDO;
                SONIDOS.clic();
            }
            return;
        }
    function comprarItem(it) {
        if (it < 0 || it >= TIENDA.length) return false;
        const item = TIENDA[it];
        const part = p();
        if (!part) return false;
        if (part.puntos >= item.costo && item.aplicar(part)) {
            part.puntos -= item.costo;
            part.flotantes.push(textFlotante(item.icono + ' comprado ✓', [255, 220, 90], LW / 2, LH * 0.42, 24));
            SONIDOS.vida();
            sacudida = 2;
            estado = ESTADOS.JUGANDO;
            return true;
        } else {
            flashItem = it; flashT = 0.35;
            SONIDOS.tick();
            return false;
        }
    }

    if (estado === ESTADOS.TIENDA) {
        const it = tiendaItemPulso();
        if (it >= 0) {
            comprarItem(it);
        } else {
            estado = ESTADOS.JUGANDO;
            SONIDOS.clic();
        }
        return;
    }
    if (estado === ESTADOS.FIN) {
        if (punteroDentro(LW / 2, 442, 150, 27)) {
            nuevoJuego();
            estado = ESTADOS.JUGANDO;
            SONIDOS.clic();
        }
    } else if (estado === ESTADOS.PAUSA) {
        estado = ESTADOS.JUGANDO;
        SONIDOS.clic();
    } else if (estado === ESTADOS.JUGANDO) {
        if (botonTiendaClick()) {
            estado = ESTADOS.TIENDA;
            SONIDOS.clic();
        } else if (botonPausaClick()) {
            estado = ESTADOS.PAUSA;
            SONIDOS.clic();
        }
    }
}

    // ---------- Pantalla Completa ----------
    const fsBtn = document.getElementById('game-fullscreen');
    function alternarPantallaCompleta() {
        const wrap = canvas.parentElement || canvas;
        if (!document.fullscreenElement) {
            if (wrap.requestFullscreen) {
                wrap.requestFullscreen().catch(() => {
                    if (canvas.requestFullscreen) canvas.requestFullscreen();
                });
            } else if (canvas.requestFullscreen) {
                canvas.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }
    if (fsBtn) {
        fsBtn.addEventListener('click', alternarPantallaCompleta);
        document.addEventListener('fullscreenchange', () => {
            fsBtn.textContent = document.fullscreenElement ? '🗗 Salir' : '⛶ Pantalla Completa';
        });
    }

    canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        acSafe();
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        const q = aLog(e);
        puntero.x = q.x; puntero.y = q.y;
        puntero.abajo = true;
        alClic();
    }, { passive: false });
    canvas.addEventListener('pointermove', (e) => {
        e.preventDefault();
        const q = aLog(e);
        puntero.x = q.x; puntero.y = q.y;
    }, { passive: false });
    function liberar() { puntero.abajo = false; }
    canvas.addEventListener('pointerup', liberar);
    canvas.addEventListener('pointercancel', liberar);
    canvas.addEventListener('pointerleave', liberar);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
        const k = e.key;
        if (k === ' ' || k === 'Enter') {
            if (estado === ESTADOS.INICIO || estado === ESTADOS.FIN) {
                nuevoJuego(); estado = ESTADOS.JUGANDO; SONIDOS.clic();
            } else if (estado === ESTADOS.JUGANDO && k === ' ') {
                puntero.abajo = true;
            }
            e.preventDefault();
        } else if (k === 'r' || k === 'R') {
            if (estado === ESTADOS.FIN) { nuevoJuego(); estado = ESTADOS.JUGANDO; SONIDOS.clic(); }
        } else if (k === 'p' || k === 'P' || k === 'Escape') {
            if (estado === ESTADOS.JUGANDO) {
                estado = ESTADOS.PAUSA; SONIDOS.clic();
            } else if (estado === ESTADOS.PAUSA || estado === ESTADOS.TIENDA) {
                estado = ESTADOS.JUGANDO; SONIDOS.clic();
            }
        } else if (k === 'f' || k === 'F') {
            alternarPantallaCompleta();
        } else if (k === 'm' || k === 'M') {
            if (soundBtn) soundBtn.click();
        } else if (k === 't' || k === 'T') {
            if (estado === ESTADOS.JUGANDO) {
                estado = ESTADOS.TIENDA; SONIDOS.clic();
            } else if (estado === ESTADOS.TIENDA) {
                estado = ESTADOS.JUGANDO; SONIDOS.clic();
            }
        } else if (k >= '1' && k <= '6') {
            const idx = parseInt(k, 10) - 1;
            if (estado === ESTADOS.TIENDA) {
                comprarItem(idx);
            } else if (estado === ESTADOS.JUGANDO) {
                estado = ESTADOS.TIENDA;
                comprarItem(idx);
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === ' ') {
            puntero.abajo = false;
        }
    });

    window.addEventListener('blur', () => {
        if (estado === ESTADOS.JUGANDO) estado = ESTADOS.PAUSA;
    });

    const selectDif = document.getElementById('game-dif');
    if (selectDif) {
        selectDif.value = String(difIdx);
        selectDif.addEventListener('change', () => {
            const v = parseInt(selectDif.value, 10);
            if (!isNaN(v) && DIFICULTADES[v]) {
                difIdx = v;
                record = cargarRecord();
                SONIDOS.clic();
            }
        });
    }

    // ---------- Arranque ----------
    for (let i = 0; i < 5; i++) {
        nebulosas.push({ x: Math.random() * LW, y: Math.random() * LH, r: 130 + Math.random() * 150 });
    }
    aplicarEscena(0, true);
    sincronizarTrofeosUI();
    nuevoJuego();
    requestAnimationFrame(bucle);
})();