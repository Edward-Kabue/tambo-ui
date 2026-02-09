// agent/components/MyButton.tsx
import React from "react";

export const MyButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    className="bg-green-500 text-white font-medium py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring"
    onClick={onClick}
  >
    Submit
  </button>
);

export default MyButton;
