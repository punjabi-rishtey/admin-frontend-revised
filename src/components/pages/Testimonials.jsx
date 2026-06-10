import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import DataTable from "../common/DataTable";
import ModalForm from "../common/ModalForm";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;

const formatDate = (value, fallback = "Not specified") => {
  if (!value) return fallback;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return parsedDate.toLocaleDateString();
};

const emptyFormData = {
  user_name: "",
  message: "",
  image_url: "",
  groom_registration_date: "",
  bride_registration_date: "",
  marriage_date: "",
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const { testimonials: loadedTestimonials } =
        await adminApi.fetchTestimonials();
      setTestimonials(Array.isArray(loadedTestimonials) ? loadedTestimonials : []);
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to load testimonials."),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTestimonial(null);
    setFormError("");
    setFormData(emptyFormData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userName = formData.user_name.trim();
    const message = formData.message.trim();
    const isCreate = !selectedTestimonial;

    if (!userName || !message) {
      setFormError("Couple name and message are required.");
      return;
    }

    if (isCreate && !(formData.image_url instanceof File)) {
      setFormError("Please upload an image before creating the testimonial.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      const payload = {
        ...formData,
        user_name: userName,
        message,
      };

      if (selectedTestimonial) {
        await adminApi.updateTestimonial(selectedTestimonial._id, payload);
        setNotice({ type: "success", message: "Testimonial updated." });
      } else {
        await adminApi.createTestimonial(payload);
        setNotice({ type: "success", message: "Testimonial created." });
      }

      handleCloseModal();
      await fetchTestimonials();
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to save the testimonial right now.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData({ ...formData, image_url: "" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setFormData({
      ...formData,
      image_url: file,
    });
  };

  const handleDelete = async () => {
    if (!selectedTestimonial?._id) return;

    try {
      setIsDeleting(true);
      await adminApi.deleteTestimonial(selectedTestimonial._id);
      setNotice({ type: "success", message: "Testimonial deleted." });
      setShowDeleteDialog(false);
      setSelectedTestimonial(null);
      await fetchTestimonials();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to delete this testimonial."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      user_name: testimonial.user_name || "",
      message: testimonial.message || "",
      image_url: testimonial.image_url || "",
      groom_registration_date:
        testimonial.groom_registration_date?.split("T")[0] || "",
      bride_registration_date:
        testimonial.bride_registration_date?.split("T")[0] || "",
      marriage_date: testimonial.marriage_date?.split("T")[0] || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const columns = [
    {
      key: "user_name",
      label: "Couple Name",
      sortable: true,
    },
    {
      key: "message",
      label: "Message",
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "marriage_date",
      label: "Marriage Date",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "created_at",
      label: "Added On",
      sortable: true,
      render: (value) => formatDate(value, "-"),
    },
    {
      key: "image_url",
      label: "Has Image",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  const actions = (testimonial) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(event) => {
          event.stopPropagation();
          handleEdit(testimonial);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title="Edit Testimonial"
      >
        <Edit2 className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          setSelectedTestimonial(testimonial);
          setShowDeleteDialog(true);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title="Delete Testimonial"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Owner&apos;s Creatives (Testimonials)
        </h1>
        <button
          onClick={() => {
            setSelectedTestimonial(null);
            setFormData(emptyFormData);
            setFormError("");
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
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

      <DataTable
        columns={columns}
        data={testimonials}
        actions={actions}
        searchPlaceholder="Search testimonials..."
        defaultSort={{ key: "created_at", direction: "desc" }}
      />

      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedTestimonial ? "Edit Testimonial" : "Add Testimonial"}
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
              Couple Name
            </label>
            <input
              type="text"
              required
              value={formData.user_name}
              onChange={(event) =>
                setFormData({ ...formData, user_name: event.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(event) =>
                setFormData({ ...formData, message: event.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="mt-1 text-xs text-gray-500">
              {selectedTestimonial
                ? "Upload a new image only if you want to replace the current one."
                : "An image is required for new testimonials."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Groom Registration
              </label>
              <input
                type="date"
                value={formData.groom_registration_date}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    groom_registration_date: event.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bride Registration
              </label>
              <input
                type="date"
                value={formData.bride_registration_date}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    bride_registration_date: event.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marriage Date
            </label>
            <input
              type="date"
              value={formData.marriage_date}
              onChange={(event) =>
                setFormData({ ...formData, marriage_date: event.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isSaving
                ? selectedTestimonial
                  ? "Updating..."
                  : "Creating..."
                : `${selectedTestimonial ? "Update" : "Add"} Testimonial`}
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Delete this testimonial? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Testimonial"}
      />
    </div>
  );
};

export default Testimonials;
