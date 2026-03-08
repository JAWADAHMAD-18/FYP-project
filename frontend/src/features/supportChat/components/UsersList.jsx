import { memo } from "react";

function StatusPill({ status }) {
  const label = status || "open";
  const cls =
    label === "assigned"
      ? "bg-teal-600/10 text-teal-700 border-teal-600/20"
      : label === "closed"
        ? "bg-gray-100 text-gray-600 border-gray-200"
        : "bg-teal-600/10 text-teal-700 border-teal-600/20";

  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function UsersList({ conversations, activeRoom, unreadCounts, onSelect }) {
  const list = Array.isArray(conversations) ? conversations : [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-[#0A1A44]">Active Chats</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Select a conversation to view messages
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {list.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-600">
            No conversations yet.
          </div>
        ) : (
          list.map((c) => {
            const rawId = c?._id;
            const id = rawId != null ? String(rawId) : null;
            const isActive = id && id === activeRoom;
            const unread = id ? (unreadCounts?.[id] || 0) : 0;
            const hasUnread = unread > 0;
            const name = c?.user?.name || "User";
            const email = c?.user?.email || "";
            const status = c?.status;

            return (
              <button
                key={id}
                onClick={() => id && onSelect?.(id)}
                className={`w-full text-left px-4 py-3 transition border-l-4 ${
                  isActive ? "bg-teal-600/5 border-teal-600" : "border-transparent"
                } ${hasUnread ? "bg-teal-50/80 hover:bg-teal-50" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0A1A44] truncate">
                        {name}
                      </p>
                      <StatusPill status={status} />
                    </div>
                    {email ? (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {email}
                      </p>
                    ) : null}
                  </div>

                  {unread > 0 ? (
                    <span className="shrink-0 min-w-6 h-6 px-2 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default memo(UsersList);

