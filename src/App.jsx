import { useState, useEffect, useRef } from "react";
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
  "Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen in bulk, had a frozen drink in hand, and kept asking where they could find the warmest place Minnesotans escape to when winter hits hard. They disappeared into a crowd of flipflops, palm trees, and travelers wearing mouse ears...";

const LOCKOUT_KEY = "carmen_played_date";

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 38) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
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

// ── Typewriter scan message component ───────────────────────────────────────
function TypewriterMessage({ text }) {
  const { displayed } = useTypewriter(text, 35);
  return <span>{displayed}<span style={{ opacity: 0.5 }}>▌</span></span>;
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
  const [flashGreen, setFlashGreen] = useState(false);
  const [radarFast, setRadarFast] = useState(false);

  useEffect(() => {
    const played = localStorage.getItem(LOCKOUT_KEY);
    if (played === getTodayString()) setLockedOut(true);
  }, []);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setScanning(true);
    setRadarFast(true);
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
      setRadarFast(false);

      if (match) {
        setFlashGreen(true);
        setTimeout(() => setFlashGreen(false), 1200);
      }

      setTimeout(() => {
        setIsCorrect(match);
        setShowName(true);
        setScanning(false);
      }, match ? 1400 : 400);
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

  const keyframes = `
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
    @keyframes btnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)} 50%{box-shadow:0 0 0 8px rgba(220,38,38,0)} }
    @keyframes greenFlash { 0%{opacity:0} 20%{opacity:0.55} 80%{opacity:0.55} 100%{opacity:0} }
    @keyframes stampIn { 0%{opacity:0;transform:rotate(-4deg) scale(1.4)} 60%{opacity:1;transform:rotate(-2deg) scale(0.95)} 100%{opacity:1;transform:rotate(-2deg) scale(1)} }
  `;

  if (submitted) {
    return (
      <div style={styles.root}>
        <style>{keyframes}</style>
        <RadarBackground fast={false} />
        <div style={styles.centeredFill}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            style={styles.folderWrap}
          >
            {/* Folder tab */}
            <div style={styles.folderTab}>
              <span style={styles.folderTabText}>SC PURSUIT DIVISION</span>
              <span style={styles.folderTabCase}>REF-{caseNumber}</span>
            </div>

            {/* Folder body */}
            <div style={styles.folderBody}>

              {/* Paper line texture */}
              <div style={styles.paperLines}></div>

              {/* Stamp — animates in */}
              <motion.div
                initial={{ scale: 1.6, opacity: 0, rotate: -6 }}
                animate={{ scale: 1, opacity: 1, rotate: -3 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 14 }}
                style={{
                  ...styles.filedStamp,
                  borderColor: isCorrect ? "#15803d" : "#dc2626",
                  color: isCorrect ? "#15803d" : "#dc2626",
                }}
              >
                {isCorrect ? "CASE CLOSED" : "CASE OPEN"}
              </motion.div>

              {/* Title row */}
              <p style={styles.folderTitle}>Pursuit Dossier</p>
              <p style={styles.folderSuspect}>Re: Carmen Sandiego</p>

              <div style={styles.folderDivider}></div>

              {/* Fields */}
              <div style={styles.folderFields}>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>REPORTING AGENT</span>
                  <span style={styles.folderFieldValue}>{name}</span>
                </div>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>FILED</span>
                  <span style={styles.folderFieldValue}>
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                  </span>
                </div>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>ANSWER SUBMITTED</span>
                  <span style={styles.folderFieldValue}>{answer.toUpperCase()}</span>
                </div>
                <div style={styles.folderField}>
                  <span style={styles.folderFieldLabel}>OUTCOME</span>
                  <span style={{
                    ...styles.folderFieldValue,
                    color: isCorrect ? "#15803d" : "#dc2626",
                  }}>
                    {isCorrect ? "Target Located — Orlando, FL (MCO)" : "Suspect Evaded"}
                  </span>
                </div>
              </div>

              <div style={styles.folderFooter}>
                <span style={styles.folderFooterText}>Sun Country Airlines · Internal Training Exercise · {new Date().getFullYear()}</span>
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
        <RadarBackground fast={false} />
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
      <style>{keyframes}</style>
      <RadarBackground fast={radarFast} />

      {/* Green flash overlay on correct answer */}
      {flashGreen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none",
          background: "rgba(34,197,94,0.3)",
          animation: "greenFlash 1.2s ease-in-out forwards",
        }}></div>
      )}

      <div style={styles.outer}>
        {/* Header — folder tab style */}
        <div style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <span style={styles.orgLabel}>SUN COUNTRY AIRLINES</span>
            <span style={styles.divider}>|</span>
            <span style={styles.orgLabel}>SC PURSUIT DIVISION</span>
          </div>
          <div style={styles.caseTag}>CASE #{caseNumber}</div>
        </div>

        <div style={styles.card}>

          {/* Paper line texture overlay */}
          <div style={styles.paperLines}></div>

          {/* Top strip — CLASSIFIED stamp + date */}
          <div style={styles.cardTopStrip}>
            <div style={styles.classifiedBadge}>CLASSIFIED</div>
            <div style={styles.topRight}>
              <span style={styles.dateStamp}>
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
              </span>
              <span style={styles.priorityTag}>PRIORITY: URGENT</span>
            </div>
          </div>

          {/* Suspect block */}
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

          {/* Section divider with rules */}
          <div style={styles.sectionDivider}>
            <div style={styles.sectionRule}></div>
            <span style={styles.sectionLabel}>LAST KNOWN INTELLIGENCE</span>
            <div style={styles.sectionRule}></div>
          </div>

          {/* Clue box */}
          <div style={styles.clueBox}>
            <span style={styles.clueTitle}>INTEL REPORT</span>
            <p style={styles.clueText}>{prompt}</p>
            <div style={styles.directiveLine}></div>
            <p style={styles.clueQuestion}>Where in the Sun Country world did they go?</p>
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
                <p style={styles.scanMessage}>
                  <TypewriterMessage key={scanStep} text={scanMessages[scanStep]} />
                </p>
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
                    background: isCorrect ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                  }}
                >
                  <div style={styles.resultTagRow}>
                    <span style={{ ...styles.resultTag, background: isCorrect ? "#16a34a" : "#dc2626" }}>
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

// ── Radar ────────────────────────────────────────────────────────────────────
function RadarBackground({ fast }) {
  return (
    <div style={styles.radarContainer}>
      <svg style={styles.radarSvg} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <circle cx="400" cy="400" r="380" fill="none" stroke="rgba(220,38,38,0.7)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(220,38,38,0.6)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="180" fill="none" stroke="rgba(220,38,38,0.5)" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="90"  fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1.5" />
        <line x1="400" y1="20"  x2="400" y2="780" stroke="rgba(220,38,38,0.3)" strokeWidth="0.75" />
        <line x1="20"  y1="400" x2="780" y2="400" stroke="rgba(220,38,38,0.3)" strokeWidth="0.75" />
      </svg>

      <motion.div
        style={styles.sweepWrap}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: fast ? 1.4 : 4, ease: "linear" }}
      >
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

// ── Styles ───────────────────────────────────────────────────────────────────
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

  radarContainer: {
    position: "fixed", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    pointerEvents: "none", zIndex: 1,
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
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  darkOverlay: {
    position: "absolute", inset: 0,
    background: "rgba(0,0,0,0.45)",
  },

  centeredFill: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "100%", position: "relative", zIndex: 10,
  },

  outer: {
    width: "100%", maxWidth: 680,
    position: "relative", zIndex: 10,
  },

  // Header — tab that sits on top of card
  headerBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "9px 20px",
    background: "#b91c1c",
    borderRadius: "6px 6px 0 0",
    borderBottom: "3px solid #7f1d1d",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  orgLabel: { color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em" },
  divider: { color: "rgba(255,255,255,0.35)", fontSize: 10 },
  caseTag: {
    color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
    background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: 3,
    border: "1px solid rgba(255,255,255,0.15)",
  },

  // Card — paper background with line texture
  card: {
    background: "#fefce8",
    border: "2px solid #92400e",
    borderTop: "none",
    borderRadius: "0 0 12px 12px",
    padding: "28px 32px 24px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.75)",
    position: "relative",
    overflow: "hidden",
  },

  // Legal-pad line texture — sits behind everything
  paperLines: {
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(146,64,14,0.07) 27px, rgba(146,64,14,0.07) 28px)",
    backgroundSize: "100% 28px",
    backgroundPositionY: "8px",
  },

  // All card children need to sit above the texture
  cardTopStrip: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20, position: "relative", zIndex: 1,
  },

  // Stamp treatment — heavier rotation, border
  classifiedBadge: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.18em",
    padding: "4px 10px",
    border: "3px solid #dc2626",
    borderRadius: 3,
    display: "inline-block",
    opacity: 0.85,
    animation: "stampIn 0.5s ease-out forwards",
    transformOrigin: "center",
  },

  topRight: {
    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
  },
  dateStamp: {
    fontSize: 9, fontWeight: 700, color: "#78350f", letterSpacing: "0.1em",
  },
  priorityTag: {
    fontSize: 9, fontWeight: 700, color: "#dc2626", letterSpacing: "0.1em",
    border: "1px solid rgba(220,38,38,0.4)", padding: "2px 6px", borderRadius: 2,
  },

  // Suspect block
  suspectHeader: {
    marginBottom: 20, padding: "16px 18px",
    background: "rgba(0,0,0,0.04)",
    borderRadius: 6, border: "1px solid rgba(146,64,14,0.2)",
    position: "relative", zIndex: 1,
  },
  suspectName: {
    fontSize: 26, fontWeight: 700, color: "#1c0a00",
    margin: "0 0 14px", letterSpacing: "0.02em",
    borderBottom: "1px solid rgba(146,64,14,0.2)", paddingBottom: 12,
  },
  suspectFieldRow: { display: "flex", flexWrap: "wrap" },
  suspectField: {
    display: "flex", flexDirection: "column", gap: 3,
    flex: "1 1 120px", paddingRight: 20,
  },
  fieldLabel: { fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", color: "#a16207" },
  fieldValue: {
    fontSize: 12, fontWeight: 700, color: "#1c0a00",
    fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.03em",
  },

  // Section divider with full-width rules
  sectionDivider: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 14, position: "relative", zIndex: 1,
  },
  sectionRule: {
    flex: 1, height: 1,
    background: "rgba(146,64,14,0.3)",
  },
  sectionLabel: {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
    color: "#78350f", whiteSpace: "nowrap",
  },

  // Clue box
  clueBox: {
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(146,64,14,0.3)",
    borderLeft: "4px solid #dc2626",
    borderRadius: 0,
    padding: "14px 16px",
    marginBottom: 20,
    position: "relative", zIndex: 1,
  },
  clueTitle: {
    display: "block",
    fontSize: 8, fontWeight: 700, letterSpacing: "0.16em",
    color: "#78350f", marginBottom: 8,
  },
  clueText: {
    fontSize: 15, lineHeight: 1.7, color: "#1c0a00",
    margin: "0 0 12px",
    fontFamily: "Georgia, serif", fontStyle: "italic",
  },
  directiveLine: {
    height: 1, background: "rgba(220,38,38,0.25)",
    marginBottom: 10, borderTop: "1px dashed rgba(220,38,38,0.3)",
  },
  clueQuestion: {
    fontSize: 14, fontWeight: 700, color: "#dc2626",
    margin: 0, letterSpacing: "0.01em",
    fontFamily: "'Courier New', Courier, monospace",
  },

  // Input
  inputSection: { marginBottom: 8, position: "relative", zIndex: 1 },
  inputLabel: {
    display: "block", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.12em", color: "#78350f", marginBottom: 8,
  },
  inputRow: { display: "flex", gap: 10 },
  input: {
    flex: 1, padding: "10px 14px", fontSize: 14,
    fontFamily: "'Courier New', Courier, monospace",
    border: "1.5px solid #92400e", borderRadius: 4,
    background: "rgba(255,255,255,0.8)", color: "#1c0a00",
    outline: "none", letterSpacing: "0.04em",
  },
  trackBtn: {
    padding: "10px 20px", background: "#dc2626", color: "#fff",
    border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700,
    letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace",
    whiteSpace: "nowrap",
  },

  // Scan
  scanSection: { padding: "20px 0", position: "relative", zIndex: 1 },
  scanHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  scanDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e",
  },
  scanTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#166534" },
  scanMessage: {
    fontSize: 13, color: "#166534",
    fontFamily: "'Courier New', Courier, monospace",
    margin: "0 0 14px", letterSpacing: "0.04em", minHeight: 20,
  },
  progressBar: {
    height: 6, background: "rgba(0,0,0,0.1)",
    borderRadius: 3, overflow: "hidden", marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#16a34a,#22c55e)",
    borderRadius: 3,
  },
  scanProgress: {
    fontSize: 11, color: "#166534", margin: 0,
    textAlign: "right", letterSpacing: "0.08em",
  },

  // Result
  resultSection: { marginBottom: 4, position: "relative", zIndex: 1 },
  resultBanner: {
    border: "1.5px solid", borderRadius: 6,
    padding: "14px 18px", marginBottom: 16,
  },
  resultTagRow: { marginBottom: 8 },
  resultTag: {
    display: "inline-block", color: "#fff", fontSize: 9,
    fontWeight: 700, letterSpacing: "0.14em",
    padding: "3px 10px", borderRadius: 2,
  },
  resultTitle: {
    fontSize: 15, fontWeight: 700, margin: "0 0 4px",
    letterSpacing: "0.02em", fontFamily: "'Courier New', Courier, monospace",
  },
  resultSub: { fontSize: 12, color: "#166534", margin: 0, letterSpacing: "0.06em" },

  agentSection: { marginTop: 4, position: "relative", zIndex: 1 },
  submitBtn: {
    padding: "10px 20px", background: "#166534", color: "#fff",
    border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700,
    letterSpacing: "0.08em", fontFamily: "'Courier New', Courier, monospace",
    whiteSpace: "nowrap",
  },

  // Footer
  cardFooter: {
    display: "flex", justifyContent: "space-between",
    marginTop: 20, paddingTop: 12,
    borderTop: "1px solid rgba(146,64,14,0.2)",
    position: "relative", zIndex: 1,
  },
  footerText: { fontSize: 9, color: "#a16207", letterSpacing: "0.08em" },

  // Lockout
  lockoutCard: {
    background: "#0f172a", border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: 12, padding: "40px 48px", textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.8)", maxWidth: 400,
  },
  lockoutIcon: { marginBottom: 20, display: "flex", justifyContent: "center" },
  lockoutTitle: {
    fontSize: 18, color: "#fff", fontWeight: 700,
    letterSpacing: "0.08em", margin: "0 0 12px",
    fontFamily: "'Courier New', Courier, monospace",
  },
  lockoutSub: {
    fontSize: 13, color: "rgba(255,255,255,0.5)",
    margin: "0 0 24px", lineHeight: 1.6,
    fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.02em",
  },
  lockoutDivider: { height: 1, background: "rgba(220,38,38,0.2)", marginBottom: 16 },
  lockoutFooter: {
    fontSize: 9, color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.12em", margin: 0,
    fontFamily: "'Courier New', Courier, monospace",
  },

  // Success — folder card
  folderWrap: {
    width: "100%",
    maxWidth: 520,
    position: "relative",
    zIndex: 10,
  },
  folderTab: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#b91c1c",
    borderBottom: "3px solid #7f1d1d",
    borderRadius: "6px 6px 0 0",
    padding: "8px 18px",
    width: "55%",
  },
  folderTabText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.14em",
    fontFamily: "'Courier New', Courier, monospace",
  },
  folderTabCase: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 9,
    letterSpacing: "0.08em",
    fontFamily: "'Courier New', Courier, monospace",
  },
  folderBody: {
    background: "#fefce8",
    border: "2px solid #92400e",
    borderTop: "2px solid #92400e",
    borderRadius: "0 6px 6px 6px",
    padding: "28px 32px 24px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 24px 60px rgba(0,0,0,0.75)",
  },
  filedStamp: {
    position: "absolute",
    top: 24,
    right: 24,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.2em",
    border: "3px solid",
    padding: "5px 12px",
    borderRadius: 3,
    opacity: 0.88,
    fontFamily: "'Courier New', Courier, monospace",
    transformOrigin: "center",
    zIndex: 2,
  },
  folderTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1c0a00",
    margin: "0 0 2px",
    letterSpacing: "0.02em",
    position: "relative",
    zIndex: 1,
  },
  folderSuspect: {
    fontSize: 12,
    color: "#78350f",
    margin: "0 0 16px",
    letterSpacing: "0.08em",
    fontFamily: "'Courier New', Courier, monospace",
    position: "relative",
    zIndex: 1,
  },
  folderDivider: {
    height: 1,
    background: "rgba(146,64,14,0.25)",
    marginBottom: 20,
    position: "relative",
    zIndex: 1,
  },
  folderFields: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    position: "relative",
    zIndex: 1,
  },
  folderField: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    paddingBottom: 14,
    borderBottom: "1px solid rgba(146,64,14,0.12)",
  },
  folderFieldLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.16em",
    color: "#a16207",
    fontFamily: "'Courier New', Courier, monospace",
  },
  folderFieldValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1c0a00",
    fontFamily: "'Courier New', Courier, monospace",
    letterSpacing: "0.03em",
  },
  folderFooter: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: "1px solid rgba(146,64,14,0.15)",
    position: "relative",
    zIndex: 1,
  },
  folderFooterText: {
    fontSize: 9,
    color: "#a16207",
    letterSpacing: "0.08em",
    fontFamily: "'Courier New', Courier, monospace",
  },
};
