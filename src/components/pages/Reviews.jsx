// components/pages/Reviews.jsx
import { useCallback, useEffect, useState } from "react";
import { Trash2, Star, Plus, Edit2, ChevronUp, ChevronDown } from "lucide-react";
import DataTable from "../common/DataTable";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import ModalForm from "../common/ModalForm";
import adminApi from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;

const emptyFormData = {
  user_name: "",
  message: "",
  ratings: 5,
  order: "",
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { reviews: fetched } = await adminApi.fetchReviews();
      setReviews(Array.isArray(fetched) ? fetched : []);
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to load reviews."),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleOpenAddModal = () => {
    setEditingReview(null);
    setFormData({
      ...emptyFormData,
      order: reviews.length + 1,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (review, e) => {
    e.stopPropagation();
    setEditingReview(review);
    setFormData({
      user_name: review.user_name || "",
      message: review.message || "",
      ratings: review.ratings || 5,
      order: review.order ?? "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setFormData(emptyFormData);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userName = formData.user_name.trim();
    const message = formData.message.trim();
    const ratings = Number(formData.ratings);

    if (!userName || !message) {
      setFormError("User name and review message are required.");
      return;
    }

    if (isNaN(ratings) || ratings < 1 || ratings > 5) {
      setFormError("Rating must be between 1 and 5.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      const payload = {
        user_name: userName,
        message,
        ratings,
        ...(formData.order !== "" ? { order: Number(formData.order) } : {}),
      };

      if (editingReview) {
        await adminApi.updateReview(editingReview._id, payload);
        setNotice({ type: "success", message: "Review updated successfully." });
      } else {
        await adminApi.createReview(payload);
        setNotice({ type: "success", message: "Review added successfully." });
      }

      handleCloseModal();
      await fetchReviews();
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to save review right now."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMove = async (reviewId, direction, e) => {
    e.stopPropagation();
    if (isReordering) return;
    const index = reviews.findIndex(
      (r) => String(r._id || r.id) === String(reviewId)
    );
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reviews.length) return;

    const reordered = [...reviews];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    // Optimistically update local sequence in UI
    const updatedWithOrder = reordered.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setReviews(updatedWithOrder);

    try {
      setIsReordering(true);
      const orderedIds = updatedWithOrder.map((item) => item._id || item.id);
      await adminApi.reorderReviews(orderedIds);
      setNotice({ type: "success", message: "Review sequence updated." });
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Failed to update review sequence."),
      });
      await fetchReviews(); // Rollback to server state
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete?._id) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteReview(reviewToDelete._id);
      setNotice({ type: "success", message: "Review deleted." });
      setShowDeleteDialog(false);
      setReviewToDelete(null);
      await fetchReviews();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to delete this review."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: "order",
      label: "Position",
      render: (value, row) => {
        const rowId = row._id || row.id;
        const index = reviews.findIndex(
          (r) => String(r._id || r.id) === String(rowId)
        );
        const displayOrder =
          index !== -1
            ? index + 1
            : typeof value === "number" && value > 0
            ? value
            : 1;
        const isFirst = index === 0;
        const isLast = index === reviews.length - 1;

        return (
          <div
            className="flex items-center space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-semibold text-gray-700 w-7 text-center text-sm">
              #{displayOrder}
            </span>
            <div className="flex flex-col">
              <button
                type="button"
                disabled={isFirst || isReordering}
                onClick={(e) => handleMove(rowId, "up", e)}
                title={isFirst ? "Already at top" : "Move Up in sequence"}
                className={`p-0.5 rounded transition-colors ${
                  isFirst || isReordering
                    ? "opacity-20 cursor-not-allowed text-gray-400"
                    : "text-gray-600 hover:text-purple-600 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isLast || isReordering}
                onClick={(e) => handleMove(rowId, "down", e)}
                title={isLast ? "Already at bottom" : "Move Down in sequence"}
                className={`p-0.5 rounded transition-colors ${
                  isLast || isReordering
                    ? "opacity-20 cursor-not-allowed text-gray-400"
                    : "text-gray-600 hover:text-purple-600 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: "user_name",
      label: "User",
      sortable: true,
    },
    {
      key: "message",
      label: "Review",
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate" title={value}>
            {value}
          </p>
        </div>
      ),
    },
    {
      key: "ratings",
      label: "Rating",
      sortable: true,
      render: (value) => renderStars(value),
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
  ];

  const actions = (review) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => handleOpenEditModal(review, e)}
        className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-purple-600 transition-colors"
        title="Edit Review"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setReviewToDelete(review);
          setShowDeleteDialog(true);
        }}
        className="p-1 rounded hover:bg-gray-100 text-red-600 hover:text-red-700 transition-colors"
        title="Delete Review"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.ratings || 0), 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer reviews and control their display sequence.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Review</span>
        </button>
      </div>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reviews.length}
              </p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Rating
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
                {renderStars(Math.round(avgRating))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Rating Distribution
            </p>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.ratings === rating).length;
              const percentage =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;

              return (
                <div key={rating} className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-gray-600 w-3">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        actions={actions}
        onRowClick={setSelectedReview}
        searchPlaceholder="Search reviews..."
      />

      {/* Add / Edit Review Modal */}
      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingReview ? "Edit Review" : "Add Review"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Name *
            </label>
            <input
              type="text"
              required
              value={formData.user_name}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating *
              </label>
              <select
                value={formData.ratings}
                onChange={(e) =>
                  setFormData({ ...formData, ratings: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                <option value={3}>3 Stars ⭐⭐⭐</option>
                <option value={2}>2 Stars ⭐⭐</option>
                <option value={1}>1 Star ⭐</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position (Sequence)
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: e.target.value })
                }
                placeholder="e.g. 1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Message *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Enter review message..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving..." : editingReview ? "Update Review" : "Save Review"}
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setReviewToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Review"}
      />

      {selectedReview && !showDeleteDialog && !showModal && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
};

// Review Detail Modal
const ReviewDetailModal = ({ review, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Review Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">User</label>
              <p className="text-gray-900 font-medium">{review.user_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Rating
                </label>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.ratings
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm text-gray-700">
                    {review.ratings}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Sequence Position
                </label>
                <p className="text-gray-900 font-medium mt-1">
                  #{review.order || "-"}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Review
              </label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{review.message}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-gray-900">
                {review.created_at ? new Date(review.created_at).toLocaleString() : "-"}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
