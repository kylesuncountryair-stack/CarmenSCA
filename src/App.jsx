
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

export default function CarmenGame() {
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);

  const correctAnswers = ["Paris", "CDG"];
  const prompt = "Where in the world is Carmen Sandiego?";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          answer,
          correct: isCorrect,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">

      {/* Radar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] border border-red-700 rounded-full animate-ping opacity-20"></div>
        <div className="absolute w-[400px] h-[400px] border border-red-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute w-[200px] h-[200px] border border-red-300 rounded-full animate-ping opacity-20"></div>
      </div>

      {/* Globe */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute w-96 h-96 bg-[radial-gradient(circle,rgba(255,0,0,0.4),transparent_70%)] rounded-full blur-2xl opacity-30"
      />

      <div className="w-full max-w-xl p-6 z-10">
        <AnimatePresence>
          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-br from-red-900 via-black to-red-950 border border-red-700 p-8 rounded-2xl shadow-[0_0_25px_rgba(255,0,0,0.4)] text-center"
            >
              <h1 className="text-4xl font-extrabold mb-2 text-red-500">
                Carmen Sandiego
              </h1>
              <p className="text-sm text-red-300 mb-6">
                ACME Detective Agency
              </p>

              <div className="bg-black/70 border border-red-700 rounded-xl p-4 mb-6">
                <p className="text-lg font-semibold text-yellow-300">
                  {prompt}
                </p>
              </div>

              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter city or airport code"
                className={`w-full p-3 rounded-xl text-black font-semibold mb-4 border-2 ${
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
                  className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold"
                >
                  Track Carmen
                </button>
              )}

              {scanning && (
                <div className="mt-4 text-yellow-300 font-bold">
                  🔍 Scanning Global Network...
                </div>
              )}

              {showName && (
                <div className="mt-6">
                  <p className="mb-3 text-lg text-red-300">
                    {isCorrect
                      ? "Target located. Excellent work, Gumshoe."
                      : "Carmen slipped away… try to be quicker next time."}
                  </p>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent full name"
                    className="w-full p-3 rounded-xl text-black mb-4 border-2 border-yellow-400 bg-yellow-100"
                    required
                  />

                  <button
                    onClick={handleFinalSubmit}
                    className="bg-red-600 px-6 py-2 rounded-full font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center">
              <h2 className="text-5xl font-extrabold text-yellow-400">
                Good Work Gumshoe 🕵️‍♂️
              </h2>
              <p className="text-red-300">
                Case File Submitted
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
