import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── CONFIG — update daily ────────────────────────────────────────────────────
const FINALE_MODE = false;
const FINALE_WINNERS = [
  { name: "Agent Name Here", dept: "Department" },
  { name: "Agent Name Here", dept: "Department" },
  { name: "Agent Name Here", dept: "Department" },
  { name: "Agent Name Here", dept: "Department" },
  { name: "Agent Name Here", dept: "Department" },
  { name: "Agent Name Here", dept: "Department" },
];

const CURRENT_DAY = {
  dept: "CRC",
  label: "Central Reservations Control",
  correctAnswers: ["crc", "central reservations control", "central reservation control", "reservations control"],
  clue: `Our crafty friend has worked themselves into the perfect hiding spot, balancing inbound calls, outbound calls, emails, and SMS messages all at once. They seem to enjoy this department because it gives them a front row seat to every bit of chaos the moment it unfolds. Catching them is extremely difficult since they can be found here 24/7, giving them plenty of opportunities for mischief and countless shifts to disappear into when suspicion arises. We thought we finally had them cornered after they got a little too generous and handed out free hotel rooms during a weather delay — but somehow they slipped through our fingers just in time and vanished back into the queue.`,
  previousDepts: [],
};

const TRANSFER_MESSAGES = [
  "She's already updated her LinkedIn. Trail's gone cold.",
  "HR has no record of her. She transferred before you could file the report.",
  "Badge deactivated. Department unknown. She's in the wind.",
];

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";
const LOCKOUT_KEY = "carmen_v2_played_date";
const BG_IMAGE = "/background.png";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function parseName(email) {
  const local = email.split("@")[0];
  const parts = local.split(".");
  if (parts.length >= 2) {
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  }
  return local;
}

function firstName(fullName) {
  return fullName.split(" ")[0];
}

function playStamp() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*Math.pow(1-i/data.length,3);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 180;
    src.buffer = buf; src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.9, ctx.currentTime);
    src.start(ctx.currentTime);
  } catch(e) {}
}

// ── TYPEWRITER ────────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 35) {
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

function TypewriterSpan({ text, speed = 30, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++; setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  useEffect(() => { if (done && onDone) onDone(); }, [done]);
  return <span>{displayed}{!done && <span style={{opacity:0.6}}>▌</span>}</span>;
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState("input"); // input | connecting | confirmed
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [agentName, setAgentName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { if (phase === "input" && inputRef.current) inputRef.current.focus(); }, [phase]);

  useEffect(() => {
    if (phase !== "connecting") return;
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 3 + 0.8;
      if (p >= 100) { p = 100; clearInterval(id); setPhase("confirmed"); }
      setProgress(Math.min(100, p));
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "confirmed") return;
    const t = setTimeout(() => onLogin(email, agentName), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  const handleSubmit = () => {
    const val = email.trim().toLowerCase();
    if (!val.endsWith("@suncountry.com")) {
      setError("Must be a @suncountry.com email address.");
      return;
    }
    setError("");
    setAgentName(parseName(val));
    setPhase("connecting");
  };

  const CONNECT_MESSAGES = [
    "Establishing secure connection...",
    "Authenticating credentials...",
    "Accessing Sun Country internal network...",
    "Loading agent profile...",
  ];
  const msgIdx = Math.min(Math.floor(progress / 25), CONNECT_MESSAGES.length - 1);

  return (
    <div style={s.loginRoot}>
      <div style={s.loginBg}><img src={BG_IMAGE} alt="" style={s.loginBgImg} /></div>
      <div style={s.loginOverlay}></div>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.5}} style={s.loginWindow}>
        {/* Window chrome */}
        <div style={s.winTitleBar}>
          <div style={{display:"flex",gap:6}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:"#ff5f57"}}></div>
            <div style={{width:12,height:12,borderRadius:"50%",background:"#febc2e"}}></div>
            <div style={{width:12,height:12,borderRadius:"50%",background:"#28c840"}}></div>
          </div>
          <span style={s.winTitle}>Sun Country Internal Network — Secure Login</span>
          <div style={{width:52}}></div>
        </div>

        <div style={s.winBody}>
          {/* Sun Country logo area */}
          <div style={s.loginLogoArea}>
            <img src="/logo.png" alt="Sun Country Airlines" style={{height:40,width:"auto",objectFit:"contain"}} />
            <div>
              <div style={{fontFamily:"'Special Elite',cursive",fontSize:16,color:"#1e3a7a",fontWeight:700}}>Sun Country Airlines</div>
              <div style={{fontFamily:"'VT323',monospace",fontSize:13,color:"#5a6a9a",letterSpacing:"0.1em"}}>INTERNAL INVESTIGATION PORTAL</div>
            </div>
          </div>

          <div style={s.loginDivider}></div>

          <AnimatePresence mode="wait">
            {phase === "input" && (
              <motion.div key="input" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div style={s.loginFieldLabel}>Work Email Address</div>
                <input
                  ref={inputRef}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="firstname.lastname@suncountry.com"
                  style={{...s.loginInput, borderColor: error ? "#dc2626" : "#c5cce8"}}
                />
                {error && <div style={s.loginError}>{error}</div>}
                <button
                  onClick={handleSubmit}
                  onMouseEnter={e=>e.target.style.background="#1e3a7a"}
                  onMouseLeave={e=>e.target.style.background="#2d4eb0"}
                  onMouseDown={e=>{e.target.style.background="#152b7a";e.target.style.transform="scale(0.98)";}}
                  onMouseUp={e=>{e.target.style.background="#1e3a7a";e.target.style.transform="scale(1)";}}
                  style={{...s.loginBtn,transition:"background 0.1s,transform 0.08s"}}
                >
                  Sign In
                </button>
                <div style={s.loginHint}>Access restricted to Sun Country employees</div>
              </motion.div>
            )}

            {phase === "connecting" && (
              <motion.div key="connecting" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div style={{fontFamily:"'VT323',monospace",fontSize:15,color:"#3a4a8a",letterSpacing:"0.08em",marginBottom:16,minHeight:22}}>
                  {CONNECT_MESSAGES[msgIdx]}
                </div>
                <div style={s.loginProgressTrack}>
                  <motion.div
                    style={{...s.loginProgressFill, width:`${progress}%`}}
                    transition={{ease:"easeOut"}}
                  ></motion.div>
                </div>
                <div style={{fontFamily:"'VT323',monospace",fontSize:13,color:"#8a9ac8",textAlign:"right",marginTop:4,letterSpacing:"0.06em"}}>
                  {Math.floor(progress)}%
                </div>
              </motion.div>
            )}

            {phase === "confirmed" && (
              <motion.div key="confirmed" initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} style={{textAlign:"center",padding:"12px 0"}}>
                <div style={{fontFamily:"'VT323',monospace",fontSize:18,color:"#15803d",letterSpacing:"0.14em",marginBottom:8}}>
                  ✓ IDENTITY CONFIRMED
                </div>
                <div style={{fontFamily:"'Special Elite',cursive",fontSize:22,color:"#1e3a7a",fontWeight:700,marginBottom:4}}>
                  Welcome, {agentName}
                </div>
                <div style={{fontFamily:"'VT323',monospace",fontSize:13,color:"#8a9ac8",letterSpacing:"0.08em"}}>
                  Loading your briefing...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── EMAIL NOTIFICATION ────────────────────────────────────────────────────────
function ChiefEmail({ agentName, agentEmail, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t1);
  }, []);

  const handleOpen = () => { setReading(true); };
  const handleClose = () => { setVisible(false); setTimeout(onDismiss, 400); };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {hour:"2-digit",minute:"2-digit"});
  const dateStr = now.toLocaleDateString("en-US", {weekday:"short",month:"short",day:"numeric"});

  if (!reading) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{x:380,opacity:0}}
            animate={{x:0,opacity:1}}
            exit={{x:380,opacity:0}}
            transition={{type:"spring",stiffness:280,damping:24}}
            style={s.emailToast}
            onClick={handleOpen}
          >
            <div style={{position:"relative",flexShrink:0}}>
              <div style={s.emailToastIcon}>
                <span style={{fontFamily:"'Special Elite',cursive",fontSize:16,color:"#fff",fontWeight:700}}>C</span>
              </div>
              <span style={{position:"absolute",top:-3,right:-3,width:12,height:12,borderRadius:"50%",background:"#dc2626",display:"block",boxShadow:"0 0 0 0 rgba(220,38,38,0.4)",animation:"redDot 1.2s ease-in-out infinite"}}></span>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Special Elite',cursive",fontSize:16,color:"#1e3a7a",fontWeight:700,marginBottom:2}}>The Chief</div>
              <div style={{fontFamily:"'VT323',monospace",fontSize:14,color:"#3a4a8a",letterSpacing:"0.04em",marginBottom:4}}>Urgent: Internal Investigation — Action Required</div>
              <div style={{fontFamily:"'VT323',monospace",fontSize:12,color:"#dc2626",letterSpacing:"0.1em",animation:"pulse 1s ease-in-out infinite"}}>▶ CLICK TO OPEN</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{opacity:0}}
      animate={{opacity:1}}
      style={s.emailModalBackdrop}
      onClick={handleClose}
    >
      <motion.div
        initial={{y:24,opacity:0}}
        animate={{y:0,opacity:1}}
        transition={{type:"spring",stiffness:240,damping:22}}
        style={s.emailModal}
        onClick={e => e.stopPropagation()}
      >
        {/* Email window chrome */}
        <div style={s.emailTitleBar}>
          <div style={{display:"flex",gap:6}}>
            <div style={{width:11,height:11,borderRadius:"50%",background:"#ff5f57"}}></div>
            <div style={{width:11,height:11,borderRadius:"50%",background:"#febc2e"}}></div>
            <div style={{width:11,height:11,borderRadius:"50%",background:"#28c840"}}></div>
          </div>
          <span style={{fontFamily:"'VT323',monospace",fontSize:12,color:"#8a9ac8",letterSpacing:"0.08em"}}>Mail — Sun Country Internal</span>
          <div style={{width:40}}></div>
        </div>

        <div style={s.emailBody}>
          {/* Email header */}
          <div style={s.emailHeader}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
              <div style={s.emailAvatarChief}>
                <span style={{fontFamily:"'Special Elite',cursive",fontSize:16,color:"#fff",fontWeight:700}}>C</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Special Elite',cursive",fontSize:15,color:"#1e3a7a",fontWeight:700,marginBottom:2}}>The Chief</div>
                <div style={{fontFamily:"'VT323',monospace",fontSize:12,color:"#8a9ac8",letterSpacing:"0.04em"}}>From: chief@suncountry.com</div>
                <div style={{fontFamily:"'VT323',monospace",fontSize:12,color:"#8a9ac8",letterSpacing:"0.04em"}}>To: {agentEmail}</div>
                <div style={{fontFamily:"'VT323',monospace",fontSize:11,color:"#a0aac8",letterSpacing:"0.04em",marginTop:2}}>{dateStr} at {timeStr}</div>
              </div>
            </div>
            <div style={s.emailSubject}>
              🔴 URGENT: Internal Investigation — Action Required, {agentName}
            </div>
          </div>

          {/* Email body */}
          <div style={s.emailContent}>
            <p style={s.emailP}>Agent {agentName},</p>
            <p style={s.emailP}>
              We have a situation. Carmen Sandiego has infiltrated our organization and we believe she is currently hiding somewhere in our company under an assumed identity.
            </p>
            <p style={s.emailP}>
              We've managed to obtain intelligence on her current whereabouts. Read the briefing carefully — your mission is to identify which <strong>department</strong> she is currently operating in.
            </p>
            <p style={s.emailP}>
              File your report through the secure portal below. We are counting on you.
            </p>
            <p style={{...s.emailP,fontStyle:"italic",color:"#5a6a9a",marginTop:20}}>
              — The Chief<br/>
              <span style={{fontFamily:"'VT323',monospace",fontSize:12,letterSpacing:"0.06em"}}>Chief of Internal Investigations · Sun Country Airlines</span>
            </p>
          </div>

          <div style={{padding:"0 20px 16px",display:"flex",gap:10}}>
            <button
              onClick={handleClose}
              onMouseEnter={e=>e.target.style.background="#152b7a"}
              onMouseLeave={e=>e.target.style.background="#1e3a7a"}
              onMouseDown={e=>{e.target.style.background="#0f1f5a";e.target.style.transform="scale(0.98)";}}
              onMouseUp={e=>{e.target.style.background="#152b7a";e.target.style.transform="scale(1)";}}
              style={{...s.emailBtn,transition:"background 0.1s,transform 0.08s"}}
            >
              Open Briefing
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── STAMP FILTER ──────────────────────────────────────────────────────────────
function StampFilter() {
  return (
    <svg width="0" height="0" style={{position:"absolute"}}>
      <defs>
        <filter id="stampFilter" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.065" numOctaves="4" seed="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
          <feComposite in="displaced" in2="SourceGraphic" operator="in"/>
        </filter>
        <filter id="paperGrain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="7" result="noise"/>
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
          <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended"/>
          <feComposite in="blended" in2="SourceGraphic" operator="in"/>
        </filter>
      </defs>
    </svg>
  );
}


// ── SCAN PROGRESS ─────────────────────────────────────────────────────────────
function useChunkyProgress(active) {
  const [progress, setProgress] = useState(0);
  const ref = useRef({value:0,pauseUntil:0});
  useEffect(() => {
    if (!active) { ref.current = {value:0,pauseUntil:0}; setProgress(0); return; }
    ref.current = {value:0,pauseUntil:0};
    const id = setInterval(() => {
      const s = ref.current;
      const now = Date.now();
      if (now < s.pauseUntil || s.value >= 99) return;
      const chunk = 1 + Math.floor(Math.random()*5);
      const next = Math.min(99, s.value + chunk);
      s.value = next; setProgress(next);
      if (Math.random() < 0.2) s.pauseUntil = now + 300 + Math.random()*400;
    }, 120);
    return () => clearInterval(id);
  }, [active]);
  return progress;
}

// ── VERDICT LINE ──────────────────────────────────────────────────────────────
function VerdictLine({ text, color }) {
  const { displayed } = useTypewriter(text, 28);
  return (
    <p style={{fontSize:15,fontWeight:400,margin:"0 0 4px",letterSpacing:"0.02em",fontFamily:"'Special Elite',cursive",color}}>
      {displayed}<span style={{opacity:displayed.length<text.length?0.5:0}}>▌</span>
    </p>
  );
}

// ── REDACTED REVEAL ───────────────────────────────────────────────────────────
function RedactedReveal({ text }) {
  return (
    <span style={{position:"relative",display:"inline-block",fontFamily:"'Crimson Pro',Georgia,serif",fontSize:14,fontWeight:600,color:"#15803d",letterSpacing:"0.02em"}}>
      {text}
      <span style={{position:"absolute",inset:0,background:"#0f1f4a",borderRadius:2,animation:"unredact 0.7s ease-in-out 0.6s forwards",width:"100%"}}></span>
    </span>
  );
}

// ── MAIN GAME ─────────────────────────────────────────────────────────────────
export default function CarmenV2() {
  const [phase, setPhase] = useState("login"); // login | email | dossier
  const [agentEmail, setAgentEmail] = useState("");
  const [agentName, setAgentName] = useState("");
  const [lockedOut, setLockedOut] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [firstAnswer, setFirstAnswer] = useState(null);
  const [canRetry, setCanRetry] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [transferMsg] = useState(() => TRANSFER_MESSAGES[Math.floor(Math.random()*TRANSFER_MESSAGES.length)]);
  const [chiefReply, setChiefReply] = useState(false);
  const scanProgress = useChunkyProgress(scanning);
  const inputRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(LOCKOUT_KEY) === getTodayString()) setLockedOut(true);
  }, []);

  useEffect(() => {
    if (phase === "dossier" && inputRef.current) setTimeout(() => inputRef.current?.focus(), 200);
  }, [phase]);

  if (FINALE_MODE) return <FinaleScreen />;
  if (phase === "login") return (
    <LoginScreen onLogin={(email, name) => {
      setAgentEmail(email); setAgentName(name);
      setPhase("email");
    }} />
  );

  const handleEmailDismiss = () => setPhase("dossier");

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setScanning(true);
    setTimeout(() => {
      const normalized = answer.trim().toLowerCase();
      const match = CURRENT_DAY.correctAnswers.includes(normalized);
      localStorage.setItem(LOCKOUT_KEY, getTodayString());
      setScanning(false); setDecrypting(true);
      setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 120); }, 300);
      setTimeout(() => {
        if (match) { setFlashGreen(true); setTimeout(() => setFlashGreen(false), 1200); }
        else { setFlashRed(true); setTimeout(() => setFlashRed(false), 400); }
      }, 1100);
      setTimeout(() => {
        setDecrypting(false); setIsCorrect(match); setShowResult(true);
        if (!match && !firstAnswer) { setFirstAnswer(answer); setCanRetry(true); }
      }, 1800);
    }, 8000);
  };

  const handleFinalSubmit = async () => {
    if (!agentEmail.trim()) return;
    setSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method:"POST", mode:"no-cors",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          name: agentName, email: agentEmail,
          answer, result: isCorrect ? "Correct" : "Incorrect",
          department: CURRENT_DAY.dept,
          date: getTodayString(),
        }),
      });
    } catch(e) {}
    if (isCorrect) setChiefReply(true);
    setTimeout(() => setSubmitted(true), isCorrect ? 4000 : 800);
  };

  const handleRetry = () => {
    localStorage.removeItem(LOCKOUT_KEY);
    setAnswer(""); setIsCorrect(null); setShowResult(false);
    setScanning(false); setDecrypting(false); setCanRetry(false);
    setFlashGreen(false); setFlashRed(false);
  };

  const keyframes = `
    @keyframes redDot{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.6)}70%{box-shadow:0 0 0 8px rgba(220,38,38,0)}}
    @keyframes emailPulse{0%,100%{box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 0 rgba(30,58,122,0.4)}50%{box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 8px rgba(30,58,122,0)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.85)}}
    @keyframes btnPulse{0%,100%{box-shadow:0 0 0 0 rgba(30,58,122,0.4)}50%{box-shadow:0 0 0 8px rgba(30,58,122,0)}}
    @keyframes greenFlash{0%{opacity:0}20%{opacity:0.5}80%{opacity:0.5}100%{opacity:0}}
    @keyframes stampIn{0%{opacity:0;transform:rotate(-4deg) scale(1.4)}60%{opacity:1;transform:rotate(-2deg) scale(0.95)}100%{opacity:1;transform:rotate(-2deg) scale(1)}}
    @keyframes unredact{0%{width:100%}100%{width:0%}}
    @keyframes flicker{0%,100%{opacity:1}93%{opacity:0.97}97%{opacity:0.98}}
    @keyframes glitchShift{0%{transform:translate(0)}20%{transform:translate(-3px,1px)}40%{transform:translate(3px,-1px)}60%{transform:translate(-2px,0)}80%{transform:translate(2px,1px)}100%{transform:translate(0)}}
    @keyframes barFlash{0%,100%{background:linear-gradient(90deg,#1e3a7a,#3b5ecc)}50%{background:#fff}}
    @keyframes decryptPulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes slideDown{0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:translateY(0)}}
  `;

  // SUBMITTED FOLDER
  if (submitted) return (
    <div style={s.root}>
      <style>{keyframes}</style>
      <StampFilter />
      <div style={s.bgLayer}><img src={BG_IMAGE} alt="" style={s.bgImg}/></div>
      <div style={s.crtOverlay}></div>
      <div style={s.centeredFill}>
        <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",stiffness:160,damping:18}} style={s.folderWrap}>
          <div style={s.folderTab}>
            <span style={s.folderTabText}>INTERNAL INVESTIGATIONS</span>
            <span style={s.folderTabCase}>FILED — {getTodayString()}</span>
          </div>
          <div style={s.folderBody}>
            <div style={s.paperLines}></div>
            <div style={s.paperGrain}></div>
            <div style={s.paperYellow}></div>
            <div style={s.folderColumns}>
              {/* LEFT */}
              <div style={{...s.folderLeft,boxShadow:"4px 0 12px rgba(0,0,0,0.06)"}}>
                <p style={s.folderTitle}>Investigation Report</p>
                <p style={s.folderSuspect}>Re: Carmen Sandiego</p>
                <div style={s.folderDivider}></div>
                <div style={s.folderFields}>
                  <div style={s.folderField}>
                    <span style={s.folderFieldLabel}>REPORTING AGENT</span>
                    <span style={s.folderFieldValue}>{agentName}</span>
                  </div>
                  <div style={s.folderField}>
                    <span style={s.folderFieldLabel}>AGENT EMAIL</span>
                    <span style={{...s.folderFieldValue,fontSize:13}}>{agentEmail}</span>
                  </div>
                  <div style={s.folderField}>
                    <span style={s.folderFieldLabel}>FILED</span>
                    <span style={s.folderFieldValue}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase()}</span>
                  </div>
                  <div style={s.folderField}>
                    <span style={s.folderFieldLabel}>{isCorrect ? "DEPARTMENT CONFIRMED" : "SUBMITTED DEPARTMENT"}</span>
                    <span style={s.folderFieldValue}>{answer.toUpperCase()}</span>
                  </div>
                  {firstAnswer && (
                    <div style={s.folderField}>
                      <span style={s.folderFieldLabel}>PRIOR ATTEMPT</span>
                      <span style={{...s.folderFieldValue,color:"#dc2626",textDecoration:"line-through",opacity:0.7}}>{firstAnswer.toUpperCase()}</span>
                    </div>
                  )}
                  <div style={s.folderField}>
                    <span style={s.folderFieldLabel}>OUTCOME</span>
                    {isCorrect ? (
                      <div>
                        <span style={s.folderFieldValue}>{CURRENT_DAY.label}</span>
                        <div style={{marginTop:6,display:"inline-block",border:"2px solid #15803d",padding:"2px 8px",transform:"rotate(-2deg)",transformOrigin:"left center"}}>
                          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.16em",color:"#15803d",fontFamily:"'Courier New',Courier,monospace",whiteSpace:"nowrap"}}>DEPARTMENT CONFIRMED</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{...s.folderFieldValue,color:"#dc2626"}}>{answer.toUpperCase()}</span>
                        <div style={{marginTop:6,display:"inline-block",border:"2px solid #dc2626",padding:"2px 8px",transform:"rotate(-2deg)",transformOrigin:"left center"}}>
                          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.16em",color:"#dc2626",fontFamily:"'Courier New',Courier,monospace",whiteSpace:"nowrap"}}>TRANSFERRED</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {!isCorrect && (
                    <div style={s.folderField}>
                      <span style={s.folderFieldLabel}>ACTUAL DEPARTMENT</span>
                      <RedactedReveal text={CURRENT_DAY.label} />
                    </div>
                  )}
                </div>
              </div>
              <div style={s.folderSpine}></div>
              {/* RIGHT — stamp */}
              <div style={{...s.folderRight,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"10px 0"}}>
                <motion.div
                  initial={{scale:1.8,opacity:0,rotate:-8}}
                  animate={{scale:1,opacity:0.92,rotate:-4}}
                  transition={{delay:0.3,type:"spring",stiffness:220,damping:14}}
                  onAnimationComplete={()=>playStamp()}
                  style={{border:`4px solid ${isCorrect?"#15803d":"#dc2626"}`,padding:"10px 20px",opacity:0.88}}
                >
                  <span style={{fontSize:20,fontWeight:700,letterSpacing:"0.12em",color:isCorrect?"#15803d":"#dc2626",fontFamily:"'Special Elite',cursive",whiteSpace:"nowrap"}}>
                    {isCorrect ? "CASE CLOSED" : "CASE OPEN"}
                  </span>
                </motion.div>
                <div style={{height:1,width:"80%",background:"rgba(58,74,138,0.15)"}}></div>
                <div style={{textAlign:"center"}}>
                  <span style={{display:"block",fontFamily:"'VT323',monospace",fontSize:12,letterSpacing:"0.14em",color:"#8a9ac8",marginBottom:4}}>INVESTIGATION REFERENCE</span>
                  <span style={{fontSize:11,color:"#1e3a7a",fontFamily:"'Courier New',Courier,monospace"}}>SC-INV-{getTodayString()}</span>
                </div>
              </div>
            </div>
            <div style={s.folderFooter}>
              <span style={s.folderFooterText}>Sun Country Airlines · Internal Investigations · Eyes Only</span>
              <span style={{...s.folderFooterText,color:"rgba(90,106,154,0.35)"}}>·</span>
              <span style={s.folderFooterText}>SC-INV-{getTodayString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // LOCKOUT
  if (lockedOut) return (
    <div style={s.root}>
      <style>{keyframes}</style>
      <StampFilter />
      <div style={s.bgLayer}><img src={BG_IMAGE} alt="" style={s.bgImg}/></div>
      <div style={s.crtOverlay}></div>
      <div style={s.centeredFill}>
        <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",stiffness:160,damping:18}} style={s.folderWrap}>
          <div style={s.folderTab}>
            <span style={s.folderTabText}>INTERNAL INVESTIGATIONS</span>
            <span style={s.folderTabCase}>DAILY BRIEFING</span>
          </div>
          <div style={s.folderBody}>
            <div style={s.paperLines}></div>
            <div style={s.paperGrain}></div>
            <div style={s.paperYellow}></div>
            <div style={s.folderColumns}>
              <div style={{...s.folderLeft,boxShadow:"4px 0 12px rgba(0,0,0,0.06)"}}>
                <p style={s.folderTitle}>Access Denied</p>
                <p style={s.folderSuspect}>Re: Carmen Sandiego</p>
                <div style={s.folderDivider}></div>
                <div style={s.folderFields}>
                  <div style={s.folderField}><span style={s.folderFieldLabel}>STATUS</span><span style={{...s.folderFieldValue,color:"#dc2626"}}>Report Already Filed Today</span></div>
                  <div style={s.folderField}><span style={s.folderFieldLabel}>NEXT BRIEFING</span><span style={s.folderFieldValue}>Tomorrow — New Case Awaits</span></div>
                </div>
              </div>
              <div style={s.folderSpine}></div>
              <div style={{...s.folderRight,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
                <motion.div initial={{scale:1.8,opacity:0,rotate:-8}} animate={{scale:1,opacity:0.88,rotate:-4}} transition={{delay:0.3,type:"spring",stiffness:220,damping:14}} onAnimationComplete={()=>playStamp()} style={{border:"4px solid #dc2626",padding:"10px 20px"}}>
                  <span style={{fontSize:20,fontWeight:700,letterSpacing:"0.12em",color:"#dc2626",fontFamily:"'Special Elite',cursive",whiteSpace:"nowrap"}}>CASE CLOSED</span>
                </motion.div>
                <button onClick={()=>{localStorage.removeItem(LOCKOUT_KEY);window.location.reload();}} style={s.newMissionBtn}>Assign Me A New Mission</button>
              </div>
            </div>
            <div style={s.folderFooter}><span style={s.folderFooterText}>Sun Country Airlines · Internal Investigations · {new Date().getFullYear()}</span></div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // MAIN DOSSIER
  return (
    <div style={{...s.root,animation:"flicker 8s ease-in-out infinite"}}>
      <style>{keyframes}</style>
      <StampFilter />
      <div style={s.bgLayer}><img src={BG_IMAGE} alt="" style={s.bgImg}/></div>
      <div style={s.crtOverlay}></div>

      {/* Email notification */}
      {phase === "email" && <ChiefEmail agentName={agentName} agentEmail={agentEmail} onDismiss={handleEmailDismiss} />}

      {/* Chief reply after correct answer filed */}
      {chiefReply && (
        <motion.div initial={{x:320,opacity:0}} animate={{x:0,opacity:1}} transition={{type:"spring",stiffness:280,damping:24}} style={{...s.emailToast,borderLeft:"3px solid #15803d",top:24}}>
          <div style={{...s.emailToastIcon,background:"#15803d"}}>
            <span style={{fontFamily:"'Special Elite',cursive",fontSize:13,color:"#fff",fontWeight:700}}>C</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Special Elite',cursive",fontSize:13,color:"#15803d",fontWeight:700}}>The Chief</div>
            <div style={{fontFamily:"'VT323',monospace",fontSize:12,color:"#5a6a9a",letterSpacing:"0.04em"}}>Outstanding work, {firstName(agentName)}. Department confirmed.</div>
          </div>
        </motion.div>
      )}

      {flashGreen && <div style={{position:"fixed",inset:0,zIndex:3,pointerEvents:"none",background:"rgba(34,197,94,0.35)",animation:"greenFlash 1.2s ease-in-out forwards"}}></div>}
      {flashRed && <div style={{position:"fixed",inset:0,zIndex:3,pointerEvents:"none",background:"rgba(160,0,0,0.65)"}}></div>}

      <motion.div
        style={{...s.outer,animation:glitch?"glitchShift 0.12s steps(4) forwards":"none"}}
        initial={{y:32,opacity:0}}
        animate={{y:phase==="email"?32:0,opacity:phase==="email"?0:1}}
        transition={{type:"spring",stiffness:140,damping:18}}
      >
        {/* Header */}
        <div style={s.headerBar}>
          <div style={s.headerLeft}>
            <span style={{...s.orgLabel,fontFamily:"'Special Elite',cursive",fontSize:12,letterSpacing:"0.08em"}}>Sun Country Airlines</span>
            <span style={s.divider}>·</span>
            <span style={{...s.orgLabel,fontFamily:"'VT323',monospace",fontSize:14,letterSpacing:"0.18em"}}>INTERNAL INVESTIGATIONS</span>
          </div>
          <div style={s.caseTag}>CASE SC-INV-{getTodayString()}</div>
        </div>

        <div style={s.card}>
          <div style={s.paperLines}></div>
          <div style={s.paperGrain}></div>
          <div style={s.paperYellow}></div>
          <div style={s.paperMargin}></div>

          {/* Top strip */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:phase==="dossier"?1:0,y:0}} transition={{delay:0.05,type:"spring",stiffness:180,damping:20}} style={s.cardTopStrip}>
            <div style={s.classifiedBadge}>CONFIDENTIAL</div>
            <div style={s.topRight}>
              <span style={s.dateStamp}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase()}</span>
              <span style={s.priorityTag}>PRIORITY: URGENT</span>
            </div>
          </motion.div>

          <div style={s.folderColumns}>
            {/* LEFT — suspect profile */}
            <div style={s.folderLeft}>
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:phase==="dossier"?1:0,y:0}} transition={{delay:0.15,type:"spring",stiffness:180,damping:20}}>
                <div style={s.suspectHeader}>
                  <div style={s.suspectProfileRow}>
                    <div style={s.suspectNameBlock}>
                      <p style={s.suspectName}>Carmen Sandiego</p>
                      <p style={s.suspectAlias}>"The Red Shadow"</p>
                      <div style={s.suspectBadges}>
                        <span style={s.suspectBadgeDanger}>UNDER INVESTIGATION</span>
                        <span style={s.suspectBadgeWarn}>THREAT: HIGH</span>
                      </div>
                    </div>
                  </div>
                  <div style={s.suspectGrid}>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>EMPLOYEE ID</span><span style={s.fieldValue}>SC-2026-????</span></div>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>START DATE</span><span style={s.fieldValue}>Unknown</span></div>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>LAST BADGE SCAN</span><span style={s.fieldValue}>T2-MSP</span></div>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>HAIR</span><span style={s.fieldValue}>Dark Brown</span></div>
                    <div style={{...s.suspectGridItem,gridColumn:"1 / -1",background:"rgba(220,38,38,0.07)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:4,padding:"8px 10px",marginTop:4}}>
                      <div style={{display:"flex",gap:20}}>
                        <div><span style={{...s.fieldLabel,color:"#dc2626",fontSize:13}}>ARMED</span><span style={{display:"block",color:"#b91c1c",fontSize:16,fontFamily:"'Crimson Pro',Georgia,serif",fontWeight:700,lineHeight:1.3}}>Unknown</span></div>
                        <div><span style={{...s.fieldLabel,color:"#dc2626",fontSize:13}}>APPROACH</span><span style={{display:"block",color:"#b91c1c",fontSize:16,fontFamily:"'Crimson Pro',Georgia,serif",fontWeight:700,lineHeight:1.3}}>With Caution</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0,y:16}} animate={{opacity:phase==="dossier"?1:0,y:0}} transition={{delay:0.25,type:"spring",stiffness:180,damping:20}}>
                <div style={s.sectionDivider}>
                  <div style={{...s.sectionRule,flex:"0 0 12px"}}></div>
                  <span style={s.sectionLabel}>PRIOR DEPARTMENTS</span>
                  <span style={{color:"rgba(58,74,138,0.3)",fontSize:10,margin:"0 2px"}}>›</span>
                  <div style={s.sectionRule}></div>
                </div>
                <div style={s.sightingsTable}>
                  <div style={s.sightingsHeader}>
                    <span style={{...s.sightingsCell,flex:1}}>DEPARTMENT</span>
                    <span style={{...s.sightingsCell,flex:"0 0 70px",textAlign:"right"}}>STATUS</span>
                  </div>
                  {CURRENT_DAY.previousDepts.length === 0 ? (
                    <div style={{padding:"10px",fontFamily:"'VT323',monospace",fontSize:13,color:"#8a9ac8",letterSpacing:"0.06em"}}>No prior sightings this week.</div>
                  ) : CURRENT_DAY.previousDepts.map((d,i) => (
                    <div key={i} style={{...s.sightingsRow,borderBottom:i<CURRENT_DAY.previousDepts.length-1?"1px solid rgba(58,74,138,0.1)":"none",opacity:0.75}}>
                      <div style={{flex:1,position:"relative"}}>
                        <span style={{...s.sightingsValue,display:"block",position:"relative"}}>
                          {d.name}
                          <span style={{position:"absolute",left:"-2px",right:"-2px",top:"50%",transform:"translateY(-52%) rotate(-1.2deg)",height:"5px",background:"rgba(185,28,28,0.72)",borderRadius:"2px",filter:"blur(0.6px)",pointerEvents:"none",display:"block"}}></span>
                        </span>
                        <span style={{...s.sightingsDate,display:"block"}}>{d.date}</span>
                      </div>
                      <span style={{...s.sightingsStatus,flex:"0 0 70px",textAlign:"right",color:"#dc2626"}}>FIRED</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div style={s.folderSpine}></div>

            {/* RIGHT — intel + input */}
            <motion.div
              style={s.folderRight}
              initial={{opacity:0,y:16}}
              animate={{opacity:phase==="dossier"?1:0,y:0}}
              transition={{delay:0.35,type:"spring",stiffness:180,damping:20}}
            >
              <div style={s.sectionDivider}>
                <div style={{...s.sectionRule,flex:"0 0 12px"}}></div>
                <span style={s.sectionLabel}>INTELLIGENCE BRIEFING</span>
                <span style={{color:"rgba(58,74,138,0.3)",fontSize:10,margin:"0 2px"}}>›</span>
                <div style={s.sectionRule}></div>
              </div>

              <div style={s.clueBox}>
                <span style={s.clueTitle}>INTEL REPORT</span>
                <p style={s.clueText}>{CURRENT_DAY.clue}</p>
                <div style={s.directiveLine}></div>
                <p style={s.clueQuestion}>Which department is Carmen hiding in?</p>
              </div>

              <AnimatePresence mode="wait">
                {!scanning && !decrypting && !showResult && (
                  <motion.div key="input" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} style={s.inputSection}>
                    <label style={s.inputLabel}>Enter Department Name</label>
                    <div style={s.inputRow}>
                      <input
                        ref={inputRef}
                        value={answer}
                        onChange={e=>setAnswer(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&answer.trim()&&handleSubmit()}
                        style={s.input}
                        placeholder="e.g. Marketing, Finance, IT..."
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!answer.trim()}
                        onMouseEnter={e=>{if(answer.trim())e.target.style.background="#1e3a7a";}}
                        onMouseLeave={e=>{e.target.style.background="#2d4eb0";}}
                        onMouseDown={e=>{e.target.style.background="#152b7a";e.target.style.transform="scale(0.98)";}}
                        onMouseUp={e=>{e.target.style.background="#1e3a7a";e.target.style.transform="scale(1)";}}
                        style={{...s.trackBtn,opacity:answer.trim()?1:0.45,cursor:answer.trim()?"pointer":"not-allowed",animation:answer.trim()?"btnPulse 1.8s ease-in-out infinite":"none",transition:"background 0.1s,transform 0.08s"}}
                      >
                        File Intelligence
                      </button>
                    </div>
                  </motion.div>
                )}

                {scanning && (
                  <motion.div key="scanning" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={s.scanSection}>
                    <div style={s.scanTitleBar}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"#dc2626",display:"inline-block"}}></span>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"#facc15",display:"inline-block"}}></span>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}></span>
                      <span style={{fontSize:11,color:"rgba(34,197,94,0.5)",letterSpacing:"0.1em",marginLeft:6,fontFamily:"'VT323',monospace"}}>SC-INTERNAL-NETWORK — ACTIVE SEARCH</span>
                    </div>
                    <div style={s.scanBody}>
                      <div style={s.scanHeader}>
                        <span style={{...s.scanDot,animation:"pulse 1.2s ease-in-out infinite"}}></span>
                        <span style={s.scanTitle}>SEARCHING INTERNAL DIRECTORIES...</span>
                      </div>
                      <p style={s.scanMessage}>Cross-referencing employee database...</p>
                      <p style={{fontFamily:"'VT323',monospace",fontSize:13,color:"#86efac",letterSpacing:"0.06em",margin:"0 0 10px"}}>Scanning department records...</p>
                      <div style={s.progressBar}>
                        <div style={{...s.progressFill,width:`${scanProgress}%`,transition:"width 0.15s ease-out"}}></div>
                      </div>
                      <p style={s.scanProgress}>{scanProgress}%</p>
                    </div>
                  </motion.div>
                )}

                {decrypting && (
                  <motion.div key="decrypting" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={s.scanSection}>
                    <div style={s.scanTitleBar}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"#dc2626",display:"inline-block"}}></span>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"#facc15",display:"inline-block"}}></span>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}></span>
                      <span style={{fontSize:11,color:"rgba(250,204,21,0.5)",letterSpacing:"0.1em",marginLeft:6,fontFamily:"'VT323',monospace"}}>SC-INTERNAL-NETWORK — ANALYZING</span>
                    </div>
                    <div style={s.scanBody}>
                      <div style={s.scanHeader}>
                        <span style={{...s.scanDot,background:"#facc15",boxShadow:"0 0 6px #facc15",animation:"pulse 0.5s ease-in-out infinite"}}></span>
                        <span style={{...s.scanTitle,color:"#facc15",animation:"decryptPulse 0.5s ease-in-out infinite"}}>ANALYZING RESULTS...</span>
                      </div>
                      <p style={{...s.scanMessage,color:"#fef08a",marginBottom:10}}>Verifying department match...</p>
                      <div style={{...s.progressBar,marginTop:0}}>
                        <div style={{...s.progressFill,width:"100%",animation:"barFlash 0.3s steps(2) infinite"}}></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showResult && (
                  <motion.div key="result" initial={{opacity:0}} animate={{opacity:1}} style={s.resultSection}>
                    <div style={{...s.resultBanner,borderColor:isCorrect?"#16a34a":"#dc2626",background:isCorrect?"rgba(74,222,128,0.06)":"rgba(248,113,113,0.06)"}}>
                      <div style={s.resultTagRow}>
                        <motion.div
                          initial={{scale:1.8,opacity:0,rotate:-8}}
                          animate={{scale:1,opacity:0.92,rotate:-2}}
                          transition={{delay:0.1,type:"spring",stiffness:260,damping:16}}
                          onAnimationComplete={()=>playStamp()}
                          style={{display:"inline-block",border:`3px solid ${isCorrect?"#16a34a":"#dc2626"}`,padding:"4px 14px",transformOrigin:"left center"}}
                        >
                          <span style={{color:isCorrect?"#16a34a":"#dc2626",fontSize:18,fontFamily:"'VT323',monospace",letterSpacing:"0.18em"}}>
                            {isCorrect ? "DEPARTMENT CONFIRMED" : "DEPARTMENT UNKNOWN"}
                          </span>
                        </motion.div>
                      </div>
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.55}}>
                        <VerdictLine
                          text={isCorrect ? `Outstanding work, ${firstName(agentName)}. She's been tracked to ${CURRENT_DAY.label}.` : transferMsg}
                          color={isCorrect?"#166534":"#991b1b"}
                        />
                        {isCorrect && <p style={{fontFamily:"'VT323',monospace",fontSize:14,color:"#166534",margin:"4px 0 0",letterSpacing:"0.06em"}}>Carmen has been located in the {CURRENT_DAY.dept}.</p>}
                      </motion.div>
                    </div>

                    {!isCorrect && canRetry && (
                      <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:0.4}} style={s.retryBox}>
                        <div style={{flex:1}}>
                          <span style={{display:"block",fontFamily:"'VT323',monospace",fontSize:14,letterSpacing:"0.14em",color:"#7f1d1d",marginBottom:4}}>REASSIGNMENT AVAILABLE</span>
                          <p style={{fontSize:11,color:"#78350f",margin:0,fontFamily:"'Courier New',Courier,monospace",letterSpacing:"0.02em",lineHeight:1.4}}>One retry permitted. First attempt remains on record.</p>
                        </div>
                        <button onClick={handleRetry} style={s.retryBtn}>Request Reassignment</button>
                      </motion.div>
                    )}

                    <div style={{marginTop:4,position:"relative",zIndex:1}}>
                      <label style={s.inputLabel}>Confirm Agent Identity</label>
                      <div style={{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:15,color:"#1e3a7a",fontWeight:600,marginBottom:12,padding:"8px 12px",background:"rgba(30,58,122,0.06)",border:"1px solid rgba(30,58,122,0.15)",borderRadius:4}}>
                        {agentName} — {agentEmail}
                      </div>
                      <button
                        onClick={handleFinalSubmit}
                        disabled={submitting}
                        style={{...s.submitBtn,opacity:submitting?0.5:1,cursor:submitting?"not-allowed":"pointer",animation:!submitting?"btnPulse 1.8s ease-in-out infinite":"none"}}
                      >
                        {submitting ? "Filing Report..." : "File Report"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div style={s.cardFooter}>
            <span style={s.footerText}>Sun Country Airlines · Internal Investigations · Eyes Only</span>
            <span style={{...s.footerText,color:"rgba(90,106,154,0.35)"}}>·</span>
            <span style={s.footerText}>SC-INV-{getTodayString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── FINALE ────────────────────────────────────────────────────────────────────
function FinaleScreen() {
  const stampRotations = [-2,-3,-1.5,-2.5,-1,-3.5];
  const WEEK_DEPTS = [
    {name:"Central Reservations Control",code:"CRC",date:"MON",fired:true},
    {name:"Social Media",code:"SOCIAL",date:"WED",fired:true},
    {name:"Training",code:"TRN",date:"FRI",fired:true},
    {name:"Call Center Operations",code:"CCO",date:"SAT",fired:false},
  ];
  const keyframes = `
    @keyframes stampIn{0%{opacity:0;transform:rotate(-4deg) scale(1.4)}60%{opacity:1;transform:rotate(-2deg) scale(0.95)}100%{opacity:1;transform:rotate(-2deg) scale(1)}}
    @keyframes unredact{0%{width:100%}100%{width:0%}}
    @keyframes flicker{0%,100%{opacity:1}93%{opacity:0.97}}
  `;
  return (
    <div style={s.root}>
      <style>{keyframes}</style>
      <StampFilter />
      <div style={s.bgLayer}><img src="/background.png" alt="" style={s.bgImg}/></div>
      <div style={s.crtOverlay}></div>
      <div style={s.centeredFill}>
        <div style={{width:"100%",maxWidth:1100,position:"relative",zIndex:10}}>
          <div style={s.headerBar}>
            <div style={s.headerLeft}>
              <span style={{...s.orgLabel,fontFamily:"'Special Elite',cursive",fontSize:12,letterSpacing:"0.08em"}}>Sun Country Airlines</span>
              <span style={s.divider}>·</span>
              <span style={{...s.orgLabel,fontFamily:"'VT323',monospace",fontSize:14,letterSpacing:"0.18em"}}>INTERNAL INVESTIGATIONS</span>
            </div>
            <div style={s.caseTag}>FINAL BRIEFING</div>
          </div>
          <div style={s.card}>
            <div style={s.paperLines}></div>
            <div style={s.paperGrain}></div>
            <div style={s.paperYellow}></div>
            <div style={s.cardTopStrip}>
              <motion.div initial={{scale:1.5,opacity:0,rotate:-4}} animate={{scale:1,opacity:0.88,rotate:-2}} transition={{delay:0.3,type:"spring",stiffness:220,damping:14}} onAnimationComplete={()=>playStamp()} style={{border:"3px solid #15803d",padding:"4px 10px",display:"inline-block",filter:"url(#stampFilter)"}}>
                <span style={{fontSize:14,fontWeight:700,letterSpacing:"0.18em",color:"#15803d",fontFamily:"'Courier New',Courier,monospace"}}>CASE CLOSED</span>
              </motion.div>
              <div style={s.topRight}>
                <span style={s.dateStamp}>FINAL WEEK RECAP</span>
                <span style={{...s.priorityTag,color:"#15803d",borderColor:"rgba(21,128,61,0.4)"}}>INVESTIGATION: COMPLETE</span>
              </div>
            </div>
            <div style={s.folderColumns}>
              <motion.div style={s.folderLeft} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2,type:"spring",stiffness:180,damping:20}}>
                <div style={s.suspectHeader}>
                  <div style={s.suspectProfileRow}>
                    <div style={s.suspectNameBlock}>
                      <p style={s.suspectName}>Carmen Sandiego</p>
                      <p style={s.suspectAlias}>"The Red Shadow"</p>
                      <div style={s.suspectBadges}>
                        <span style={{...s.suspectBadgeDanger,background:"#15803d"}}>TERMINATED</span>
                        <span style={s.suspectBadgeWarn}>THREAT: NEUTRALIZED</span>
                      </div>
                    </div>
                  </div>
                  <div style={s.suspectGrid}>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>FINAL DEPT</span><span style={s.fieldValue}>CCO</span></div>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>APPREHENDED</span><span style={s.fieldValue}>This Week</span></div>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>DEPTS INFILTRATED</span><span style={s.fieldValue}>4</span></div>
                    <div style={s.suspectGridItem}><span style={s.fieldLabel}>REPORTS FILED</span><span style={s.fieldValue}>209</span></div>
                    <div style={{...s.suspectGridItem,gridColumn:"1/-1"}}><span style={s.fieldLabel}>REWARD TOTAL</span><span style={{...s.fieldValue,color:"#15803d",fontSize:16}}>$600</span></div>
                  </div>
                </div>
                <div style={s.sectionDivider}>
                  <div style={{...s.sectionRule,flex:"0 0 12px"}}></div>
                  <span style={s.sectionLabel}>WEEK IN REVIEW</span>
                  <span style={{color:"rgba(58,74,138,0.3)",fontSize:10,margin:"0 2px"}}>›</span>
                  <div style={s.sectionRule}></div>
                </div>
                <div style={s.sightingsTable}>
                  <div style={s.sightingsHeader}>
                    <span style={{...s.sightingsCell,flex:1}}>DEPARTMENT</span>
                    <span style={{...s.sightingsCell,flex:"0 0 50px",textAlign:"center"}}>CODE</span>
                    <span style={{...s.sightingsCell,flex:"0 0 50px",textAlign:"right"}}>STATUS</span>
                  </div>
                  {WEEK_DEPTS.map((d,i)=>(
                    <div key={i} style={{...s.sightingsRow,borderBottom:i<WEEK_DEPTS.length-1?"1px solid rgba(58,74,138,0.1)":"none"}}>
                      <div style={{flex:1,position:"relative"}}>
                        <span style={{...s.sightingsValue,display:"block",position:"relative"}}>
                          {d.name}
                          {d.fired&&<span style={{position:"absolute",left:"-2px",right:"-2px",top:"50%",transform:"translateY(-52%) rotate(-1.2deg)",height:"5px",background:"rgba(185,28,28,0.72)",borderRadius:"2px",filter:"blur(0.6px)",pointerEvents:"none",display:"block"}}></span>}
                        </span>
                      </div>
                      <span style={{...s.sightingsCode,flex:"0 0 50px",textAlign:"center"}}>{d.code}</span>
                      <span style={{...s.sightingsStatus,flex:"0 0 50px",textAlign:"right",color:d.fired?"#dc2626":"#15803d"}}>{d.fired?"FIRED":"CAUGHT"}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <div style={s.folderSpine}></div>
              <motion.div style={{...s.folderRight,display:"flex",flexDirection:"column"}} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35,type:"spring",stiffness:180,damping:20}}>
                <div style={{...s.clueBox,marginBottom:18}}>
                  <span style={{...s.clueTitle,background:"#15803d"}}>FINAL TRANSMISSION</span>
                  <p style={s.clueText}>Carmen Sandiego has been apprehended after infiltrating four Sun Country departments. Six agents cracked the case and have each earned the reward. The Pursuit Division thanks all agents for their service this week. Case closed.</p>
                  <p style={{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:13,fontStyle:"italic",color:"#78350f",margin:"6px 0 0",lineHeight:1.5}}>— The Chief, Sun Country Internal Investigations</p>
                </div>
                <div style={s.sectionDivider}>
                  <div style={{...s.sectionRule,flex:"0 0 12px"}}></div>
                  <span style={s.sectionLabel}>REWARD RECIPIENTS</span>
                  <span style={{color:"rgba(58,74,138,0.3)",fontSize:10,margin:"0 2px"}}>›</span>
                  <div style={s.sectionRule}></div>
                </div>
                <p style={{fontFamily:"'VT323',monospace",fontSize:12,color:"#8a9ac8",letterSpacing:"0.1em",marginBottom:10,position:"relative",zIndex:1}}>THE FOLLOWING AGENTS ARE EACH AWARDED $100</p>
                {FINALE_WINNERS.map((w,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.5+i*0.08,type:"spring",stiffness:200,damping:20}} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 14px",background:"rgba(21,128,61,0.05)",border:"1px solid rgba(21,128,61,0.2)",borderRadius:4,marginBottom:7,position:"relative",zIndex:1}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"#15803d",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontFamily:"'Special Elite',cursive",fontSize:15,color:"#fff",fontWeight:700}}>{w.name.charAt(0)}</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Special Elite',cursive",fontSize:14,color:"#1e3a7a",fontWeight:700}}>{w.name}</div>
                      <div style={{fontFamily:"'VT323',monospace",fontSize:12,color:"#8a9ac8",letterSpacing:"0.08em"}}>{w.dept}</div>
                    </div>
                    <div style={{border:"2px solid #15803d",padding:"3px 10px",transform:`rotate(${stampRotations[i]}deg)`,flexShrink:0}}>
                      <span style={{fontFamily:"'Courier New',Courier,monospace",fontSize:12,fontWeight:700,color:"#15803d"}}>$100</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div style={s.cardFooter}>
              <span style={s.footerText}>Sun Country Airlines · Internal Investigations · Eyes Only</span>
              <span style={{...s.footerText,color:"rgba(90,106,154,0.35)"}}>·</span>
              <span style={{...s.footerText,color:"#15803d",letterSpacing:"0.14em"}}>✓ CASE CLOSED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  // Root & layout
  root: {minHeight:"100vh",background:"#050a14",display:"flex",alignItems:"flex-start",justifyContent:"center",fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif",padding:"16px",position:"relative",overflow:"hidden"},
  bgLayer: {position:"fixed",inset:0,zIndex:0,pointerEvents:"none",filter:"sepia(0.05)",overflow:"hidden"},
  bgImg: {position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",minWidth:"100%",minHeight:"100%",width:"auto",height:"auto",display:"block"},
  crtOverlay: {position:"fixed",inset:0,zIndex:99,pointerEvents:"none",backgroundImage:["repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)","radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(0,0,0,0.35) 100%)"].join(","),backgroundSize:"100% 4px,100% 100%"},
  centeredFill: {display:"flex",alignItems:"center",justifyContent:"center",width:"100%",position:"relative",zIndex:10},
  outer: {width:"100%",maxWidth:1100,position:"relative",zIndex:10},

  // Login
  loginRoot: {minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",background:"#050a14",fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif"},
  loginBg: {position:"fixed",inset:0,overflow:"hidden",zIndex:0},
  loginBgImg: {position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",minWidth:"100%",minHeight:"100%",width:"auto",height:"auto",filter:"sepia(0.05)"},
  loginOverlay: {position:"fixed",inset:0,background:"rgba(0,5,20,0.65)",zIndex:1},
  loginWindow: {width:"100%",maxWidth:420,position:"relative",zIndex:10,borderRadius:8,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.8)"},
  winTitleBar: {background:"#d0d4dc",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  winTitle: {fontFamily:"'VT323',monospace",fontSize:12,color:"#4a5060",letterSpacing:"0.06em"},
  winBody: {background:"#f0f2f8",padding:"28px 28px 24px"},
  loginLogoArea: {display:"flex",alignItems:"center",gap:12,marginBottom:20},
  loginDivider: {height:1,background:"#c5cce8",marginBottom:20},
  loginFieldLabel: {fontSize:12,color:"#5a6a9a",fontFamily:"'VT323',monospace",letterSpacing:"0.1em",marginBottom:6,display:"block"},
  loginInput: {width:"100%",boxSizing:"border-box",padding:"10px 12px",fontSize:13,fontFamily:"'Courier New',Courier,monospace",border:"1.5px solid #c5cce8",borderRadius:4,background:"#fff",color:"#1e3a7a",outline:"none",letterSpacing:"0.04em",marginBottom:8},
  loginError: {fontSize:11,color:"#dc2626",fontFamily:"'Courier New',Courier,monospace",marginBottom:8,letterSpacing:"0.02em"},
  loginBtn: {width:"100%",padding:"11px 0",background:"#2d4eb0",color:"#fff",border:"none",borderRadius:4,fontSize:12,fontWeight:700,letterSpacing:"0.1em",fontFamily:"'Courier New',Courier,monospace",cursor:"pointer"},
  loginHint: {textAlign:"center",fontSize:10,color:"#8a9ac8",marginTop:10,fontFamily:"'VT323',monospace",letterSpacing:"0.08em"},
  loginProgressTrack: {height:8,background:"#d0d4dc",borderRadius:4,overflow:"hidden"},
  loginProgressFill: {height:"100%",background:"linear-gradient(90deg,#1e3a7a,#4a7adc)",borderRadius:4,transition:"width 0.1s"},

  // Email toast & modal
  emailToast: {position:"fixed",top:24,right:24,zIndex:200,background:"#f0f2f8",border:"2px solid #1e3a7a",borderRadius:10,padding:"18px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",width:380,boxShadow:"0 12px 40px rgba(0,0,0,0.6)",animation:"emailPulse 1.8s ease-in-out infinite"},
  emailToastIcon: {width:48,height:48,borderRadius:"50%",background:"#1e3a7a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  emailModalBackdrop: {position:"fixed",inset:0,zIndex:150,background:"rgba(0,5,20,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:24},
  emailModal: {width:"100%",maxWidth:560,borderRadius:8,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.8)"},
  emailTitleBar: {background:"#d0d4dc",padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  emailBody: {background:"#f8f9fc"},
  emailHeader: {padding:"20px 20px 0"},
  emailAvatarChief: {width:42,height:42,borderRadius:"50%",background:"#1e3a7a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  emailSubject: {fontFamily:"'Special Elite',cursive",fontSize:14,color:"#1e3a7a",fontWeight:700,padding:"12px 0",borderBottom:"1px solid #e0e4f0"},
  emailContent: {padding:"16px 20px"},
  emailP: {fontFamily:"'Crimson Pro',Georgia,serif",fontSize:15,color:"#1e3a7a",lineHeight:1.7,margin:"0 0 12px"},
  emailBtn: {background:"#1e3a7a",color:"#fff",border:"none",borderRadius:4,padding:"10px 20px",fontFamily:"'Courier New',Courier,monospace",fontSize:12,fontWeight:700,letterSpacing:"0.08em",cursor:"pointer"},

  // Header
  headerBar: {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 20px",background:"#1e3a7a",borderRadius:"6px 6px 0 0",borderBottom:"3px solid #152b7a"},
  headerLeft: {display:"flex",alignItems:"center",gap:10},
  orgLabel: {color:"#fff",fontSize:10,fontWeight:700,letterSpacing:"0.14em"},
  divider: {color:"rgba(255,255,255,0.35)",fontSize:10},
  caseTag: {color:"#fff",fontSize:10,fontWeight:700,letterSpacing:"0.1em",background:"rgba(0,0,0,0.3)",padding:"3px 10px",borderRadius:3,border:"1px solid rgba(255,255,255,0.15)"},

  // Card / paper
  card: {background:"linear-gradient(160deg,#f0f4ff 0%,#e8eeff 40%,#dde4ff 100%)",border:"2px solid #3a4a8a",borderTop:"none",borderRadius:"0 0 12px 12px",padding:"24px 28px 20px",boxShadow:"4px 8px 0 rgba(0,0,0,0.15),0 24px 60px rgba(0,0,0,0.75),inset 0 0 40px rgba(30,58,122,0.06)",position:"relative",overflow:"hidden"},
  paperLines: {position:"absolute",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:["repeating-linear-gradient(transparent,transparent 27px,rgba(58,74,138,0.07) 27px,rgba(58,74,138,0.07) 28px)","radial-gradient(ellipse at 0% 0%,rgba(30,58,122,0.05) 0%,transparent 55%)","radial-gradient(ellipse at 100% 100%,rgba(30,58,122,0.06) 0%,transparent 55%)"].join(","),backgroundSize:"100% 28px,100% 100%,100% 100%",backgroundPositionY:"8px,0,0"},
  paperGrain: {position:"absolute",inset:0,pointerEvents:"none",zIndex:0,opacity:0.04,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",backgroundRepeat:"repeat",backgroundSize:"180px 180px"},
  paperYellow: {position:"absolute",left:0,right:0,top:0,height:"45%",pointerEvents:"none",zIndex:0,background:"linear-gradient(to bottom,rgba(58,74,138,0.05) 0%,transparent 100%)"},
  paperMargin: {position:"absolute",top:0,bottom:0,left:"calc(30% + 27px)",width:"1px",background:"rgba(58,74,138,0.2)",pointerEvents:"none",zIndex:1},

  // Card top strip
  cardTopStrip: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,position:"relative",zIndex:1},
  classifiedBadge: {color:"#1e3a7a",fontSize:14,fontWeight:700,letterSpacing:"0.18em",padding:"4px 10px",border:"3px solid #1e3a7a",borderRadius:3,display:"inline-block",opacity:0.85,animation:"stampIn 0.5s ease-out forwards",transformOrigin:"center",filter:"url(#stampFilter)"},
  topRight: {display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4},
  dateStamp: {fontSize:9,fontWeight:700,color:"#3a4a8a",letterSpacing:"0.1em"},
  priorityTag: {fontSize:9,fontWeight:700,color:"#dc2626",letterSpacing:"0.1em",border:"1px solid rgba(220,38,38,0.4)",padding:"2px 6px",borderRadius:2,display:"inline-block",transform:"rotate(1.5deg)"},

  // Columns
  folderColumns: {display:"flex",gap:0,alignItems:"stretch",marginBottom:0},
  folderLeft: {flex:"0 0 30%",paddingRight:20},
  folderSpine: {flex:"0 0 1px",background:"rgba(58,74,138,0.2)",alignSelf:"stretch",margin:"0 20px"},
  folderRight: {flex:1,minWidth:0},

  // Suspect block
  suspectHeader: {marginBottom:16,padding:"14px",background:"rgba(30,58,122,0.04)",borderRadius:6,border:"1px solid rgba(58,74,138,0.2)",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.04)",position:"relative",zIndex:1},
  suspectProfileRow: {display:"flex",gap:12,alignItems:"flex-start",marginBottom:12,paddingBottom:12,borderBottom:"1px solid rgba(58,74,138,0.15)"},
  suspectNameBlock: {flex:1,minWidth:0},
  suspectName: {fontSize:22,fontWeight:700,color:"#0f1f4a",margin:"0 0 2px",letterSpacing:"0.02em",fontFamily:"'Special Elite',cursive"},
  suspectAlias: {fontSize:12,color:"#3a4a8a",fontStyle:"italic",margin:"0 0 8px",fontFamily:"'Crimson Pro',Georgia,serif",letterSpacing:"0.02em"},
  suspectBadges: {display:"flex",gap:5,flexWrap:"wrap"},
  suspectBadgeDanger: {fontSize:8,fontWeight:700,letterSpacing:"0.12em",color:"#fff",background:"#dc2626",padding:"2px 7px",borderRadius:2},
  suspectBadgeWarn: {fontSize:8,fontWeight:700,letterSpacing:"0.12em",color:"#3a4a8a",background:"rgba(58,74,138,0.12)",border:"1px solid rgba(58,74,138,0.25)",padding:"2px 7px",borderRadius:2},
  suspectGrid: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 12px"},
  suspectGridItem: {display:"flex",flexDirection:"column",gap:2},
  fieldLabel: {fontSize:13,fontWeight:400,letterSpacing:"0.14em",color:"#5a6a9a",fontFamily:"'VT323','Courier New',monospace"},
  fieldValue: {fontSize:13,fontWeight:600,color:"#0f1f4a",fontFamily:"'Crimson Pro',Georgia,serif",letterSpacing:"0.01em"},

  // Section dividers
  sectionDivider: {display:"flex",alignItems:"center",gap:10,marginBottom:14,position:"relative",zIndex:1},
  sectionRule: {flex:1,height:1,background:"rgba(58,74,138,0.3)"},
  sectionLabel: {fontSize:13,fontWeight:400,letterSpacing:"0.14em",color:"#3a4a8a",whiteSpace:"nowrap",fontFamily:"'VT323','Courier New',monospace"},

  // Sightings
  sightingsTable: {marginBottom:0,position:"relative",zIndex:1,border:"1px solid rgba(58,74,138,0.2)",borderRadius:4,overflow:"hidden"},
  sightingsHeader: {display:"flex",padding:"4px 10px",background:"rgba(58,74,138,0.08)",borderBottom:"1px solid rgba(58,74,138,0.15)"},
  sightingsCell: {fontSize:13,fontWeight:400,letterSpacing:"0.12em",color:"#3a4a8a",fontFamily:"'VT323','Courier New',monospace"},
  sightingsRow: {display:"flex",padding:"5px 10px",alignItems:"center"},
  sightingsDate: {fontSize:11,color:"#5a6a9a",fontFamily:"'VT323',monospace",letterSpacing:"0.04em"},
  sightingsValue: {fontSize:13,fontWeight:400,color:"#0f1f4a",fontFamily:"'VT323',monospace",letterSpacing:"0.04em"},
  sightingsCode: {fontSize:13,fontWeight:400,color:"#3a4a8a",fontFamily:"'VT323',monospace",letterSpacing:"0.06em"},
  sightingsStatus: {fontSize:12,fontWeight:400,letterSpacing:"0.1em",fontFamily:"'VT323',monospace"},

  // Clue box
  clueBox: {background:"#fff",border:"1px solid rgba(58,74,138,0.2)",borderLeft:"none",borderRadius:2,padding:"14px 18px 14px 32px",marginBottom:20,position:"relative",zIndex:1,overflow:"hidden",boxShadow:"1px 2px 8px rgba(0,0,0,0.08)",backgroundImage:["repeating-linear-gradient(transparent,transparent 31px,rgba(100,140,220,0.35) 31px,rgba(100,140,220,0.35) 32px)","linear-gradient(to right,rgba(58,74,138,0.5) 0px,rgba(58,74,138,0.5) 1px,transparent 1px)"].join(","),backgroundSize:"100% 32px,100% 100%",backgroundPositionY:"0px,0",lineHeight:"32px"},
  clueTitle: {display:"inline-block",fontSize:14,fontWeight:400,letterSpacing:"0.16em",color:"#fff",background:"#1e3a7a",padding:"2px 10px",borderRadius:2,marginBottom:8,fontFamily:"'VT323',monospace"},
  clueText: {fontSize:15,lineHeight:"32px",color:"#0f1f4a",margin:"0 0 0px",fontFamily:"'Crimson Pro',Georgia,serif",fontStyle:"normal",fontWeight:400},
  directiveLine: {height:1,background:"rgba(58,74,138,0.3)",margin:"8px 0",borderTop:"1px dashed rgba(58,74,138,0.35)"},
  clueQuestion: {fontSize:18,fontWeight:700,color:"#1e3a7a",margin:0,letterSpacing:"0.02em",fontFamily:"'Special Elite','Courier New',cursive",lineHeight:"32px"},

  // Input
  inputSection: {marginBottom:8,paddingTop:14,borderTop:"1px dashed rgba(58,74,138,0.15)",position:"relative",zIndex:1},
  inputLabel: {display:"block",fontSize:14,fontWeight:400,letterSpacing:"0.08em",color:"#3a4a8a",marginBottom:8,fontFamily:"'Special Elite','Courier New',cursive"},
  inputRow: {display:"flex",flexDirection:"column",gap:8},
  input: {width:"100%",boxSizing:"border-box",padding:"10px 14px",fontSize:14,fontFamily:"'Courier New',Courier,monospace",border:"1.5px solid #3a4a8a",borderRadius:4,background:"rgba(255,255,255,0.85)",color:"#0f1f4a",outline:"none",letterSpacing:"0.04em"},
  trackBtn: {width:"100%",padding:"10px 0",background:"#2d4eb0",color:"#fff",border:"none",borderRadius:4,fontSize:12,fontWeight:700,letterSpacing:"0.08em",fontFamily:"'Courier New',Courier,monospace",whiteSpace:"nowrap",textAlign:"center"},

  // Scan terminal
  scanSection: {margin:"0 0 8px",border:"1px solid rgba(0,200,60,0.5)",borderRadius:4,position:"relative",zIndex:1,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.5),inset 0 0 30px rgba(0,0,0,0.4)",background:"#071a07",backgroundImage:["repeating-linear-gradient(0deg,rgba(0,0,0,0.35) 0px,rgba(0,0,0,0.35) 1px,transparent 1px,transparent 4px)","radial-gradient(ellipse at 50% 50%,rgba(0,60,0,0.4) 0%,rgba(0,0,0,0.5) 100%)"].join(",")},
  scanTitleBar: {background:"rgba(0,180,60,0.12)",borderBottom:"1px solid rgba(0,180,60,0.2)",padding:"5px 12px",display:"flex",alignItems:"center",gap:8},
  scanBody: {padding:"12px 16px"},
  scanHeader: {display:"flex",alignItems:"center",gap:10,marginBottom:10},
  scanDot: {width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block",boxShadow:"0 0 5px #22c55e",flexShrink:0},
  scanTitle: {fontSize:13,fontWeight:400,letterSpacing:"0.16em",color:"#4ade80",fontFamily:"'VT323',monospace"},
  scanMessage: {fontSize:15,color:"#86efac",fontFamily:"'VT323',monospace",margin:"0 0 6px",letterSpacing:"0.06em",minHeight:20},
  progressBar: {height:8,background:"rgba(0,0,0,0.4)",borderRadius:2,overflow:"hidden",marginBottom:6,marginTop:4,border:"1px solid rgba(0,180,60,0.2)"},
  progressFill: {height:"100%",borderRadius:2,backgroundImage:"linear-gradient(90deg,#15803d,#22c55e)"},
  scanProgress: {fontSize:14,color:"#4ade80",margin:0,textAlign:"right",letterSpacing:"0.08em",fontFamily:"'VT323',monospace"},

  // Result
  resultSection: {marginBottom:4,position:"relative",zIndex:1},
  resultBanner: {border:"1.5px solid",borderRadius:4,padding:"14px 18px",marginBottom:16},
  resultTagRow: {marginBottom:8},
  retryBox: {display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,background:"rgba(127,29,29,0.06)",border:"1px solid rgba(127,29,29,0.2)",borderLeft:"3px solid #7f1d1d",borderRadius:4,padding:"12px 14px",marginBottom:14,position:"relative",zIndex:1},
  retryBtn: {padding:"8px 14px",background:"transparent",color:"#7f1d1d",border:"1.5px solid #7f1d1d",borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:"0.1em",fontFamily:"'Courier New',Courier,monospace",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0},
  submitBtn: {width:"100%",padding:"10px 0",background:"#1e3a7a",color:"#fff",border:"none",borderRadius:4,fontSize:12,fontWeight:700,letterSpacing:"0.08em",fontFamily:"'Courier New',Courier,monospace",whiteSpace:"nowrap",textAlign:"center"},

  // Footer
  cardFooter: {display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20,paddingTop:12,borderTop:"1px solid rgba(58,74,138,0.2)",position:"relative",zIndex:1},
  footerText: {fontSize:13,color:"#5a6a9a",letterSpacing:"0.08em",fontFamily:"'VT323',monospace"},

  // Folder (submitted/lockout screens)
  folderWrap: {width:"100%",maxWidth:760,position:"relative",zIndex:10},
  folderTab: {display:"flex",justifyContent:"space-between",alignItems:"center",background:"#1e3a7a",borderRadius:"6px 6px 0 0",padding:"8px 18px",width:"38%",boxShadow:"inset 0 -3px 0 #152b7a"},
  folderTabText: {color:"#fff",fontSize:9,fontWeight:700,letterSpacing:"0.14em",fontFamily:"'Courier New',Courier,monospace"},
  folderTabCase: {color:"rgba(255,255,255,0.6)",fontSize:9,letterSpacing:"0.08em",fontFamily:"'Courier New',Courier,monospace"},
  folderBody: {background:"linear-gradient(160deg,#f0f4ff 0%,#e8eeff 40%,#dde4ff 100%)",border:"2px solid #3a4a8a",borderTop:"2px solid #3a4a8a",borderRadius:"0 8px 8px 8px",padding:"28px 32px 24px",position:"relative",overflow:"visible",boxShadow:"0 24px 60px rgba(0,0,0,0.75),inset 0 0 40px rgba(30,58,122,0.06)"},
  folderTitle: {fontSize:22,fontWeight:700,color:"#0f1f4a",margin:"0 0 2px",letterSpacing:"0.02em",position:"relative",zIndex:1,fontFamily:"'Special Elite','Courier New',cursive"},
  folderSuspect: {fontSize:12,color:"#3a4a8a",margin:"0 0 16px",letterSpacing:"0.04em",fontFamily:"'Crimson Pro',Georgia,serif",fontStyle:"italic",position:"relative",zIndex:1},
  folderDivider: {height:1,background:"rgba(58,74,138,0.25)",marginBottom:20,position:"relative",zIndex:1},
  folderFields: {display:"flex",flexDirection:"column",gap:14,position:"relative",zIndex:1},
  folderField: {display:"flex",flexDirection:"column",gap:3,paddingBottom:14,borderBottom:"1px solid rgba(58,74,138,0.12)"},
  folderFieldLabel: {fontSize:13,fontWeight:400,letterSpacing:"0.16em",color:"#5a6a9a",fontFamily:"'VT323','Courier New',monospace"},
  folderFieldValue: {fontSize:15,fontWeight:600,color:"#0f1f4a",fontFamily:"'Crimson Pro',Georgia,serif",letterSpacing:"0.01em"},
  folderFooter: {marginTop:20,paddingTop:12,borderTop:"1px solid rgba(58,74,138,0.15)",position:"relative",zIndex:1},
  folderFooterText: {fontSize:9,color:"#5a6a9a",letterSpacing:"0.08em",fontFamily:"'Courier New',Courier,monospace"},
  newMissionBtn: {marginTop:20,width:"100%",padding:"10px 0",background:"#dc2626",color:"#fff",border:"none",borderRadius:4,fontSize:13,fontWeight:700,letterSpacing:"0.1em",fontFamily:"'Courier New',Courier,monospace",cursor:"pointer",position:"relative",zIndex:1},
};
