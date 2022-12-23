import React from "react";

function TranscriptText({ text }) {
  return (
    <div className="border-4 m-4">
      <p className="mb-3 font-light text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
}

export default TranscriptText;
