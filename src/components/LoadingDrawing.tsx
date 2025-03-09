import { motion } from "framer-motion";

interface LoadingDrawingProps {
  message?: string;
  onCancel?: () => void;
}

const LoadingDrawing = ({
  message = "Finding a drawing for you to continue...",
  onCancel,
}: LoadingDrawingProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6">
          <motion.div
            animate={{
              rotate: 360,
              transition: { duration: 2, repeat: Infinity, ease: "linear" },
            }}
            className="w-full h-full border-4 border-purple-500 border-t-purple-200 rounded-full"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">{message}</h2>

        <p className="text-gray-600 mb-6">
          We're connecting you with another artist's work that needs your
          creative touch.
        </p>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-purple-500 hover:text-purple-700 font-medium"
          >
            Cancel
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingDrawing;
