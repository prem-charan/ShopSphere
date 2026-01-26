import { useState } from 'react';
import { FaCheckCircle, FaTimes, FaCopy, FaCheck } from 'react-icons/fa';

const RewardSuccessModal = ({ reward, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reward.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FaTimes size={24} />
        </button>

        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-green-600 text-6xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reward Claimed!</h2>
          <p className="text-gray-600">
            You've successfully redeemed <strong>{reward.points} points</strong> for <strong>{reward.name}</strong>
          </p>
        </div>

        {/* Discount Code */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
          <p className="text-sm text-purple-800 font-semibold mb-2 text-center">Your Discount Code</p>
          <div className="bg-white rounded-lg p-4 mb-3">
            <p className="text-center font-mono text-xl font-bold text-gray-800 break-all">
              {reward.code}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            {copied ? (
              <>
                <FaCheck /> Copied!
              </>
            ) : (
              <>
                <FaCopy /> Copy Code
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Copy the discount code above</li>
            <li>Add items to your cart</li>
            <li>Apply the code at checkout</li>
            <li>Enjoy your discount!</li>
          </ol>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RewardSuccessModal;
