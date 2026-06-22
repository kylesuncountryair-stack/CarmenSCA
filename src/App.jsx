import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";

const generateCaseNumber = () =>
  "SC-" + Math.floor(1000 + Math.random() * 9000);

const correctAnswers = [
  "orlando",
  "mco",
  "orlando, fl",
  "orlando, florida",
];

const scanMessages = [
  "Scanning Sun Country Global Network...",
  "Checking Skyspeed Reservations...",
  "Searching Advisories...",
  "Compiling Customer Care Database Files...",
];

const prompt =
  "Your sneaky traveler has vanished again! Rumor has it; they were last seen buying sunscreen, holding a frozen drink, and asking where Minnesotans escape winter. Surrounded by palm trees, flip flops, and mouse ears... Where in the Sun Country world did they go?";

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
  const [glitchActive, setGlitchActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 4000);
    return () => clearInterval(interval);
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
    }, 1300);

    const progressInterval = setInterval(() => {
      setScanProgress((p) => Math.min(p + 2, 95));
    }, 110);

    setTimeout(() => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setScanProgress(100);

      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.includes(normalized);

      setTimeout(() => {
        setIsCorrect(match);
        setShowName(true);
        setScanning(false);
      }, 400);
    }, 5500);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !scanning && !showName && answer.trim()) {
      handleSubmit();
    }
  };

  if (submitted) {
    return (
      <div style={styles.root}>
        <GridLines />
        <div style={styles.successWrap}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={styles.successCard}
          >
            <div style={styles.successIcon}>✓</div>
            <p style={styles.successTitle}>Report Filed</p>
            <div style={styles.successMeta}>
              <span style={styles.metaLabel}>Agent</span>
              <span style={styles.metaValue}>{name}</span>
            </div>
            <div style={styles.successMeta}>
              <span style={styles.metaLabel}>Case</span>
              <span style={styles.metaValue}>{caseNumber}</span>
            </div>
            <div style={styles.successMeta}>
              <span style={styles.metaLabel}>Status</span>
              <span style={{ ...styles.metaValue, color: isCorrect ? "#4ade80" : "#f87171" }}>
                {isCorrect ? "Target Located" : "Pursuit Ongoing"}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <GridLines />

      {/* Radar sweep */}
      <div style={styles.radarWrap}>
        <div style={styles.radarRing1} />
        <div style={styles.radarRing2} />
        <div style={styles.radarRing3} />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          style={styles.radarSweep}
        />
      </div>

      {/* Main card */}
      <div style={styles.outer}>
        {/* Header bar */}
        <div style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <span style={styles.orgLabel}></span>
            <span style={styles.divider}>|</span>
            <span style={styles.orgLabel}></span>
          </div>
          <div style={styles.caseTag}>
            CASE #{caseNumber}
          </div>
        </div>

        <div style={styles.card}>
          {/* Top strip */}
          <div style={styles.cardTopStrip}>
            <div style={styles.classifiedBadge}>CLASSIFIED</div>
            <div style={styles.fileType}>PURSUIT DOSSIER</div>
          </div>

          {/* Suspect header */}
          <div style={styles.suspectHeader}>
            <div style={styles.suspectPhotoWrap}>
              <div style={styles.suspectPhoto}>
                <SilhouetteIcon />
              </div>
              <div style={styles.photoLabel}>SUSPECT</div>
            </div>
            <div style={styles.suspectInfo}>
              <p style={styles.suspectName}>Carmen Sandiego</p>
              <p style={styles.suspectAlias}>ALIAS: "The Red Shadow"</p>
              <div style={styles.threatRow}>
                <span style={styles.threatBadge}>THREAT LEVEL: HIGH</span>
                <span style={styles.statusBadge}>STATUS: AT LARGE</span>
              </div>
              <div style={styles.traitRow}>
                <span style={styles.traitPill}>Evasive</span>
                <span style={styles.traitPill}>Resourceful</span>
                <span style={styles.traitPill}>Traveler</span>
              </div>
            </div>
          </div>

          {/* Divider */}
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

          {/* Input area */}
          <AnimatePresence mode="wait">
            {!scanning && !showName && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={styles.inputSection}
              >
                <label style={styles.inputLabel}>
                  Enter city name or airport code
                </label>
                <div style={styles.inputRow}>
                  <input
                    ref={inputRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={styles.input}
                    placeholder="Input Suspected Location"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    style={{
                      ...styles.trackBtn,
                      opacity: answer.trim() ? 1 : 0.45,
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
                  <span style={styles.scanDot} />
                  <span style={styles.scanTitle}>SCANNING...</span>
                </div>
                <p style={styles.scanMessage}>{scanMessages[scanStep]}</p>
                <div style={styles.progressBar}>
                  <motion.div
                    style={styles.progressFill}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: "linear" }}
                  />
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
                    borderColor: isCorrect ? "#4ade80" : "#f87171",
                    background: isCorrect
                      ? "rgba(74, 222, 128, 0.08)"
                      : "rgba(248, 113, 113, 0.08)",
                  }}
                >
                  <p
                    style={{
                      ...styles.resultTitle,
                      color: isCorrect ? "#4ade80" : "#f87171",
                    }}
                  >
                    {isCorrect
                      ? "🎯 Target Locked! Excellent Work, Gumshoe!"
                      : "❌ Carmen Escaped! Track Her Again Tomorrow!"}
                  </p>
                  {isCorrect && (
                    <p style={styles.resultSub}>
                      Suspect located in Orlando, FL (MCO)
                    </p>
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
                      placeholder="Enter your full name to file report"
                    />
                    <button
                      onClick={handleFinalSubmit}
                      disabled={submitting || !name.trim()}
                      style={{
                        ...styles.submitBtn,
                        opacity: submitting || !name.trim() ? 0.5 : 1,
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
            <span style={styles.footerText}>ACME-{caseNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SilhouetteIcon() {
  return (
    <svg viewBox="0 0 80 100" width="60" height="75" fill="none">
      <circle cx="40" cy="28" r="18" fill="#c0392b" opacity="0.85" />
      <path
        d="M10 95 C10 68 70 68 70 95"
        stroke="#c0392b"
        strokeWidth="2"
        fill="#c0392b"
        opacity="0.85"
      />
      <rect x="28" y="12" width="24" height="8" rx="2" fill="#8b0000" opacity="0.9" />
      <path d="M18 18 Q40 4 62 18" stroke="#8b0000" strokeWidth="3" fill="none" />
    </svg>
  );
}

function GridLines() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage:
          "linear-gradient(rgba(220,38,38,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0a",
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
  radarWrap: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  radarRing1: {
    position: "absolute",
    width: 700,
    height: 700,
    borderRadius: "50%",
    border: "1px solid rgba(220,38,38,0.12)",
  },
  radarRing2: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    border: "1px solid rgba(220,38,38,0.1)",
  },
  radarRing3: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    border: "1px solid rgba(220,38,38,0.08)",
  },
  radarSweep: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "conic-gradient(rgba(0,220,80,0.08), transparent 18%)",
  },
  outer: {
    width: "100%",
    maxWidth: 680,
    position: "relative",
    zIndex: 10,
  },
  headerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    background: "rgba(220,38,38,0.9)",
    borderRadius: "6px 6px 0 0",
    marginBottom: 0,
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
  card: {
    background: "linear-gradient(160deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)",
    border: "2px solid #92400e",
    borderTop: "none",
    borderRadius: "0 0 12px 12px",
    padding: "28px 32px 24px",
    position: "relative",
    boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
    backgroundAttachment: "local",
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
  suspectHeader: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
    padding: "16px",
    background: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    border: "1px solid rgba(146,64,14,0.25)",
  },
  suspectPhotoWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  suspectPhoto: {
    width: 80,
    height: 96,
    background: "#fef9c3",
    border: "2px solid #92400e",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#78350f",
  },
  suspectInfo: {
    flex: 1,
  },
  suspectName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1c0a00",
    margin: "0 0 2px",
    fontFamily: "'Courier New', Courier, monospace",
    letterSpacing: "0.02em",
  },
  suspectAlias: {
    fontSize: 11,
    color: "#78350f",
    margin: "0 0 10px",
    letterSpacing: "0.08em",
  },
  threatRow: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  threatBadge: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#dc2626",
    border: "1px solid #dc2626",
    padding: "2px 8px",
    borderRadius: 2,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#b45309",
    border: "1px solid #b45309",
    padding: "2px 8px",
    borderRadius: 2,
  },
  traitRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  traitPill: {
    fontSize: 9,
    color: "#44403c",
    background: "rgba(0,0,0,0.07)",
    padding: "2px 8px",
    borderRadius: 10,
    letterSpacing: "0.06em",
  },
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
    whiteSpace: "nowrap",
    background: "linear-gradient(160deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)",
    padding: "0 8px 0 0",
    position: "relative",
  },
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
  clueIcon: {
    fontSize: 16,
  },
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
  inputSection: {
    marginBottom: 8,
  },
  inputLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#78350f",
    marginBottom: 8,
  },
  inputRow: {
    display: "flex",
    gap: 10,
  },
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
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.15s",
  },
  scanSection: {
    padding: "20px 0",
  },
  scanHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  scanDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    boxShadow: "0 0 6px #22c55e",
    animation: "pulse 1s infinite",
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
    background: "linear-gradient(90deg, #16a34a, #22c55e)",
    borderRadius: 3,
  },
  scanProgress: {
    fontSize: 11,
    color: "#166534",
    margin: 0,
    textAlign: "right",
    letterSpacing: "0.08em",
  },
  resultSection: {
    marginBottom: 4,
  },
  resultBanner: {
    border: "1.5px solid",
    borderRadius: 6,
    padding: "14px 18px",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 4px",
    letterSpacing: "0.02em",
  },
  resultSub: {
    fontSize: 12,
    color: "#166534",
    margin: 0,
    letterSpacing: "0.06em",
  },
  agentSection: {
    marginTop: 4,
  },
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
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.15s",
  },
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
  successWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    zIndex: 10,
    position: "relative",
  },
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
    fontWeight: 300,
  },
  successTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "0.1em",
    margin: "0 0 24px",
    fontFamily: "'Courier New', Courier, monospace",
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
    fontFamily: "'Courier New', Courier, monospace",
  },
  metaValue: {
    fontSize: 13,
    color: "#fff",
    fontFamily: "'Courier New', Courier, monospace",
  },
};
