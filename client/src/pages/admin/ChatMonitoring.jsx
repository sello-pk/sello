import { useState } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import {
    useGetAllChatsQuery,
    useGetChatStatisticsQuery,
    useGetAllSupportChatsQuery,
    useGetChatMessagesQuery,
    useGetSupportChatMessagesAdminQuery,
} from "../../redux/services/adminApi";
import { Spinner } from "../../components/ui/Loading";
import { FiSearch, FiMessageSquare, FiTrendingUp, FiEye, FiX } from "react-icons/fi";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { MdFlag } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

const ChatMonitoring = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const { data: chatsData, isLoading: chatsLoading } = useGetAllChatsQuery({});
    const { data: stats } = useGetChatStatisticsQuery();
    const { data: supportChatsData, isLoading: supportChatsLoading } = useGetAllSupportChatsQuery({}, {
        pollingInterval: 5000,
    });

    const chatList = chatsData?.chats || [];
    const supportChats = supportChatsData?.chats || [];
    const allChats = [...supportChats, ...chatList];

    // Filter chats based on search
    const filteredChats = allChats.filter(chat => {
        if (!searchQuery) return true;
        const userName = chat.user?.name || chat.participants?.[0]?.name || chat.customerName || '';
        const lastMessage = chat.lastMessage || '';
        return userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalMessages = stats?.totalMessages || allChats.reduce((sum, chat) => sum + (chat.messageCount || 0), 0);
    const flaggedMessages = supportChats.filter(c => c.priority === 'urgent' || c.priority === 'high').length;
    const todayMessages = allChats.filter(chat => {
        const today = new Date().setHours(0, 0, 0, 0);
        const chatDate = new Date(chat.lastMessageAt || chat.createdAt).setHours(0, 0, 0, 0);
        return chatDate === today;
    }).length;

    const handleOpenChat = (chat) => {
        setSelectedChat(chat);
        setShowChatModal(true);
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Chat Monitoring</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor buyer-seller communications and support inquiries
                    </p>
                </div>

                {/* Overview Cards (kept as in original) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Messages */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">Total Messages</p>
                                <p className="text-3xl font-bold text-gray-900">{totalMessages}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                                <HiChatBubbleLeftRight className="text-white" size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Flagged Messages */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">Flagged Support</p>
                                <p className="text-3xl font-bold text-gray-900">{flaggedMessages}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                                <MdFlag className="text-white" size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Today's Messages */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">Today's Chats</p>
                                <p className="text-3xl font-bold text-gray-900">{todayMessages}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                                <FiMessageSquare className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat List Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last Message</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredChats.map((chat) => (
                                    <tr key={chat._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {chat.user?.name || chat.participants?.[0]?.name || chat.customerName || 'User'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                            {chat.lastMessage}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${chat.chatType === 'support' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {chat.chatType === 'support' ? 'Support' : 'Car Inquiry'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {chat.lastMessageAt ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true }) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleOpenChat(chat)}
                                                className="text-primary-600 hover:text-primary-900 font-medium text-sm flex items-center gap-1"
                                            >
                                                <FiEye /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chat Message Viewer Modal */}
                {showChatModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="font-bold text-lg">
                                    Chat with {selectedChat.user?.name || selectedChat.customerName || 'User'}
                                </h3>
                                <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                <ChatMessagesList chatId={selectedChat._id} chatType={selectedChat.chatType} />
                            </div>
                            {selectedChat.chatType === 'support' && (
                                <div className="p-4 border-t text-center">
                                    <button 
                                        onClick={() => navigate(ROUTES.admin.supportChatWithId(selectedChat._id))}
                                        className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition"
                                    >
                                        Open in Support Chat to Reply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

const ChatMessagesList = ({ chatId, chatType }) => {
    const isSupport = chatType === 'support';
    
    // Hooks should generally be at top level, but for this specific component we'll use them.
    // However, they are already imported at the top of the file.
    const { data: supportMsgs, isLoading: sLoading } = useGetSupportChatMessagesAdminQuery(chatId, { skip: !isSupport });
    const { data: carMsgs, isLoading: cLoading } = useGetChatMessagesQuery({ chatId }, { skip: isSupport });

    const loading = isSupport ? sLoading : cLoading;
    const messages = (isSupport ? supportMsgs : carMsgs) || [];

    if (loading) return <div className="flex justify-center p-8"><Spinner fullScreen={false} /></div>;
    if (messages.length === 0) return <div className="text-center p-8 text-gray-500">No messages found.</div>;

    return (
        <div className="space-y-4">
            {messages.map((msg, i) => (
                <div key={msg._id || i} className={`flex ${msg.sender?.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender?.role === 'admin' ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-white border rounded-tl-none shadow-sm'}`}>
                        <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender?.name || (msg.isBot ? 'Bot' : 'User')}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-[10px] mt-1 opacity-50 text-right">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatMonitoring;
