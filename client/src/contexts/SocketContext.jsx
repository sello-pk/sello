import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../redux/config";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);

  // Get token from localStorage with proper error handling
  const getToken = () => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  };

  const token = getToken();

  const createSocketConnection = useCallback(() => {
    const currentToken = getToken();
    if (!currentToken) return;

    // Clean up existing socket if any
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.close();
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionAttempted(true);

    try {
      const newSocket = io(SOCKET_BASE_URL, {
        auth: { token: currentToken },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
        timeout: 15000,
        forceNew: true,
      });

      newSocket.on("connect", () => {
        console.log("🔌 Socket connected successfully!");
        setSocketConnected(true);
        // Clear any stored error flag on successful connection
        sessionStorage.removeItem("socketErrorShown");

        // Join essential rooms
        newSocket.emit("join-chats");
        newSocket.emit("join-notifications");
      });

      newSocket.on("disconnect", (reason) => {
        console.warn("⚠️ Socket disconnected:", reason);
        setSocketConnected(false);

        // Handle different disconnect reasons
        if (reason === "io server disconnect") {
          // Server disconnected, reconnect manually
          setTimeout(() => {
            newSocket.connect();
          }, 1000);
        } else if (reason === "ping timeout") {
          // Network issue - will attempt reconnection automatically
          console.log("Network timeout, attempting reconnection...");
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setSocketConnected(false);

        // Show user-friendly error message only once per session
        const errorKey = "socketErrorShown";
        if (!sessionStorage.getItem(errorKey)) {
          // Only show error if this isn't a development environment issue
          if (
            !SOCKET_BASE_URL.includes("localhost") ||
            error.message !== "xhr poll error"
          ) {
            toast.error("Real-time features connecting...", {
              duration: 3000,
              position: "bottom-right",
              icon: "🔄",
            });
          }
          sessionStorage.setItem(errorKey, "true");
        }

        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect socket...");
          newSocket.connect();
        }, 3000);
      });

      // Handle reconnection events
      newSocket.on("reconnect", (attemptNumber) => {
        console.log(`🔌 Socket reconnected after ${attemptNumber} attempts`);
        toast.success("Real-time features restored!", {
          duration: 2000,
          position: "bottom-right",
          icon: "✅",
        });
        sessionStorage.removeItem("socketErrorShown");
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`🔄 Socket reconnection attempt ${attemptNumber}`);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("❌ Socket reconnection failed");
        toast.error(
          "Unable to connect to real-time features. Some features may be limited.",
          {
            duration: 5000,
            position: "bottom-right",
            icon: "⚠️",
          },
        );
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (error) {
      console.error("Error creating socket connection:", error);
      setSocketConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      // Clean up if no token
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
      setSocket(null);
      setSocketConnected(false);
      return;
    }

    // Delay connection slightly to ensure app is ready
    const connectionDelay = setTimeout(() => {
      createSocketConnection();
    }, 100);

    return () => {
      clearTimeout(connectionDelay);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
      }
    };
  }, [token, createSocketConnection]);

  // Centralized event listener management
  const addEventListener = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      listenersRef.current.set(event, callback);
    }
  };

  const removeEventListener = (event) => {
    if (socketRef.current && listenersRef.current.has(event)) {
      socketRef.current.off(event, listenersRef.current.get(event));
      listenersRef.current.delete(event);
    }
  };

  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Socket not connected. Cannot emit event: ${event}`);
      // Optionally queue the event for later when socket reconnects
    }
  };

  const joinChat = (chatId) => {
    if (socketConnected) {
      emit("join-chat", chatId);
    }
  };

  const sendMessage = (data) => {
    if (socketConnected) {
      emit("send-message", data);
    } else {
      toast.error(
        "Connection lost. Please wait for real-time features to restore.",
        {
          duration: 3000,
          position: "bottom-right",
        },
      );
    }
  };

  // Handle new notifications globally
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      toast.success(data.message || data.title || "New notification", {
        icon: "🔔",
        duration: 7000,
        position: "bottom-right",
      });
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket]);

  const value = {
    socket,
    socketConnected,
    connectionAttempted,
    addEventListener,
    removeEventListener,
    emit,
    joinChat,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
