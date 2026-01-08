import { useState } from "react";
import {
  useGetBlogCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetMeQuery,
} from "../../../redux/services/api";
import { FiMessageSquare, FiSend, FiTrash2, FiClock } from "react-icons/fi";
import { formatDate } from "../../../utils/format";
import { Link as RouterLink } from "react-router-dom";
import toast from "react-hot-toast";

const BlogCommentsSection = ({ blogId }) => {
  // Get user data using RTK Query instead of useSelector
  const { data: userData } = useGetMeQuery();
  const user = userData?.user;

  const [page, setPage] = useState(1);
  const [commentContent, setCommentContent] = useState("");

  const { data, isLoading } = useGetBlogCommentsQuery({
    blogId,
    page,
    limit: 10,
  });
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const comments = data?.data?.comments || [];
  const pagination = data?.data?.pagination || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await createComment({ blogId, content: commentContent }).unwrap();
      setCommentContent("");
      toast.success("Comment submitted! It will appear after moderation.");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      await deleteComment(commentId).unwrap();
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mt-12"
      id="comments"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiMessageSquare />
        Comments ({pagination.total || 0})
      </h3>

      {/* Comment Form */}
      <div className="mb-10">
        {user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {commentContent.length}/1000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={isPosting || !commentContent.trim()}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPosting ? (
                      "Posting..."
                    ) : (
                      <>
                        <FiSend /> Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">
              Please log in to leave a comment.
            </p>
            <RouterLink
              to="/login"
              state={{ from: `/blog/${blogId}` }}
              className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Log In
            </RouterLink>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <div className="flex-shrink-0">
                {comment.user?.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                    {comment.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {comment.user?.name || "Unknown User"}
                    </h4>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <FiClock size={14} />
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                {(user?._id === comment.user?._id ||
                  user?.role === "admin") && (
                  <div className="mt-1 flex justify-end">
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 border rounded ${
                  page === pageNum
                    ? "bg-primary-500 text-white border-primary-500"
                    : "hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogCommentsSection;
