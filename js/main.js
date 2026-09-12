// =============================================
// ASTRONOMÍAS DEL MUNDO · FUNDACITE CARACAS
// JavaScript ligero y estático
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAudioAtmosphere();
    initNav();
    initHeroStars();
    initAstronomersFilter();
    initCaracasSky();
    initSolarOrrery();
    initTools();
    initClassroom();
    initFooterYear();
});

// ---------- Menú móvil ----------
function initNav() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => nav.classList.toggle('open'));
        nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
    }
}

// =============================================
// SELECTOR DE TEMAS (PERGAMINO / COSMOS / LUZ ROJA)
// =============================================
function initTheme() {
    const THEMES = ['default', 'dark', 'redshift'];
    const THEME_NAMES = {
        'default': '☀️ Pergamino',
        'dark': '🌌 Cosmos',
        'redshift': '🔴 Observatorio'
    };

    let saved = localStorage.getItem('fundacite_theme') || 'default';
    if (!THEMES.includes(saved)) saved = 'default';

    const applyTheme = (theme) => {
        if (theme === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('fundacite_theme', theme);

        document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
            btn.innerHTML = `<span>${THEME_NAMES[theme]}</span>`;
            btn.setAttribute('title', `Tema actual: ${THEME_NAMES[theme]}. Clic para cambiar.`);
        });
    };

    applyTheme(saved);

    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const current = localStorage.getItem('fundacite_theme') || 'default';
            const nextIdx = (THEMES.indexOf(current) + 1) % THEMES.length;
            applyTheme(THEMES[nextIdx]);
            playChime(587.33);
        });
    });
}

// =============================================
// AUDIO AMBIENTAL PROCEDURAL (WEB AUDIO API)
// Sin archivos pesados: 100% generado en vivo
// =============================================
let audioCtx = null;
let ambientGain = null;
let isAudioActive = false;
let oscillators = [];

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playChime(freq = 523.25) {
    if (!isAudioActive) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
    } catch (e) { /* ignore */ }
}

function startCosmicAmbient() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        ambientGain = ctx.createGain();
        ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        ambientGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        ambientGain.connect(filter);
        filter.connect(ctx.destination);

        // Acorde espacial (C2, G2, C3, E3)
        const chordFrequencies = [65.41, 98.00, 130.81, 164.81];
        oscillators = chordFrequencies.map((f, i) => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(f + (i * 0.35), ctx.currentTime);
            oscGain.gain.value = 0.25;
            osc.connect(oscGain);
            oscGain.connect(ambientGain);
            osc.start();
            return osc;
        });

        isAudioActive = true;
    } catch (e) {
        console.warn('Audio contextual no disponible', e);
    }
}

function stopCosmicAmbient() {
    if (!audioCtx || !ambientGain) return;
    try {
        ambientGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        setTimeout(() => {
            oscillators.forEach((o) => { try { o.stop(); o.disconnect(); } catch (e) {} });
            oscillators = [];
            isAudioActive = false;
        }, 1300);
    } catch (e) {}
}

function initAudioAtmosphere() {
    const btns = document.querySelectorAll('.audio-toggle-btn');
    if (!btns.length) return;

    const updateBtns = (active) => {
        btns.forEach((btn) => {
            btn.classList.toggle('active', active);
            btn.innerHTML = active
                ? '<span>🎵 Música Cósmica: ON</span>'
                : '<span>🔇 Música Cósmica: OFF</span>';
            btn.setAttribute('title', active ? 'Silenciar música espacial' : 'Activar atmósfera espacial sintetizada');
        });
    };

    btns.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!isAudioActive) {
                startCosmicAmbient();
                updateBtns(true);
            } else {
                stopCosmicAmbient();
                updateBtns(false);
            }
        });
    });
}

// =============================================
// CANVAS HERO CON CONSTELACIONES DINÁMICAS
// =============================================
function initHeroStars() {
    const canvas = document.getElementById('hero-stars-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let stars = [];
    let meteors = [];
    let mouse = { x: -9999, y: -9999, radius: 140 };

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
        initStars();
    }

    function initStars() {
        stars = [];
        const count = Math.floor((width * height) / 4800);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
                color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#ffd57d' : '#99c3ff')
            });
        }
    }

    function spawnMeteor() {
        if (Math.random() < 0.015 && meteors.length < 3) {
            meteors.push({
                x: Math.random() * width * 0.8,
                y: Math.random() * height * 0.4,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 8 + 6,
                angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
                life: 1.0,
                decay: Math.random() * 0.03 + 0.015
            });
        }
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    resize();

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Dibujar estrellas
        for (let s of stars) {
            s.alpha += s.twinkleSpeed;
            if (s.alpha > 1 || s.alpha < 0.2) s.twinkleSpeed *= -1;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
            ctx.shadowBlur = s.radius > 1.2 ? 6 : 0;
            ctx.shadowColor = s.color;
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Líneas de constelación con el cursor
        if (mouse.x > 0 && mouse.x < width && mouse.y > 0 && mouse.y < height) {
            for (let i = 0; i < stars.length; i++) {
                const s1 = stars[i];
                const dMouse = Math.hypot(s1.x - mouse.x, s1.y - mouse.y);

                if (dMouse < mouse.radius) {
                    for (let j = i + 1; j < stars.length; j++) {
                        const s2 = stars[j];
                        const dStars = Math.hypot(s1.x - s2.x, s1.y - s2.y);
                        if (dStars < 75) {
                            const lineAlpha = (1 - dStars / 75) * (1 - dMouse / mouse.radius) * 0.7;
                            ctx.beginPath();
                            ctx.moveTo(s1.x, s1.y);
                            ctx.lineTo(s2.x, s2.y);
                            ctx.strokeStyle = '#c9a54e';
                            ctx.globalAlpha = lineAlpha;
                            ctx.lineWidth = 0.85;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        // Meteoros
        spawnMeteor();
        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.life -= m.decay;

            if (m.life <= 0 || m.x > width || m.y > height) {
                meteors.splice(i, 1);
                continue;
            }

            const tailX = m.x - Math.cos(m.angle) * m.length;
            const tailY = m.y - Math.sin(m.angle) * m.length;

            const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(1, `rgba(255, 240, 200, ${m.life})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.globalAlpha = m.life;
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
        requestAnimationFrame(render);
    }

    render();
}

// =============================================
// FILTRADO DINÁMICO Y MODAL DE ASTRÓNOMOS
// =============================================
const ASTRONOMERS_DATA = {
    'Nicolás Copérnico': {
        quote: 'Saber que sabemos lo que sabemos, y saber que no sabemos lo que no sabemos: esa es la verdadera sabiduría.',
        impact: 'Desafió más de un milenio de dogma ptolemaico con su modelo heliocéntrico, situando al Sol en el centro del sistema planetario y encendiendo la mecha de la Revolución Científica.'
    },
    'Johannes Kepler': {
        quote: 'La geometría existió antes de la creación; es coetánea con la mente divina.',
        impact: 'Descubrió que las órbitas planetarias no eran círculos perfectos sino elipses. Sus tres leyes describieron el movimiento celeste con exactitud matemática insuperable.'
    },
    'Galileo Galilei': {
        quote: 'La filosofía está escrita en ese inmenso libro que continuamente está abierto ante nuestros ojos: el universo.',
        impact: 'El primer ser humano en orientar un telescopio astronómico hacia el cosmos: descubrió los cráteres lunares, las 4 lunas de Júpiter y las fases de Venus, cambiando la historia humana para siempre.'
    },
    'Isaac Newton': {
        quote: 'Si he logrado ver más lejos, ha sido porque he subido a hombros de gigantes.',
        impact: 'Formuló la Ley de la Gravitación Universal y las tres leyes del movimiento. Unificó por primera vez las reglas de la Tierra con las leyes de los cuerpos celestes.'
    },
    'Albert Einstein': {
        quote: 'Lo más incomprensible del universo es que sea comprensible.',
        impact: 'Redefinió la gravedad no como una fuerza invisible a distancia, sino como la curvatura misma del tejido del espacio-tiempo causada por la masa y la energía.'
    },
    'Edwin Hubble': {
        quote: 'Equipado con sus cinco sentidos, el hombre explora el universo que le rodea y llama a esa aventura ciencia.',
        impact: 'Probó que la Vía Láctea no era todo el universo, descubriendo millones de otras galaxias y demostrando que el cosmos se expande continuamente.'
    },
    'Stephen Hawking': {
        quote: 'Recuerda mirar hacia arriba, a las estrellas, y no hacia abajo, a tus pies.',
        impact: 'Demostró que los agujeros negros emiten radiación cuántica (Radiación de Hawking) y unió la termodinámica, la relatividad general y la teoría cuántica.'
    },
    'Carl Sagan': {
        quote: 'El cosmos está dentro de nosotros. Estamos hechos de materia estelar. Somos el medio para que el cosmos se conozca a sí mismo.',
        impact: 'El más brillante divulgador de la astronomía del siglo XX; acercó el universo a cientos de millones de personas con la legendaria serie Cosmos y los discos de oro de las sondas Voyager.'
    }
};

function initAstronomersFilter() {
    const searchInput = document.getElementById('astro-search');
    const chips = document.querySelectorAll('.astro-chip');
    const cards = document.querySelectorAll('#astronomos .card');
    const countEl = document.getElementById('astro-count');
    if (!cards.length) return;

    cards.forEach((card) => {
        const titleEl = card.querySelector('h3');
        if (!titleEl) return;
        const name = titleEl.textContent.trim();
        const body = card.querySelector('.card-body');
        if (body && !card.querySelector('.card-quote-btn')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'card-quote-btn';
            btn.innerHTML = '✦ Cita y legado';
            btn.addEventListener('click', () => openAstroModal(name));
            body.appendChild(btn);
        }
    });

    let currentTag = 'todos';
    let currentSearch = '';

    function filterCards() {
        let visibleCount = 0;
        const query = currentSearch.toLowerCase().trim();

        cards.forEach((card) => {
            const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const tag = (card.querySelector('.card-tag')?.textContent || '').toLowerCase();
            const text = (card.querySelector('p')?.textContent || '').toLowerCase();

            const matchesTag = (currentTag === 'todos') || tag.includes(currentTag);
            const matchesSearch = !query || name.includes(query) || tag.includes(query) || text.includes(query);

            if (matchesTag && matchesSearch) {
                card.classList.remove('is-hidden');
                visibleCount++;
            } else {
                card.classList.add('is-hidden');
            }
        });

        if (countEl) {
            countEl.textContent = `Mostrando ${visibleCount} de ${cards.length} astrónomos`;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            filterCards();
        });
    }

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            chips.forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            currentTag = chip.getAttribute('data-tag') || 'todos';
            filterCards();
            playChime(659.25);
        });
    });

    let modal = document.getElementById('astro-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'astro-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box" role="dialog" aria-modal="true">
                <button type="button" class="modal-close" aria-label="Cerrar modal">&times;</button>
                <span class="card-tag" id="modal-tag">Astronomía</span>
                <h3 id="modal-title" style="margin-top:10px; font-family:var(--serif); font-size:24px;"></h3>
                <blockquote class="modal-quote" id="modal-quote"></blockquote>
                <p id="modal-impact" style="font-size:15px; color:var(--ink-soft); line-height:1.6;"></p>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('open'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }
}

function openAstroModal(name) {
    const modal = document.getElementById('astro-modal');
    if (!modal) return;
    const info = ASTRONOMERS_DATA[name] || {
        quote: 'Explorar el cosmos es explorar nuestro propio origen.',
        impact: 'Figura fundamental en la comprensión humana de las leyes astronómicas.'
    };

    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-quote').textContent = `«${info.quote}»`;
    document.getElementById('modal-impact').textContent = info.impact;
    modal.classList.add('open');
    playChime(783.99);
}

// =============================================
// CIELO DE CARACAS EN VIVO (WARAIRA REPANO)
// =============================================
function calculateMoonPhase(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let y = year;
    let m = month;
    if (m < 3) {
        y--;
        m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
    const daysSinceNew = (jd - 2451549.5) % 29.53058867;
    const normalized = (daysSinceNew + 29.53058867) % 29.53058867;
    const phaseFraction = normalized / 29.53058867;
    const illumination = Math.round((1 - Math.cos(phaseFraction * Math.PI * 2)) / 2 * 100);

    let name = 'Luna Nueva';
    if (phaseFraction > 0.03 && phaseFraction < 0.22) name = 'Luna Creciente';
    else if (phaseFraction >= 0.22 && phaseFraction <= 0.28) name = 'Cuarto Creciente';
    else if (phaseFraction > 0.28 && phaseFraction < 0.47) name = 'Gibosa Creciente';
    else if (phaseFraction >= 0.47 && phaseFraction <= 0.53) name = 'Luna Llena';
    else if (phaseFraction > 0.53 && phaseFraction < 0.72) name = 'Gibosa Menguante';
    else if (phaseFraction >= 0.72 && phaseFraction <= 0.78) name = 'Cuarto Menguante';
    else if (phaseFraction > 0.78 && phaseFraction < 0.97) name = 'Luna Menguante';

    let daysToFull = Math.round((0.5 - phaseFraction) * 29.53);
    if (daysToFull < 0) daysToFull += Math.round(29.53);

    return { fraction: phaseFraction, illumination, name, daysToFull };
}

function calculateCaracasLST() {
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const d = (now.getTime() - j2000.getTime()) / 86400000;

    let gmst = 18.697374558 + 24.06570982441908 * d;
    gmst = (gmst % 24 + 24) % 24;

    const lonWestHours = 66.9146 / 15;
    let lst = (gmst - lonWestHours) % 24;
    if (lst < 0) lst += 24;

    const hrs = Math.floor(lst);
    const mins = Math.floor((lst - hrs) * 60);
    const secs = Math.floor(((lst - hrs) * 60 - mins) * 60);

    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderMoonSVG(fraction, illumination) {
    const isWaxing = fraction < 0.5;
    return `
        <svg class="moon-svg-disc" viewBox="-50 -50 100 100" aria-label="${illumination}% iluminada">
            <circle cx="0" cy="0" r="45" fill="#1b2238" stroke="#a07b21" stroke-width="2"/>
            <path d="M 0,-45 A 45,45 0 0,${isWaxing ? 1 : 0} 0,45 A ${Math.abs(Math.cos(fraction * Math.PI * 2)) * 45},45 0 0,${fraction < 0.25 || fraction > 0.75 ? 0 : 1} 0,-45" fill="#ffd977"/>
        </svg>
    `;
}

function initCaracasSky() {
    const moonWrap = document.getElementById('caracas-moon-slot');
    const siderealSlot = document.getElementById('caracas-sidereal-slot');
    if (!moonWrap && !siderealSlot) return;

    const moon = calculateMoonPhase();
    if (moonWrap) {
        moonWrap.innerHTML = `
            <div class="moon-visual-wrap">
                ${renderMoonSVG(moon.fraction, moon.illumination)}
                <div>
                    <b style="font-size:18px; display:block; color:var(--ink);">${moon.name}</b>
                    <span style="font-size:13.5px; color:var(--ink-soft);">${moon.illumination}% iluminada</span>
                    <p style="font-size:12px; color:var(--muted); margin-top:2px;">Próxima luna llena en aprox. ${moon.daysToFull} días</p>
                </div>
            </div>
        `;
    }

    if (siderealSlot) {
        const updateLST = () => {
            siderealSlot.textContent = calculateCaracasLST();
        };
        updateLST();
        setInterval(updateLST, 1000);
    }
}

// =============================================
// EXPLORADOR ORBITAL INTERACTIVO DEL SISTEMA SOLAR
// =============================================
const ORRERY_PLANETS = [
    { name: 'Mercurio', distUA: 0.39, period: 0.24, radius: 4, color: '#a8a8a8', temp: '167 °C', moons: 0, desc: 'El planeta más rápido del sistema solar: completa una vuelta al Sol cada 88 días.' },
    { name: 'Venus', distUA: 0.72, period: 0.62, radius: 6.5, color: '#e8be74', temp: '464 °C', moons: 0, desc: 'El infierno de nubes de ácido sulfúrico: el planeta más caliente de todos.' },
    { name: 'Tierra', distUA: 1.00, period: 1.00, radius: 7, color: '#4d88e8', temp: '15 °C', moons: 1, desc: 'Nuestro oasis cósmico: el único mundo conocido con océanos líquidos y vida floreciente.' },
    { name: 'Marte', distUA: 1.52, period: 1.88, radius: 5.5, color: '#d95a43', temp: '-65 °C', moons: 2, desc: 'El planeta rojo: hogar del Monte Olimpo, el volcán más colosal del sistema solar.' },
    { name: 'Júpiter', distUA: 5.20, period: 11.86, radius: 13, color: '#d9a86c', temp: '-110 °C', moons: 95, desc: 'El rey de los planetas: su escudo gravitatorio protege a la Tierra de impactos cometarios.' },
    { name: 'Saturno', distUA: 9.58, period: 29.45, radius: 11, color: '#ecd89a', temp: '-140 °C', moons: 146, ring: true, desc: 'La joya anillada: miles de millones de fragmentos de hielo orbitando en perfecta armonía.' },
    { name: 'Urano', distUA: 19.22, period: 84.02, radius: 8.5, color: '#7ce0dc', temp: '-195 °C', moons: 28, desc: 'El gigante de hielo inclinado: rueda horizontalmente a lo largo de su órbita.' },
    { name: 'Neptuno', distUA: 30.05, period: 164.8, radius: 8, color: '#4a6fe3', temp: '-200 °C', moons: 16, desc: 'Los vientos más feroces del cosmos, alcanzando más de 2.100 km por hora.' }
];

function initSolarOrrery() {
    const canvas = document.getElementById('orrery-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.clientWidth || 600;
    let height = 480;
    canvas.width = width;
    canvas.height = height;

    let isPlaying = true;
    let speed = 1.0;
    let selectedIdx = 2; // Tierra por defecto
    let time = 0;

    const minR = 36;
    const maxR = Math.min(width, height) * 0.46;
    const planetDistances = ORRERY_PLANETS.map((_, i) => minR + (i / (ORRERY_PLANETS.length - 1)) * (maxR - minR));

    function updateCard(idx) {
        const p = ORRERY_PLANETS[idx];
        const card = document.getElementById('orrery-planet-info');
        if (!card) return;

        card.innerHTML = `
            <div style="text-align:center;">
                <div class="planet-preview-sphere" style="background: radial-gradient(circle at 30% 30%, ${p.color}, #080c18);"></div>
                <h3 style="font-family:var(--serif); font-size:24px; color:#fff; margin-bottom:4px;">${p.name}</h3>
                <span style="font-size:12px; color:var(--gold-soft); letter-spacing:0.1em; text-transform:uppercase;">Planeta del Sistema Solar</span>
            </div>
            <table class="planet-spec-table">
                <tr><td>Distancia al Sol:</td><td>${p.distUA} UA (${(p.distUA * 149.6).toFixed(1)} M km)</td></tr>
                <tr><td>Periodo orbital:</td><td>${p.period} años terrestres</td></tr>
                <tr><td>Temperatura media:</td><td>${p.temp}</td></tr>
                <tr><td>Satélites naturales:</td><td>${p.moons} lunas</td></tr>
            </table>
            <p style="font-size:14px; color:rgba(255,255,255,0.85); line-height:1.55; border-top:1px dashed rgba(255,255,255,0.15); padding-top:12px;">
                💡 <b>Dato Fundacite:</b> ${p.desc}
            </p>
        `;
    }

    updateCard(selectedIdx);

    document.getElementById('orrery-pause-btn')?.addEventListener('click', (e) => {
        isPlaying = !isPlaying;
        e.currentTarget.textContent = isPlaying ? '⏸ Pausar' : '▶ Reanudar';
    });

    document.querySelectorAll('.orrery-speed-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.orrery-speed-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            speed = parseFloat(btn.getAttribute('data-speed') || '1');
            playChime(523.25);
        });
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left - width / 2;
        const clickY = e.clientY - rect.top - height / 2;

        let bestIdx = -1;
        let bestDist = 20;

        ORRERY_PLANETS.forEach((p, i) => {
            const orbitR = planetDistances[i];
            const angle = (time / p.period) * Math.PI * 2;
            const px = Math.cos(angle) * orbitR;
            const py = Math.sin(angle) * orbitR;
            const d = Math.hypot(clickX - px, clickY - py);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        });

        if (bestIdx !== -1) {
            selectedIdx = bestIdx;
            updateCard(selectedIdx);
            playChime(659.25 + bestIdx * 40);
        }
    });

    function draw() {
        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        // Sol central
        const sunPulse = Math.sin(time * 3) * 2;
        const sunGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 26 + sunPulse);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.3, '#ffea78');
        sunGrad.addColorStop(0.7, '#ff9020');
        sunGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');

        ctx.beginPath();
        ctx.arc(cx, cy, 26 + sunPulse, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#fff4a3';
        ctx.fill();

        ORRERY_PLANETS.forEach((p, i) => {
            const orbitR = planetDistances[i];
            const isSelected = i === selectedIdx;

            ctx.beginPath();
            ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
            ctx.strokeStyle = isSelected ? 'rgba(201, 165, 78, 0.75)' : 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = isSelected ? 1.5 : 0.8;
            ctx.stroke();

            const angle = (time / p.period) * Math.PI * 2;
            const px = cx + Math.cos(angle) * orbitR;
            const py = cy + Math.sin(angle) * orbitR;

            if (isSelected) {
                ctx.beginPath();
                ctx.arc(px, py, p.radius + 6, 0, Math.PI * 2);
                ctx.strokeStyle = '#c9a54e';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            if (p.ring) {
                ctx.beginPath();
                ctx.ellipse(px, py, p.radius * 2.2, p.radius * 0.7, Math.PI / 6, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(236, 216, 154, 0.75)';
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(px, py, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = isSelected ? 10 : 0;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.font = '10.5px system-ui';
            ctx.fillStyle = isSelected ? '#ffd577' : 'rgba(255, 255, 255, 0.65)';
            ctx.fillText(p.name, px + p.radius + 4, py + 3);
        });

        if (isPlaying) {
            time += 0.003 * speed;
        }

        requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener('resize', () => {
        width = canvas.clientWidth || 600;
        canvas.width = width;
    });
}

// ---------- Herramientas (cálculo estático) ----------
function initTools() {
    initWeight();
    initAge();
    initDistance();
}

const PLANETS = [
    { name: 'Mercurio', gravity: 3.7, years: 0.241, color: '#9a9a9a' },
    { name: 'Venus', gravity: 8.87, years: 0.615, color: '#d9a44a' },
    { name: 'Tierra', gravity: 9.81, years: 1, color: '#4f8ed9' },
    { name: 'Marte', gravity: 3.71, years: 1.88, color: '#c1543c' },
    { name: 'Júpiter', gravity: 24.79, years: 11.86, color: '#c89a63' },
    { name: 'Saturno', gravity: 10.44, years: 29.45, color: '#e0c98f' },
    { name: 'Urano', gravity: 8.87, years: 84.02, color: '#7fc9c9' },
    { name: 'Neptuno', gravity: 11.15, years: 164.8, color: '#5a74c4' }
];

function planetRows(list) {
    return list.map((p) => `
        <div class="row">
            <span>${p.name}</span>
            <b style="color:${p.color}">${p.value}</b>
        </div>`).join('');
}

function initWeight() {
    const input = document.getElementById('weight-input');
    const out = document.getElementById('weight-results');
    if (!input || !out) return;
    const render = () => {
        const kg = parseFloat(input.value);
        if (!(kg > 0)) { out.innerHTML = ''; return; }
        out.innerHTML = planetRows(PLANETS.map((p) => ({ ...p, value: (kg * p.gravity / 9.81).toFixed(1) + ' kg' })));
    };
    input.addEventListener('input', render);
    render();
}

function initAge() {
    const input = document.getElementById('age-input');
    const out = document.getElementById('age-results');
    if (!input || !out) return;
    const render = () => {
        const years = parseFloat(input.value);
        if (!(years >= 0)) { out.innerHTML = ''; return; }
        out.innerHTML = planetRows(PLANETS.map((p) => ({ ...p, value: (years / p.years).toFixed(1) + ' años' })));
    };
    input.addEventListener('input', render);
    render();
}

function initDistance() {
    const input = document.getElementById('dist-input');
    const fromSel = document.getElementById('dist-from');
    const toSel = document.getElementById('dist-to');
    const btn = document.getElementById('dist-convert');
    const out = document.getElementById('dist-results');
    const chips = document.querySelectorAll('.chip');
    if (!input || !fromSel || !toSel || !btn || !out) return;

    const FACTORS = { km: 1, ua: 149597870.7, ly: 9460730472580800 };
    const UNITS = { km: 'km', ua: 'UA', ly: 'años luz' };

    let value = 1;
    input.addEventListener('input', () => { value = parseFloat(input.value) || 0; });

    const convert = () => {
        const from = fromSel.value;
        const to = toSel.value;
        const n = parseFloat(input.value) || 0;
        let result = '';
        if (n > 0) {
            const km = n * FACTORS[from];
            const v = km / FACTORS[to];
            result = v >= 1e4 || v < 1e-3 ? v.toExponential(3) + ' ' + UNITS[to] : v.toLocaleString('es-VE', { maximumFractionDigits: 3 }) + ' ' + UNITS[to];
        }
        out.innerHTML = result
            ? `<div class="row"><span>Conversión</span><b>${result}</b></div>`
            : '';
    };
    btn.addEventListener('click', convert);

    const PRESETS = [
        { label: 'Tierra–Luna', km: 384400 },
        { label: 'Tierra–Sol', km: 149597870.7 },
        { label: 'Sol–Plutón', km: 5906376272 },
        { label: 'Próxima Centauri', km: 40208000000000 }
    ];
    chips.forEach((chip, i) => {
        chip.addEventListener('click', () => {
            chips.forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            const preset = PRESETS[i];
            if (preset) {
                input.value = preset.km;
                fromSel.value = 'km';
                value = preset.km;
                convert();
            }
        });
    });
}

// =============================================
// AULA VIRTUAL (aula.html) — PLATAFORMA COMPLETA
// Módulos + Examen de 10 Preguntas + Certificado Imprimible
// =============================================
const AULA_EXAM_QUESTIONS = [
    { q: '¿Cuál es la estrella más cercana a nuestro planeta Tierra?', options: ['Próxima Centauri', 'El Sol', 'Sirio', 'Betelgeuse'], correct: 1, why: 'El Sol es nuestra estrella central, a unos 150 millones de kilómetros (1 Unidad Astronómica).' },
    { q: '¿Quién formuló el modelo heliocéntrico moderno demostrando que los planetas giran alrededor del Sol?', options: ['Ptolomeo', 'Nicolás Copérnico', 'Aristóteles', 'Edwin Hubble'], correct: 1, why: 'Copérnico publicó en 1543 su revolucionaria obra «De revolutionibus orbium coelestium».' },
    { q: '¿Qué descubrió Johannes Kepler sobre la forma geométrica de las órbitas planetarias?', options: ['Que son círculos perfectos', 'Que son elipses con el Sol en uno de sus focos', 'Que son espirales infinitas', 'Que son ondas senoidales'], correct: 1, why: 'La Primera Ley de Kepler demuestra que los planetas orbitan en trayectorias elípticas.' },
    { q: '¿Qué astrónomo histórico descubrió cuatro lunas orbitando a Júpiter con su telescopio?', options: ['Galileo Galilei', 'Isaac Newton', 'Stephen Hawking', 'Alexander von Humboldt'], correct: 0, why: 'En 1610, Galileo descubrió Ío, Europa, Ganimedes y Calisto (las lunas galileanas).' },
    { q: '¿Qué representa y mide un año luz en astrofísica?', options: ['El tiempo que tarda una estrella en apagarse', 'La distancia que recorre la luz en un año solar (aprox. 9.46 billones de km)', 'La edad calculada de la Vía Láctea', 'La duración del ciclo orbital de Plutón'], correct: 1, why: 'Es una unidad de longitud astronómica que equivale a unos 9.460.730.472.580 kilómetros.' },
    { q: '¿Cuál es el observatorio astronómico histórico más antiguo de Venezuela, fundado en Caracas?', options: ['Observatorio de Llano del Hato', 'Observatorio Naval Cagigal', 'Mirador Waraira Repano', 'Planetario Humboldt'], correct: 1, why: 'El Observatorio Cajigal fue fundado en 1888 en la colina de Quintana, Caracas, siendo pionero en geodesia y meteorología.' },
    { q: '¿Por qué la teoría de la Relatividad General de Einstein revolucionó el concepto de gravedad de Newton?', options: ['Porque la gravedad es la curvatura del espacio y tiempo provocada por la masa', 'Porque demostró que los planetas no tienen masa', 'Porque eliminó el concepto de órbitas', 'Porque probó que el universo no tiene historia'], correct: 0, why: 'Einstein explicó que la materia y energía le dicen al espacio-tiempo cómo curvarse, y el espacio curvado le dice a la materia cómo moverse.' },
    { q: '¿Qué fenómeno físico permitió a Edwin Hubble concluir que el universo se está expandiendo?', options: ['El enfriamiento de las estrellas', 'El corrimiento hacia el rojo (redshift) en la luz de galaxias distantes', 'La colisión de asteroides', 'La evaporación de agujeros negros'], correct: 1, why: 'La Ley de Hubble demostró que cuanto más distante está una galaxia, más rápido se aleja de nosotros.' },
    { q: '¿Por qué la latitud de Caracas (10.5° Norte) ofrece un cielo privilegiado?', options: ['Porque permite observar tanto constelaciones del norte como del sur (como la Cruz del Sur)', 'Porque nunca hay nubes en el cerro Ávila', 'Porque la Luna se ve el doble de grande', 'Porque está más cerca del Sol que el polo sur'], correct: 0, why: 'Al estar en el trópico boreal, desde Caracas se pueden apreciar estrellas septentrionales y meridionales a lo largo del año.' },
    { q: '¿Qué famosa radiación teórica demostró Stephen Hawking que emiten los agujeros negros?', options: ['Radiación Gamma Estelar', 'Radiación de Hawking', 'Viento Solar', 'Rayos Cósmicos Pesados'], correct: 1, why: 'La Radiación de Hawking surge de efectos cuánticos en el horizonte de sucesos, haciendo que los agujeros negros se evaporen lentamente.' }
];

function initClassroom() {
    // Manejo de pestañas
    const tabs = document.querySelectorAll('.aula-tab');
    const panels = document.querySelectorAll('.aula-panel');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach((t) => t.classList.remove('active'));
            panels.forEach((p) => p.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(target)?.classList.add('active');
            playChime(587.33);
        });
    });

    // Renderizar examen interactivo
    const host = document.getElementById('preguntas');
    if (!host) return;

    host.innerHTML = AULA_EXAM_QUESTIONS.map((item, i) => `
        <div class="pregunta" id="q-block-${i}">
            <p class="q"><b>${i + 1}.</b> ${item.q}</p>
            <div class="opciones">${item.options.map((opt, o) => `
                <label class="opcion">
                    <input type="radio" name="sondeo${i + 1}" value="${o}">
                    <span>${opt}</span>
                </label>`).join('')}
            </div>
            <p class="retro"></p>
        </div>`).join('');

    const checkBtn = document.getElementById('sondeo-check');
    const retryBtn = document.getElementById('sondeo-retry');
    const notaEl = document.getElementById('sondeo-nota');
    const certBlock = document.getElementById('cert-unlock-banner');

    if (checkBtn) {
        checkBtn.addEventListener('click', () => {
            let score = 0;
            AULA_EXAM_QUESTIONS.forEach((item, i) => {
                const radios = document.querySelectorAll(`input[name="sondeo${i + 1}"]`);
                const chosen = document.querySelector(`input[name="sondeo${i + 1}"]:checked`);
                const qEl = document.getElementById(`q-block-${i}`);
                const retro = qEl.querySelector('.retro');

                radios.forEach((r) => {
                    const lbl = r.closest('.opcion');
                    lbl.classList.remove('ok', 'mal', 'des');
                    lbl.classList.add('des');
                    if (Number(r.value) === item.correct) lbl.classList.add('ok');
                    if (r === chosen && Number(r.value) !== item.correct) lbl.classList.add('mal');
                });

                const bien = chosen && Number(chosen.value) === item.correct;
                if (bien) score += 1;
                retro.textContent = (bien ? '✓ ¡Excelente! ' : '✗ Respuesta incorrecta. ') + item.why;
                retro.classList.toggle('ok', bien);
            });

            const percent = Math.round((score / AULA_EXAM_QUESTIONS.length) * 100);
            if (notaEl) {
                notaEl.textContent = `Puntaje: ${score} / ${AULA_EXAM_QUESTIONS.length} (${percent}%)`;
            }

            if (percent >= 80) {
                playChime(880.0);
                if (certBlock) certBlock.style.display = 'block';
                const certTab = document.querySelector('.aula-tab[data-tab="tab-cert"]');
                if (certTab) {
                    certTab.removeAttribute('disabled');
                    certTab.classList.add('unlocked');
                    certTab.textContent = '🏆 Tu Certificado (¡Aprobado!)';
                }
            } else {
                playChime(330.0);
            }
        });
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            AULA_EXAM_QUESTIONS.forEach((_, i) => {
                const radios = document.querySelectorAll(`input[name="sondeo${i + 1}"]`);
                const qEl = document.getElementById(`q-block-${i}`);
                radios.forEach((r) => {
                    r.checked = false;
                    r.closest('.opcion')?.classList.remove('ok', 'mal', 'des');
                });
                const retro = qEl?.querySelector('.retro');
                if (retro) {
                    retro.textContent = '';
                    retro.classList.remove('ok');
                }
            });
            if (notaEl) notaEl.textContent = '';
        });
    }

    initCertificate();
}

function initCertificate() {
    const nameInput = document.getElementById('cert-input-name');
    const nameDisplay = document.getElementById('cert-target-name');
    const dateDisplay = document.getElementById('cert-target-date');
    const folioDisplay = document.getElementById('cert-target-folio');
    const printBtn = document.getElementById('cert-print-btn');

    if (dateDisplay) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = today.toLocaleDateString('es-VE', options);
    }

    if (folioDisplay && !folioDisplay.textContent) {
        const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        folioDisplay.textContent = `FDC-CARACAS-${new Date().getFullYear()}-${randomCode}`;
    }

    if (nameInput && nameDisplay) {
        nameInput.addEventListener('input', () => {
            nameDisplay.textContent = nameInput.value.trim() || 'Nombre del Estudiante';
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

// ---------- Año en el pie ----------
function initFooterYear() {
    document.querySelectorAll('#year').forEach((el) => {
        el.textContent = new Date().getFullYear();
    });
}
