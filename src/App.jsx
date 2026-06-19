import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";
const generateCaseNumber = () => "SC-" + Math.floor(1000 + Math.random() * 9000);

export default function CarmenGame() {
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseNumber] = useState(generateCaseNumber());

const correctAnswers = ["Orlando", "MCO", "mco", "Orlando, FL", "Orlando, Florida"];
  const prompt = "Your sneaky traveler has vanished again! Rumor has it; they were last spotted boarding a bright orange tailed jet. Locals say they were buying sunscreen in bulk, had a frozen drink in hand, and kept asking where they could find the warmest place Minnesotans escape to when winter hits hard. They disappeared into a crowd of flipflops, palm trees, and travelers wearing mouse ear headbands. Where in the Sun Country world did they go? ";

  const handleSubmit = () => {
    setScanning(true);

    setTimeout(() => {
      const normalized = answer.trim().toLowerCase();
      const match = correctAnswers.some(a => a.toLowerCase() === normalized);

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
        body: JSON.stringify({ name, answer, correct: isCorrect, caseNumber }),
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => setSubmitted(true), 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* ✅ NEW MAP IMAGE */}
     <img
  src="https://res.hovia.com/gimmersta-wallpaper/image/upload/c_fill,f_auto,fl_progressive,q_auto,w_1101,h_801/v1716223329/articles/VI0004BU30W_product.jpg"
  className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
/>

      {/* RADAR */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] border border-red-700 rounded-full animate-ping opacity-30"></div>
        <div className="absolute w-[500px] h-[500px] border border-red-500 rounded-full animate-ping opacity-30"></div>
      </div>

      {/* SWEEP */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute w-[650px] h-[650px] rounded-full opacity-60 pointer-events-none"
        style={{ background: "conic-gradient(rgba(0,255,100,0.6), transparent 20%)" }}
      />

      {/* CONTENT */}
      <div className="w-full max-w-5xl p-6 relative z-20 text-black">
        {!submitted ? (
          <div>

            <div className="bg-yellow-300 inline-block px-6 py-2 rounded-t-lg border font-bold ml-4">
              CASE FILE
            </div>

            <div className="bg-yellow-100 border-2 border-yellow-600 rounded-xl p-10 shadow-xl relative overflow-hidden">

              {/* ✅ RESULT FLASH */}
              <AnimatePresence>
                {showName && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0] }}
                    exit={{ opacity: 0 }}
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

              <h1 className="text-3xl font-bold mb-4">Carmen Sandiego<br></br></h1><h2>Suspect: Carmen Sandiego</h2>

              <div className="bg-white p-4 border mb-4">
                {prompt}
              </div>

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
                  className="bg-red-600 text-white px-6 py-2 hover:scale-105 transition"
                >
                  Track Carmen
                </button>
              )}

              {/* ENHANCED SCANNING */}
              {scanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 font-bold text-lg flex flex-col items-center gap-2"
                >
                  <div className="animate-pulse text-2xl">📡 SCANNING SUN COUNTRY GLOBAL NETWORK...</div>
                  <div className="flex gap-2">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-150">●</span>
                    <span className="animate-bounce delay-300">●</span>
                  </div>
                </motion.div>
              )}

              {showName && (
                <div className="mt-4">

                  <motion.p
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    className={`mb-4 text-2xl font-extrabold ${
                      isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isCorrect ? "🎯 TARGET LOCKED! Excellent Work Gumshoe!" : "❌ CARMEN ESCAPED! Track Her Again Tomorrow!"}
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
            ✅ Case Submitted    Agent: {name}  Case: {caseNumber}
          </div>
        )}
      </div>

    </div>
  );
}
