import React from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { Bot, User } from "lucide-react";


const MessageBubble = React.memo(({ message, isUser }) => {
  const isPackageRedirect = (text) => {
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes("/customize-package") ||
      lowerText.includes("custom package builder") ||
      lowerText.includes("package builder")
    );
  };

  const extractLink = (text) => {
    const match = text.match(/\/customize-package/);
    return match ? "/customize-package" : null;
  };

  const renderContent = () => {
    if (isPackageRedirect(message)) {
      const link = extractLink(message);
      return (
        <div className="space-y-3">
          {/* ✅ wrapper added */}
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>

          {link && (
            <Link
              to={link}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all duration-300 shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 hover:-translate-y-0.5 active:scale-95"
            >
              <span>Go to Custom Package Builder</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">
                {children}
              </strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 ml-2">
                {children}
              </ul>
            ),
            li: ({ children }) => <li className="text-gray-700">{children}</li>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 underline"
              >
                {children}
              </a>
            ),
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      className={`flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
          isUser
            ? "bg-gradient-to-br from-teal-500 to-teal-600"
            : "bg-gradient-to-br from-gray-100 to-gray-200"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-teal-600" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] md:max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-sm"
              : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
          }`}
        >
          {renderContent()}
        </div>
        <span
          className={`text-xs mt-1 px-2 text-gray-500 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
