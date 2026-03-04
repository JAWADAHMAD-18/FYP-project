import { useContext } from "react";
import { SupportChatContext } from "./SupportChatContext";

export function useSupportChat() {
  const ctx = useContext(SupportChatContext);
  if (!ctx) {
    throw new Error("useSupportChat must be used within SupportChatProvider");
  }
  return ctx;
}

