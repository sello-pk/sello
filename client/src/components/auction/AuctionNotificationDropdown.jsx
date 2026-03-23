import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  IoNotificationsOutline as Bell,
  IoCheckmarkDoneOutline as DoneAll,
} from "react-icons/io5";
import {
  useGetUserNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@redux/services/api";
import { api } from "@redux/services/api";
import { useSocket } from "@contexts/SocketContext";

/**
 * Inspiration: NotificationDropdown — in-app alerts for auction users.
 */
export default function AuctionNotificationDropdown({ className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const { addEventListener, removeEventListener } = useSocket();

  const { data, refetch } = useGetUserNotificationsQuery(
    { page: 1, limit: 15 },
    { skip: false },
  );
  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAll] = useMarkAllNotificationsAsReadMutation();

  const list = data?.notifications || data?.data?.notifications || data || [];
  const items = Array.isArray(list) ? list : [];

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (!addEventListener) return undefined;
    const onNew = () => {
      dispatch(api.util.invalidateTags(["Notification"]));
      refetch();
    };
    addEventListener("new-notification", onNew);
    return () => removeEventListener("new-notification", onNew);
  }, [addEventListener, removeEventListener, dispatch, refetch]);

  const unread = items.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-white/90 hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-900 text-sm">Notifications</span>
            <button
              type="button"
              className="text-xs text-[#FFA602] flex items-center gap-1"
              onClick={async () => {
                try {
                  await markAll().unwrap();
                  refetch();
                } catch {
                  /* ignore */
                }
              }}
            >
              <DoneAll className="w-4 h-4" /> Mark all read
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto text-sm">
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-slate-500">No notifications</li>
            ) : (
              items.map((n) => (
                <li
                  key={n._id || n.id}
                  className={`border-b border-slate-50 px-3 py-2 hover:bg-slate-50 ${
                    !n.isRead && !n.read ? "bg-amber-50/50" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="text-left w-full"
                    onClick={async () => {
                      const id = n._id || n.id;
                      if (id && !n.isRead && !n.read) {
                        try {
                          await markRead(id).unwrap();
                        } catch {
                          /* ignore */
                        }
                      }
                      if (n.actionUrl) {
                        setOpen(false);
                        window.location.assign(n.actionUrl);
                      }
                    }}
                  >
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <p className="text-slate-600 text-xs line-clamp-2">{n.message}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="px-3 py-2 border-t border-slate-100 text-center">
            <Link
              to="/profile"
              className="text-xs text-[#FFA602] font-medium"
              onClick={() => setOpen(false)}
            >
              Account settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
