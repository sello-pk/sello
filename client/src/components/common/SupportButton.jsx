import { FiMessageSquare } from "react-icons/fi";
import { useSupportChat } from "../../contexts/SupportChatContext";

const SupportButton = ({ className = "", iconSize = 20, showText = false }) => {
  const { openSupportChat } = useSupportChat();

  return (
    <button
      onClick={() => openSupportChat()}
      className={`flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all ${className}`}
    >
      <FiMessageSquare size={iconSize} />
      {showText && <span>Support</span>}
    </button>
  );
};

export default SupportButton;
