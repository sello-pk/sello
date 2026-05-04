import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMessageSquare,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiImage,
  FiBell,
} from "react-icons/fi";
import {
  useGetSellerBuyerChatsQuery,
  useGetCarChatMessagesQuery,
  useSendCarChatMessageMutation,
  useEditCarChatMessageMutation,
  useDeleteCarChatMessageMutation,
  useGetMeQuery,
} from "../../redux/services/api";
import { Spinner } from "../../components/ui/Loading";
import toast from "react-hot-toast";
import { useSocket } from "../../contexts/SocketContext";

const SellerChats = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const { socket, socketConnected, joinChat, sendMessage } = useSocket();

  const token = localStorage.getItem("token");
  const { data: currentUser } = useGetMeQuery(undefined, { skip: !token });
  const {
    data: chats = [],
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useGetSellerBuyerChatsQuery(undefined, {
    // Disable polling - rely on socket.io for real-time updates
  });
  const {
    data: messagesData = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetCarChatMessagesQuery(selectedChat, {
    skip: !selectedChat,
    // Disable polling - rely on socket.io for real-time updates
  });
  const [sendMessageMutation] = useSendCarChatMessageMutation();
  const [editMessage] = useEditCarChatMessageMutation();
  const [deleteMessage] = useDeleteCarChatMessageMutation();

  // Initialize messages from data and handle real-time updates
  useEffect(() => {
    if (messagesData && Array.isArray(messagesData)) {
      const filteredMessages = messagesData.filter((msg) => !msg.isDeleted);
      setMessages(filteredMessages);
      shouldAutoScrollRef.current = true;
    }
  }, [messagesData]); // Re-run when messagesData changes (for proper sync)

  // Store RTK Query functions in refs to prevent infinite re-renders
  const refetchMessagesRef = useRef(refetchMessages);
  const refetchChatsRef = useRef(refetchChats);

  useEffect(() => {
    refetchMessagesRef.current = refetchMessages;
    refetchChatsRef.current = refetchChats;
  });

  // Listen for socket events using centralized socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log("New message received in SellerChats:", data);
      if (data.chatId === selectedChat) {
        // Refetch messages to ensure we have the latest data
        refetchMessagesRef.current();
        refetchChatsRef.current(); // Update chat list for unread counts
      }
    };

    const handleMessageDeleted = (data) => {
      console.log("Message deleted in SellerChats:", data);
      if (data.chatId === selectedChat) {
        refetchMessagesRef.current();
      }
    };

    const handleMessageUpdated = (data) => {
      console.log("Message updated in SellerChats:", data);
      if (data.chatId === selectedChat) {
        refetchMessagesRef.current();
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("message-updated", handleMessageUpdated);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("message-updated", handleMessageUpdated);
    };
  }, [socket, selectedChat]);

  // Join chat room when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      joinChat(selectedChat);
      refetchMessagesRef.current();
    }
  }, [selectedChat, joinChat]); // Use ref for refetchMessages to prevent infinite loop

  // Track user scroll to determine if we should auto-scroll (rAF: one layout read per frame)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        ticking = false;
        rafId = null;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        shouldAutoScrollRef.current = isNearBottom;
      });
    };

    const scrollOpts = { passive: true };
    container.addEventListener("scroll", handleScroll, scrollOpts);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll, scrollOpts);
    };
  }, [selectedChat]);

  // Auto-scroll to bottom only if user is near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    if (shouldAutoScrollRef.current) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const messageText = message.trim();
    setMessage("");

    try {
      if (socket && socketConnected) {
        // Send via socket for real-time updates
        sendMessage({
          chatId: selectedChat,
          message: messageText,
          messageType: "text",
        });
        // Don't refetch - socket event will update the messages
        refetchChatsRef.current(); // Only update chat list
      } else {
        // Fallback to REST API if socket not connected
        await sendMessageMutation({
          chatId: selectedChat,
          message: messageText,
        }).unwrap();
        refetchMessagesRef.current();
        refetchChatsRef.current();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editMessageText.trim()) return;

    try {
      await editMessage({
        messageId,
        message: editMessageText.trim(),
      }).unwrap();
      setEditingMessageId(null);
      setEditMessageText("");
      // Message updated via socket event, no refetch needed
    } catch (error) {
      toast.error(error?.data?.message || "Failed to edit message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      await deleteMessage(messageId).unwrap();
      // Message deleted via socket event, no refetch needed
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete message");
    }
  };

  const selectedChatData = chats.find((c) => c._id === selectedChat);
  const buyer =
    selectedChatData?.buyer ||
    selectedChatData?.participants?.find(
      (p) => p._id.toString() !== currentUser?._id?.toString(),
    );

  const getUnreadCount = (chat) => {
    if (chat.unreadCount && typeof chat.unreadCount === "object") {
      return chat.unreadCount[currentUser?._id] || 0;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-200"
              aria-label="Go back"
            >
              <FiArrowLeft size={24} />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Buyer Messages
              </h1>
              <p className="mt-1 text-gray-600">
                Manage conversations with buyers
              </p>
            </div>
          </div>
          {socketConnected && (
            <div className="flex shrink-0 items-center gap-2 text-green-600">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
              <span className="text-sm">Connected</span>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex min-h-[min(520px,85dvh)] flex-col md:h-[calc(100vh-11rem)] md:max-h-[900px]">
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              {/* Chat List Sidebar */}
              <div
                className={`flex min-h-0 w-full flex-col border-b border-gray-200 md:w-[34%] md:max-w-sm md:flex-shrink-0 md:border-b-0 md:border-r ${selectedChat ? "hidden md:flex" : "flex"}`}
              >
                <div className="border-b border-gray-200 p-4">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Conversations
                  </h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chatsLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner fullScreen={false} />
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No buyer conversations yet
                    </div>
                  ) : (
                    chats.map((chat) => {
                    const unreadCount = getUnreadCount(chat);
                    const chatBuyer =
                      chat.buyer ||
                      chat.participants?.find(
                        (p) =>
                          p._id.toString() !== currentUser?._id?.toString(),
                      );
                    const isSelected = chat._id === selectedChat;

                      return (
                        <div
                          key={chat._id}
                          onClick={() => setSelectedChat(chat._id)}
                          className={`cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 ${
                            isSelected
                              ? "border-l-4 border-l-primary-500 bg-primary-50"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 font-semibold text-white">
                              {chatBuyer?.avatar ? (
                                <img
                                  src={chatBuyer.avatar}
                                  alt={chatBuyer.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                chatBuyer?.name?.charAt(0)?.toUpperCase() || "B"
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center justify-between">
                                <h3 className="truncate font-semibold text-gray-900">
                                  {chatBuyer?.name || "Buyer"}
                                </h3>
                                {unreadCount > 0 && (
                                  <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-bold text-white">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="mb-1 truncate text-sm text-gray-600">
                                {chat.car?.title || "Car Listing"}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {chat.lastMessage || "No messages yet"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div
                className={`flex min-h-0 min-w-0 flex-1 flex-col ${selectedChat ? "flex" : "hidden md:flex"}`}
              >
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
                        aria-label="Back to conversations"
                        onClick={() => setSelectedChat(null)}
                      >
                        <FiArrowLeft size={20} />
                      </button>
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 font-semibold text-white">
                          {buyer?.avatar ? (
                            <img
                              src={buyer.avatar}
                              alt={buyer.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            buyer?.name?.charAt(0)?.toUpperCase() || "B"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {buyer?.name || "Buyer"}
                          </h3>
                          <p className="truncate text-sm text-gray-600">
                            {selectedChatData?.car?.title || "Car Listing"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 bg-[#ECE5DD] space-y-3"
                  >
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Spinner fullScreen={false} />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isCurrentUser =
                          currentUser?._id &&
                          msg.sender?._id &&
                          currentUser._id.toString() ===
                            msg.sender._id.toString();
                        const isEditing = editingMessageId === msg._id;

                        return (
                          <div
                            key={msg._id}
                            className={`flex mb-4 ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex items-end gap-2 max-w-[80%] ${
                                isCurrentUser ? "flex-row" : "flex-row-reverse"
                              }`}
                            >
                              {isCurrentUser && (
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {msg.sender?.avatar ? (
                                    <img
                                      src={msg.sender.avatar}
                                      alt={msg.sender.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    msg.sender?.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "B"
                                  )}
                                </div>
                              )}
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isCurrentUser
                                    ? "bg-primary-500 text-white rounded-bl-sm"
                                    : "bg-white text-gray-900 rounded-br-sm border border-gray-200"
                                }`}
                              >
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <label htmlFor="edit-message" className="sr-only">Edit message</label>
                                    <input
                                      id="edit-message"
                                      type="text"
                                      value={editMessageText}
                                      onChange={(e) =>
                                        setEditMessageText(e.target.value)
                                      }
                                      className="w-full px-2 py-1 border rounded text-gray-900"
                                      autoFocus
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          handleEditMessage(msg._id);
                                        }
                                        if (e.key === "Escape") {
                                          setEditingMessageId(null);
                                        }
                                      }}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleEditMessage(msg._id)
                                        }
                                        className="text-xs bg-white text-primary-500 px-2 py-1 rounded"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingMessageId(null);
                                          setEditMessageText("");
                                        }}
                                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                      {msg.message}
                                    </p>
                                    <div
                                      className={`flex items-center gap-1 mt-1 ${
                                        isCurrentUser
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >
                                      <span className="text-xs opacity-70">
                                        {new Date(
                                          msg.createdAt,
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {isCurrentUser && (
                                        <div className="flex gap-1 ml-2">
                                          <button
                                            onClick={() => {
                                              setEditingMessageId(msg._id);
                                              setEditMessageText(msg.message);
                                            }}
                                            className="opacity-70 hover:opacity-100"
                                          >
                                            <FiEdit2 size={12} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteMessage(msg._id)
                                            }
                                            className="opacity-70 hover:opacity-100"
                                          >
                                            <FiTrash2 size={12} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                              {!isCurrentUser && (
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {msg.sender?.avatar ? (
                                    <img
                                      src={msg.sender.avatar}
                                      alt={msg.sender.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    msg.sender?.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "B"
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
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <label htmlFor="message-input" className="sr-only">Type a message</label>
                      <input
                        id="message-input"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="p-2 bg-primary-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                      >
                        <FiSend size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiMessageSquare
                      size={48}
                      className="mx-auto mb-4 opacity-50"
                    />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerChats;
