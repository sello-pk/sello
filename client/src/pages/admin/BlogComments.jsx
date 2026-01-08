import { useState } from "react";
import {
  useGetAllCommentsQuery,
  useUpdateCommentStatusMutation,
  useDeleteCommentMutation,
} from "../../redux/services/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import Spinner from "../../components/Spinner";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiTrash2, FiSearch, FiMessageSquare, FiAlertCircle } from "react-icons/fi";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import { formatDate } from "../../utils/format";
import { Link } from "react-router-dom";

const BlogComments = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const { data, isLoading, refetch } = useGetAllCommentsQuery({
    status: filter,
    search,
    page,
    limit: 20,
  });

  const [updateStatus] = useUpdateCommentStatusMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const comments = data?.comments || [];
  const pagination = data?.pagination || {};

  const handleStatusUpdate = async (commentId, newStatus) => {
    try {
      await updateStatus({ commentId, status: newStatus }).unwrap();
      toast.success(`Comment marked as ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteClick = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete).unwrap();
      toast.success("Comment deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      spam: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blog Comments</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and moderate comments on your blog posts
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {["all", "pending", "approved", "spam"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner fullScreen={false} />
            </div>
          ) : comments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="flex justify-center mb-4">
                <FiMessageSquare className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No comments found</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <div key={comment._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4 w-full">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                         {comment.user?.avatar ? (
                             <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full object-cover" />
                         ) : (
                             <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                 {comment.user?.name?.charAt(0) || "U"}
                             </div>
                         )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{comment.user?.name || "Unknown User"}</h4>
                            <span className="text-xs text-gray-500">• {formatDate(comment.createdAt)}</span>
                            {getStatusBadge(comment.status)}
                        </div>
                        <p className="text-gray-800 text-base mb-2">{comment.content}</p>
                        
                         {comment.blog && (
                             <div className="text-xs text-gray-500 flex items-center gap-1">
                                 <span>on:</span>
                                 <Link to={`/blog/${comment.blog.slug || comment.blog._id}`} target="_blank" className="font-medium hover:underline text-primary-600 truncate max-w-xs">
                                     {comment.blog.title}
                                 </Link>
                             </div>
                         )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {comment.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(comment._id, "approved")}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Approve"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(comment._id, "rejected")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Reject"
                          >
                            <FiX size={18} />
                          </button>
                        </>
                      )}
                      {comment.status === "approved" && (
                          <button
                            onClick={() => handleStatusUpdate(comment._id, "spam")}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            title="Mark as Spam"
                          >
                              <FiAlertCircle size={18} />
                          </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(comment._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-gray-600">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>

        {/* Delete Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          confirmText="Delete"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
        />
      </div>
    </AdminLayout>
  );
};

export default BlogComments;
