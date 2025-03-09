import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tldraw, Editor } from "@tldraw/tldraw";
import { getAllFinishedDrawings } from "../services/firebase";

interface DrawingItem {
  id: string;
  originalId: string;
  url: string;
  data: any;
}

interface GalleryProps {
  onBackToStart: () => void;
}

const Gallery = ({ onBackToStart }: GalleryProps) => {
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingItem | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
        const fetchedDrawings = await getAllFinishedDrawings();
        setDrawings(fetchedDrawings);
      } catch (err) {
        console.error("Failed to load gallery:", err);
        setError("Failed to load gallery. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrawings();
  }, []);

  const handleViewDrawing = (drawing: DrawingItem) => {
    setSelectedDrawing(drawing);
  };

  const handleCloseDrawing = () => {
    setSelectedDrawing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold">ArtSwap Gallery</h1>
            <button
              onClick={onBackToStart}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Start</span>
            </button>
          </div>
          <p className="mt-2 text-white/80">
            Explore collaborative masterpieces created by artists like you!
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded">
            <p>{error}</p>
            <button
              onClick={onBackToStart}
              className="mt-2 text-red-600 underline hover:text-red-800"
            >
              Return to Home
            </button>
          </div>
        )}

        {!loading && drawings.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700">
              No Artworks Yet
            </h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Be the first to create a collaborative masterpiece! Go back to
              start and begin drawing.
            </p>
            <button
              onClick={onBackToStart}
              className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              Start Drawing
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && drawings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drawings.map((drawing) => (
              <motion.div
                key={drawing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDrawing(drawing)}
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {/* This would ideally be a thumbnail of the drawing */}
                  <div className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Artwork #{drawing.id.substring(0, 8)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    A collaborative masterpiece
                  </p>
                  <div className="mt-2 text-purple-600 text-sm font-medium">
                    Click to view
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedDrawing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Artwork #{selectedDrawing.id.substring(0, 8)}
              </h3>
              <button
                onClick={handleCloseDrawing}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow relative">
              <Tldraw
                onMount={(editor: Editor) => {
                  try {
                    editor.store.put(selectedDrawing.data);
                  } catch (err) {
                    console.error("Error loading drawing in viewer:", err);
                  }
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Gallery;
