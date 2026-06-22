import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";

const generateCaseNumber = () =>
  "SC-" + Math.floor(1000 + Math.random() * 9000);

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

const prompt =
  "Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen in bulk, had a frozen drink in hand, and kept asking where they could find the warmest place Minnesotans escape to when winter hits hard. They disappeared into a crowd of flipflops, palm trees, and travelers wearing mouse ear...";

const LOCKOUT_KEY = "carmen_played_date";

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function CarmenGame() {
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseNumber] = useState(generateCaseNumber());
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);

  useEffect(() => {
    const played = localStorage.getItem(LOCKOUT_KEY);
    if (played === getTodayString()) setLockedOut(true);
  }, []);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setScanning(true);
    setScanStep(0);
    setScanProgress(0);

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < scanMessages.length) setScanStep(step);
    }, 1600);

    const progressInterval = setInterval(() => {
      setScanProgress((p) => Math.min(p + 1, 95));
    }, 115);

    setTimeout(() => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setScanProgress(100);
      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.includes(normalized);
      localStorage.setItem(LOCKOUT_KEY, getTodayString());
      setTimeout(() => {
        setIsCorrect(match);
        setShowName(true);
        setScanning(false);
      }, 400);
    }, 12000);
  };

  const handleFinalSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          answer,
          result: isCorrect ? "Correct" : "Incorrect",
          caseNumber,
        }),
      });
    } catch (err) {}
    setTimeout(() => setSubmitted(true), 800);
  };

  if (submitted) {
    return (
      <div style={styles.root}>
        <RadarBackground />
        <div style={styles.centeredFill}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={styles.successCard}
          >
            <div style={styles.successIcon}>✓</div>
            <p style={styles.successTitle}>Report Filed</p>
            <div style={styles.successMeta}>
              <span style={styles.metaLabel}>AGENT</span>
              <span style={styles.metaValue}>{name}</span>
            </div>
            <div style={styles.successMeta}>
              <span style={styles.metaLabel}>CASE</span>
              <span style={styles.metaValue}>{caseNumber}</span>
            </div>
            <div style={styles.successMeta}>
              <span style={styles.metaLabel}>STATUS</span>
              <span style={{ ...styles.metaValue, color: isCorrect ? "#4ade80" : "#f87171" }}>
                {isCorrect ? "Target Located" : "Pursuit Ongoing"}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (lockedOut && !submitted) {
    return (
      <div style={styles.root}>
        <RadarBackground />
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} } @keyframes btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)} 50%{box-shadow:0 0 0 8px rgba(220,38,38,0)} }`}</style>
        <div style={styles.centeredFill}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180 }}
            style={styles.lockoutCard}
          >
            <div style={styles.lockoutIcon}>
              <svg viewBox="0 0 40 48" width="40" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="20" width="32" height="24" rx="3" fill="#dc2626"/>
                <path d="M10 20V14a10 10 0 0 1 20 0v6" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                <circle cx="20" cy="32" r="3.5" fill="#fff"/>
                <rect x="18.5" y="32" width="3" height="6" rx="1.5" fill="#fff"/>
              </svg>
            </div>
            <p style={styles.lockoutTitle}>Case Closed for Today</p>
            <p style={styles.lockoutSub}>
              You have already filed your report for today. Check back tomorrow for a new case.
            </p>
            <div style={styles.lockoutDivider}></div>
            <p style={styles.lockoutFooter}>SUN COUNTRY AIRLINES · PURSUIT DIVISION</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} } @keyframes btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)} 50%{box-shadow:0 0 0 8px rgba(220,38,38,0)} }`}</style>
      <RadarBackground />

      <div style={styles.outer}>
        {/* Header bar */}
        <div style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <span style={styles.orgLabel}>SUN COUNTRY AIRLINES</span>
            <span style={styles.divider}>|</span>
            <span style={styles.orgLabel}>PURSUIT DIVISION</span>
          </div>
          <div style={styles.caseTag}>CASE #{caseNumber}</div>
        </div>

        <div style={styles.card}>
          {/* Top strip */}
          <div style={styles.cardTopStrip}>
            <div style={styles.classifiedBadge}>CLASSIFIED</div>
            <div style={styles.fileType}>PURSUIT DOSSIER</div>
          </div>

          {/* Suspect header */}
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

          {/* Section label */}
          <div style={styles.sectionDivider}>
            <span style={styles.sectionLabel}>LAST KNOWN INTELLIGENCE</span>
          </div>

          {/* Clue box */}
          <div style={styles.clueBox}>
            <div style={styles.clueHeader}>
              <span style={styles.clueIcon}>📡</span>
              <span style={styles.clueTitle}>Field Report</span>
            </div>
            <p style={styles.clueText}>{prompt}</p>
            <p style={styles.clueQuestion}>
              <strong>Where in the Sun Country world did they go?</strong>
            </p>
          </div>

          {/* Input / scan / result */}
          <AnimatePresence mode="wait">
            {!scanning && !showName && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={styles.inputSection}
              >
                <label style={styles.inputLabel}>Input Suspect's Location</label>
                <div style={styles.inputRow}>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && answer.trim() && handleSubmit()}
                    style={styles.input}
                    placeholder="City or airport code"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    style={{
                      ...styles.trackBtn,
                      opacity: answer.trim() ? 1 : 0.45,
                      cursor: answer.trim() ? "pointer" : "not-allowed",
                      animation: answer.trim() ? "btnPulse 1.8s ease-in-out infinite" : "none",
                    }}
                  >
                    Track Carmen
                  </button>
                </div>
              </motion.div>
            )}

            {scanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.scanSection}
              >
                <div style={styles.scanHeader}>
                  <span style={{ ...styles.scanDot, animation: "pulse 1.2s ease-in-out infinite" }}></span>
                  <span style={styles.scanTitle}>SCANNING...</span>
                </div>
                <p style={styles.scanMessage}>{scanMessages[scanStep]}</p>
                <div style={styles.progressBar}>
                  <motion.div
                    style={styles.progressFill}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: "linear" }}
                  ></motion.div>
                </div>
                <p style={styles.scanProgress}>{Math.round(scanProgress)}%</p>
              </motion.div>
            )}

            {showName && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.resultSection}
              >
                <div
                  style={{
                    ...styles.resultBanner,
                    borderColor: isCorrect ? "#16a34a" : "#dc2626",
                    background: isCorrect
                      ? "rgba(74,222,128,0.08)"
                      : "rgba(248,113,113,0.08)",
                  }}
                >
                  <div style={styles.resultTagRow}>
                    <span style={{
                      ...styles.resultTag,
                      background: isCorrect ? "#16a34a" : "#dc2626",
                    }}>
                      {isCorrect ? "TARGET LOCKED" : "SUSPECT EVADED"}
                    </span>
                  </div>
                  <p style={{ ...styles.resultTitle, color: isCorrect ? "#166534" : "#991b1b" }}>
                    {isCorrect
                      ? "Excellent work, Gumshoe. Case closed."
                      : "Carmen slipped away. Better luck next time, Agent."}
                  </p>
                  {isCorrect && (
                    <p style={styles.resultSub}>Suspect located in Orlando, FL (MCO)</p>
                  )}
                </div>
                <div style={styles.agentSection}>
                  <label style={styles.inputLabel}>Agent Full Name</label>
                  <div style={styles.inputRow}>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && name.trim() && handleFinalSubmit()}
                      style={styles.input}
                      placeholder="Enter your name to file report"
                    />
                    <button
                      onClick={handleFinalSubmit}
                      disabled={submitting || !name.trim()}
                      style={{
                        ...styles.submitBtn,
                        opacity: submitting || !name.trim() ? 0.5 : 1,
                        cursor: submitting || !name.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      {submitting ? "Filing..." : "File Report"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div style={styles.cardFooter}>
            <span style={styles.footerText}>
              Sun Country Airlines · Internal Training Exercise · {new Date().getFullYear()}
            </span>
            <span style={styles.footerText}>REF-{caseNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fingerprint ────────────────────────────────────────────────────────────
function Fingerprint() {
  const cx = 44, cy = 48;
  const rings = [
    { rx: 6,  ry: 7,  gaps: [] },
    { rx: 11, ry: 13, gaps: [{ start: 60, end: 100 }] },
    { rx: 16, ry: 19, gaps: [{ start: 200, end: 240 }] },
    { rx: 21, ry: 25, gaps: [{ start: 50,  end: 85  }] },
    { rx: 26, ry: 31, gaps: [{ start: 180, end: 225 }] },
    { rx: 31, ry: 37, gaps: [{ start: 55,  end: 95  }, { start: 270, end: 300 }] },
    { rx: 36, ry: 42, gaps: [{ start: 190, end: 230 }] },
  ];

  function arcPath(rx, ry, startDeg, endDeg) {
    const toRad = (d) => (d * Math.PI) / 180;
    const x1 = cx + rx * Math.cos(toRad(startDeg));
    const y1 = cy + ry * Math.sin(toRad(startDeg));
    const x2 = cx + rx * Math.cos(toRad(endDeg));
    const y2 = cy + ry * Math.sin(toRad(endDeg));
    const span = ((endDeg - startDeg) + 360) % 360;
    const large = span > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${rx} ${ry} 0 ${large} 1 ${x2} ${y2}`;
  }

  function ringPaths(rx, ry, gaps) {
    if (gaps.length === 0) {
      return [arcPath(rx, ry, 0, 359.9)];
    }
    const sorted = [...gaps].sort((a, b) => a.start - b.start);
    const paths = [];
    let cursor = sorted[sorted.length - 1].end;
    for (const g of sorted) {
      paths.push(arcPath(rx, ry, cursor, g.start));
      cursor = g.end;
    }
    return paths;
  }

  return (
    <svg
      viewBox="0 0 88 100"
      width="72"
      height="82"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {rings.map((r, i) =>
        ringPaths(r.rx, r.ry, r.gaps).map((d, j) => (
          <path
            key={`${i}-${j}`}
            d={d}
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ))
      )}
      {/* bottom arch lines suggesting fingertip */}
      <path d="M 10 85 Q 44 100 78 85" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M 16 91 Q 44 104 72 91" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" opacity="0.35"/>
    </svg>
  );
}

// ── Radar background — SVG-based so it always shows ───────────────────────
function RadarBackground() {
  return (
    <div style={styles.radarContainer}>
      {/* Static rings */}
      <svg
        style={styles.radarSvg}
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="400" cy="400" r="380" fill="none" stroke="rgba(220,38,38,0.7)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(220,38,38,0.6)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="180" fill="none" stroke="rgba(220,38,38,0.5)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="90"  fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1.5" />
        {/* Cross-hairs */}
        <line x1="400" y1="20"  x2="400" y2="780" stroke="rgba(220,38,38,0.3)" strokeWidth="0.75" />
        <line x1="20"  y1="400" x2="780" y2="400" stroke="rgba(220,38,38,0.3)" strokeWidth="0.75" />
      </svg>

      {/* Rotating sweep — separate element so rings stay static */}
      <motion.div
        style={styles.sweepWrap}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      >
        <svg
          style={styles.radarSvg}
          viewBox="0 0 800 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="sweepFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,220,80,0)" />
              <stop offset="100%" stopColor="rgba(0,220,80,0.55)" />
            </radialGradient>
          </defs>
          {/* Conic sweep approximated with a wide wedge path */}
          <path
            d="M400,400 L400,20 A380,380 0 0,1 752,540 Z"
            fill="url(#sweepFade)"
            opacity="1"
          />
          {/* Leading edge glow line */}
          <line
            x1="400" y1="400"
            x2="400" y2="20"
            stroke="rgba(0,255,80,0.9)"
            strokeWidth="2"
          />
        </svg>
      </motion.div>

      {/* Dark overlay so bg image doesn't wash out the card */}
      <div style={styles.darkOverlay}></div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#050505",
    backgroundImage: "url('https://i.wpfc.ml/h7/uxapf2.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Courier New', Courier, monospace",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
  },

  // Radar
  radarContainer: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  radarSvg: {
    position: "absolute",
    width: "min(120vw, 120vh)",
    height: "min(120vw, 120vh)",
  },
  sweepWrap: {
    position: "absolute",
    width: "min(120vw, 120vh)",
    height: "min(120vw, 120vh)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  darkOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
  },

  centeredFill: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    zIndex: 10,
  },

  // Main layout
  outer: {
    width: "100%",
    maxWidth: 680,
    position: "relative",
    zIndex: 10,
  },

  // Header bar
  headerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    background: "rgba(220,38,38,0.92)",
    borderRadius: "6px 6px 0 0",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  orgLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
  },
  divider: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
  },
  caseTag: {
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    background: "rgba(0,0,0,0.25)",
    padding: "3px 10px",
    borderRadius: 3,
  },

  // Card
  card: {
    background: "linear-gradient(160deg,#fefce8 0%,#fef3c7 50%,#fde68a 100%)",
    border: "2px solid #92400e",
    borderTop: "none",
    borderRadius: "0 0 12px 12px",
    padding: "28px 32px 24px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.75)",
  },
  cardTopStrip: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  classifiedBadge: {
    background: "#dc2626",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.15em",
    padding: "4px 12px",
    borderRadius: 3,
    transform: "rotate(-1deg)",
    display: "inline-block",
  },
  fileType: {
    fontSize: 10,
    fontWeight: 700,
    color: "#78350f",
    letterSpacing: "0.12em",
    border: "1px solid #92400e",
    padding: "4px 10px",
    borderRadius: 3,
  },

  // Suspect block
  suspectHeader: {
    marginBottom: 20,
    padding: "16px 18px",
    background: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    border: "1px solid rgba(146,64,14,0.25)",
  },
  suspectName: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1c0a00",
    margin: "0 0 14px",
    letterSpacing: "0.02em",
    borderBottom: "1px solid rgba(146,64,14,0.2)",
    paddingBottom: 12,
  },
  suspectFieldRow: {
    display: "flex",
    gap: 0,
    flexWrap: "wrap",
  },
  suspectField: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: "1 1 120px",
    paddingRight: 20,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.14em",
    color: "#a16207",
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1c0a00",
    fontFamily: "'Courier New', Courier, monospace",
    letterSpacing: "0.03em",
  },

  // Section divider
  sectionDivider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.14em",
    color: "#78350f",
  },

  // Clue
  clueBox: {
    background: "#fffbeb",
    border: "1px solid #92400e",
    borderLeft: "4px solid #dc2626",
    borderRadius: 6,
    padding: "16px 18px",
    marginBottom: 20,
  },
  clueHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  clueIcon: { fontSize: 16 },
  clueTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#78350f",
  },
  clueText: {
    fontSize: 15,
    lineHeight: 1.65,
    color: "#1c0a00",
    margin: "0 0 10px",
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
  },
  clueQuestion: {
    fontSize: 14,
    color: "#1c0a00",
    margin: 0,
    fontFamily: "Georgia, serif",
  },

  // Input
  inputSection: { marginBottom: 8 },
  inputLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#78350f",
    marginBottom: 8,
  },
  inputRow: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "'Courier New', Courier, monospace",
    border: "1.5px solid #92400e",
    borderRadius: 4,
    background: "#fffbeb",
    color: "#1c0a00",
    outline: "none",
    letterSpacing: "0.04em",
  },
  trackBtn: {
    padding: "10px 20px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    fontFamily: "'Courier New', Courier, monospace",
    whiteSpace: "nowrap",
  },

  // Scan
  scanSection: { padding: "20px 0" },
  scanHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  scanDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    boxShadow: "0 0 6px #22c55e",
  },
  scanTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.16em",
    color: "#166534",
  },
  scanMessage: {
    fontSize: 13,
    color: "#166534",
    fontFamily: "'Courier New', Courier, monospace",
    margin: "0 0 14px",
    letterSpacing: "0.04em",
  },
  progressBar: {
    height: 6,
    background: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#16a34a,#22c55e)",
    borderRadius: 3,
  },
  scanProgress: {
    fontSize: 11,
    color: "#166534",
    margin: 0,
    textAlign: "right",
    letterSpacing: "0.08em",
  },

  // Result
  resultSection: { marginBottom: 4 },
  resultBanner: {
    border: "1.5px solid",
    borderRadius: 6,
    padding: "14px 18px",
    marginBottom: 16,
  },
  resultTagRow: {
    marginBottom: 8,
  },
  resultTag: {
    display: "inline-block",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.14em",
    padding: "3px 10px",
    borderRadius: 2,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: "0 0 4px",
    letterSpacing: "0.02em",
    fontFamily: "'Courier New', Courier, monospace",
  },
  resultSub: {
    fontSize: 12,
    color: "#166534",
    margin: 0,
    letterSpacing: "0.06em",
  },

  // Lockout
  lockoutCard: {
    background: "#0f172a",
    border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: 12,
    padding: "40px 48px",
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
    maxWidth: 400,
  },
  lockoutIcon: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
  },
  lockoutTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: "0 0 12px",
    fontFamily: "'Courier New', Courier, monospace",
  },
  lockoutSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    margin: "0 0 24px",
    lineHeight: 1.6,
    fontFamily: "'Courier New', Courier, monospace",
    letterSpacing: "0.02em",
  },
  lockoutDivider: {
    height: 1,
    background: "rgba(220,38,38,0.2)",
    marginBottom: 16,
  },
  lockoutFooter: {
    fontSize: 9,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.12em",
    margin: 0,
    fontFamily: "'Courier New', Courier, monospace",
  },
  agentSection: { marginTop: 4 },
  submitBtn: {
    padding: "10px 20px",
    background: "#166534",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    fontFamily: "'Courier New', Courier, monospace",
    whiteSpace: "nowrap",
  },

  // Footer
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 12,
    borderTop: "1px solid rgba(146,64,14,0.2)",
  },
  footerText: {
    fontSize: 9,
    color: "#a16207",
    letterSpacing: "0.08em",
  },

  // Success screen
  successCard: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "40px 48px",
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
    minWidth: 320,
  },
  successIcon: {
    fontSize: 40,
    color: "#4ade80",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "0.1em",
    margin: "0 0 24px",
  },
  successMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 32,
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  metaLabel: {
    fontSize: 10,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.4)",
  },
  metaValue: {
    fontSize: 13,
    color: "#fff",
  },
};
