"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const questions = [
  {
    id: "sleep",
    question: "How much sleep did you get?",
    type: "text",
    placeholder: "e.g., 7 hours"
  },
  {
    id: "feeling",
    question: "How do you feel?",
    type: "text",
    placeholder: "e.g., Good, Tired, Energetic"
  },
  {
    id: "dayQuality",
    question: "How is the day going? (Out of step, or good)",
    type: "select",
    options: ["Good", "Out of step", "Normal"]
  },
  {
    id: "stressLevel",
    question: "How do you rate your stress levels (1-10)",
    type: "select",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  },
  {
    id: "moodEnergyChanges",
    question: "Have you noticed changes in your mood or energy levels recently?",
    type: "select",
    options: ["Yes", "No", "Unsure"]
  }
];

export default function Questionnaire() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flightNumber = searchParams.get("flight");
  const userName = searchParams.get("name");
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (currentAnswer.trim()) {
      const newAnswers = {
        ...answers,
        [questions[currentQuestion].id]: currentAnswer
      };
      setAnswers(newAnswers);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentAnswer("");
      } else {
        // Save all answers
        saveAnswers(newAnswers);
      }
    }
  };

  const saveAnswers = async (finalAnswers: Record<string, string>) => {
    setSaving(true);
    try {
      // First, fetch flight data to ensure it's saved
      console.log('Fetching flight data first...');
      const flightResponse = await fetch(`/api/flight?flight=${encodeURIComponent(flightNumber || '')}`);
      const flightData = await flightResponse.json();
      
      if (flightData.error || !flightData.data || flightData.data.length === 0) {
        console.error('No flight data found');
        alert('Flight data not found. Please try again.');
        setSaving(false);
        return;
      }

      // Save flight data with person info
      if (userName) {
        await fetch('/api/person', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userName,
            flightData: flightData.data[0],
          }),
        });
      }

      // Small delay to ensure file is written
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now save questionnaire
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          flight: flightNumber,
          answers: finalAnswers,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Questionnaire saved successfully');
        // Redirect to results page
        router.push(`/results?flight=${encodeURIComponent(flightNumber || '')}&name=${encodeURIComponent(userName || '')}`);
      } else {
        console.error('Error saving questionnaire:', data.error);
        alert('Error saving questionnaire. Please try again.');
      }
    } catch (err) {
      console.error('Error saving questionnaire:', err);
      alert('Error saving data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-sky-200 overflow-hidden">
      {/* Cloud background */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300/30 to-sky-100/30"></div>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-8 max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-8 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-blue-950/70 font-medium">QUESTION {currentQuestion + 1} OF {questions.length}</span>
            <span className="text-xs text-blue-950/70 font-medium">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600/80 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question card */}
        <div className="w-full p-8 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-2xl">
          <h2 className="text-2xl font-light text-blue-950 mb-8">
            {currentQ.question}
          </h2>

          {currentQ.type === "text" ? (
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={currentQ.placeholder}
              className="w-full px-6 py-4 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl text-blue-950 placeholder-blue-900/40 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all duration-300 text-center text-lg font-medium shadow-lg mb-6"
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
              autoFocus
            />
          ) : (
            <div className="space-y-3 mb-6">
              {currentQ.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    const newAnswers = {
                      ...answers,
                      [questions[currentQuestion].id]: option
                    };
                    setAnswers(newAnswers);
                    setCurrentAnswer(option);

                    setTimeout(() => {
                      if (currentQuestion < questions.length - 1) {
                        setCurrentQuestion(currentQuestion + 1);
                        setCurrentAnswer("");
                      } else {
                        saveAnswers(newAnswers);
                      }
                    }, 200);
                  }}
                  className={`w-full px-6 py-4 rounded-2xl border transition-all duration-300 text-lg font-medium ${
                    currentAnswer === option
                      ? 'bg-blue-600/80 border-blue-500/50 text-white shadow-lg'
                      : 'bg-white/30 backdrop-blur-2xl border-white/40 text-blue-950 hover:bg-white/40'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQ.type === "text" && (
            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim() || saving}
              className="w-full px-6 py-4 bg-blue-600/80 backdrop-blur-2xl border border-blue-500/50 rounded-2xl text-white hover:bg-blue-600/90 hover:border-blue-400/60 hover:shadow-xl transition-all duration-300 font-medium tracking-wide text-base uppercase shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'SAVING...' : currentQuestion === questions.length - 1 ? 'COMPLETE' : 'NEXT'}
            </button>
          )}
        </div>

        {/* Back button */}
        {currentQuestion > 0 && !saving && (
          <button
            onClick={() => {
              setCurrentQuestion(currentQuestion - 1);
              setCurrentAnswer(answers[questions[currentQuestion - 1].id] || "");
            }}
            className="mt-6 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-lg text-blue-950/80 font-medium hover:bg-white/30 transition-all"
          >
            ← Back
          </button>
        )}
      </main>
    </div>
  );
}
