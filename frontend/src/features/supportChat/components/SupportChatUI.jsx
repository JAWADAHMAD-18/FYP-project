import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useSupportChat } from "../context/useSupportChat";
import SupportChatButton from "./SupportChatButton";
import SupportChatWindow from "./SupportChatWindow";
import AdminChatLayout from "./AdminChatLayout";

/**
 * SupportChatUI handles the rendering of chat components within the Router context.
 * It is rendered in App.jsx to ensure access to useNavigate().
 */
function SupportChatUI() {
  const { isAdmin } = useSupportChat();
  const navigate = useNavigate();

  return (
    <>
      {!isAdmin && <SupportChatButton />}
      {!isAdmin && <SupportChatWindow />}
      {isAdmin && <AdminChatLayout navigate={navigate} />}
    </>
  );
}

export default memo(SupportChatUI);
