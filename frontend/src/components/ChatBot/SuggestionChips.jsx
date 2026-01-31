import React from 'react';
import { Sparkles, X } from 'lucide-react';

const SuggestionChips = ({ suggestions, onSuggestionClick, hasMessages, onDismiss }) => {
  // Initial suggestions for first-time users
  const initialSuggestions = [
    'Best time to visit Hunza?',
    'Show me beach destinations',
    'What to see in Murree?',
    'Historical places in Pakistan',
  ];

  // Follow-up suggestions after first interaction
  const followUpSuggestions = [
    'Check weather forecast',
    'View flight options',
    'Find hotels',
    'Create custom package',
  ];

  const displaySuggestions = hasMessages ? followUpSuggestions : initialSuggestions;
  const chipsToShow = suggestions.length > 0 ? suggestions : displaySuggestions;

  if (chipsToShow.length === 0) return null;

  return (
    <div className="px-3 py-2 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-semibold text-gray-600">
            Suggested Questions
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Dismiss suggestions"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chipsToShow.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;

