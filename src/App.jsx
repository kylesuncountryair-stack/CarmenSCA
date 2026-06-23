import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";

const generateCaseNumber = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SC-${y}-${m}${day}-${rand}`;
};

const correctAnswers = ["orlando", "mco", "orlando, fl", "orlando, florida"];

const scanMessages = [
  "Scanning Sun Country Global Network...",
  "Checking Skyspeed Reservations...",
  "Cross-referencing Flight Manifests...",
  "Searching Travel Advisories...",
  "Compiling Customer Care Database Files...",
  "Analyzing Passenger Records...",
  "Triangulating Last Known Position...",
];

const bootLines = [
  "INITIALIZING SECURE CONNECTION...",
  "AUTHENTICATING AGENT CREDENTIALS...",
  "ACCESSING SC PURSUIT DIVISION DATABASE...",
  "CONNECTION ESTABLISHED. ACCESS GRANTED.",
];

const HEX_CHARS = "0123456789ABCDEF";
const randomHex = (len) => Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join("");

const prompt =
  "Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen in bulk, had a frozen drink in hand, and kept asking where they could find the warmest place Minnesotans escape to when winter hits hard. They disappeared into a crowd of flipflops, palm trees, and travelers wearing mouse ears...";

const LOCKOUT_KEY = "carmen_played_date";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Map waypoints — SVG coords in a 320x280 viewBox of the Americas ──────────
// x increases east, y increases south
const WAYPOINTS = [
  { id: "msp", label: "Minneapolis", x: 142, y: 72 },
  { id: "ord", label: "Chicago",     x: 155, y: 82 },
  { id: "nyc", label: "New York",    x: 182, y: 84 },
  { id: "lax", label: "Los Angeles", x: 72,  y: 112 },
  { id: "mex", label: "Mexico City", x: 118, y: 152 },
  { id: "mia", label: "Miami",       x: 178, y: 140 },
  { id: "mco", label: "Orlando",     x: 170, y: 130 },  // correct
  { id: "bog", label: "Bogotá",      x: 158, y: 198 },
  { id: "can", label: "Cancún",      x: 138, y: 148 },
];
const DECOY_CITIES = [
  { id: "mia", label: "Miami, FL" },
  { id: "can", label: "Cancún, MX" },
  { id: "bog", label: "Bogotá, CO" },
];

// Sequence of waypoint IDs the dot visits during the 8s scan
const SCAN_PATH = ["msp", "lax", "ord", "mex", "nyc", "can", "bog", "mia"];

// ── Web Audio ─────────────────────────────────────────────────────────────────
function playStamp() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 180;
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.9, ctx.currentTime);
    src.start(ctx.currentTime);
  } catch (e) {}
}

function playChime(correct) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    const freqs = correct ? [523, 659, 784] : [392, 349];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.13);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.13);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.13 + 0.35);
      osc.start(ctx.currentTime + i * 0.13);
      osc.stop(ctx.currentTime + i * 0.13 + 0.35);
    });
  } catch (e) {}
}

function playTick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.045);
  } catch (e) {}
}

// ── Signal bars ───────────────────────────────────────────────────────────────
function SignalBars() {
  const [heights, setHeights] = useState([0.4, 0.7, 0.5, 0.9]);
  useEffect(() => {
    const id = setInterval(() => {
      setHeights([0.2 + Math.random() * 0.8, 0.2 + Math.random() * 0.8,
                  0.2 + Math.random() * 0.8, 0.2 + Math.random() * 0.8]);
    }, 350);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: 4, height: `${Math.round(h * 16)}px`, background: "#dc2626", borderRadius: 1, transition: "height 0.28s ease", opacity: 0.7 + h * 0.3 }}></div>
      ))}
    </div>
  );
}

// ── Hex trace ─────────────────────────────────────────────────────────────────
function HexTrace() {
  const [trace, setTrace] = useState(randomHex(6));
  useEffect(() => {
    const id = setInterval(() => setTrace(randomHex(6)), 600);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontSize: 10, color: "#92400e", letterSpacing: "0.1em", opacity: 0.7 }}>TRACE: {trace}</span>;
}

// ── World map component ───────────────────────────────────────────────────────
function TrackingMap({ dotIndex, finalCity, locked }) {
  const current = dotIndex < SCAN_PATH.length
    ? WAYPOINTS.find(w => w.id === SCAN_PATH[dotIndex])
    : locked
      ? WAYPOINTS.find(w => w.id === "mco")
      : WAYPOINTS.find(w => w.id === (finalCity || "mia"));

  return (
    <div style={{ background: "#0a1a0a", border: "1px solid rgba(0,180,60,0.3)", borderRadius: 4, marginBottom: 10, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 4, left: 6, fontSize: 8, color: "rgba(0,200,60,0.6)", letterSpacing: "0.12em", fontFamily: "'Courier New', Courier, monospace" }}>
        TRACKING GRID — WESTERN HEMISPHERE
      </div>
      <svg viewBox="0 0 320 200" width="100%" style={{ display: "block" }}>
        {/* Grid lines */}
        {[40,80,120,160].map(y => (
          <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(0,180,60,0.08)" strokeWidth="0.5" />
        ))}
        {[64,128,192,256].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="rgba(0,180,60,0.08)" strokeWidth="0.5" />
        ))}

        {/* Landmass shapes — simplified Americas */}
        {/* North America */}
        <path d="M60 20 L90 18 L130 22 L160 30 L190 40 L200 60 L195 80 L180 95 L165 110 L150 115 L135 120 L120 118 L105 125 L95 140 L85 145 L80 135 L75 120 L70 100 L65 80 L55 60 L50 40 Z" fill="rgba(0,120,40,0.25)" stroke="rgba(0,180,60,0.35)" strokeWidth="0.8" />
        {/* Central America */}
        <path d="M120 118 L130 125 L135 135 L130 145 L120 148 L115 140 L112 128 Z" fill="rgba(0,120,40,0.2)" stroke="rgba(0,180,60,0.3)" strokeWidth="0.8" />
        {/* South America */}
        <path d="M135 155 L160 148 L185 155 L200 175 L205 200 L195 230 L175 250 L155 255 L140 245 L125 225 L118 200 L120 175 Z" fill="rgba(0,120,40,0.2)" stroke="rgba(0,180,60,0.3)" strokeWidth="0.8" />

        {/* Waypoint dots — dim */}
        {WAYPOINTS.filter(w => w.id !== "mco").map(w => (
          <circle key={w.id} cx={w.x} cy={w.y} r="2" fill="rgba(0,180,60,0.2)" stroke="rgba(0,180,60,0.4)" strokeWidth="0.5" />
        ))}

        {/* Orlando marker — always shown, dim until locked */}
        <circle cx={WAYPOINTS.find(w=>w.id==="mco").x} cy={WAYPOINTS.find(w=>w.id==="mco").y}
          r="3" fill={locked ? "rgba(74,222,128,0.9)" : "rgba(0,180,60,0.15)"}
          stroke={locked ? "#4ade80" : "rgba(0,180,60,0.3)"} strokeWidth="0.8" />

        {/* Tracking dot + ripple */}
        {current && (
          <g>
            <circle cx={current.x} cy={current.y} r="6" fill="none" stroke="rgba(220,38,38,0.3)" strokeWidth="0.8">
              <animate attributeName="r" from="4" to="12" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={current.x} cy={current.y} r="3.5" fill="#dc2626" stroke="#ff6060" strokeWidth="0.8" />
            <text x={current.x + 5} y={current.y - 4} fontSize="6" fill="rgba(220,38,38,0.85)" fontFamily="Courier New">{current.label}</text>
          </g>
        )}

        {/* Lock-on crosshair when final */}
        {locked && current && (
          <g stroke="#4ade80" strokeWidth="0.8" opacity="0.7">
            <line x1={current.x - 8} y1={current.y} x2={current.x - 4} y2={current.y} />
            <line x1={current.x + 4} y1={current.y} x2={current.x + 8} y2={current.y} />
            <line x1={current.x} y1={current.y - 8} x2={current.x} y2={current.y - 4} />
            <line x1={current.x} y1={current.y + 4} x2={current.x} y2={current.y + 8} />
          </g>
        )}
      </svg>
    </div>
  );
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text, speed = 38, withSound = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (withSound) playTick();
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

function TypewriterLine({ text, speed = 30, onDone }) {
  const { done, displayed } = useTypewriter(text, speed, true);
  useEffect(() => { if (done && onDone) onDone(); }, [done]);
  return <span>{displayed}{!done && <span style={{ opacity: 0.7 }}>▌</span>}</span>;
}

function VerdictLine({ text, color }) {
  const { displayed } = useTypewriter(text, 28, false);
  return (
    <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.02em", fontFamily: "'Courier New', Courier, monospace", color }}>
      {displayed}<span style={{ opacity: displayed.length < text.length ? 0.5 : 0 }}>▌</span>
    </p>
  );
}

// ── Scan message ──────────────────────────────────────────────────────────────
function ScanMessage({ text, step }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: "easeOut" }} style={styles.scanMessage}>
        {text}
      </motion.p>
    </AnimatePresence>
  );
}

// ── Redacted reveal ───────────────────────────────────────────────────────────
function RedactedReveal({ text }) {
  return (
    <span style={{ position: "relative", display: "inline-block", fontFamily: "'Courier New', Courier, monospace", fontSize: 14, fontWeight: 700, color: "#15803d", letterSpacing: "0.03em" }}>
      {text}
      <span style={{ position: "absolute", inset: 0, background: "#1c0a00", borderRadius: 2, animation: "unredact 0.7s ease-in-out 0.6s forwards", width: "100%" }}></span>
    </span>
  );
}

// ── Boot sequence ─────────────────────────────────────────────────────────────
function BootSequence({ onComplete }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [lines, setLines] = useState([]);
  const [fading, setFading] = useState(false);
  const advance = () => {
    const next = lineIndex + 1;
    if (next < bootLines.length) {
      setLines(prev => [...prev, bootLines[lineIndex]]);
      setLineIndex(next);
    } else {
      setLines(prev => [...prev, bootLines[lineIndex]]);
      setTimeout(() => { setFading(true); setTimeout(onComplete, 400); }, 300);
    }
  };
  return (
    <motion.div animate={{ opacity: fading ? 0 : 1 }} transition={{ duration: 0.5 }} style={styles.bootOverlay}>
      <div style={styles.bootBox}>
        <div style={styles.bootHeader}>
          <span style={styles.bootHeaderDot}></span>
          <span style={styles.bootHeaderDot}></span>
          <span style={styles.bootHeaderDot}></span>
          <span style={styles.bootHeaderTitle}>SC-TERMINAL v2.4.1</span>
        </div>
        <div style={styles.bootBody}>
          {lines.map((l, i) => (
            <p key={i} style={{ ...styles.bootLine, color: i === lines.length - 1 && l === bootLines[bootLines.length - 1] ? "#4ade80" : "#a3e635" }}>{l}</p>
          ))}
          {lineIndex < bootLines.length && (
            <p style={styles.bootLine}>
              <TypewriterLine key={lineIndex} text={bootLines[lineIndex]} speed={16} onDone={advance} />
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Chunky progress ───────────────────────────────────────────────────────────
function useChunkyProgress(active) {
  const [progress, setProgress] = useState(0);
  const stateRef = useRef({ value: 0, pauseUntil: 0 });
  useEffect(() => {
    if (!active) { stateRef.current = { value: 0, pauseUntil: 0 }; setProgress(0); return; }
    stateRef.current = { value: 0, pauseUntil: 0 };
    const id = setInterval(() => {
      const s = stateRef.current;
      const now = Date.now();
      if (now < s.pauseUntil || s.value >= 99) return;
      const chunk = 1 + Math.floor(Math.random() * 5);
      const next = Math.min(99, s.value + chunk);
      s.value = next;
      setProgress(next);
      if (Math.random() < 0.2) s.pauseUntil = now + 300 + Math.random() * 400;
    }, 120);
    return () => clearInterval(id);
  }, [active]);
  return progress;
}

export default function CarmenGame() {
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseNumber] = useState(generateCaseNumber());
  const [scanStep, setScanStep] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  const [radarFast, setRadarFast] = useState(false);
  const [booting, setBooting] = useState(true);
  const [mapDotIndex, setMapDotIndex] = useState(0);
  const [mapLocked, setMapLocked] = useState(false);
  const [mapFinalCity, setMapFinalCity] = useState(null);
  const [glitch, setGlitch] = useState(false);

  const scanProgress = useChunkyProgress(scanning);

  useEffect(() => {
    const played = localStorage.getItem(LOCKOUT_KEY);
    if (played === getTodayString()) setLockedOut(true);
  }, []);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setScanning(true);
    setRadarFast(true);
    setMapDotIndex(0);
    setMapLocked(false);
    setScanStep(0);

    // Advance map dot through waypoints
    let dotStep = 0;
    const dotInterval = setInterval(() => {
      dotStep++;
      if (dotStep < SCAN_PATH.length) {
        setMapDotIndex(dotStep);
      } else {
        clearInterval(dotInterval);
      }
    }, 8000 / SCAN_PATH.length);

    // Advance scan messages
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < scanMessages.length) setScanStep(step);
    }, 1050);

    setTimeout(() => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.includes(normalized);
      localStorage.setItem(LOCKOUT_KEY, getTodayString());
      setRadarFast(false);

      // Lock map dot to final city
      const decoy = DECOY_CITIES[Math.floor(Math.random() * DECOY_CITIES.length)];
      setMapFinalCity(match ? "mco" : decoy.id);
      setMapLocked(true);

      // DECRYPT phase
      setScanning(false);
      setDecrypting(true);

      // Glitch once after 300ms
      setTimeout(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120);
      }, 300);

      // Play chime and flash at 700ms, reveal at 800ms
      setTimeout(() => {
        playChime(match);
        if (match) {
          setFlashGreen(true);
          setTimeout(() => setFlashGreen(false), 1200);
        } else {
          setFlashRed(true);
          setTimeout(() => setFlashRed(false), 1000);
        }
      }, 700);

      setTimeout(() => {
        setDecrypting(false);
        setIsCorrect(match);
        setShowName(true);
      }, 900);

    }, 8000);
  };

  const handleFinalSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answer, result: isCorrect ? "Correct" : "Incorrect", caseNumber }),
      });
    } catch (err) {}
    setTimeout(() => setSubmitted(true), 800);
  };

  const keyframes = `
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
    @keyframes btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)} 50%{box-shadow:0 0 0 8px rgba(220,38,38,0)} }
    @keyframes greenFlash { 0%{opacity:0} 20%{opacity:0.55} 80%{opacity:0.55} 100%{opacity:0} }
    @keyframes redFlash { 0%{opacity:0} 15%{opacity:0.5} 70%{opacity:0.5} 100%{opacity:0} }
    @keyframes stampIn { 0%{opacity:0;transform:rotate(-4deg) scale(1.4)} 60%{opacity:1;transform:rotate(-2deg) scale(0.95)} 100%{opacity:1;transform:rotate(-2deg) scale(1)} }
    @keyframes unredact { 0%{width:100%} 100%{width:0%} }
    @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.97} 94%{opacity:1} 97%{opacity:0.98} 98%{opacity:1} }
    @keyframes scanlines { 0%{background-position:0 0} 100%{background-position:0 4px} }
    @keyframes glitchShift { 0%{transform:translate(0)} 20%{transform:translate(-3px,1px)} 40%{transform:translate(3px,-1px)} 60%{transform:translate(-2px,0)} 80%{transform:translate(2px,1px)} 100%{transform:translate(0)} }
    @keyframes barFlash { 0%,100%{background:linear-gradient(90deg,#991b1b,#dc2626)} 50%{background:#fff} }
    @keyframes decryptPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  `;

  if (submitted) {
    return (
      <div style={styles.root}>
        <style>{keyframes}</style>
        <div style={styles.crtOverlay}></div>
        <RadarBackground fast={false} />
        <div style={styles.centeredFill}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} style={styles.folderWrap}>
            <div style={styles.folderTab}>
              <span style={styles.folderTabText}>SC PURSUIT DIVISION</span>
              <span style={styles.folderTabCase}>REF-{caseNumber}</span>
            </div>
            <div style={styles.folderBody}>
              <div style={styles.paperLines}></div>
              <motion.div initial={{ scale: 1.6, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: -3 }} transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 14 }} onAnimationComplete={() => playStamp()} style={{ ...styles.filedStamp, borderColor: isCorrect ? "#15803d" : "#dc2626", color: isCorrect ? "#15803d" : "#dc2626" }}>
                {isCorrect ? "CASE CLOSED" : "CASE OPEN"}
              </motion.div>
              <p style={styles.folderTitle}>Pursuit Dossier</p>
              <p style={styles.folderSuspect}>Re: Carmen Sandiego</p>
              <div style={styles.folderDivider}></div>
              <div style={styles.folderFields}>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>REPORTING AGENT</span>
                  <span style={styles.folderFieldValue}>{name}</span>
                </div>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>FILED</span>
                  <span style={styles.folderFieldValue}>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
                </div>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>{isCorrect ? "LOCATION CONFIRMED" : "SUBMITTED LOCATION"}</span>
                  <span style={styles.folderFieldValue}>{answer.toUpperCase()}</span>
                </div>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>OUTCOME</span>
                  {isCorrect ? (
                    <RedactedReveal text="Orlando, FL (MCO) — Target Located" />
                  ) : (
                    <span style={{ ...styles.folderFieldValue, color: "#dc2626" }}>Suspect Evaded — Location Unknown</span>
                  )}
                </div>
              </div>
              <div style={styles.folderFooter}>
                <span style={styles.folderFooterText}>Sun Country Airlines · Eyes Only · Destroy After Reading</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (lockedOut) {
    return (
      <div style={styles.root}>
        <style>{keyframes}</style>
        <div style={styles.crtOverlay}></div>
        <RadarBackground fast={false} />
        <div style={styles.centeredFill}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} style={styles.folderWrap}>
            <div style={styles.folderTab}>
              <span style={styles.folderTabText}>SC PURSUIT DIVISION</span>
              <span style={styles.folderTabCase}>DAILY BRIEFING</span>
            </div>
            <div style={styles.folderBody}>
              <div style={styles.paperLines}></div>
              <motion.div initial={{ scale: 1.6, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: -3 }} transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 14 }} onAnimationComplete={() => playStamp()} style={{ ...styles.filedStamp, borderColor: "#dc2626", color: "#dc2626" }}>
                CASE CLOSED
              </motion.div>
              <p style={styles.folderTitle}>Access Denied</p>
              <p style={styles.folderSuspect}>Re: Carmen Sandiego</p>
              <div style={styles.folderDivider}></div>
              <div style={styles.folderFields}>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>STATUS</span>
                  <span style={{ ...styles.folderFieldValue, color: "#dc2626" }}>Report Already Filed Today</span>
                </div>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>NEXT BRIEFING</span>
                  <span style={styles.folderFieldValue}>Tomorrow — New Case Awaits</span>
                </div>
              </div>
              <div style={styles.folderFooter}>
                <span style={styles.folderFooterText}>Sun Country Airlines · SC Pursuit Division · {new Date().getFullYear()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.root, animation: "flicker 8s ease-in-out infinite" }}>
      <style>{keyframes}</style>
      <div style={styles.crtOverlay}></div>
      <RadarBackground fast={radarFast} />

      <AnimatePresence>
        {booting && <BootSequence onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      {flashGreen && <div style={{ position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none", background: "rgba(34,197,94,0.3)", animation: "greenFlash 1.2s ease-in-out forwards" }}></div>}
      {flashRed && <div style={{ position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none", background: "rgba(220,38,38,0.35)", animation: "redFlash 1.0s ease-in-out forwards" }}></div>}

      <motion.div
        style={{ ...styles.outer, animation: glitch ? "glitchShift 0.12s steps(4) forwards" : "none" }}
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: booting ? 32 : 0, opacity: booting ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
      >
        <div style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <span style={styles.orgLabel}>SUN COUNTRY AIRLINES</span>
            <span style={styles.divider}>|</span>
            <span style={styles.orgLabel}>SC PURSUIT DIVISION</span>
          </div>
          <div style={styles.caseTag}>CASE {caseNumber}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.paperLines}></div>

          <div style={styles.cardTopStrip}>
            <div style={styles.classifiedBadge}>CLASSIFIED</div>
            <div style={styles.topRight}>
              <span style={styles.dateStamp}>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
              <span style={styles.priorityTag}>PRIORITY: URGENT</span>
            </div>
          </div>

          <div style={styles.suspectHeader}>
            <p style={styles.suspectName}>Carmen Sandiego</p>
            <div style={styles.suspectFieldRow}>
              <div style={styles.suspectField}>
                <span style={styles.fieldLabel}>ALIAS</span>
                <span style={styles.fieldValue}>"The Red Shadow"</span>
              </div>
              <div style={styles.suspectField}>
                <span style={styles.fieldLabel}>STATUS</span>
                <span style={{ ...styles.fieldValue, color: "#dc2626" }}>AT LARGE</span>
              </div>
              <div style={styles.suspectField}>
                <span style={styles.fieldLabel}>THREAT</span>
                <span style={{ ...styles.fieldValue, color: "#dc2626" }}>HIGH</span>
              </div>
              <div style={styles.suspectField}>
                <span style={styles.fieldLabel}>KNOWN FOR</span>
                <span style={styles.fieldValue}>Evasion · Deception · Travel</span>
              </div>
            </div>
          </div>

          <div style={styles.sectionDivider}>
            <div style={styles.sectionRule}></div>
            <span style={styles.sectionLabel}>LAST KNOWN INTELLIGENCE</span>
            <div style={styles.sectionRule}></div>
          </div>

          <div style={styles.clueBox}>
            <span style={styles.clueTitle}>INTEL REPORT</span>
            <p style={styles.clueText}>{prompt}</p>
            <div style={styles.directiveLine}></div>
            <p style={styles.clueQuestion}>Where in the Sun Country world did they go?</p>
          </div>

          <AnimatePresence mode="wait">
            {!scanning && !decrypting && !showName && (
              <motion.div key="input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={styles.inputSection}>
                <label style={styles.inputLabel}>Input Suspect's Location</label>
                <div style={styles.inputRow}>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && answer.trim() && handleSubmit()}
                    onFocus={(e) => e.target.style.boxShadow = "0 0 0 3px rgba(146,64,14,0.25)"}
                    onBlur={(e) => e.target.style.boxShadow = "none"}
                    style={styles.input}
                    placeholder="City or airport code"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    style={{ ...styles.trackBtn, opacity: answer.trim() ? 1 : 0.45, cursor: answer.trim() ? "pointer" : "not-allowed", animation: answer.trim() ? "btnPulse 1.8s ease-in-out infinite" : "none" }}
                  >
                    Track Carmen
                  </button>
                </div>
              </motion.div>
            )}

            {scanning && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.scanSection}>
                <div style={styles.scanHeader}>
                  <span style={{ ...styles.scanDot, animation: "pulse 1.2s ease-in-out infinite" }}></span>
                  <span style={styles.scanTitle}>SCANNING...</span>
                  <div style={{ marginLeft: "auto" }}><SignalBars /></div>
                </div>

                {/* World map */}
                <TrackingMap dotIndex={mapDotIndex} finalCity={mapFinalCity} locked={mapLocked} />

                <ScanMessage text={scanMessages[scanStep]} step={scanStep} />

                <div style={{ marginBottom: 12 }}><HexTrace /></div>

                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${scanProgress}%`, transition: "width 0.15s ease-out" }}></div>
                </div>
                <p style={styles.scanProgress}>{scanProgress}%</p>
              </motion.div>
            )}

            {decrypting && (
              <motion.div key="decrypting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.scanSection}>
                <div style={styles.scanHeader}>
                  <span style={{ ...styles.scanDot, background: "#f59e0b", boxShadow: "0 0 6px #f59e0b", animation: "pulse 0.5s ease-in-out infinite" }}></span>
                  <span style={{ ...styles.scanTitle, color: "#92400e", animation: "decryptPulse 0.5s ease-in-out infinite" }}>DECRYPTING...</span>
                </div>
                <TrackingMap dotIndex={SCAN_PATH.length} finalCity={mapFinalCity} locked={mapLocked} />
                <div style={{ ...styles.progressBar, marginTop: 8 }}>
                  <div style={{ ...styles.progressFill, width: "100%", animation: "barFlash 0.3s steps(2) infinite" }}></div>
                </div>
              </motion.div>
            )}

            {showName && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={styles.resultSection}>
                <div style={{ ...styles.resultBanner, borderColor: isCorrect ? "#16a34a" : "#dc2626", background: isCorrect ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)" }}>
                  <div style={styles.resultTagRow}>
                    <span style={{ ...styles.resultTag, background: isCorrect ? "#16a34a" : "#dc2626" }}>
                      {isCorrect ? "TARGET LOCKED" : "SUSPECT EVADED"}
                    </span>
                  </div>
                  <VerdictLine
                    text={isCorrect ? "Excellent work, Gumshoe. Case closed." : "Carmen slipped away. A new case awaits tomorrow, Agent."}
                    color={isCorrect ? "#166534" : "#991b1b"}
                  />
                  {isCorrect && <p style={styles.resultSub}>Suspect located in Orlando, FL (MCO)</p>}
                </div>
                <div style={styles.agentSection}>
                  <label style={styles.inputLabel}>Agent Full Name</label>
                  <div style={styles.inputRow}>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && name.trim() && handleFinalSubmit()}
                      onFocus={(e) => e.target.style.boxShadow = "0 0 0 3px rgba(146,64,14,0.25)"}
                      onBlur={(e) => e.target.style.boxShadow = "none"}
                      style={styles.input}
                      placeholder="Enter your name to file report"
                    />
                    <button
                      onClick={handleFinalSubmit}
                      disabled={submitting || !name.trim()}
                      style={{ ...styles.submitBtn, opacity: submitting || !name.trim() ? 0.5 : 1, cursor: submitting || !name.trim() ? "not-allowed" : "pointer", animation: name.trim() && !submitting ? "btnPulse 1.8s ease-in-out infinite" : "none" }}
                    >
                      {submitting ? "Filing..." : "File Report"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={styles.cardFooter}>
            <span style={styles.footerText}>Sun Country Airlines · Eyes Only · Destroy After Reading</span>
            <span style={{ ...styles.footerText, color: "rgba(161,98,7,0.35)" }}>·</span>
            <span style={styles.footerText}>REF-{caseNumber}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Radar with phosphor trail ─────────────────────────────────────────────────
function RadarBackground({ fast }) {
  const dur = fast ? 1.4 : 4;
  return (
    <div style={styles.radarContainer}>
      <svg style={styles.radarSvg} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <circle cx="400" cy="400" r="380" fill="none" stroke="rgba(220,38,38,0.7)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(220,38,38,0.6)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="180" fill="none" stroke="rgba(220,38,38,0.5)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="90"  fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1.5" />
        <line x1="400" y1="20" x2="400" y2="780" stroke="rgba(220,38,38,0.3)" strokeWidth="0.75" />
        <line x1="20" y1="400" x2="780" y2="400" stroke="rgba(220,38,38,0.3)" strokeWidth="0.75" />
      </svg>

      {/* Phosphor trail wedges — offset behind the main sweep */}
      {[
        { offset: -18, opacity: 0.38 },
        { offset: -34, opacity: 0.22 },
        { offset: -50, opacity: 0.12 },
        { offset: -66, opacity: 0.06 },
      ].map((t, i) => (
        <motion.div
          key={i}
          style={{ ...styles.sweepWrap }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: dur, ease: "linear" }}
        >
          <svg style={styles.radarSvg} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <g transform={`rotate(${t.offset} 400 400)`}>
              <path d="M400,400 L400,20 A380,380 0 0,1 752,540 Z" fill={`rgba(0,220,80,${t.opacity})`} />
            </g>
          </svg>
        </motion.div>
      ))}

      {/* Main sweep with leading edge */}
      <motion.div style={styles.sweepWrap} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: dur, ease: "linear" }}>
        <svg style={styles.radarSvg} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sweepFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,220,80,0)" />
              <stop offset="100%" stopColor="rgba(0,220,80,0.55)" />
            </radialGradient>
          </defs>
          <path d="M400,400 L400,20 A380,380 0 0,1 752,540 Z" fill="url(#sweepFade)" opacity="1" />
          <line x1="400" y1="400" x2="400" y2="20" stroke="rgba(0,255,80,0.9)" strokeWidth="2" />
        </svg>
      </motion.div>

      <div style={styles.darkOverlay}></div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: { minHeight: "100vh", background: "#050505", backgroundImage: "url('https://i.wpfc.ml/h7/uxapf2.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', Courier, monospace", padding: "24px 16px", position: "relative", overflow: "hidden" },

  crtOverlay: {
    position: "fixed", inset: 0, zIndex: 99, pointerEvents: "none",
    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
    backgroundSize: "100% 4px",
  },

  bootOverlay: { position: "fixed", inset: 0, zIndex: 50, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" },
  bootBox: { width: "100%", maxWidth: 540, border: "1px solid rgba(0,255,80,0.3)", borderRadius: 4, overflow: "hidden" },
  bootHeader: { background: "rgba(0,255,80,0.08)", borderBottom: "1px solid rgba(0,255,80,0.2)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 },
  bootHeaderDot: { width: 10, height: 10, borderRadius: "50%", background: "rgba(0,255,80,0.4)", display: "inline-block" },
  bootHeaderTitle: { fontSize: 10, color: "rgba(0,255,80,0.6)", letterSpacing: "0.12em", marginLeft: 6 },
  bootBody: { background: "#000", padding: "20px 24px", minHeight: 140 },
  bootLine: { fontSize: 13, color: "#a3e635", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.06em", margin: "0 0 10px", lineHeight: 1.4 },

  radarContainer: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 1 },
  radarSvg: { position: "absolute", width: "min(120vw, 120vh)", height: "min(120vw, 120vh)" },
  sweepWrap: { position: "absolute", width: "min(120vw, 120vh)", height: "min(120vw, 120vh)", display: "flex", alignItems: "center", justifyContent: "center" },
  darkOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" },

  centeredFill: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", position: "relative", zIndex: 10 },
  outer: { width: "100%", maxWidth: 680, position: "relative", zIndex: 10 },

  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 20px", background: "#b91c1c", borderRadius: "6px 6px 0 0", borderBottom: "3px solid #7f1d1d" },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  orgLabel: { color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em" },
  divider: { color: "rgba(255,255,255,0.35)", fontSize: 10 },
  caseTag: { color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.15)" },

  card: { background: "#fefce8", border: "2px solid #92400e", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "28px 32px 24px", boxShadow: "0 24px 60px rgba(0,0,0,0.75)", position: "relative", overflow: "hidden" },

  paperLines: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: ["repeating-linear-gradient(transparent, transparent 27px, rgba(146,64,14,0.07) 27px, rgba(146,64,14,0.07) 28px)", "radial-gradient(ellipse at 0% 0%, rgba(120,53,15,0.09) 0%, transparent 55%)", "radial-gradient(ellipse at 100% 0%, rgba(120,53,15,0.07) 0%, transparent 50%)", "radial-gradient(ellipse at 100% 100%, rgba(120,53,15,0.1) 0%, transparent 55%)", "radial-gradient(ellipse at 0% 100%, rgba(120,53,15,0.09) 0%, transparent 55%)"].join(","), backgroundSize: "100% 28px, 100% 100%, 100% 100%, 100% 100%, 100% 100%", backgroundPositionY: "8px, 0, 0, 0, 0" },

  cardTopStrip: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, position: "relative", zIndex: 1 },
  classifiedBadge: { color: "#dc2626", fontSize: 14, fontWeight: 700, letterSpacing: "0.18em", padding: "4px 10px", border: "3px solid #dc2626", borderRadius: 3, display: "inline-block", opacity: 0.85, animation: "stampIn 0.5s ease-out forwards", transformOrigin: "center" },
  topRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 },
  dateStamp: { fontSize: 9, fontWeight: 700, color: "#78350f", letterSpacing: "0.1em" },
  priorityTag: { fontSize: 9, fontWeight: 700, color: "#dc2626", letterSpacing: "0.1em", border: "1px solid rgba(220,38,38,0.4)", padding: "2px 6px", borderRadius: 2 },

  suspectHeader: { marginBottom: 20, padding: "16px 18px", background: "rgba(0,0,0,0.04)", borderRadius: 6, border: "1px solid rgba(146,64,14,0.2)", position: "relative", zIndex: 1 },
  suspectName: { fontSize: 26, fontWeight: 700, color: "#1c0a00", margin: "0 0 14px", letterSpacing: "0.02em", borderBottom: "1px solid rgba(146,64,14,0.2)", paddingBottom: 12 },
  suspectFieldRow: { display: "flex", flexWrap: "wrap" },
  suspectField: { display: "flex", flexDirection: "column", gap: 3, flex: "1 1 120px", paddingRight: 20 },
  fieldLabel: { fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", color: "#a16207" },
  fieldValue: { fontSize: 12, fontWeight: 700, color: "#1c0a00", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.03em" },

  sectionDivider: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, position: "relative", zIndex: 1 },
  sectionRule: { flex: 1, height: 1, background: "rgba(146,64,14,0.3)" },
  sectionLabel: { fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "#78350f", whiteSpace: "nowrap" },

  clueBox: { background: "rgba(255,255,255,0.55)", border: "1px solid rgba(146,64,14,0.3)", borderLeft: "4px solid #dc2626", borderRadius: 0, padding: "14px 16px", marginBottom: 20, position: "relative", zIndex: 1 },
  clueTitle: { display: "block", fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", color: "#78350f", marginBottom: 8 },
  clueText: { fontSize: 15, lineHeight: 1.7, color: "#1c0a00", margin: "0 0 12px", fontFamily: "Georgia, serif", fontStyle: "italic" },
  directiveLine: { height: 1, background: "rgba(220,38,38,0.25)", marginBottom: 10, borderTop: "1px dashed rgba(220,38,38,0.3)" },
  clueQuestion: { fontSize: 14, fontWeight: 700, color: "#dc2626", margin: 0, letterSpacing: "0.01em", fontFamily: "'Courier New', Courier, monospace" },

  inputSection: { marginBottom: 8, position: "relative", zIndex: 1 },
  inputLabel: { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#78350f", marginBottom: 8 },
  inputRow: { display: "flex", gap: 10 },
  input: { flex: 1, padding: "10px 14px", fontSize: 14, fontFamily: "'Courier New', Courier, monospace", border: "1.5px solid #92400e", borderRadius: 4, background: "rgba(255,255,255,0.8)", color: "#1c0a00", outline: "none", letterSpacing: "0.04em" },
  trackBtn: { padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap" },

  scanSection: { padding: "16px 0", position: "relative", zIndex: 1 },
  scanHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  scanDot: { width: 8, height: 8, borderRadius: "50%", background: "#dc2626", display: "inline-block", boxShadow: "0 0 6px #dc2626", flexShrink: 0 },
  scanTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#991b1b" },
  scanMessage: { fontSize: 13, color: "#78350f", fontFamily: "'Courier New', Courier, monospace", margin: "0 0 6px", letterSpacing: "0.04em", minHeight: 20 },
  progressBar: { height: 8, background: "rgba(0,0,0,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: 6, marginTop: 4 },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#991b1b,#dc2626)", borderRadius: 2 },
  scanProgress: { fontSize: 11, color: "#991b1b", margin: 0, textAlign: "right", letterSpacing: "0.08em" },

  resultSection: { marginBottom: 4, position: "relative", zIndex: 1 },
  resultBanner: { border: "1.5px solid", borderRadius: 6, padding: "14px 18px", marginBottom: 16 },
  resultTagRow: { marginBottom: 8 },
  resultTag: { display: "inline-block", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", padding: "3px 10px", borderRadius: 2 },
  resultTitle: { fontSize: 15, fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.02em", fontFamily: "'Courier New', Courier, monospace" },
  resultSub: { fontSize: 12, color: "#166534", margin: 0, letterSpacing: "0.06em" },

  agentSection: { marginTop: 4, position: "relative", zIndex: 1 },
  submitBtn: { padding: "10px 20px", background: "#7f1d1d", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap" },

  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 12, borderTop: "1px solid rgba(146,64,14,0.2)", position: "relative", zIndex: 1 },
  footerText: { fontSize: 9, color: "#a16207", letterSpacing: "0.08em" },

  folderWrap: { width: "100%", maxWidth: 520, position: "relative", zIndex: 10 },
  folderTab: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#b91c1c", borderBottom: "3px solid #7f1d1d", borderRadius: "6px 6px 0 0", padding: "8px 18px", width: "55%" },
  folderTabText: { color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", fontFamily: "'Courier New', Courier, monospace" },
  folderTabCase: { color: "rgba(255,255,255,0.6)", fontSize: 9, letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace" },
  folderBody: { background: "#fefce8", border: "2px solid #92400e", borderTop: "2px solid #92400e", borderRadius: "0 6px 6px 6px", padding: "28px 32px 24px", position: "relative", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.75)" },
  filedStamp: { position: "absolute", top: 24, right: 24, fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", border: "3px solid", padding: "5px 12px", borderRadius: 3, opacity: 0.88, fontFamily: "'Courier New', Courier, monospace", transformOrigin: "center", zIndex: 2 },
  folderTitle: { fontSize: 22, fontWeight: 700, color: "#1c0a00", margin: "0 0 2px", letterSpacing: "0.02em", position: "relative", zIndex: 1 },
  folderSuspect: { fontSize: 12, color: "#78350f", margin: "0 0 16px", letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace", position: "relative", zIndex: 1 },
  folderDivider: { height: 1, background: "rgba(146,64,14,0.25)", marginBottom: 20, position: "relative", zIndex: 1 },
  folderFields: { display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1 },
  folderField: { display: "flex", flexDirection: "column", gap: 3, paddingBottom: 14, borderBottom: "1px solid rgba(146,64,14,0.12)" },
  folderFieldLabel: { fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", color: "#a16207", fontFamily: "'Courier New', Courier, monospace" },
  folderFieldValue: { fontSize: 14, fontWeight: 700, color: "#1c0a00", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.03em" },
  folderFooter: { marginTop: 20, paddingTop: 12, borderTop: "1px solid rgba(146,64,14,0.15)", position: "relative", zIndex: 1 },
  folderFooterText: { fontSize: 9, color: "#a16207", letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace" },
};
