import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";

export default function CarmenGame() {
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);

const correctAnswers = ["Orlando", "MCO", "Orlando, FL", "Orlando, Florida"];
  const prompt = "•	Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen in bulk, had a frozen drink in hand, and kept asking where they could find the warmest place Minnesotans escape to when winter hits hard. They disappeared into a crowd of flipflops, palm trees, and travelers wearing mouse ear headbands. Where in the Sun Country world did they go? ";


  const handleSubmit = () => {
    setScanning(true);
    setTimeout(() => {
      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.some(
        (a) => a.toLowerCase() === normalized
      );
      setIsCorrect(match);
      setShowName(true);
      setScanning(false);
    }, 2000);
  };

  const handleFinalSubmit = async () => {
    if (!name) return alert("Name required");
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answer, correct: isCorrect }),
      });
    } catch (err) {}

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">

      {/* MAP */}
      <div className="absolute inset-0 opacity-15 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center" />

      {/* RADAR RINGS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[700px] h-[700px] border border-red-700 rounded-full animate-ping opacity-20"></div>
        <div className="absolute w-[500px] h-[500px] border border-red-500 rounded-full animate-ping opacity-20"></div>
      </div>

      {/* 🔥 RADAR SWEEP LINE */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{
          background: "conic-gradient(rgba(0,255,100,0.25), transparent 20%)",
          filter: "blur(2px)",
        }}
      />

      {/* GLOBE */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        className="absolute w-[500px] h-[500px] rounded-full border border-red-500 opacity-40"
      />

      <div className="w-full max-w-3xl p-6 z-10 relative">
        <AnimatePresence>
          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-900 via-black to-red-950 border border-red-600 p-10 rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.5)] text-center relative overflow-hidden"
            >

              {/* TARGET LOCK */}
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 border-4 border-green-400 rounded-2xl pointer-events-none"
                />
              )}

              {/* WRONG FLASH */}
              {isCorrect === false && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-red-600/30 rounded-2xl pointer-events-none"
                />
              )}

              <h1 className="text-5xl font-extrabold mb-2 text-red-500">
                Carmen Sandiego
              </h1>
              <p className="text-sm text-red-300 mb-8 tracking-widest">
                Sun Country Detective Agency
              </p>

              <div className="bg-black/70 border border-red-600 rounded-xl p-6 mb-6">
                <p className="text-xl font-semibold text-yellow-300 leading-relaxed">
                  {prompt}
                </p>
              </div>

              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter city or airport code"
                className={`w-full p-4 rounded-xl text-black font-semibold mb-6 border-2 text-lg ${
                  isCorrect === true
                    ? "bg-green-400 border-green-600"
                    : isCorrect === false
                    ? "bg-red-400 border-red-700"
                    : "bg-yellow-100 border-yellow-400"
                }`}
                disabled={showName || scanning}
              />

              {!showName && !scanning && (
                <button
                  onClick={handleSubmit}
                  className="bg-yellow-400 text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-110 transition"
                >
                  Track Carmen
                </button>
              )}

              {scanning && (
                <div className="mt-4 text-green-300 font-bold text-xl animate-pulse">
                  📡 Scanning Sun Country Global Network...
                </div>
              )}

              {showName && (
                <div className="mt-6">
                  <p className="mb-4 text-xl text-red-300">
                    {isCorrect
                      ? "🎯 Target Locked! Excellent work, Gumshoe."
                      : "❌ Carmen slipped away… try to be quicker next time."}
                  </p>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent full name"
                    className="w-full p-4 rounded-xl text-black mb-4 border-2 border-yellow-400 bg-yellow-100"
                  />

                  <button
                    onClick={handleFinalSubmit}
                    className="bg-red-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-110 transition"
                  >
                    Submit Report
                  </button>
                </div>
              )}

            </motion.div>
          ) : (
            <div className="text-center">
              <h2 className="text-6xl font-extrabold text-yellow-400">
                Good Work Gumshoe 🕵️‍♂️
              </h2>
              <p className="text-red-300 mt-4">
                Case File Submitted
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
