import { useState, useEffect } from "react";
import "./App.css";
import Start from "./components/Start";
import DrawingRound from "./components/DrawingRound";
import ContinueDrawing from "./components/ContinueDrawing";
import LoadingDrawing from "./components/LoadingDrawing";
import Gallery from "./components/Gallery";
import { getRandomUnfinishedDrawing } from "./services/firebase";

interface StorageInfo {
  url: string;
  id: string;
}

interface DrawingData {
  shapesData: any;
  storageInfo?: StorageInfo;
}

function App() {
  const [gameState, setGameState] = useState<
    "start" | "drawing" | "loading" | "continuing" | "completing" | "gallery"
  >("start");
  const [currentDrawing, setCurrentDrawing] = useState<DrawingData | null>(
    null
  );
  const [randomDrawing, setRandomDrawing] = useState<{
    id: string;
    data: any;
  } | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | undefined>(
    undefined
  );

  const handleDrawingComplete = (
    drawingData: any,
    storageInfo?: StorageInfo
  ) => {
    setCurrentDrawing({
      shapesData: drawingData,
      storageInfo,
    });

    if (storageInfo) {
      setLastSubmittedId(storageInfo.id);
    }

    setGameState("completing");

    setTimeout(() => {
      setGameState("loading");
    }, 3000);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRandomDrawing = async () => {
      if (gameState !== "loading") return;

      try {
        const drawing = await getRandomUnfinishedDrawing(lastSubmittedId);

        if (isMounted) {
          if (drawing) {
            setRandomDrawing({
              id: drawing.id,
              data: drawing.data,
            });
            setGameState("continuing");
          } else {
            setGameState("gallery");
          }
        }
      } catch (error) {
        console.error("Error fetching random drawing:", error);
        if (isMounted) {
          setGameState("start");
        }
      }
    };

    if (gameState === "loading") {
      fetchRandomDrawing();
    }

    return () => {
      isMounted = false;
    };
  }, [gameState, lastSubmittedId]);

  const handleContinueDrawingComplete = () => {
    setGameState("gallery");
  };

  const handleContinueDrawingError = () => {
    setGameState("start");
  };

  const handleStartGame = () => {
    setGameState("drawing");
  };

  const handleBackToStart = () => {
    setGameState("start");
  };

  const handleCancelLoading = () => {
    setGameState("start");
  };

  return (
    <>
      {gameState === "start" && <Start onContinue={handleStartGame} />}

      {gameState === "drawing" && (
        <DrawingRound onComplete={handleDrawingComplete} />
      )}

      {gameState === "loading" && (
        <LoadingDrawing onCancel={handleCancelLoading} />
      )}

      {gameState === "continuing" && randomDrawing && (
        <ContinueDrawing
          initialDrawing={randomDrawing}
          onComplete={handleContinueDrawingComplete}
          onError={handleContinueDrawingError}
        />
      )}

      {gameState === "gallery" && <Gallery onBackToStart={handleBackToStart} />}

      {gameState === "completing" && (
        <div className="min-h-screen flex items-center justify-center bg-purple-100">
          <div className="text-center p-8 bg-white rounded-xl shadow-xl">
            <h1 className="text-3xl font-bold text-gray-800">
              Drawing Started!
            </h1>
            <p className="text-gray-600 mt-2">
              Now, let's find another artist's work for you to continue...
            </p>
            {currentDrawing && currentDrawing.storageInfo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                <h3 className="font-medium text-gray-700 mb-2">
                  Drawing Details:
                </h3>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Elements:</span>{" "}
                  {Object.keys(currentDrawing.shapesData).length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-semibold">Storage ID:</span>{" "}
                  {currentDrawing.storageInfo.id}
                </p>
              </div>
            )}
            <div className="mt-6">
              <div className="loader mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-500">
                Finding you another drawing to continue...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
