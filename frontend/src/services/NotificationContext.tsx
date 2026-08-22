// context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { connectSocket } from "../services/socket";
import connect from "../services/Util";

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Récupérer le compteur initial au chargement
  const fetchInitialUnread = async () => {
    try {
      const res = await connect.get("/api/notifications/unread"); // si vous avez cette route
      // Sinon, on peut compter via /api/messages/me
      setUnreadCount(res.data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchInitialUnread();

    const socket = connectSocket();

    // Incrémente quand l'admin envoie un message
    const handleNewMessage = () => {
      setUnreadCount((prev) => prev + 1);
    };

    // Pour un broadcast, on incrémente aussi
    const handleBroadcast = () => {
      setUnreadCount((prev) => prev + 1);
    };

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
      value={{ unreadCount, setUnreadCount, incrementUnread, resetUnread }}
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
