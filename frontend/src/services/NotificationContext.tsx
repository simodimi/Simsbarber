// context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { connectSocket } from "../services/socket";
import connect from "../services/Util";

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
  refreshUnread: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnread = async () => {
    try {
      const res = await connect.get("/api/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnread();
    const socket = connectSocket();
    const handleNewMessage = () => setUnreadCount((prev) => prev + 1);
    const handleBroadcast = () => setUnreadCount((prev) => prev + 1);
    socket.on("message:new", handleNewMessage);
    socket.on("message:broadcast", handleBroadcast);
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:broadcast", handleBroadcast);
    };
  }, []);

  const incrementUnread = () => setUnreadCount((prev) => prev + 1);
  const resetUnread = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        incrementUnread,
        resetUnread,
        refreshUnread: fetchUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
