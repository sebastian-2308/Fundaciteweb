// =============================================
// ASTRONOMÍAS DEL MUNDO · FUNDACITE CARACAS
// JavaScript ligero y estático
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    initNav();
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
// AULA VIRTUAL (aula.html) — SONDEO BÁSICO
// Apartado en desarrollo: muestra de formato.
// =============================================
function initClassroom() {
    const host = document.getElementById('preguntas');
    if (!host) return;

    const QUESTIONS = [
        { q: '¿Cuál es la estrella más cercana a la Tierra?', options: ['El Sol', 'Próxima Centauri', 'La Estrella Polar'], correct: 0, why: 'El Sol es la estrella más cercana; Próxima Centauri es la más cercana fuera del sistema solar.' },
        { q: '¿Cuántos planetas orbitan alrededor del Sol?', options: ['Nueve', 'Siete', 'Ocho'], correct: 2, why: 'El sistema solar tiene ocho planetas: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.' },
        { q: '¿Por qué hay día y noche?', options: ['Por la rotación de la Tierra sobre su eje', 'Por el movimiento de la Luna', 'Por las estaciones del año'], correct: 0, why: 'La Tierra gira sobre su eje cada 24 horas: la parte que mira al Sol tiene día y la opuesta, noche.' },
        { q: '¿Qué mide un año luz?', options: ['El tiempo de la Tierra alrededor del Sol', 'La distancia que viaja la luz en un año', 'La edad del universo'], correct: 1, why: 'Es una unidad de distancia: unos 9.46 billones de kilómetros.' },
        { q: '¿Qué vemos en las fases de la Luna?', options: ['La cara iluminada de la Luna según su posición', 'El movimiento de las estrellas', 'La sombra de otros planetas'], correct: 0, why: 'La Luna no cambia de forma: cambia la parte que vemos iluminada según gira alrededor de la Tierra.' },
        { q: '¿Cuánto tarda la Tierra en dar una vuelta completa al Sol?', options: ['24 horas', 'Un mes', 'Un año (365 días)'], correct: 2, why: 'Ese viaje alrededor del Sol es lo que llamamos un año; con la inclinación de la Tierra produce las estaciones.' }
    ];

    host.innerHTML = QUESTIONS.map((item, i) => `
        <div class="pregunta">
            <p class="q">${i + 1}. ${item.q}</p>
            <div class="opciones">${item.options.map((opt, o) => `
                <label class="opcion">
                    <input type="radio" name="sondeo${i + 1}" value="${o}">
                    <span>${opt}</span>
                </label>`).join('')}
            </div>
            <p class="retro"></p>
        </div>`).join('');

    const check = document.getElementById('sondeo-check');
    if (check) {
        check.addEventListener('click', () => {
            let score = 0;
            QUESTIONS.forEach((item, i) => {
                const radios = document.querySelectorAll(`input[name="sondeo${i + 1}"]`);
                const chosen = document.querySelector(`input[name="sondeo${i + 1}"]:checked`);
                const qEl = radios[0].closest('.pregunta');
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
                retro.textContent = (bien ? '✓ Correcto. ' : '✗ ') + item.why;
                retro.classList.toggle('ok', bien);
            });
            const nota = document.getElementById('sondeo-nota');
            if (nota) nota.textContent = score + ' / ' + QUESTIONS.length;
        });
    }

    const retry = document.getElementById('sondeo-retry');
    if (retry) {
        retry.addEventListener('click', () => {
            QUESTIONS.forEach((_, i) => {
                const radios = document.querySelectorAll(`input[name="sondeo${i + 1}"]`);
                const qEl = radios[0].closest('.pregunta');
                radios.forEach((r) => {
                    r.checked = false;
                    r.closest('.opcion').classList.remove('ok', 'mal', 'des');
                });
                const retro = qEl.querySelector('.retro');
                retro.textContent = '';
                retro.classList.remove('ok');
            });
            const nota = document.getElementById('sondeo-nota');
            if (nota) nota.textContent = '';
        });
    }
}

// ---------- Año en el pie ----------
function initFooterYear() {
    document.querySelectorAll('#year').forEach((el) => {
        el.textContent = new Date().getFullYear();
    });
}
