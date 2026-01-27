import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/features/admin/AdminLayout";
import { io } from "socket.io-client";
import {
    useGetAllSupportChatsQuery,
    useGetSupportChatMessagesAdminQuery,
    useSendAdminResponseMutation,
    useUpdateSupportChatStatusMutation,
    useGetChatbotStatsQuery,
    useGetQuickRepliesQuery,
    useUseQuickReplyMutation
} from "../../redux/services/adminApi";
import { useGetMeQuery } from "../../redux/services/api";
import { Spinner } from "../../components/ui/Loading";
import toast from "react-hot-toast";
import { 
    FiSend, 
    FiPaperclip, 
    FiSearch, 
    FiClock, 
    FiCheckCircle, 
    FiMessageSquare, 
    FiCpu,
    FiPlus,
    FiMoreVertical,
    FiAlertCircle
} from "react-icons/fi";
import { IoMdCheckmark, IoMdDoneAll } from "react-icons/io";
import { formatDistanceToNow } from "date-fns";
import { SOCKET_BASE_URL } from "../../redux/config";

const SupportChatbot = () => {
    const { chatId: chatIdFromParams } = useParams();
    const navigate = useNavigate();
    
    const [socket, setSocket] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(chatIdFromParams || null);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [socketConnected, setSocketConnected] = useState(false);
    
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const shouldAutoScrollRef = useRef(true);

    const token = localStorage.getItem("token");
    const { data: adminUser } = useGetMeQuery();
    const adminId = adminUser?._id;

    // Queries
    const { data: stats } = useGetChatbotStatsQuery(undefined, { pollingInterval: 10000 });
    const { data: quickReplies } = useGetQuickRepliesQuery({ isActive: true });
    
    const { data: chatsData, isLoading: chatsLoading, refetch: refetchChats } = useGetAllSupportChatsQuery({
        status: filterStatus === "all" ? undefined : filterStatus,
        search: searchQuery || undefined,
    }, {
        pollingInterval: 5000,
        refetchOnMountOrArgChange: true
    });

    const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useGetSupportChatMessagesAdminQuery(
        selectedChatId,
        { 
            skip: !selectedChatId,
            pollingInterval: 3000,
            refetchOnMountOrArgChange: true
        }
    );

    // Mutations
    const [sendResponse] = useSendAdminResponseMutation();
    const [updateStatus] = useUpdateSupportChatStatusMutation();
    const [useQuickReply] = useUseQuickReplyMutation();

    // Memoized chats
    const chats = React.useMemo(() => {
        if (!chatsData) return [];
        if (chatsData.chats && Array.isArray(chatsData.chats)) return chatsData.chats;
        if (Array.isArray(chatsData)) return chatsData;
        return [];
    }, [chatsData]);

    const selectedChatData = React.useMemo(() => {
        if (!selectedChatId) return null;
        return chats.find(c => String(c._id) === String(selectedChatId));
    }, [chats, selectedChatId]);

    // Update selectedChatId when URL params change
    useEffect(() => {
        if (chatIdFromParams && chatIdFromParams !== selectedChatId) {
            setSelectedChatId(chatIdFromParams);
        }
    }, [chatIdFromParams]);

    // Initialize Socket
    useEffect(() => {
        if (!token) return;

        const newSocket = io(SOCKET_BASE_URL, {
            auth: { token },
            query: { token },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            setSocketConnected(true);
            newSocket.emit('join-chats');
            if (selectedChatId) {
                newSocket.emit('join-chat', selectedChatId);
            }
        });

        newSocket.on('new-message', (data) => {
            const incomingChatId = data.chatId || data.chat?._id;
            if (String(incomingChatId) === String(selectedChatId)) {
                setMessages(prev => {
                    if (prev.find(m => m._id === data.message._id)) return prev;
                    return [...prev, data.message];
                });
            }
            refetchChats();
        });

        newSocket.on('disconnect', () => setSocketConnected(false));

        setSocket(newSocket);
        return () => newSocket.close();
    }, [token, selectedChatId]);

    // Load messages from query
    useEffect(() => {
        if (messagesData) {
            const messagesArray = Array.isArray(messagesData) ? messagesData : (messagesData?.data || []);
            setMessages(messagesArray);
            shouldAutoScrollRef.current = true;
        } else {
            setMessages([]);
        }
    }, [messagesData, selectedChatId]);

    // Auto-scroll logic
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [selectedChatId]);

    useEffect(() => {
        if (shouldAutoScrollRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
        navigate(`/admin/support-chatbot/${chatId}`);
    };

    const handleSendMessage = async (customMessage) => {
        const text = (customMessage || messageInput).trim();
        if (!text || !selectedChatId) return;

        if (!customMessage) setMessageInput("");

        try {
            await sendResponse({
                chatId: selectedChatId,
                message: text,
            }).unwrap();
            
            refetchMessages();
            refetchChats();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to send message");
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0 || !selectedChatId) return;

        try {
            await sendResponse({
                chatId: selectedChatId,
                message: '📎 Attachment',
                attachments: files
            }).unwrap();
            refetchMessages();
            refetchChats();
            toast.success("File uploaded");
        } catch (error) {
            toast.error("Failed to upload file");
        }
    };

    const handleStatusChange = async (status) => {
        if (!selectedChatId) return;
        try {
            await updateStatus({ chatId: selectedChatId, status }).unwrap();
            toast.success("Status updated");
            refetchChats();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleQuickReply = async (reply) => {
        try {
            await useQuickReply(reply._id).unwrap();
            handleSendMessage(reply.message);
        } catch (error) {
            toast.error("Failed to use quick reply");
        }
    };

    const getUserName = (chat) => {
        if (!chat) return "User";
        if (chat.customerName && chat.customerName !== "Unknown User") return chat.customerName;
        const customer = chat.participants?.find(p => p.role !== 'admin');
        return customer?.name || "User";
    };

    const getUserAvatar = (chat) => {
        if (!chat) return null;
        const customer = chat.participants?.find(p => p.role !== 'admin');
        return customer?.avatar || null;
    };

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard 
                        label="Active Support" 
                        value={stats?.activeChats || 0} 
                        icon={<FiMessageSquare className="text-blue-500" />} 
                        bg="bg-blue-50"
                    />
                    <StatCard 
                        label="Pending" 
                        value={stats?.pending || 0} 
                        icon={<FiClock className="text-yellow-500" />} 
                        bg="bg-yellow-50"
                    />
                    <StatCard 
                        label="Resolved Today" 
                        value={stats?.resolvedToday || stats?.resolved || 0} 
                        icon={<FiCheckCircle className="text-green-500" />} 
                        bg="bg-green-50"
                    />
                    <StatCard 
                        label="Avg. Response" 
                        value={stats?.avgResponseTime || "5m"} 
                        icon={<FiClock className="text-purple-500" />} 
                        bg="bg-purple-50"
                    />
                </div>

                {/* Main Chat Interface */}
                <div className="flex-1 flex bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    
                    {/* Chat List Sidebar */}
                    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <FiCpu className="text-primary-500" />
                                Chats
                            </h2>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {chatsLoading ? (
                                <div className="p-4 flex justify-center"><Spinner fullScreen={false} /></div>
                            ) : chats.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">No chats found</div>
                            ) : (
                                chats.map((chat) => (
                                    <div 
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat._id)}
                                        className={`p-4 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                                            String(selectedChatId) === String(chat._id) ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                                                {getUserAvatar(chat) ? (
                                                    <img src={getUserAvatar(chat)} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    getUserName(chat).charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold text-sm truncate">{getUserName(chat)}</p>
                                                    <span className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(chat.updatedAt || Date.now()), { addSuffix: false })}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage || chat.subject || "No message"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                        {selectedChatId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                                            {getUserAvatar(selectedChatData) ? (
                                                <img src={getUserAvatar(selectedChatData)} className="w-full h-full rounded-full object-cover" alt="" />
                                            ) : (
                                                getUserName(selectedChatData).charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white leading-tight">
                                                {getUserName(selectedChatData)}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-gray-400 animate-pulse'}`}></span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                                    {socketConnected ? 'Connected' : 'Reconnecting...'} • {selectedChatData?.status || 'Open'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <select 
                                            className="text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                            value={selectedChatData?.status || 'open'}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                        >
                                            <option value="open">Open</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={messagesContainerRef}>
                                    {messagesLoading ? (
                                        <div className="flex justify-center h-full items-center"><Spinner fullScreen={false} /></div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                            <FiMessageSquare size={48} className="opacity-20" />
                                            <p className="text-sm">No conversation history found</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isAdmin = msg.sender?.role === 'admin' || String(msg.sender?._id || msg.sender) === String(adminId);
                                            const isBot = msg.isBot;
                                            
                                            return (
                                                <div key={msg._id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex flex-col max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                                                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                                                            isAdmin 
                                                                ? 'bg-primary-500 text-white rounded-tr-none' 
                                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                                        }`}>
                                                            {msg.attachments && msg.attachments.length > 0 && (
                                                                <div className="space-y-2 mb-2">
                                                                    {msg.attachments.map((url, idx) => (
                                                                        <img
                                                                            key={idx}
                                                                            src={url}
                                                                            alt="Attachment"
                                                                            className="max-w-full rounded-lg"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                                            <div className={`flex items-center gap-1 mt-1.5 opacity-60 ${isAdmin ? 'justify-end' : ''}`}>
                                                                <span className="text-[9px] font-medium uppercase">
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {isAdmin && (
                                                                    <span className="text-[10px]">
                                                                        {msg.seenBy?.length > 0 ? <IoMdDoneAll /> : <IoMdCheckmark />}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Replies bar */}
                                {quickReplies?.length > 0 && (
                                    <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-white/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 no-scrollbar">
                                        {quickReplies.map(reply => (
                                            <button 
                                                key={reply._id}
                                                onClick={() => handleQuickReply(reply)}
                                                className="whitespace-nowrap px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs hover:border-primary-500 hover:text-primary-500 transition shadow-sm font-medium"
                                            >
                                                {reply.title}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Message Input */}
                                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload} 
                                        className="hidden" 
                                        multiple 
                                    />
                                    <div className="flex gap-3 items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1.5 rounded-xl focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-gray-400 hover:text-primary-500 transition"
                                        >
                                            <FiPaperclip size={20} />
                                        </button>
                                        <input 
                                            type="text" 
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Type your response here..."
                                            className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white px-2"
                                        />
                                        <button 
                                            onClick={() => handleSendMessage()}
                                            disabled={!messageInput.trim()}
                                            className="bg-primary-500 text-white p-2.5 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:grayscale transition shadow-md"
                                        >
                                            <FiSend size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="m-auto text-center space-y-4 max-w-sm px-6">
                                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiCpu size={40} className="text-primary-500" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white font-outfit">Ready to Assist</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-inter">
                                    Select a conversation from the list to start responding. You can use Quick Replies to speed up your support.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const StatCard = ({ label, value, icon, bg }) => (
    <div className={`p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 bg-white dark:bg-gray-800 transition-all hover:shadow-md`}>
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center text-xl`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black font-outfit dark:text-white">{value}</p>
        </div>
    </div>
);

export default SupportChatbot;
