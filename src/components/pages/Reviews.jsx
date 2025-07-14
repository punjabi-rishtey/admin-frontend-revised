// components/pages/Reviews.jsx
import { useState, useEffect } from "react";
import { Trash2, Star } from "lucide-react";
import DataTable from "../common/DataTable";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { reviews } = await adminApi.fetchReviews();
      setReviews(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteReview(selectedReview._id);
      fetchReviews();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting review:", error);
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
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (review) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSelectedReview(review);
        setShowDeleteDialog(true);
      }}
      className="p-1 rounded hover:bg-gray-100"
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </button>
  );

  if (loading) return <LoadingSpinner />;

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.ratings, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>

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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />

      {selectedReview && !showDeleteDialog && (
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
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">User</label>
              <p className="text-gray-900">{review.user_name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Rating
              </label>
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= review.ratings
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-700">{review.ratings}/5</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Review
              </label>
              <p className="text-gray-900 mt-1">{review.message}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-gray-900">
                {new Date(review.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
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
