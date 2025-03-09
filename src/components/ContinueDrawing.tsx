import { useState, useRef } from "react";
import { Tldraw, track, Editor } from "@tldraw/tldraw";
import { motion } from "framer-motion";
import "@tldraw/tldraw/tldraw.css";
import { saveFinishedDrawing } from "../services/firebase";

interface StorageInfo {
  url: string;
  id: string;
}

interface ContinueDrawingProps {
  initialDrawing: {
    id: string;
    data: any;
  };
  onComplete: (originalId: string, storageInfo: StorageInfo) => void;
  onError: () => void;
}

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
          <li>Complete the drawing in your own style</li>
          <li>Try to build on the original idea</li>
          <li>Click "Finish" when you're done</li>
        </ul>
      </motion.div>
    </div>
  );
});

const ContinueDrawing = ({
  initialDrawing,
  onComplete,
  onError,
}: ContinueDrawingProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const loadedRef = useRef(false);

  const handleEditorMount = (editor: Editor) => {
    editorRef.current = editor;

    try {
      if (!loadedRef.current && initialDrawing?.data) {
        console.log("Loading initial drawing data into editor");
        editor.store.put(initialDrawing.data);
        loadedRef.current = true;
      }
    } catch (err) {
      console.error("Error loading drawing:", err);
      onError();
    }
  };

  const handleFinishDrawing = async () => {
    if (!editorRef.current) return;

    try {
      setIsSaving(true);

      const shapesData = editorRef.current.store.getSnapshot();

      const storageInfo = await saveFinishedDrawing(
        shapesData,
        initialDrawing.id
      );

      onComplete(initialDrawing.id, storageInfo);
    } catch (err) {
      console.error("Error saving finished drawing:", err);
      onError();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col">
      <div className="absolute top-4 left-4 z-20 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800">
            Continue This Drawing
          </h2>
        </motion.div>
      </div>

      <div className="flex-grow relative">
        <Tldraw onMount={handleEditorMount}>
          <DrawingTools />
        </Tldraw>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFinishDrawing}
          disabled={isSaving}
          className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg flex items-center space-x-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Finish Drawing</span>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ContinueDrawing;
