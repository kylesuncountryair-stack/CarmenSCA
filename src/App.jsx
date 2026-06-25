import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bgImage from "/public/background.png";

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

const correctAnswers = ["msy", "orleans", "new orleans, louisiana", "new orleans, la", "new orleans la", "new orleans louisiana", "neworleans", "msy - new orleans", "nawlins", "new orleans"];

// ── Update this list each day ─────────────────────────────────────────────────
const PRIOR_SIGHTINGS = [
  { city: "Orlando, FL", code: "MCO", date: "JUN 22, 2026", status: "ESCAPED" },
  { city: "Las Vegas, NV", code: "LAS", date: "JUN 23, 2026", status: "ESCAPED" },
   { city: "Seattle, WA", code: "SEA", date: "JUN 24, 2026", status: "ESCAPED" },
];

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
  "ACCESSING PURSUIT DIVISION DATABASE...",
  "CONNECTION ESTABLISHED. ACCESS GRANTED.",
];

const HEX_CHARS = "0123456789ABCDEF";
const randomHex = (len) => Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join("");

const prompt =
  "Our latest lead came with a soundtrack. Carmen surfaced in a city where every few blocks seem to have their own band, balconies are dressed in intricate ironwork, and the air somehow smells like both chicory and spicy cooking. Witnesses watched her duck into a hidden courtyard, admire a grand cathedral overlooking a lively square, and strike up a conversation with a captain preparing a paddlewheel riverboat for departure. When our agents finally caught up, the music had changed, the crowd had shifted and Carmen had vanished without a trace except for a trail of powdered sugar leading nowhere.";

const LOCKOUT_KEY = "carmen_played_date";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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

// ── Coordinate tracker ────────────────────────────────────────────────────────
const CITY_COORDS = {
  correct: { lat: 29.9511, lon: -90.0715, label: "MSY — LOCKED" },
  decoys: [
    { lat: 25.7959, lon: -80.2870, label: "MIA — LOCKED" },
    { lat: 21.3187, lon: -157.9225, label: "HNL — LOCKED" },
    { lat: 33.9425, lon: -118.4081, label: "LAX — LOCKED" },
  ],
};

function CoordTracker({ locked, isCorrect }) {
  const [lat, setLat] = useState(44.2 + Math.random() * 8);
  const [lon, setLon] = useState(-110.5 - Math.random() * 20);

  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => {
      setLat(prev => parseFloat((prev + (Math.random() - 0.5) * 0.8).toFixed(4)));
      setLon(prev => parseFloat((prev + (Math.random() - 0.5) * 0.8).toFixed(4)));
    }, 400);
    return () => clearInterval(id);
  }, [locked]);

  const final = locked
    ? isCorrect
      ? CITY_COORDS.correct
      : CITY_COORDS.decoys[Math.floor(Math.random() * CITY_COORDS.decoys.length)]
    : null;

  const displayLat = locked ? final.lat : lat;
  const displayLon = locked ? final.lon : lon;
  const latDir = displayLat >= 0 ? "N" : "S";
  const lonDir = displayLon >= 0 ? "E" : "W";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: locked ? (isCorrect ? "#4ade80" : "#86efac") : "#86efac", fontFamily: "'VT323', monospace", letterSpacing: "0.08em", fontWeight: 400 }}>
        LAT: {Math.abs(displayLat).toFixed(4)}°{latDir} · LON: {Math.abs(displayLon).toFixed(4)}°{lonDir}
        {locked && <span style={{ marginLeft: 10, fontSize: 12, letterSpacing: "0.14em" }}>▸ {final.label}</span>}
      </span>
    </div>
  );
}

// ── SVG stamp filter (injected once into DOM) ─────────────────────────────────
function StampFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id="stampFilter" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.065" numOctaves="4" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feComposite in="displaced" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="paperGrain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="7" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended" />
          <feComposite in="blended" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
function useTypewriter(text, speed = 38) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

function TypewriterLine({ text, speed = 30, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  useEffect(() => { if (done && onDone) onDone(); }, [done]);
  return <span>{displayed}{!done && <span style={{ opacity: 0.7 }}>▌</span>}</span>;
}

function VerdictLine({ text, color }) {
  const { displayed } = useTypewriter(text, 28, false);
  return (
    <p style={{ fontSize: 16, fontWeight: 400, margin: "0 0 4px", letterSpacing: "0.02em", fontFamily: "'Special Elite', cursive", color }}>
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
const BOOT_CHECKS = [
  "SC-TERMINAL v2.4.1",
  "BIOS CHECK........................ OK",
  "MEMORY CHECK...................... OK",
  "NETWORK INTERFACE................. OK",
  "ENCRYPTION MODULE................. OK",
  "INITIALIZING SECURE CONNECTION...",
  "AUTHENTICATING AGENT CREDENTIALS...",
  "ACCESSING PURSUIT DIVISION DATABASE...",
];

function BootSequence({ onComplete }) {
  const [phase, setPhase] = useState("checks"); // checks | wipe | granted
  const [lineIndex, setLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState([]);
  const [fading, setFading] = useState(false);

  const advance = () => {
    setCompletedLines(prev => [...prev, BOOT_CHECKS[lineIndex]]);
    const next = lineIndex + 1;
    if (next < BOOT_CHECKS.length) {
      setLineIndex(next);
    } else {
      // All checks done — wipe after a short pause
      setTimeout(() => {
        setPhase("wipe");
        setTimeout(() => {
          setPhase("granted");
          setTimeout(() => {
            setFading(true);
            setTimeout(onComplete, 500);
          }, 1900);
        }, 300);
      }, 200);
    }
  };

  return (
    <motion.div
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      style={styles.bootOverlay}
    >
      <div style={styles.bootBox}>
        <div style={styles.bootHeader}>
          <span style={styles.bootHeaderTitle}>SUN COUNTRY · PURSUIT DIVISION · SECURE TERMINAL</span>
          <span style={styles.bootHeaderDot}></span>
        </div>

        <AnimatePresence mode="wait">
          {phase === "checks" && (
            <motion.div
              key="checks"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={styles.bootBody}
            >
              {completedLines.map((l, i) => (
                <p key={i} style={{ ...styles.bootLine, color: "rgba(255,255,255,0.28)", fontFamily: "'VT323', monospace", fontSize: 15 }}>{l}</p>
              ))}
              {lineIndex < BOOT_CHECKS.length && (
                <p style={{ ...styles.bootLine, color: "rgba(255,255,255,0.9)", fontFamily: "'VT323', monospace", fontSize: 15 }}>
                  <span style={{ color: "#dc2626", marginRight: 6 }}>›</span>
                  <TypewriterLine
                    key={lineIndex}
                    text={BOOT_CHECKS[lineIndex]}
                    speed={12}
                    onDone={advance}
                  />
                </p>
              )}
            </motion.div>
          )}

          {phase === "granted" && (
            <motion.div
              key="granted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ ...styles.bootBody, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}
            >
              <p style={{ ...styles.bootLine, color: "#fff", fontSize: 22, fontFamily: "'VT323', monospace", letterSpacing: "0.22em", margin: 0, textAlign: "center" }}>
                ACCESS GRANTED
              </p>
              <p style={{ ...styles.bootLine, color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "'VT323', monospace", margin: 0, letterSpacing: "0.18em", textAlign: "center" }}>
                PURSUIT DIVISION · SECURE TERMINAL
              </p>
            </motion.div>
          )}
        </AnimatePresence>
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
  const [bgFilter, setBgFilter] = useState("none");
  const [glitch, setGlitch] = useState(false);

  const [firstAnswer, setFirstAnswer] = useState(null);
  const [canRetry, setCanRetry] = useState(false);
  const [coordLocked, setCoordLocked] = useState(false);
  const [coordCorrect, setCoordCorrect] = useState(false);
  const scanProgress = useChunkyProgress(scanning);
  const inputRef = useRef(null);

  useEffect(() => {
    const played = localStorage.getItem(LOCKOUT_KEY);
    if (played === getTodayString()) setLockedOut(true);
  }, []);

  // Autofocus input when boot completes
  useEffect(() => {
    if (!booting && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [booting]);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setScanning(true);
    setRadarFast(true);
    setScanStep(0);

    // Advance scan messages
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < scanMessages.length) setScanStep(step);
    }, 1050);

    setTimeout(() => {
      clearInterval(stepInterval);
      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.includes(normalized);
      localStorage.setItem(LOCKOUT_KEY, getTodayString());
      setRadarFast(false);
      setCoordLocked(true);
      setCoordCorrect(match);

      // DECRYPT phase
      setScanning(false);
      setDecrypting(true);

      // Glitch once after 300ms
      setTimeout(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120);
      }, 300);

      // Play chime and flash at 1100ms, reveal at 1800ms
      setTimeout(() => {
        if (match) {
          setFlashGreen(true);
          setTimeout(() => setFlashGreen(false), 1200);
        } else {
          setFlashRed(true);
          setTimeout(() => setFlashRed(false), 400);
        }
      }, 1100);

      setTimeout(() => {
        setDecrypting(false);
        setIsCorrect(match);
        setShowName(true);
        if (match) {
          setBgFilter("sepia(0.3) hue-rotate(80deg) saturate(1.4)");
          setTimeout(() => setBgFilter("none"), 2500);
        } else {
          if (!firstAnswer) {
            setFirstAnswer(answer);
            setCanRetry(true);
          }
        }
      }, 1800);

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

  const handleRetry = () => {
    localStorage.removeItem(LOCKOUT_KEY);
    setAnswer("");
    setIsCorrect(null);
    setShowName(false);
    setScanning(false);
    setDecrypting(false);
    setCanRetry(false);
    setScanStep(0);
    setFlashGreen(false);
    setFlashRed(false);
    setBgFilter("none");
    setCoordLocked(false);
    setCoordCorrect(false);
  };

  const keyframes = `
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
    @keyframes btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)} 50%{box-shadow:0 0 0 8px rgba(220,38,38,0)} }
    @keyframes greenFlash { 0%{opacity:0} 20%{opacity:0.55} 80%{opacity:0.55} 100%{opacity:0} }
    @keyframes redFlash { 0%,80%{opacity:1} 100%{opacity:1} }
    @keyframes stampIn { 0%{opacity:0;transform:rotate(-4deg) scale(1.4)} 60%{opacity:1;transform:rotate(-2deg) scale(0.95)} 100%{opacity:1;transform:rotate(-2deg) scale(1)} }
    @keyframes unredact { 0%{width:100%} 100%{width:0%} }
    @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.97} 94%{opacity:1} 97%{opacity:0.98} 98%{opacity:1} }
    @keyframes scanlines { 0%{background-position:0 0} 100%{background-position:0 4px} }
    @keyframes glitchShift { 0%{transform:translate(0)} 20%{transform:translate(-3px,1px)} 40%{transform:translate(3px,-1px)} 60%{transform:translate(-2px,0)} 80%{transform:translate(2px,1px)} 100%{transform:translate(0)} }
    @keyframes barFlash { 0%,100%{background:linear-gradient(90deg,#991b1b,#dc2626)} 50%{background:#fff} }
    @keyframes bgFilterFade { 0%{opacity:0} 15%{opacity:1} 75%{opacity:1} 100%{opacity:0} }
    @keyframes stampBleed { 0%{filter:url(#stampFilter) opacity(0) blur(1px)} 100%{filter:url(#stampFilter) opacity(0.85) blur(0px)} }
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
              <span style={styles.folderTabText}>PURSUIT DIVISION</span>
              <span style={styles.folderTabCase}>REF-{caseNumber}</span>
            </div>
            <div style={styles.folderBody}>
              <div style={styles.paperLines}></div>
              <div style={styles.paperGrain}></div>
              <div style={styles.paperYellow}></div>
              <div style={styles.folderColumns}>

                {/* LEFT — case metadata */}
                <div style={{ ...styles.folderLeft, boxShadow: "4px 0 12px rgba(0,0,0,0.06)" }}>
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
                    {firstAnswer && (
                      <div style={styles.folderField}>
                        <span style={styles.folderFieldLabel}>PRIOR ATTEMPT</span>
                        <span style={{ ...styles.folderFieldValue, color: "#dc2626", textDecoration: "line-through", opacity: 0.7 }}>{firstAnswer.toUpperCase()}</span>
                      </div>
                    )}
                    <div style={styles.folderField}>
                      <span style={styles.folderFieldLabel}>OUTCOME</span>
                      {isCorrect ? (
                        <div>
                          <span style={styles.folderFieldValue}>New Orleans, LA (MSY)</span>
                          <div style={{ marginTop: 6, display: "inline-block", border: "2px solid #15803d", padding: "2px 8px", transform: "rotate(-2deg)", transformOrigin: "left center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#15803d", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap" }}>TARGET LOCKED</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span style={{ ...styles.folderFieldValue, color: "#dc2626" }}>{answer.toUpperCase()}</span>
                          <div style={{ marginTop: 6, display: "inline-block", border: "2px solid #dc2626", padding: "2px 8px", transform: "rotate(-2deg)", transformOrigin: "left center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#dc2626", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap" }}>SUSPECT EVADED</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Spine */}
                <div style={styles.folderSpine}></div>

                {/* RIGHT — stamp */}
                <div style={{ ...styles.folderRight, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "10px 0" }}>
                  <motion.div
                    initial={{ scale: 1.8, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: isCorrect ? -4 : -4 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 14 }}
                    onAnimationComplete={() => playStamp()}
                    style={{ border: `4px solid ${isCorrect ? "#15803d" : "#dc2626"}`, padding: "10px 20px", opacity: 0.88 }}
                  >
                    <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.2em", color: isCorrect ? "#15803d" : "#dc2626", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap" }}>
                      {isCorrect ? "CASE CLOSED" : "CASE OPEN"}
                    </span>
                  </motion.div>
                  <div style={{ height: 1, width: "80%", background: "rgba(146,64,14,0.15)" }}></div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "#a16207", marginBottom: 4 }}>CASE REFERENCE</span>
                    <span style={{ fontSize: 11, color: "#1c0a00", fontFamily: "'Courier New', Courier, monospace" }}>{caseNumber}</span>
                  </div>
                </div>

              </div>
              <div style={styles.folderFooter}>
                <span style={styles.folderFooterText}>Sun Country Airlines · Eyes Only · Destroy After Reading</span>
                <span style={{ ...styles.folderFooterText, color: "rgba(161,98,7,0.35)" }}>·</span>
                <span style={styles.folderFooterText}>REF-{caseNumber}</span>
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
              <span style={styles.folderTabText}>PURSUIT DIVISION</span>
              <span style={styles.folderTabCase}>DAILY BRIEFING</span>
            </div>
            <div style={styles.folderBody}>
              <div style={styles.paperLines}></div>
              <div style={styles.paperGrain}></div>
              <div style={styles.paperYellow}></div>
              <div style={styles.folderColumns}>

                {/* LEFT — status info */}
                <div style={{ ...styles.folderLeft, boxShadow: "4px 0 12px rgba(0,0,0,0.06)" }}>
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
                </div>

                {/* Spine */}
                <div style={styles.folderSpine}></div>

                {/* RIGHT — stamp + new mission */}
                <div style={{ ...styles.folderRight, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "10px 0" }}>
                  <motion.div
                    initial={{ scale: 1.8, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: -4 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 14 }}
                    onAnimationComplete={() => playStamp()}
                    style={{ border: "4px solid #dc2626", padding: "10px 20px", opacity: 0.88 }}
                  >
                    <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.2em", color: "#dc2626", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap" }}>
                      CASE CLOSED
                    </span>
                  </motion.div>
                  <button
                    onClick={() => { localStorage.removeItem(LOCKOUT_KEY); window.location.reload(); }}
                    style={styles.newMissionBtn}
                  >
                    Assign Me A New Mission
                  </button>
                </div>

              </div>
              <div style={styles.folderFooter}>
                <span style={styles.folderFooterText}>Sun Country Airlines · Pursuit Division · {new Date().getFullYear()}</span>
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
      <StampFilter />
      {/* Background image layer with reactive filter */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        filter: bgFilter !== "none" ? bgFilter : "sepia(0.05)",
        transition: "filter 0.4s ease",
        overflow: "hidden",
      }}>
        <img
          src={bgImage}
          alt=""
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: "100%",
            minHeight: "100%",
            width: "auto",
            height: "auto",
            display: "block",
          }}
        />
      </div>
      <div style={styles.crtOverlay}></div>
      <RadarBackground fast={radarFast} />

      <AnimatePresence>
        {booting && <BootSequence onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      {flashGreen && <div style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", background: "rgba(34,197,94,0.35)", animation: "greenFlash 1.2s ease-in-out forwards" }}></div>}
      {flashRed && <div style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", background: "rgba(160,0,0,0.65)" }}></div>}

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
            <span style={styles.orgLabel}>PURSUIT DIVISION</span>
          </div>
          <div style={styles.caseTag}>CASE {caseNumber}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.paperLines}></div>
          {/* Paper grain texture */}
          <div style={styles.paperGrain}></div>
          {/* Top yellowing — old document ages from top */}
          <div style={styles.paperYellow}></div>
          {/* Red margin line down left column */}
          <div style={styles.paperMargin}></div>

          {/* Top strip */}
          <div style={styles.cardTopStrip}>
            <div style={styles.classifiedBadge}>CLASSIFIED</div>
            <div style={styles.topRight}>
              <span style={styles.dateStamp}>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
              <span style={styles.priorityTag}>PRIORITY: URGENT</span>
            </div>
          </div>

          {/* Open folder — two pages side by side */}
          <div style={styles.folderColumns}>

            {/* LEFT PAGE — suspect + sightings */}
            <div style={styles.folderLeft}>

              <div style={styles.suspectHeader}>
                {/* Profile row — photo box + name/alias */}
                <div style={styles.suspectProfileRow}>
                  <div style={styles.suspectNameBlock}>
                    <p style={styles.suspectName}>Carmen Sandiego</p>
                    <p style={styles.suspectAlias}>"The Red Shadow"</p>
                    <div style={styles.suspectBadges}>
                      <span style={styles.suspectBadgeDanger}>AT LARGE</span>
                      <span style={styles.suspectBadgeWarn}>THREAT: HIGH</span>
                    </div>
                  </div>
                </div>

                {/* Field grid */}
                <div style={styles.suspectGrid}>
                  <div style={styles.suspectGridItem}>
                    <span style={styles.fieldLabel}>NATIONALITY</span>
                    <span style={styles.fieldValue}>Unknown</span>
                  </div>
                  <div style={styles.suspectGridItem}>
                    <span style={styles.fieldLabel}>HAIR</span>
                    <span style={styles.fieldValue}>Dark Brown</span>
                  </div>
                  <div style={styles.suspectGridItem}>
                    <span style={styles.fieldLabel}>DISTINGUISHING</span>
                    <span style={styles.fieldValue}>Red wide-brim hat</span>
                  </div>
                  <div style={styles.suspectGridItem}>
                    <span style={styles.fieldLabel}>KNOWN FOR</span>
                    <span style={styles.fieldValue}>Forgery · Theft</span>
                  </div>
                  <div style={{ ...styles.suspectGridItem, gridColumn: "1 / -1", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 4, padding: "8px 10px", marginTop: 4 }}>
                    <div style={{ display: "flex", gap: 20 }}>
                      <div>
                        <span style={{ ...styles.fieldLabel, color: "#dc2626", fontSize: 13 }}>ARMED</span>
                        <span style={{ display: "block", color: "#b91c1c", fontSize: 18, fontFamily: "'Special Elite', cursive", lineHeight: 1.2 }}>UNKNOWN</span>
                      </div>
                      <div>
                        <span style={{ ...styles.fieldLabel, color: "#dc2626", fontSize: 13 }}>APPROACH</span>
                        <span style={{ display: "block", color: "#b91c1c", fontSize: 18, fontFamily: "'Special Elite', cursive", lineHeight: 1.2 }}>WITH CAUTION</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.sectionDivider}>
                <div style={{ ...styles.sectionRule, flex: "0 0 12px" }}></div>
                <span style={styles.sectionLabel}>PRIOR SIGHTINGS</span>
                <span style={{ color: "rgba(146,64,14,0.3)", fontSize: 10, margin: "0 2px" }}>›</span>
                <div style={styles.sectionRule}></div>
              </div>

              <div style={styles.sightingsTable}>
                <div style={styles.sightingsHeader}>
                  <span style={{ ...styles.sightingsCell, flex: 1 }}>LOCATION</span>
                  <span style={{ ...styles.sightingsCell, flex: "0 0 38px", textAlign: "center" }}>CODE</span>
                  <span style={{ ...styles.sightingsCell, flex: "0 0 58px", textAlign: "right" }}>STATUS</span>
                </div>
                {PRIOR_SIGHTINGS.map((s, i) => (
                  <div key={i} style={{ ...styles.sightingsRow, borderBottom: i < PRIOR_SIGHTINGS.length - 1 ? "1px solid rgba(146,64,14,0.1)" : "none", opacity: s.status === "ESCAPED" ? 0.75 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ ...styles.sightingsValue, display: "block", position: "relative" }}>
                        {s.city}
                        {s.status === "ESCAPED" && (
                          <span style={{
                            position: "absolute",
                            left: "-2px",
                            right: "-2px",
                            top: "50%",
                            transform: "translateY(-52%) rotate(-1.2deg)",
                            height: "5px",
                            background: "rgba(185,28,28,0.72)",
                            borderRadius: "2px",
                            filter: "blur(0.6px)",
                            pointerEvents: "none",
                            display: "block",
                          }}></span>
                        )}
                      </span>
                      <span style={{ ...styles.sightingsDate, display: "block" }}>{s.date}</span>
                    </div>
                    <span style={{ ...styles.sightingsCode, flex: "0 0 38px", textAlign: "center" }}>{s.code}</span>
                    <span style={{
                      ...styles.sightingsStatus,
                      flex: "0 0 58px",
                      textAlign: "right",
                      color: s.status === "ACTIVE" ? "#dc2626" : "#92400e",
                    }}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder spine */}
            <div style={styles.folderSpine}></div>

            {/* RIGHT PAGE — intel + input */}
            <div style={styles.folderRight}>

              <div style={styles.sectionDivider}>
                <div style={{ ...styles.sectionRule, flex: "0 0 12px" }}></div>
                <span style={styles.sectionLabel}>LAST KNOWN INTELLIGENCE</span>
                <span style={{ color: "rgba(146,64,14,0.3)", fontSize: 10, margin: "0 2px" }}>›</span>
                <div style={styles.sectionRule}></div>
              </div>

              <div style={styles.clueBox}>
                <span style={styles.clueTitle}>INTEL REPORT</span>
                <p style={styles.clueText}>{prompt}</p>
                <div style={styles.directiveLine}></div>
                <p style={styles.clueQuestion}>Where in the Sun Country World is Carmen Sandiego?</p>
              </div>

              <AnimatePresence mode="wait">
                {!scanning && !decrypting && !showName && (
                  <motion.div key="input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={styles.inputSection}>
                    <label style={styles.inputLabel}>Input Suspect's Location</label>
                    <div style={styles.inputRow}>
                      <input
                        ref={inputRef}
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
                    {/* Terminal title bar */}
                    <div style={styles.scanTitleBar}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", display: "inline-block" }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#facc15", display: "inline-block" }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                      <span style={{ fontSize: 11, color: "rgba(0,180,60,0.5)", letterSpacing: "0.1em", marginLeft: 6, fontFamily: "'VT323', monospace" }}>SC-PURSUIT-TERMINAL — ACTIVE TRACE</span>
                    </div>
                    <div style={styles.scanBody}>
                      <div style={styles.scanHeader}>
                        <span style={{ ...styles.scanDot, animation: "pulse 1.2s ease-in-out infinite" }}></span>
                        <span style={styles.scanTitle}>SCANNING...</span>
                        <div style={{ marginLeft: "auto" }}><SignalBars /></div>
                      </div>
                      <ScanMessage text={scanMessages[scanStep]} step={scanStep} />
                      <CoordTracker locked={coordLocked} isCorrect={coordCorrect} />
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${scanProgress}%`, transition: "width 0.15s ease-out" }}></div>
                      </div>
                      <p style={styles.scanProgress}>{scanProgress}%</p>
                    </div>
                  </motion.div>
                )}

                {decrypting && (
                  <motion.div key="decrypting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.scanSection}>
                    <div style={styles.scanTitleBar}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", display: "inline-block" }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#facc15", display: "inline-block" }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                      <span style={{ fontSize: 11, color: "rgba(250,204,21,0.5)", letterSpacing: "0.1em", marginLeft: 6, fontFamily: "'VT323', monospace" }}>SC-PURSUIT-TERMINAL — DECRYPTING</span>
                    </div>
                    <div style={styles.scanBody}>
                      <div style={styles.scanHeader}>
                        <span style={{ ...styles.scanDot, background: "#facc15", boxShadow: "0 0 6px #facc15", animation: "pulse 0.5s ease-in-out infinite" }}></span>
                        <span style={{ ...styles.scanTitle, color: "#facc15", animation: "decryptPulse 0.5s ease-in-out infinite" }}>DECRYPTING...</span>
                      </div>
                      <p style={{ ...styles.scanMessage, color: "#fef08a", marginBottom: 10 }}>ANALYZING RESULTS...</p>
                      <div style={{ ...styles.progressBar, marginTop: 0 }}>
                        <div style={{ ...styles.progressFill, width: "100%", animation: "barFlash 0.3s steps(2) infinite" }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showName && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={styles.resultSection}>
                    <div style={{ ...styles.resultBanner, borderColor: isCorrect ? "#16a34a" : "#dc2626", background: isCorrect ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)" }}>
                      <div style={styles.resultTagRow}>
                        <motion.span
                          initial={{ scale: 1.8, opacity: 0, rotate: -6 }}
                          animate={{ scale: 1, opacity: 1, rotate: -1 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 16 }}
                          onAnimationComplete={() => playStamp()}
                          style={{ ...styles.resultTag, background: isCorrect ? "#16a34a" : "#dc2626", display: "inline-block", transformOrigin: "left center" }}
                        >
                          {isCorrect ? "TARGET LOCKED" : "SUSPECT EVADED"}
                        </motion.span>
                      </div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <VerdictLine
                          text={isCorrect ? "Excellent work, Gumshoe. Case closed." : "Carmen slipped away. Better luck next time, Agent."}
                          color={isCorrect ? "#166534" : "#991b1b"}
                        />
                        {isCorrect && <p style={styles.resultSub}>Suspect located in New Orleans, LA (MSY)</p>}
                      </motion.div>
                    </div>
                    {!isCorrect && canRetry && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={styles.retryBox}>
                        <div style={styles.retryLeft}>
                          <span style={styles.retryLabel}>REASSIGNMENT AVAILABLE</span>
                          <p style={styles.retryText}>One retry permitted. First attempt remains on record.</p>
                        </div>
                        <button
                          onClick={handleRetry}
                          onMouseEnter={(e) => { e.target.style.background = "rgba(127,29,29,0.1)"; e.target.style.color = "#991b1b"; }}
                          onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#7f1d1d"; }}
                          style={styles.retryBtn}
                        >
                          Request Reassignment
                        </button>
                      </motion.div>
                    )}
                    <div style={styles.agentSection}>
                      <label style={styles.inputLabel}>Agent Full Name</label>
                      <div style={styles.inputRow}>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && name.trim() && !submitting && handleFinalSubmit()}
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
                          {submitting ? "Filing..." : "File Report →"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer — full width */}
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
  const dur = fast ? 4 : 9;
  return (
    <div style={styles.radarContainer}>
      {/* Static rings */}
      <svg style={styles.radarSvg} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <circle cx="400" cy="400" r="380" fill="none" stroke="rgba(220,38,38,0.3)"  strokeWidth="1" />
        <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(220,38,38,0.25)" strokeWidth="1" />
        <circle cx="400" cy="400" r="180" fill="none" stroke="rgba(220,38,38,0.2)"  strokeWidth="1" />
        <circle cx="400" cy="400" r="90"  fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="1" />
        <line x1="400" y1="20"  x2="400" y2="780" stroke="rgba(220,38,38,0.1)" strokeWidth="0.5" />
        <line x1="20"  y1="400" x2="780" y2="400" stroke="rgba(220,38,38,0.1)" strokeWidth="0.5" />
      </svg>

      {/* Conic sweep — angular gradient that decays like real phosphor */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: dur, ease: "linear" }}
        style={{
          position: "absolute",
          width: "min(120vw, 120vh)",
          height: "min(120vw, 120vh)",
          borderRadius: "50%",
          background: [
            "conic-gradient(",
            "  from 0deg,",
            "  transparent         0deg,",
            "  rgba(0,255,80,0.00) 326deg,",
            "  rgba(0,255,80,0.03) 336deg,",
            "  rgba(0,255,80,0.08) 344deg,",
            "  rgba(0,255,80,0.18) 351deg,",
            "  rgba(0,255,80,0.32) 356deg,",
            "  rgba(0,255,80,0.50) 360deg",
            ")",
          ].join(""),
        }}
      ></motion.div>

      {/* Hard leading edge line on top of the conic sweep */}
      <motion.div
        style={{ ...styles.sweepWrap }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: dur, ease: "linear" }}
      >
        <svg style={styles.radarSvg} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <line x1="400" y1="400" x2="400" y2="20" stroke="rgba(0,255,80,0.85)" strokeWidth="1.5" />
        </svg>
      </motion.div>

      <div style={styles.darkOverlay}></div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: { minHeight: "100vh", background: "#050505", display: "flex", alignItems: "flex-start", justifyContent: "center", fontFamily: "'Courier New', Courier, monospace", padding: "16px", position: "relative", overflow: "hidden" },

  crtOverlay: {
    position: "fixed", inset: 0, zIndex: 99, pointerEvents: "none",
    backgroundImage: [
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
      "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)",
    ].join(","),
    backgroundSize: "100% 4px, 100% 100%",
  },

  bootOverlay: { position: "fixed", inset: 0, zIndex: 50, background: "#0a0402", display: "flex", alignItems: "center", justifyContent: "center" },
  bootBox: { width: "100%", maxWidth: 480, border: "1px solid rgba(185,28,28,0.4)", borderRadius: 3, overflow: "hidden", boxShadow: "0 0 60px rgba(185,28,28,0.08)" },
  bootHeader: { background: "#b91c1c", padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  bootHeaderDot: { width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "inline-block" },
  bootHeaderTitle: { fontSize: 10, color: "rgba(255,255,255,0.9)", letterSpacing: "0.14em", fontWeight: 700 },
  bootBody: { background: "#0d0604", padding: "14px 18px", borderTop: "1px solid rgba(185,28,28,0.2)" },
  bootLine: { fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.04em", margin: "0 0 5px", lineHeight: 1.4 },

  radarContainer: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 1 },
  radarSvg: { position: "absolute", width: "min(120vw, 120vh)", height: "min(120vw, 120vh)" },
  sweepWrap: { position: "absolute", width: "min(120vw, 120vh)", height: "min(120vw, 120vh)", display: "flex", alignItems: "center", justifyContent: "center" },
  darkOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" },

  centeredFill: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", position: "relative", zIndex: 10 },
  outer: { width: "100%", maxWidth: 1100, position: "relative", zIndex: 10 },

  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 20px", background: "#b91c1c", borderRadius: "6px 6px 0 0", borderBottom: "3px solid #7f1d1d" },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  orgLabel: { color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em" },
  divider: { color: "rgba(255,255,255,0.35)", fontSize: 10 },
  caseTag: { color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.15)" },

  card: { background: "linear-gradient(160deg, #fdf4e0 0%, #f8ebca 40%, #f4e4b8 100%)", border: "2px solid #92400e", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "24px 28px 20px", boxShadow: "4px 8px 0 rgba(0,0,0,0.15), 0 24px 60px rgba(0,0,0,0.75), inset 0 0 40px rgba(120,60,0,0.08)", position: "relative", overflow: "hidden" },

  folderColumns: { display: "flex", gap: 0, alignItems: "stretch", marginBottom: 0 },
  folderLeft: { flex: "0 0 30%", paddingRight: 20, boxShadow: "4px 0 12px rgba(0,0,0,0.06)" },
  folderSpine: { flex: "0 0 1px", background: "rgba(146,64,14,0.2)", alignSelf: "stretch", margin: "0 20px" },
  folderRight: { flex: 1, minWidth: 0 },

  paperLines: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: ["repeating-linear-gradient(transparent, transparent 27px, rgba(139,90,43,0.09) 27px, rgba(139,90,43,0.09) 28px)", "radial-gradient(ellipse at 0% 0%, rgba(120,53,15,0.07) 0%, transparent 55%)", "radial-gradient(ellipse at 100% 0%, rgba(120,53,15,0.05) 0%, transparent 50%)", "radial-gradient(ellipse at 100% 100%, rgba(120,53,15,0.08) 0%, transparent 55%)", "radial-gradient(ellipse at 0% 100%, rgba(120,53,15,0.07) 0%, transparent 55%)"].join(","), backgroundSize: "100% 28px, 100% 100%, 100% 100%, 100% 100%, 100% 100%", backgroundPositionY: "8px, 0, 0, 0, 0" },

  paperGrain: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.045, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "180px 180px" },

  paperYellow: { position: "absolute", left: 0, right: 0, top: 0, height: "45%", pointerEvents: "none", zIndex: 0, background: "linear-gradient(to bottom, rgba(180,120,40,0.07) 0%, transparent 100%)" },

  paperMargin: { position: "absolute", top: 0, bottom: 0, left: "calc(30% + 27px)", width: "1px", background: "rgba(185,28,28,0.2)", pointerEvents: "none", zIndex: 1 },


  cardTopStrip: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, position: "relative", zIndex: 1 },
  classifiedBadge: { color: "#dc2626", fontSize: 14, fontWeight: 700, letterSpacing: "0.18em", padding: "4px 10px", border: "3px solid #dc2626", borderRadius: 3, display: "inline-block", opacity: 0.85, animation: "stampIn 0.5s ease-out forwards", transformOrigin: "center", filter: "url(#stampFilter)" },
  topRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 },
  dateStamp: { fontSize: 9, fontWeight: 700, color: "#78350f", letterSpacing: "0.1em" },
  priorityTag: { fontSize: 9, fontWeight: 700, color: "#dc2626", letterSpacing: "0.1em", border: "1px solid rgba(220,38,38,0.4)", padding: "2px 6px", borderRadius: 2, display: "inline-block", transform: "rotate(1.5deg)", transformOrigin: "center" },

  suspectHeader: { marginBottom: 16, padding: "14px", background: "rgba(0,0,0,0.04)", borderRadius: 6, border: "1px solid rgba(146,64,14,0.2)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)", position: "relative", zIndex: 1 },

  suspectProfileRow: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(146,64,14,0.15)" },
  suspectNameBlock: { flex: 1, minWidth: 0 },
  suspectName: { fontSize: 22, fontWeight: 700, color: "#1c0a00", margin: "0 0 2px", letterSpacing: "0.02em", fontFamily: "'Special Elite', 'Courier New', cursive" },
  suspectAlias: { fontSize: 12, color: "#78350f", fontStyle: "italic", margin: "0 0 8px", fontFamily: "'Source Serif 4', Georgia, serif", letterSpacing: "0.02em" },
  suspectBadges: { display: "flex", gap: 5, flexWrap: "wrap" },
  suspectBadgeDanger: { fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "#fff", background: "#dc2626", padding: "2px 7px", borderRadius: 2 },
  suspectBadgeWarn: { fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "#78350f", background: "rgba(146,64,14,0.12)", border: "1px solid rgba(146,64,14,0.25)", padding: "2px 7px", borderRadius: 2 },

  suspectGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" },
  suspectGridItem: { display: "flex", flexDirection: "column", gap: 2 },

  suspectFieldRow: { display: "flex", flexWrap: "wrap" },
  suspectField: { display: "flex", flexDirection: "column", gap: 3, flex: "1 1 120px", paddingRight: 20 },
  fieldLabel: { fontSize: 13, fontWeight: 400, letterSpacing: "0.14em", color: "#a16207", fontFamily: "'VT323', 'Courier New', monospace" },
  fieldValue: { fontSize: 13, fontWeight: 700, color: "#1c0a00", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.03em" },

  sectionDivider: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, position: "relative", zIndex: 1 },

  sightingsTable: { marginBottom: 0, position: "relative", zIndex: 1, border: "1px solid rgba(146,64,14,0.2)", borderRadius: 4, overflow: "hidden" },
  sightingsHeader: { display: "flex", padding: "5px 10px", background: "rgba(146,64,14,0.08)", borderBottom: "1px solid rgba(146,64,14,0.15)" },
  sightingsCell: { fontSize: 13, fontWeight: 400, letterSpacing: "0.12em", color: "#78350f", fontFamily: "'VT323', 'Courier New', monospace" },
  sightingsRow: { display: "flex", padding: "8px 10px", alignItems: "center" },
  sightingsDate: { fontSize: 11, color: "#78350f", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.02em", fontWeight: 600 },
  sightingsValue: { fontSize: 13, fontWeight: 700, color: "#1c0a00", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.02em" },
  sightingsCode: { fontSize: 12, fontWeight: 700, color: "#78350f", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.06em" },
  sightingsStatus: { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Courier New', Courier, monospace" },
  sectionRule: { flex: 1, height: 1, background: "rgba(146,64,14,0.3)" },
  sectionLabel: { fontSize: 13, fontWeight: 400, letterSpacing: "0.14em", color: "#78350f", whiteSpace: "nowrap", fontFamily: "'VT323', 'Courier New', monospace" },

  clueBox: {
    background: "#fff",
    border: "1px solid rgba(146,64,14,0.2)",
    borderLeft: "none",
    borderRadius: 2,
    padding: "14px 18px 14px 32px",
    marginBottom: 20,
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
    boxShadow: "1px 2px 8px rgba(0,0,0,0.08)",
    backgroundImage: [
      "repeating-linear-gradient(transparent, transparent 31px, rgba(100,140,220,0.35) 31px, rgba(100,140,220,0.35) 32px)",
      "linear-gradient(to right, rgba(220,38,38,0.5) 0px, rgba(220,38,38,0.5) 1px, transparent 1px)",
    ].join(","),
    backgroundSize: "100% 32px, 100% 100%",
    backgroundPositionY: "0px, 0",
    lineHeight: "32px",
  },
  clueTitle: { display: "inline-block", fontSize: 14, fontWeight: 400, letterSpacing: "0.16em", color: "#fff", background: "#b91c1c", padding: "2px 10px", borderRadius: 2, marginBottom: 8, fontFamily: "'VT323', monospace" },
  clueText: { fontSize: 15, lineHeight: "32px", color: "#1c0a00", margin: "0 0 0px", fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "normal", fontWeight: 400 },
  directiveLine: { height: 1, background: "rgba(220,38,38,0.3)", margin: "8px 0", borderTop: "1px dashed rgba(220,38,38,0.35)" },
  clueQuestion: { fontSize: 15, fontWeight: 700, color: "#b91c1c", margin: 0, letterSpacing: "0.02em", fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: "32px" },

  inputSection: { marginBottom: 8, paddingTop: 14, borderTop: "1px dashed rgba(146,64,14,0.15)", position: "relative", zIndex: 1 },
  inputLabel: { display: "block", fontSize: 14, fontWeight: 400, letterSpacing: "0.08em", color: "#78350f", marginBottom: 8, fontFamily: "'Special Elite', 'Courier New', cursive" },
  inputRow: { display: "flex", flexDirection: "column", gap: 8 },
  input: { width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 14, fontFamily: "'Courier New', Courier, monospace", border: "1.5px solid #92400e", borderRadius: 4, background: "rgba(255,255,255,0.8)", color: "#1c0a00", outline: "none", letterSpacing: "0.04em" },
  trackBtn: { width: "100%", padding: "10px 0", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap", textAlign: "center" },

  scanSection: {
    margin: "0 0 8px",
    border: "1px solid rgba(0,200,60,0.5)",
    borderRadius: 4,
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.4)",
    background: "#071a07",
    backgroundImage: [
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 4px)",
      "radial-gradient(ellipse at 50% 50%, rgba(0,60,0,0.4) 0%, rgba(0,0,0,0.5) 100%)",
    ].join(","),
  },
  scanTitleBar: {
    background: "rgba(0,180,60,0.12)",
    borderBottom: "1px solid rgba(0,180,60,0.2)",
    padding: "5px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  scanBody: { padding: "12px 16px" },
  scanHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  scanDot: { width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 5px #22c55e", flexShrink: 0 },
  scanTitle: { fontSize: 13, fontWeight: 400, letterSpacing: "0.16em", color: "#4ade80", fontFamily: "'VT323', monospace" },
  scanMessage: { fontSize: 15, color: "#86efac", fontFamily: "'VT323', monospace", margin: "0 0 6px", letterSpacing: "0.06em", minHeight: 20 },
  progressBar: { height: 8, background: "rgba(0,0,0,0.4)", borderRadius: 2, overflow: "hidden", marginBottom: 6, marginTop: 4, border: "1px solid rgba(0,180,60,0.2)" },
  progressFill: { height: "100%", borderRadius: 2, backgroundImage: "linear-gradient(90deg, #15803d, #22c55e), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)", backgroundBlendMode: "multiply" },
  scanProgress: { fontSize: 14, color: "#4ade80", margin: 0, textAlign: "right", letterSpacing: "0.08em", fontFamily: "'VT323', monospace" },

  resultSection: { marginBottom: 4, position: "relative", zIndex: 1 },
  resultBanner: { border: "1.5px solid", borderRadius: 4, padding: "14px 18px", marginBottom: 16 },
  resultTagRow: { marginBottom: 8 },
  resultTag: { display: "inline-block", color: "#fff", fontSize: 16, fontFamily: "'VT323', monospace", letterSpacing: "0.14em", padding: "2px 12px", borderRadius: 2 },
  resultTitle: { fontSize: 16, fontWeight: 400, margin: "0 0 4px", letterSpacing: "0.02em", fontFamily: "'Special Elite', cursive" },
  resultSub: { fontSize: 12, color: "#166534", margin: 0, letterSpacing: "0.06em", fontFamily: "'VT323', monospace", fontSize: 14 },

  agentSection: { marginTop: 4, position: "relative", zIndex: 1 },

  retryBox: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    background: "rgba(127,29,29,0.06)", border: "1px solid rgba(127,29,29,0.2)",
    borderLeft: "3px solid #7f1d1d", borderRadius: 4,
    padding: "12px 14px", marginBottom: 14, position: "relative", zIndex: 1,
  },
  retryLeft: { flex: 1 },
  retryLabel: {
    display: "block", fontSize: 14, fontWeight: 400, letterSpacing: "0.14em",
    color: "#7f1d1d", marginBottom: 4, fontFamily: "'VT323', monospace",
  },
  retryText: {
    fontSize: 11, color: "#78350f", margin: 0,
    fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.02em", lineHeight: 1.4,
  },
  retryBtn: {
    padding: "8px 14px", background: "transparent", color: "#7f1d1d",
    border: "1.5px solid #7f1d1d", borderRadius: 4, fontSize: 10,
    fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Courier New', Courier, monospace",
    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
  },
  submitBtn: { width: "100%", padding: "10px 0", background: "#7f1d1d", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace", whiteSpace: "nowrap", textAlign: "center" },

  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 12, borderTop: "1px solid rgba(146,64,14,0.2)", position: "relative", zIndex: 1 },
  footerText: { fontSize: 13, color: "#a16207", letterSpacing: "0.08em", fontFamily: "'VT323', monospace" },

  newMissionBtn: {
    marginTop: 20,
    width: "100%",
    padding: "10px 0",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.1em",
    fontFamily: "'Courier New', Courier, monospace",
    cursor: "pointer",
    animation: "btnPulse 1.8s ease-in-out infinite",
    position: "relative",
    zIndex: 1,
  },

  folderWrap: { width: "100%", maxWidth: 760, position: "relative", zIndex: 10 },
  folderTab: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#b91c1c", borderBottom: "3px solid #7f1d1d", borderRadius: "6px 6px 0 0", padding: "8px 18px", width: "38%" },
  folderTabText: { color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", fontFamily: "'Courier New', Courier, monospace" },
  folderTabCase: { color: "rgba(255,255,255,0.6)", fontSize: 9, letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace" },
  folderBody: { background: "linear-gradient(160deg, #fdf4e0 0%, #f8ebca 40%, #f4e4b8 100%)", border: "2px solid #92400e", borderTop: "2px solid #92400e", borderRadius: "0 8px 8px 8px", padding: "28px 32px 24px", position: "relative", overflow: "visible", boxShadow: "0 24px 60px rgba(0,0,0,0.75), inset 0 0 40px rgba(120,60,0,0.08)" },
  filedStamp: { position: "absolute", top: 20, right: 20, fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", border: "3px solid", padding: "5px 12px", borderRadius: 3, opacity: 0.88, fontFamily: "'Courier New', Courier, monospace", transformOrigin: "center", zIndex: 2 },
  folderTitle: { fontSize: 22, fontWeight: 700, color: "#1c0a00", margin: "0 0 2px", letterSpacing: "0.02em", position: "relative", zIndex: 1, fontFamily: "'Special Elite', 'Courier New', cursive" },
  folderSuspect: { fontSize: 12, color: "#78350f", margin: "0 0 16px", letterSpacing: "0.04em", fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", position: "relative", zIndex: 1 },
  folderDivider: { height: 1, background: "rgba(146,64,14,0.25)", marginBottom: 20, position: "relative", zIndex: 1 },
  folderFields: { display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1 },
  folderField: { display: "flex", flexDirection: "column", gap: 3, paddingBottom: 14, borderBottom: "1px solid rgba(146,64,14,0.12)" },
  folderFieldLabel: { fontSize: 13, fontWeight: 400, letterSpacing: "0.16em", color: "#a16207", fontFamily: "'VT323', 'Courier New', monospace" },
  folderFieldValue: { fontSize: 15, fontWeight: 400, color: "#1c0a00", fontFamily: "'Special Elite', cursive", letterSpacing: "0.02em" },
  folderFooter: { marginTop: 20, paddingTop: 12, borderTop: "1px solid rgba(146,64,14,0.15)", position: "relative", zIndex: 1 },
  folderFooterText: { fontSize: 9, color: "#a16207", letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace" },
};
