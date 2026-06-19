import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ CLEAN Google Script URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";

const generateCaseNumber = () =>
  "SC-" + Math.floor(1000 + Math.random() * 9000);

export default function CarmenGame() {
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseNumber] = useState(generateCaseNumber());

  const correctAnswers = [
    "orlando",
    "mco",
    "orlando, fl",
    "orlando, florida",
  ];

  const prompt =
    "Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen in bulk, had a frozen drink in hand, and kept asking where they could find the warmest place Minnesotans escape to when winter hits hard. They disappeared into a crowd of flip flops, palm trees, and travelers wearing mouse ear headbands. Where in the Sun Country world did they go?";

  const handleSubmit = () => {
    setScanning(true);

    setTimeout(() => {
      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.some((a) => a === normalized);

      setIsCorrect(match);
      setShowName(true);
      setScanning(false);
    }, 2200);
  };

  const handleFinalSubmit = async () => {
    if (!name) return alert("Name Required");

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
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => setSubmitted(true), 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* ✅ BACKGROUND IMAGE (FIXED) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://i.wpfc.ml/h7/uxapf2.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />

      {/* ✅ DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* ✅ RADAR RINGS */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] border border-red-700 rounded-full animate-ping opacity-30" />
        <div className="absolute w-[500px] h-[500px] border border-red-500 rounded-full animate-ping opacity-30" />
      </div>

      {/* ✅ RADAR SWEEP */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute w-[650px] h-[650px] rounded-full opacity-60 pointer-events-none"
        style={{
          background: "conic-gradient(rgba(0,255,100,0.6), transparent 20%)",
        }}
      />

      {/* ✅ CONTENT */}
      <div className="w-full max-w-5xl p-6 relative z-20 text-black">
        {!submitted ? (
          <div>

            {/* TAB */}
            <div className="bg-yellow-300 px-6 py-2 rounded-t-lg border font-bold ml-4 inline-block">
              CASE FILE
            </div>

            {/* FOLDER */}
         <div
  className="border-2 border-yellow-700 rounded-xl p-10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg, #fef3c7 0%, #fde68a 45%, #fcd34d 100%)",
  }}
>
           {/* 📄 PAPER TEXTURE */}
<div className="absolute inset-0 opacity-30 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_22px,rgba(0,0,0,0.04)_23px)]" />

           {/* 📁 EDGE SHADING */}
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute inset-0 rounded-xl border border-black/10" />
  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/20 to-transparent rounded-t-xl opacity-40" />
  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl opacity-30" />
</div>

              {/* ✅ RESULT FLASH */}
              <AnimatePresence>
                {showName && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.7, 0] }}
                    transition={{ duration: 0.8 }}
                    className={`absolute inset-0 pointer-events-none ${
                      isCorrect ? "bg-green-400" : "bg-red-500"
                    }`}
                  />
                )}
              </AnimatePresence>

              {/* CONFIDENTIAL */}
              <div className="absolute top-6 right-6 text-red-600 border-4 border-red-600 px-4 py-1 font-bold rotate-[-15deg]">
                CONFIDENTIAL
              </div>

              {/* CASE */}
              <div className="absolute top-6 left-6 text-sm font-bold">
                Case #: {caseNumber}
              </div>

              <h1 className="text-3xl font-bold mb-4">
                Suspect: Carmen Sandiego
              </h1>

              <div className="bg-white p-4 border mb-4">{prompt}</div>

              {/* INPUT */}
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 mb-4 border"
                placeholder="Enter city or airport code"
                disabled={scanning || showName}
              />

              {!scanning && !showName && (
                <button
                  onClick={handleSubmit}
                  className="bg-red-600 text-white font-bold px-6 py-2 hover:scale-105 transition"
                >
                  Track Carmen
                </button>
              )}

              {/* SCANNING */}
              {scanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 font-bold text-lg flex flex-col items-center gap-2"
                >
                  <div className="animate-pulse text-2xl">
                    📡 SCANNING SUN COUNTRY GLOBAL NETWORK...
                  </div>
                  <div className="flex gap-2">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-150">●</span>
                    <span className="animate-bounce delay-300">●</span>
                  </div>
                </motion.div>
              )}

              {/* RESULT */}
              {showName && (
                <div className="mt-4">
                  <motion.p
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    className={`mb-4 text-2xl font-extrabold text-center ${
                      isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isCorrect
                      ? "🎯 TARGET LOCKED! Excellent Work Gumshoe!"
                      : "❌ CARMEN ESCAPED! Track Her Again Tomorrow!"}
                  </motion.p>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent Full Name"
                    className="w-full p-3 mb-3 border"
                  />

                  <button
                    onClick={handleFinalSubmit}
                    disabled={submitting}
                    className={`px-6 py-2 text-white ${
                      submitting ? "bg-gray-500" : "bg-green-600"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="text-white text-center text-3xl">
            ✅ Case Submitted<br />
            Agent: {name}<br />
            Case: {caseNumber}
          </div>
        )}
      </div>

    </div>
  );
}
