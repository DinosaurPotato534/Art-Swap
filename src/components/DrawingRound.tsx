import { useEffect, useState, useRef } from "react";
import { Tldraw, track, Editor } from "@tldraw/tldraw";
import { motion } from "framer-motion";
import "@tldraw/tldraw/tldraw.css";
import { saveDrawingToStorage } from "../services/firebase";

interface StorageInfo {
  url: string;
  id: string;
}

interface DrawingRoundProps {
  onComplete: (drawingData: any, storageInfo?: StorageInfo) => void;
}

// Timer and DrawingTools components remain unchanged
const Timer = track(
  ({ timeLeft, isStarted }: { timeLeft: number; isStarted: boolean }) => {
    // Format the time in MM:SS
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0");
      return `${mins}:${secs}`;
    };

    return (
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`text-4xl font-bold rounded-lg px-4 py-2 backdrop-blur-md bg-white/30 shadow-lg
          ${timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-800"}`}
        >
          {isStarted ? formatTime(timeLeft) : "--:--"}
        </div>
      </div>
    );
  }
);

const DrawingTools = track(() => {
  return (
    <div className="absolute top-24 left-4 z-10 flex flex-col gap-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg p-2 rounded-lg"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2 px-2">Tips:</h3>
        <ul className="text-sm text-gray-600 list-disc pl-6 pr-2">
          <li>Start something interesting!</li>
          <li>Leave room for others to add to it</li>
          <li>Be creative and have fun!</li>
        </ul>
      </motion.div>
    </div>
  );
});

// Simple, reliable timer progress bar
const TimerProgressBar = track(
  ({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) => {
    // Simple percentage calculation for the width
    const percentage = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));

    // Simple color logic
    const barColor =
      timeLeft <= 5
        ? "bg-red-500"
        : timeLeft <= 10
        ? "bg-orange-500"
        : "bg-blue-500";

    return (
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 w-2/3 max-w-lg">
        {/* Simple, reliable progress bar */}
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className={`h-full ${barColor}`}
            initial={{ width: "100%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </div>

        <div className="text-center mt-1.5">
          <div className="inline-block bg-black/30 backdrop-blur-md text-white rounded-full px-3 py-0.5">
            <span className="font-bold">{timeLeft}</span> seconds left
          </div>
        </div>
      </div>
    );
  }
);

const DrawingRound = ({ onComplete }: DrawingRoundProps) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isComplete, setIsComplete] = useState(false);
  const [, setIsSaving] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const saveAttemptedRef = useRef(false);
  const TOTAL_TIME = 30;

  useEffect(() => {
    let interval: number | undefined;

    if (isStarted && !isComplete) {
      setTimeLeft(TOTAL_TIME);

      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);

            if (!isComplete) {
              setTimeout(() => {
                setIsComplete(true);

                if (editorRef.current) {
                  try {
                    const shapesData = editorRef.current.store.allRecords();
                    handleDrawingCapture(shapesData);
                  } catch (err) {
                    console.error("Error capturing drawing:", err);
                    onComplete({});
                  }
                }
              }, 0);
            }
            return 0;
          }

          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isStarted, isComplete, TOTAL_TIME, onComplete]);

  const handleDrawingCapture = async (shapesData: any) => {
    if (saveAttemptedRef.current) {
      console.log("Save already attempted, preventing duplicate upload");
      return;
    }

    saveAttemptedRef.current = true;

    try {
      setIsSaving(true);
      console.log("Saving drawing to Firebase...");

      const storageInfo = await saveDrawingToStorage(shapesData);
      console.log("Drawing saved successfully with ID:", storageInfo.id);

      onComplete(shapesData, storageInfo);
    } catch (error) {
      console.error("Error saving drawing:", error);
      onComplete(shapesData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorMount = (editor: Editor) => {
    editorRef.current = editor;
  };

  const handleStartDrawing = () => {
    setIsStarted(true);
  };

  return (
    <div className="relative w-full h-screen flex flex-col">
      <div className="flex-grow relative">
        <Tldraw onMount={handleEditorMount}>
          <Timer timeLeft={timeLeft} isStarted={isStarted} />
          <DrawingTools />
          {isStarted && (
            <TimerProgressBar timeLeft={timeLeft} totalTime={TOTAL_TIME} />
          )}
        </Tldraw>
      </div>

      {!isStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Ready to Start Drawing?
            </h2>
            <p className="text-gray-600 mb-6">
              You'll have 30 seconds to begin your artwork. Don't worry about
              finishing - just start something interesting!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartDrawing}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg"
            >
              Start Drawing
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Time's Up!
            </h2>
            <p className="text-gray-600 mb-6">
              Great start! Now your drawing will be passed to another artist to
              complete.
            </p>
            <div className="loader mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">
              Preparing for the next round...
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DrawingRound;
