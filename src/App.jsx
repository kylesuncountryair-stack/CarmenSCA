import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [scanStep, setScanStep] = useState(0);

  const correctAnswers = [
    "orlando",
    "mco",
    "orlando, fl",
    "orlando, florida",
  ];

  const scanMessages = [
    "Checking Skyspeed Reservations...",
    "Searching Advisories...",
    "Compiling Customer Care Database Files...",
  ];

  const prompt =
    "Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen, holding a frozen drink, and asking where Minnesotans escape winter. Surrounded by palm trees, flip flops, and mouse ears... Where in the Sun Country world did they go?";

  const handleSubmit = () => {
    setScanning(true);
    setScanStep(0);

    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step < scanMessages.length) {
        setScanStep(step);
      }
    }, 700);

    setTimeout(() => {
      clearInterval(interval);

      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.includes(normalized);

      setIsCorrect(match);
      setShowName(true);
      setScanning(false);
    }, 2300);
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

      {/* ✅ BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://i.wpfc.ml/h7/uxapf2.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* RADAR */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] border border-red-700 rounded-full animate-ping opacity-30" />
        <div className="absolute w-[500px] h-[500px] border border-red-500 rounded-full animate-ping opacity-30" />
      </div>

      {/* SWEEP */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute w-[650px] h-[650px] rounded-full opacity-60 pointer-events-none"
        style={{
          background: "conic-gradient(rgba(0,255,100,0.6), transparent 20%)",
        }}
      />

      {/* CONTENT */}
      <div className="w-full max-w-5xl p-6 relative z-20 text-black">

        {!submitted ? (
          <div>

            {/* TAB */}
            <div className="bg-yellow-300 px-6 py-2 rounded-t-lg border border-yellow-700 font-bold ml-4 inline-block shadow-md">
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

              {/* TEXTURE */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_22px,rgba(0,0,0,0.04)_23px)]" />

              {/* RESULT FLASH */}
              <AnimatePresence>
                {showName && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: [0, 0.7, 0], scale: [0.95, 1.05, 1] }}
                    transition={{ duration: 0.8 }}
                    className={`absolute inset-0 ${
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

              <h1 className="text-3xl font-bold mb-4 text-center">
                Suspect: Carmen Sandiego
              </h1>

              <div className="bg-white p-4 border mb-4 text-center">
                {prompt}
              </div>

              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 mb-4 border text-center"
                placeholder="Enter city or airport code"
                disabled={scanning || showName}
              />

              {!scanning && !showName && (
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    className="bg-red-600 text-white px-6 py-2 hover:scale-105 transition"
                  >
                    Track Carmen
                  </button>
                </div>
              )}

              {/* ✅ MULTI-STEP SCANNING */}
              {scanning && (
                <motion.div
                  key={scanStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 font-bold text-lg flex flex-col items-center gap-2 text-center"
                >
                  <motion.div
                    key={scanMessages[scanStep]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl"
                  >
                    📡 {scanMessages[scanStep]}
                  </motion.div>

                  <div className="flex gap-2">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-150">●</span>
                    <span className="animate-bounce delay-300">●</span>
                  </div>
                </motion.div>
              )}

              {/* RESULT */}
              {showName && (
                <div className="mt-6 flex flex-col items-center text-center">

                  <motion.p
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    className={`mb-4 text-3xl font-extrabold ${
                      isCorrect ? "text-green-700" : "text-red-700"
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
                    className="w-full p-3 mb-3 border text-center"
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
            ✅ Case Submitted <br />
            Agent: {name} <br />
            Case: {caseNumber}
          </div>
        )}
      </div>
    </div>
  );
}
