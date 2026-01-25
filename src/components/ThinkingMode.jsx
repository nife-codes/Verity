import { useState, useEffect } from 'react';

export default function ThinkingMode({ thinkingText }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!thinkingText) return;

    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < thinkingText.length) {
        setDisplayedText(prev => prev + thinkingText[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [thinkingText]);

  if (!thinkingText) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🧠</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Reasoning Process
          </h3>
          <div className="text-sm text-blue-800 font-mono whitespace-pre-wrap">
            {displayedText}
            {isTyping && <span className="animate-pulse">▊</span>}
          </div>
        </div>
      </div>
    </div>
  );
}