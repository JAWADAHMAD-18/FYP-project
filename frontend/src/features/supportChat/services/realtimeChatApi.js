import api from "../../../api/Api";

function unwrapApiData(payload) {
  // Backend controllers are inconsistent in this repo; keep client resilient.
  // Prefer the common { data } shape, then fall back to message/data nesting.
  return payload?.data ?? payload?.message ?? payload;
}

export async function startChat() {
  const res = await api.get("/realtime-chat/start");
  return unwrapApiData(res.data);
}

export async function getConversationMessages(conversationId, { page = 1, limit = 50 } = {}) {
  const res = await api.get(
    `/realtime-chat/conversation/${conversationId}/messages`,
    { params: { page, limit } }
  );
  return unwrapApiData(res.data);
}

export async function getAdminConversations() {
  const res = await api.get("/realtime-chat/admin/conversations");
  return unwrapApiData(res.data);
}

export async function getAdminConversationWithMessages(
  conversationId,
  { page = 1, limit = 50 } = {}
) {
  const res = await api.get(`/realtime-chat/admin/conversation/${conversationId}`, {
    params: { page, limit },
  });
  return unwrapApiData(res.data);
}

