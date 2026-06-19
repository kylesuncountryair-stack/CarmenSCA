import { useState } from "react";
import { motion } from "framer-motion";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwte1jkE2vu7Lg32395bHpnjXYv9uibdodFYAneu0AphFxNCzl-JHX6Q7lv1tIn9Dnz/exec";

const generateCaseNumber = () => "SC-" + Math.floor(1000 + Math.random() * 9000);

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
      const match = correctAnswers.some(a => a.toLowerCase() === normalized);

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
        body: JSON.stringify({
          name,
          answer,
          result: isCorrect ? "Correct" : "Incorrect
          caseNumber,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* ✅ MAP (fixed) */}
     <img
  src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
  className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
/>


      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* RADAR RINGS */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] border border-red-700 rounded-full animate-ping opacity-30"></div>
        <div className="absolute w-[500px] h-[500px] border border-red-500 rounded-full animate-ping opacity-30"></div>
      </div>

      {/* RADAR SWEEP */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute w-[650px] h-[650px] rounded-full opacity-50 pointer-events-none"
        style={{ background: "conic-gradient(rgba(0,255,100,0.5), transparent 25%)" }}
      />

      {/* GLOBE */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute w-[450px] h-[450px] rounded-full opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url(https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/512px-The_Earth_seen_from_Apollo_17.jpg)",
          backgroundSize: "cover",
        }}
      />

      {/* CONTENT */}
      <div className="w-full max-w-5xl p-6 relative z-20 text-black">
        {!submitted ? (
          <div>

            <div className="bg-yellow-300 inline-block px-6 py-2 rounded-t-lg border font-bold ml-4">
              CASE FILE
            </div>

            <div className="bg-yellow-100 border-2 border-yellow-600 rounded-xl p-10 shadow-xl relative">

              {/* CONFIDENTIAL */}
              <div className="absolute top-6 right-6 text-red-600 border-4 border-red-600 px-4 py-1 font-bold rotate-[-15deg]">
                CONFIDENTIAL
              </div>

              {/* CASE NUMBER */}
              <div className="absolute top-6 left-6 text-sm font-bold">
                Case #: {caseNumber}
              </div>

              <h1 className="text-3xl font-bold mb-4">Carmen Sandiego</h1>

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
                  className="bg-red-600 text-white px-6 py-2"
                >
                  Track Carmen
                </button>
              )}

              {scanning && (
                <div className="text-green-600 font-bold animate-pulse">
                  📡 Scanning Sun Country Global Network...
                </div>
              )}

              {showName && (
                <div className="mt-4">
                  <p className="mb-2 font-bold">
                    {isCorrect ? "🎯 Target Locked, Great Work Gumshoe!" : "❌ Carmen Escaped, Search For Her Again Tomorrow!"}
                  </p>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent Full Name"
                    className="w-full p-3 mb-3 border"
                  />

                  <button
                    onClick={handleFinalSubmit}
                    className="bg-green-600 text-white px-6 py-2"
                  >
                    Submit Report
                  </button>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="text-white text-center text-3xl">
            ✅ Case Submitted \nAgent: {name} \nCase: {caseNumber}
          </div>
        )}
      </div>

    </div>
  );
}
