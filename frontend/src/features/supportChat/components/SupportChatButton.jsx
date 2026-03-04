import { memo } from "react";
import { Headset } from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import { useSupportChat } from "../context/useSupportChat";

function SupportChatButton() {
  const { user } = useAuth();
  const { isOpen, isMinimized, openChat, maximizeChat, totalUnread } = useSupportChat();

  if (!user) return null;

  const isVisible = !isOpen || isMinimized;
  if (!isVisible) return null;

  const handleClick = () => {
    if (isMinimized) maximizeChat();
    else openChat();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-28 right-8 z-[999] w-14 h-14 bg-teal-600 text-white rounded-full shadow-2xl shadow-teal-600/25 hover:shadow-teal-600/35 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
      aria-label="Open support chat"
    >
      <Headset className="w-6 h-6" />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-white text-teal-600 rounded-full text-xs font-bold flex items-center justify-center shadow-sm border border-gray-100">
          {totalUnread > 99 ? "99+" : totalUnread}
        </span>
      )}
    </button>
  );
}

export default memo(SupportChatButton);

