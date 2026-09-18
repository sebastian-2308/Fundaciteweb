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
// SELECTOR DE TEMAS (PERGAMINO / COSMOS / AURORA)
// =============================================
function initTheme() {
    const THEMES = ['default', 'dark', 'aurora'];
    const THEME_NAMES = {
        'default': '🌲 Bosque',
        'dark': '🌑 Noche',
        'aurora': '🟢 Aurora'
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
// MOTOR DE MÚSICA PROCEDURAL: INTERSTELAR (HANS ZIMMER)
// Síntesis de órgano de tubos, arpegios ascendentes y
// tic-tac de dilatación temporal (100% Web Audio API)
// =============================================
let audioCtx = null;
let isAudioActive = false;
let interstellarTimer = null;
let currentChordIndex = 0;
let noteIndex = 0;
let filterNode = null;
let masterMusicGain = null;
let delayNode = null;
let delayGain = null;

// Acordes de Hans Zimmer (Cornfield Chase / First Step):
// Am -> F -> C -> G
const INTERSTELLAR_CHORDS = [
    {
        name: 'Am',
        rootBass: 55.00, // A1
        notes: [220.00, 329.63, 440.00, 523.25, 659.25, 523.25, 440.00, 329.63] // A3, E4, A4, C5, E5, C5, A4, E4
    },
    {
        name: 'F',
        rootBass: 43.65, // F1
        notes: [174.61, 261.63, 349.23, 440.00, 523.25, 440.00, 349.23, 261.63] // F3, C4, F4, A4, C5, A4, F4, C4
    },
    {
        name: 'C',
        rootBass: 32.70, // C1 (pedal bajo profundo)
        notes: [196.00, 261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63] // G3, C4, E4, G4, C5, G4, E4, C4
    },
    {
        name: 'G',
        rootBass: 49.00, // G1
        notes: [196.00, 293.66, 392.00, 493.88, 587.33, 493.88, 392.00, 293.66] // G3, D4, G4, B4, D5, B4, G4, D4
    }
];

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

// Reproduce un toque de campana celestial para retroalimentación de UI
function playChime(freq = 523.25) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
    } catch (e) { /* ignore */ }
}

// Genera un tono de órgano de iglesia con múltiples armónicos
function playOrganNote(freq, duration = 0.14, isPedal = false) {
    const ctx = getAudioContext();
    if (!ctx || !isAudioActive || !masterMusicGain) return;

    try {
        const t = ctx.currentTime;
        const noteGain = ctx.createGain();

        // 1. Fundamental (flautado 8')
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, t);

        // 2. Octava superior (octava 4') para brillo catedralicio
        const osc2 = ctx.createOscillator();
        osc2.type = isPedal ? 'sawtooth' : 'triangle';
        osc2.frequency.setValueAtTime(isPedal ? freq : freq * 2, t);

        // Envolvente de volumen de órgano
        const maxVol = isPedal ? 0.35 : 0.18;
        noteGain.gain.setValueAtTime(0.0001, t);
        noteGain.gain.linearRampToValueAtTime(maxVol, t + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc1.connect(noteGain);
        osc2.connect(noteGain);

        // Conectar al filtro resonante del órgano y a la reverberación
        noteGain.connect(filterNode);
        noteGain.connect(delayNode);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + duration + 0.05);
        osc2.stop(t + duration + 0.05);
    } catch (e) { /* ignore */ }
}

// Tic-tac del tiempo de relatividad (Miller's planet / cada segundo cuenta)
function playRelativityTick() {
    const ctx = getAudioContext();
    if (!ctx || !isAudioActive || !masterMusicGain) return;
    try {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1480, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);

        tickGain.gain.setValueAtTime(0.08, t);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

        osc.connect(tickGain);
        tickGain.connect(masterMusicGain);

        osc.start(t);
        osc.stop(t + 0.04);
    } catch (e) {}
}

function startInterstellarMusic() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        // Cadena de audio maestra
        masterMusicGain = ctx.createGain();
        masterMusicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterMusicGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 2.5);

        // Filtro de órgano catedralicio con barrido dinámico
        filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(850, ctx.currentTime);
        filterNode.Q.value = 2.5;

        // Simulador de reverberación espacial / acústica de catedral
        delayNode = ctx.createDelay();
        delayNode.delayTime.value = 0.38; // 380 ms de eco catedralicio
        delayGain = ctx.createGain();
        delayGain.gain.value = 0.42;

        filterNode.connect(masterMusicGain);
        delayNode.connect(delayGain);
        delayGain.connect(delayNode); // feedback loop
        delayGain.connect(masterMusicGain);

        masterMusicGain.connect(ctx.destination);

        isAudioActive = true;
        currentChordIndex = 0;
        noteIndex = 0;

        // Barrido dinámico del filtro (Crescendo característico de Zimmer)
        filterNode.frequency.linearRampToValueAtTime(2600, ctx.currentTime + 30);

        // Arpegiador continuo a 118 BPM (cada semicorchea ~ 127 ms)
        const noteStepMs = 128;
        let tickCounter = 0;

        interstellarTimer = setInterval(() => {
            if (!isAudioActive) return;

            const chord = INTERSTELLAR_CHORDS[currentChordIndex];

            // Al inicio de cada ciclo de arpegio (8 notas), tocar el pedal bajo de órgano
            if (noteIndex === 0) {
                playOrganNote(chord.rootBass, 0.95, true);
            }

            // Tic-tac de dilatación temporal cada 4 semicorcheas (cada negra)
            if (tickCounter % 4 === 0) {
                playRelativityTick();
            }
            tickCounter++;

            // Tocar la nota del arpegio
            const noteFreq = chord.notes[noteIndex];
            playOrganNote(noteFreq, 0.16, false);

            noteIndex++;
            if (noteIndex >= chord.notes.length) {
                noteIndex = 0;
                currentChordIndex = (currentChordIndex + 1) % INTERSTELLAR_CHORDS.length;
            }
        }, noteStepMs);

        updateMusicUI(true);
    } catch (e) {
        console.warn('No se pudo inicializar la música Interestelar', e);
    }
}

function stopInterstellarMusic() {
    if (!audioCtx || !masterMusicGain) return;
    try {
        masterMusicGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        setTimeout(() => {
            clearInterval(interstellarTimer);
            interstellarTimer = null;
            isAudioActive = false;
            updateMusicUI(false);
        }, 1300);
    } catch (e) {
        isAudioActive = false;
        updateMusicUI(false);
    }
}

function updateMusicUI(isPlaying) {
    // Actualizar botones de cabecera
    document.querySelectorAll('.audio-toggle-btn').forEach((btn) => {
        btn.classList.toggle('active', isPlaying);
        btn.innerHTML = isPlaying
            ? '<span>🎹 Interestelar: ON</span>'
            : '<span>🔇 Música Interestelar: OFF</span>';
        btn.setAttribute('title', isPlaying ? 'Silenciar banda sonora' : 'Reproducir tema de Interestelar');
    });

    // Actualizar reproductores flotantes
    document.querySelectorAll('.interstellar-player-dock').forEach((dock) => {
        dock.classList.toggle('playing', isPlaying);
        const playBtn = dock.querySelector('.interstellar-play-btn');
        if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
    });
}

function initAudioAtmosphere() {
    // Conectar botones de cabecera
    document.querySelectorAll('.audio-toggle-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!isAudioActive) {
                startInterstellarMusic();
            } else {
                stopInterstellarMusic();
            }
        });
    });

    // Conectar reproductores flotantes
    document.querySelectorAll('.interstellar-play-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!isAudioActive) {
                startInterstellarMusic();
            } else {
                stopInterstellarMusic();
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
                color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#a9d7bd' : '#c3e2cd')
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
                            ctx.strokeStyle = '#55896a';
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
// CRÓNICAS BIOGRÁFICAS Y RESEÑAS DE ASTRÓNOMOS
// =============================================
const ASTRONOMERS_DATA = {
    'Nicolás Copérnico': {
        title: 'El clérigo que movió la Tierra y detuvo al Sol',
        era: 'Renacimiento (1473 – 1543 · Polonia)',
        quote: 'En el centro de todo reside el Sol. Pues en este hermoso templo, ¿quién colocaría esta lámpara en otro lugar más digno desde el cual iluminarlo todo?',
        story: 'Nacido en Toruń y educado en Cracovia e Italia, Copérnico fue matemático, médico, diplomático y canónigo de la Iglesia. Durante más de tres décadas trabajó desde una solitaria torre en la catedral de Frombork, midiendo la posición de los planetas con instrumentos de madera rústicos. Se dio cuenta de que la hipótesis geocéntrica de Ptolomeo requería decenas de artificios geométricos imposibles (ecuantes y epiciclos). Al colocar con osadía matemática al Sol en el centro, el universo cobró una armonía perfecta.',
        eureka: 'El enigma de los planetas que retrocedían (movimiento retrógrado) se resolvió de golpe: no era que Marte o Júpiter frenasen y diesen marcha atrás en el cielo, sino que la Tierra, al viajar más rápido en su órbita interior, los rebasa como un coche rápido en una pista de carreras.',
        curiosity: 'Temiendo la incomprensión y las acusaciones teológicas, no autorizó la impresión de su obra maestra hasta que un joven matemático protestante, Rheticus, lo convenció al final de su vida. La leyenda histórica cuenta que un ejemplar recién salido de la imprenta llegó a sus manos el 24 de mayo de 1543, apenas unas horas antes de fallecer.',
        impact: 'Desencadenó la Revolución Científica. Su obra cambió para siempre la concepción del ser humano en el cosmos: la Tierra dejó de ser el estático centro de la creación para convertirse en un viajero estelar más.'
    },
    'Johannes Kepler': {
        title: 'El matemático de las armonías celestes',
        era: 'Mecánica Celeste (1571 – 1630 · Alemania)',
        quote: 'Medí los cielos, ahora mido las sombras de la Tierra. Del cielo era el espíritu, aquí reposa la sombra del cuerpo.',
        story: 'Kepler creció en la extrema pobreza, con secuelas físicas y de visión por viruela infantil. Durante años tuvo que defender en persona a su madre, Katharina, de ser quemada viva bajo una acusación inquisitorial por brujería. Su prodigiosa mente matemática le valió convertirse en asistente del noble danés Tycho Brahe en Praga. A la muerte de Tycho, heredó los registros de observación celeste más precisos de la historia.',
        eureka: 'Durante ocho agotadores años intentó hacer encajar la órbita de Marte en círculos perfectos, el dogma sacrosanto desde Platón. Su cálculo difería de las observaciones reales por solo 8 minutos de arco (menos de un tercio del ancho de la Luna llena). En vez de ocultar el error, concluyó: «Si hubiera creído que podíamos ignorar esos 8 minutos, habría remendado mi hipótesis. Pero como no era lícito ignorarlos, solo ellos condujeron a una reforma total de la astronomía». Fue entonces cuando trazó una elipse.',
        curiosity: 'Escribió «Somnium» (El Sueño), considerada por Isaac Asimov y Carl Sagan como la primera obra de ciencia ficción de la historia, donde describe un viaje a la Luna y cómo se vería la Tierra rotando desde la superficie lunar.',
        impact: 'Sus Tres Leyes demostraron que la geometría del cielo es elíptica y precisa, proporcionando la prueba matemática irrefutable que permitió a Isaac Newton formular medio siglo más tarde la gravitación universal.'
    },
    'Galileo Galilei': {
        title: 'El mensajero sideral y padre del método científico',
        era: 'Observación Empírica (1564 – 1642 · Italia)',
        quote: 'La filosofía está escrita en ese inmenso libro que continuamente está abierto ante nuestros ojos: el universo. Pero no se puede entender si primero no se aprende su lengua: las matemáticas.',
        story: 'Profesor en Padua y Pisa, en 1609 oyó noticias de un tubo con dos cristales fabricado en Holanda que agrandaba objetos distantes. Sin haber visto ninguno, pulió sus propias lentes cóncavas y convexas en su taller, logrando un telescopio astronómico de 20 aumentos. Cuando apuntó aquel tubo al cielo nocturno de Venecia en otoño de 1609, lo que vio demolió 2.000 años de filosofía aristotélica.',
        eureka: 'La Luna no era una esfera pulida e inmaculada de éter puro: tenía cráteres, cadenas montañosas y valles. Miró a Júpiter y descubrió cuatro pequeñas estrellas que lo acompañaban noche tras noche orbitando a su alrededor: no todo giraba alrededor de la Tierra.',
        curiosity: 'En 1633, anciano, ciego y enfermo, fue llevado ante el tribunal de la Inquisición en Roma. Tuvo que pronunciar de rodillas su abjuración del heliocentrismo para evitar la hoguera. Según la tradición inmortal, al ponerse en pie murmuró entre dientes: «Eppur si muove» (Y sin embargo, se mueve). Pasó sus últimos 9 años confinado en su casa de Arcetri.',
        impact: 'Estableció el principio fundamental de la ciencia moderna: una hipótesis debe rendirse ante los hechos observados y los experimentos reproducibles. Fundó la cinemática moderna y la astronomía observacional.'
    },
    'Isaac Newton': {
        title: 'El genio que unificó el cielo y la Tierra',
        era: 'Física Universal (1643 – 1727 · Inglaterra)',
        quote: 'No sé cómo me verá el mundo, pero a mis ojos he sido sólo como un niño jugando en la orilla del mar, divirtiéndome buscando un guijarro más liso, mientras el inmenso océano de la verdad se extendía inexplorado ante mí.',
        story: 'Nació prematuro en una granja el día de Navidad de 1642 (según el calendario juliano). En 1665, cuando la Gran Peste bubónica obligó a cerrar la Universidad de Cambridge, el joven Newton de 23 años regresó a la granja de Woolsthorpe. En ese retiro de apenas 18 meses, en lo que se conoce como su «Annus Mirabilis», inventó el cálculo infinitesimal, formuló la teoría óptica del color con prismas y concibió la ley de la gravitación.',
        eureka: 'Observando una manzana caer en el huerto familiar al atardecer, mientras la Luna brillaba en el cielo, tuvo una epifanía revolucionaria: la misma fuerza invisible que atrae a la fruta hacia el suelo de la Tierra debe extenderse hasta la Luna, curvando su caída en una órbita infinita.',
        curiosity: 'Para evitar la aberración cromática que emborronaba las imágenes en los telescopios de lentes de Galileo, Newton inventó el primer telescopio reflector con espejo parabólico cóncavo (el Telescopio Newtoniano), diseño que todavía usan los mayores observatorios astronómicos y telescopios espaciales hoy en día.',
        impact: 'Publicó en 1687 los «Principia Mathematica», considerada la obra científica más influyente jamás escrita. Demostró que el universo se rige por leyes matemáticas universales, unificando la física terrestre con la mecánica celeste.'
    },
    'Albert Einstein': {
        title: 'El arquitecto del espacio y el tiempo curvos',
        era: 'Física Moderna (1879 – 1955 · Alemania / EE. UU.)',
        quote: 'La imaginación es más importante que el conocimiento. El conocimiento es limitado; la imaginación abarca el universo entero, estimulando el progreso y dando origen a la evolución.',
        story: 'Incomprendido por el rígido sistema escolar prusiano, no conseguía puesto académico tras graduarse y terminó trabajando como examinador técnico de tercera clase en la oficina de patentes de Berna en Suiza. En 1905, en sus ratos libres, redactó cuatro artículos que reescribieron la física: el efecto fotoeléctrico (que le valió el Nobel), el movimiento browniano y la Relatividad Especial con la célebre ecuación $E = mc^2$.',
        eureka: 'En 1907 tuvo lo que llamó «el pensamiento más feliz de mi vida»: una persona en caída libre desde un tejado no siente su propio peso. A partir de esa intuición comprendió que la gravedad y la aceleración son indistinguibles, deduciendo diez años después que la masa y la energía no tiran con cuerdas mágicas, sino que deforman y curvan la propia malla cuatridimensional del espacio-tiempo.',
        curiosity: 'Su teoría predecía que el tiempo corre más despacio en campos gravitatorios intensos (dilatación temporal). Esta propiedad física real es el núcleo de la película *Interstellar* en el planeta Miller, y es indispensable hoy: los relojes atómicos de los satélites GPS deben compensar este desfase de microsegundos cada día para que la ubicación en tu teléfono no falle por kilómetros.',
        impact: 'Predijo la existencia de agujeros negros, lentes gravitacionales que amplifican galaxias distantes y las ondas gravitacionales en el tejido cósmico (detectadas por fin por LIGO en 2015, exactamente un siglo después de su predicción).'
    },
    'Edwin Hubble': {
        title: 'El explorador que reveló la inmensidad del cosmos',
        era: 'Cosmología Observacional (1889 – 1953 · Estados Unidos)',
        quote: 'Equipado con sus cinco sentidos, el ser humano explora el universo que le rodea y llama a esa aventura ciencia.',
        story: 'Atleta consumado, boxeador aficionado y abogado en sus inicios, abandonó la abogacía por su pasión: la astronomía. Tras servir en la Primera Guerra Mundial, se incorporó al Observatorio de Monte Wilson en California, donde acababa de instalarse el telescopio Hooker de 100 pulgadas, el mayor ojo del planeta en ese momento.',
        eureka: 'En la noche del 5 de octubre de 1923, fotografiando la llamada "nebulosa espiral" de Andrómeda (M31), localizó una estrella variable Cefeida. Al medir su brillo y periodo según la regla descubierta por Henrietta Leavitt, calculó su distancia: ¡estaba a más de dos millones de años luz! Andrómeda no era una nube de polvo de nuestra galaxia, sino un «universo-isla» con sus propios cientos de miles de millones de estrellas. La Vía Láctea era solo una gota en un océano infinito.',
        curiosity: 'En la placa fotográfica original de vidrio de aquella noche, Hubble tachó con lápiz rojo la letra "N" (creyendo que era una nova) y escribió emocionado: «VAR!» con un signo de admiración, marcando el momento en que la humanidad descubrió el universo extragaláctico.',
        impact: 'Formuló la Ley de Hubble: demostró que las galaxias se alejan unas de otras a velocidades proporcionales a su distancia (corrimiento al rojo). Derribó la creencia de un universo estático y eterno, dando nacimiento a la cosmología del Big Bang. En su honor, la NASA bautizó al legendario Telescopio Espacial Hubble.'
    },
    'Stephen Hawking': {
        title: 'El conquistador del horizonte de sucesos y el tiempo',
        era: 'Astrofísica Teórica (1942 – 2018 · Reino Unido)',
        quote: 'Recuerda mirar hacia arriba, a las estrellas, y no hacia abajo, a tus pies. Intenta dar sentido a lo que ves y pregúntate qué hace que el universo exista. Sé curioso.',
        story: 'Estudiando en Oxford y Cambridge a los 21 años, empezó a tropezar y le diagnosticaron Esclerosis Lateral Amiotrófica (ELA). Los médicos le pronosticaron apenas dos años de vida. Sin embargo, su enfermedad progresó más lento de lo esperado. Aunque perdió el uso de brazos, piernas y finalmente su voz natural, conservó intacta su genialidad matemática. Con la ayuda de un software controlado con el movimiento de un músculo de su mejilla, dictó conferencias alrededor del mundo.',
        eureka: 'En 1974, combinó la Relatividad General con la Mecánica Cuántica en las fronteras de los agujeros negros. Descubrió que las fluctuaciones cuánticas del vacío en el horizonte de sucesos crean pares de partículas donde una cae y la otra escapa. Esto significa que los agujeros negros no son prisiones absolutas: emiten un tenue resplandor térmico (Radiación de Hawking) y, con el tiempo cósmico, se evaporan por completo.',
        curiosity: 'Poseía un legendario sentido del humor y le gustaba apostar suscripciones a revistas científicas con otros físicos teóricos sobre paradojas de la información. Organizó célebremente una "Fiesta para Viajeros del Tiempo" en la Universidad de Cambridge, pero solo envió las invitaciones después de que la fiesta terminó: nadie asistió, demostrando con picardía que viajar al pasado no parecía factible.',
        impact: 'Escribió «Breve historia del tiempo», el libro de divulgación científica más vendido de la historia contemporánea (más de 25 millones de ejemplares). Unió como nadie la termodinámica, la relatividad y la física cuántica.'
    },
    'Carl Sagan': {
        title: 'El embajador de la Tierra hacia las estrellas',
        era: 'Astrobiología y Divulgación (1934 – 1996 · Estados Unidos)',
        quote: 'Mira ese punto. Eso es aquí. Eso es nuestro hogar. Eso somos nosotros. En él todos los que amas, todos los que conoces, cada ser humano que ha existido, vivió su vida en una mota de polvo suspendida en un rayo de sol.',
        story: 'Hijo de un sastre ucraniano inmigrante en Brooklyn, quedó fascinado por las estrellas en la Feria Mundial de Nueva York de 1939. Profesor en Cornell, asesoró a la NASA en las misiones Mariner, Viking, Pioneer y Voyager. Diseñó el mensaje interestelar grabado en las placas de oro de las nondas Pioneer y los célebres Discos de Oro de las Voyager, que transportan saludos en 55 idiomas, música de Bach, Beethoven y sonidos de ballenas hacia otras civilizaciones.',
        eureka: 'Analizó las emisiones de radio de Venus en los años 60 cuando la mayoría creía que era un paraíso tropical cubierto de nubes. Sagan demostró que sus nubes eran de ácido sulfúrico concentrado y que un feroz efecto invernadero desbocado elevaba la temperatura a más de 460 °C (suficiente para fundir plomo), una advertencia crucial sobre el cambio climático en la Tierra.',
        curiosity: 'En 1990, cuando la sonda Voyager 1 cruzó la frontera de Neptuno a 6.000 millones de kilómetros, convenció a la dirección de la NASA de girar su cámara hacia atrás una última vez para tomar un retrato de familia del sistema solar. En esa imagen, la Tierra ocupa menos de un solo píxel: el «Punto Azul Pálido», inspirando su discurso más conmovedor.',
        impact: 'Con su serie televisiva «Cosmos: Un viaje personal» (vista por más de 500 millones de personas en 60 países), revolucionó la forma en que la humanidad mira el cielo, inspirando a millones de niños y niñas a convertirse en astrónomos y científicos.'
    }
};

function openAstroModal(name) {
    let modal = document.getElementById('astro-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'astro-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box" role="dialog" aria-modal="true" style="max-width:680px; max-height:85vh; overflow-y:auto;">
                <button type="button" class="modal-close" aria-label="Cerrar modal">&times;</button>
                <span class="card-tag" id="modal-tag">Astronomía</span>
                <h3 id="modal-title" style="margin:12px 0 2px; font-family:var(--serif); font-size:26px; color:var(--ink);"></h3>
                <span id="modal-honor" style="display:block; font-size:13px; color:var(--gold); font-weight:700; margin-bottom:12px;"></span>
                <blockquote class="modal-quote" id="modal-quote" style="margin:8px 0 18px;"></blockquote>
                
                <div style="display:flex; flex-direction:column; gap:14px; font-size:14.5px; line-height:1.6; color:var(--ink-soft);">
                    <div>
                        <b style="color:var(--ink); display:block; margin-bottom:4px;">📖 Crónica Biográfica y Desafío:</b>
                        <p id="modal-story" style="margin:0;"></p>
                    </div>
                    <div>
                        <b style="color:var(--gold); display:block; margin-bottom:4px;">💡 El Momento Eureka:</b>
                        <p id="modal-eureka" style="margin:0;"></p>
                    </div>
                    <div>
                        <b style="color:var(--ink); display:block; margin-bottom:4px;">🔍 Curiosidad Histórica:</b>
                        <p id="modal-curiosity" style="margin:0;"></p>
                    </div>
                    <div>
                        <b style="color:var(--ink); display:block; margin-bottom:4px;">🏛️ Legado para la Humanidad:</b>
                        <p id="modal-impact" style="margin:0;"></p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('open'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    const data = ASTRONOMERS_DATA[name];
    if (!data) return;

    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-tag').textContent = data.era;
    document.getElementById('modal-honor').textContent = data.title;
    document.getElementById('modal-quote').textContent = `«${data.quote}»`;
    document.getElementById('modal-story').textContent = data.story;
    document.getElementById('modal-eureka').textContent = data.eureka;
    document.getElementById('modal-curiosity').textContent = data.curiosity;
    document.getElementById('modal-impact').textContent = data.impact;

    modal.classList.add('open');
    playChime(783.99);
}

window.openAstroModal = openAstroModal;

function initAstronomersFilter() {
    // Las tarjetas ricas ya están renderizadas estáticamente en el HTML
    // y los botones activan window.openAstroModal
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
            <circle cx="0" cy="0" r="45" fill="#14261d" stroke="#3f6d52" stroke-width="2"/>
            <path d="M 0,-45 A 45,45 0 0,${isWaxing ? 1 : 0} 0,45 A ${Math.abs(Math.cos(fraction * Math.PI * 2)) * 45},45 0 0,${fraction < 0.25 || fraction > 0.75 ? 0 : 1} 0,-45" fill="#9dc7ad"/>
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
                <div class="planet-preview-sphere" style="background: radial-gradient(circle at 30% 30%, ${p.color}, #0c1811);"></div>
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
            ctx.strokeStyle = isSelected ? 'rgba(85, 137, 106, 0.75)' : 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = isSelected ? 1.5 : 0.8;
            ctx.stroke();

            const angle = (time / p.period) * Math.PI * 2;
            const px = cx + Math.cos(angle) * orbitR;
            const py = cy + Math.sin(angle) * orbitR;

            if (isSelected) {
                ctx.beginPath();
                ctx.arc(px, py, p.radius + 6, 0, Math.PI * 2);
                ctx.strokeStyle = '#55896a';
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
            ctx.fillStyle = isSelected ? '#9dc7ad' : 'rgba(255, 255, 255, 0.65)';
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
