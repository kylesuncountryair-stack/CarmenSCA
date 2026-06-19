import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";

// generate random case number
const generateCaseNumber = () => {
  return "SC-" + Math.floor(1000 + Math.random() * 9000);
};

export default function CarmenGame() {
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [caseNumber] = useState(generateCaseNumber());

const correctAnswers = ["Orlando", "MCO", "Orlando, FL", "Orlando, Florida"];
  const prompt = "•	Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen in bulk, had a frozen drink in hand, and kept asking where they could find the warmest place Minnesotans escape to when winter hits hard. They disappeared into a crowd of flipflops, palm trees, and travelers wearing mouse ear headbands. Where in the Sun Country world did they go? ";


  const handleSubmit = () => {
    setScanning(true);
    setTimeout(() => {
      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.some((a) => a.toLowerCase() === normalized);
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
        body: JSON.stringify({ name, answer, correct: isCorrect, caseNumber }),
      });
    } catch (err) {}

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-black relative overflow-hidden">

      {/* MAP */}
      <div className="absolute inset-0 opacity-25 bg-[url(https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg)] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/40" />

      {/* FOLDER WRAPPER */}
      <div className="w-full max-w-5xl p-6 z-10 relative">
        <AnimatePresence>
          {!submitted ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* FILE TAB */}
              <div className="relative w-fit ml-6">
                <div className="bg-yellow-300 px-6 py-2 rounded-t-lg border border-yellow-500 shadow-md font-bold tracking-wide">
                  CASE FILE
                </div>
                <div className="absolute right-[-20px] top-0 w-6 h-full bg-yellow-200 skew-x-12 border-r border-yellow-500" />
              </div>

              {/* MAIN FOLDER */}
              <div className="bg-yellow-100 border-2 border-yellow-600 rounded-xl p-10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">

                {/* CONFIDENTIAL STAMP */}
                <motion.div
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: -15, opacity: 0.9 }}
                  className="absolute top-6 right-6 text-red-600 border-4 border-red-600 px-6 py-2 font-extrabold text-2xl tracking-widest"
                >
                  CONFIDENTIAL
                </motion.div>

                {/* CASE NUMBER */}
                <div className="absolute top-6 left-6 text-sm font-bold text-gray-700">
                  Case #: {caseNumber}
                </div>

                {/* PAPER TEXTURE */}
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_24px,rgba(0,0,0,0.05)_25px)] rounded-xl" />

                <h1 className="text-4xl font-extrabold mb-2 text-red-600">
                  Carmen Sandiego
                </h1>
                <p className="text-sm text-gray-600 mb-8 tracking-widest">
                  Sun Country Detective Agency
                </p>

                {/* FILE CONTENT */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-inner">
                  <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                    {prompt}
                  </p>
                </div>

                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter city or airport code"
                  className={`w-full p-4 rounded-lg mb-6 border-2 text-lg ${
                    isCorrect === true
                      ? "bg-green-200 border-green-600"
                      : isCorrect === false
                      ? "bg-red-200 border-red-600"
                      : "bg-white border-gray-400"
                  }`}
                  disabled={showName || scanning}
                />

                {!showName && !scanning && (
                  <button
                    onClick={handleSubmit}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition"
                  >
                    Track Carmen
                  </button>
                )}

                {scanning && (
                  <div className="mt-4 text-green-600 font-bold text-lg animate-pulse">
                    📡 Scanning Global Network...
                  </div>
                )}

                {showName && (
                  <div className="mt-6">
                    <p className="mb-4 text-lg text-gray-700">
                      {isCorrect
                        ? "🎯 Target Locked! Excellent work, Gumshoe."
                        : "❌ Carmen slipped away this time… try again tomorrow."}
                    </p>

                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Agent full name"
                      className="w-full p-4 rounded-lg mb-4 border border-gray-400"
                    />

                    <button
                      onClick={handleFinalSubmit}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold"
                    >
                      Submit Report
                    </button>
                  </div>
                )}

              </div>

            </motion.div>
          ) : (
            <div className="text-center text-yellow-300">
              <h2 className="text-5xl font-extrabold">Good Work Gumshoe 🕵️‍♂️</h2>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
