import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_BASE_URL, API_BASE_URL } from "../../redux/config";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import {
  useGetMeQuery,
  useGetCarChatMessagesQuery,
  useSendCarChatMessageMutation,
  useCreateCarChatMutation,
} from "../../redux/services/api";
import Spinner from "../Spinner";
import toast from "react-hot-toast";

const CarChatWidget = ({ carId, carTitle, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: currentUser } = useGetMeQuery();
  const token = localStorage.getItem("token");

  // Get car chat messages
  const {
    data: chatMessages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetCarChatMessagesQuery(chatId, {
    skip: !chatId,
  });

  const [sendCarChatMessageMutation] = useSendCarChatMessageMutation();
  const [createCarChatMutation] = useCreateCarChatMutation();

  // Initialize Socket.io for real-time messages
  useEffect(() => {
    if (!token || !carId) return;

    const newSocket = io(SOCKET_BASE_URL, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on("connect", async () => {
      setSocketConnected(true);

      let createdChatId = null;
      try {
        const result = await createCarChatMutation(carId).unwrap();
        if (result?.data?._id) {
          createdChatId = result.data._id;
          setChatId(result.data._id);
        }
      } catch {
        // Chat might already exist, try to get existing chat
        try {
          const response = await fetch(
            `${API_BASE_URL}/car-chat/car/${carId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const existingChat = await response.json();

          if (existingChat?.data?._id) {
            createdChatId = existingChat.data._id;
            setChatId(existingChat.data._id);
          }
        } catch {
          // If all fails, show error
          toast.error("Unable to create chat. Please try again.");
          return;
        }
      }

      // Then join the chat room
      if (createdChatId) {
        newSocket.emit("join-chat", createdChatId);
      }
    });

    newSocket.on("disconnect", () => {
      setSocketConnected(false);
    });

    newSocket.on("new-message", (data) => {
      if (data.chatId === chatId) {
        refetchMessages();
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [token, carId, refetchMessages, createCarChatMutation, chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && chatMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId) return;

    const messageText = message.trim();
    setMessage("");

    try {
      if (socket && socketConnected) {
        // Send via socket for real-time
        socket.emit("send-message", {
          chatId: chatId, // Use chatId not carId
          message: messageText,
          messageType: "text",
        });

        refetchMessages();
      } else {
        // Fallback to REST API
        await sendCarChatMessageMutation({
          chatId: chatId, // Use chatId not carId
          message: messageText,
          messageType: "text",
        }).unwrap();

        toast.success("Message sent!");
        refetchMessages();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 bg-white rounded-lg shadow-2xl z-40 flex flex-col ${
        isOpen ? "w-96 h-[500px]" : "w-96 h-12"
      } transition-all`}
    >
      {/* Header */}
      <div className="bg-primary-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiMessageSquare />
          <span className="font-semibold">Chat with Seller</span>
          {socketConnected && (
            <span className="text-xs bg-green-500 px-2 py-0.5 rounded">
              Live
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            className="hover:opacity-90 p-1 rounded"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Chat Info */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-800 truncate">
              {carTitle || "Car Listing"}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ECE5DD]">
            {messagesLoading ? (
              <div className="flex justify-center py-8">
                <Spinner fullScreen={false} />
              </div>
            ) : !chatMessages || chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isCurrentUser =
                  currentUser?._id &&
                  msg.sender?._id &&
                  currentUser._id.toString() === msg.sender._id.toString();

                return (
                  <div
                    key={msg._id}
                    className={`flex mb-4 ${
                      isCurrentUser ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[80%] ${
                        isCurrentUser ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      {/* Avatar */}
                      {isCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden">
                          {msg.sender?.avatar ? (
                            <img
                              src={msg.sender.avatar}
                              alt={msg.sender?.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (msg.sender?.name || "User").charAt(0).toUpperCase()
                          )}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          isCurrentUser
                            ? "bg-primary-500 text-white rounded-bl-sm"
                            : "bg-white text-gray-900 rounded-br-sm border border-gray-200"
                        }`}
                      >
                        {/* Sender Name */}
                        {!isCurrentUser && msg.sender?.name && (
                          <p className="text-xs font-semibold mb-1 text-gray-700">
                            {msg.sender.name}
                          </p>
                        )}

                        {/* Message Content */}
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {msg.message}
                        </p>
                        {msg.isEdited && (
                          <p className="text-xs italic mt-1 opacity-75">
                            (edited)
                          </p>
                        )}

                        {/* Message Footer */}
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isCurrentUser ? "justify-start" : "justify-end"
                          }`}
                        >
                          <span
                            className={`text-xs ${
                              isCurrentUser
                                ? "text-primary-100"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Avatar for other user */}
                      {!isCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden">
                          {msg.sender?.avatar ? (
                            <img
                              src={msg.sender.avatar}
                              alt={msg.sender?.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (msg.sender?.name || "User").charAt(0).toUpperCase()
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CarChatWidget;
