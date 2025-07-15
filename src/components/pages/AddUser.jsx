// components/pages/AddUser.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Save,
  X,
  Upload,
  Calendar,
  Phone,
  Mail,
  Lock,
  Heart,
  FileText,
  AlertCircle,
} from "lucide-react";
import adminApi from "../../services/api";

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Required fields
    name: "",
    email: "",
    password: "",
    mobile: "",
    gender: "",
    dob: "",
    religion: "",
    marital_status: "",

    // Optional fields
    caste: "",
    height: "",
    mangalik: "",
    language: "",
    hobbies: "",

    // Birth details
    birth_time: "",
    birth_place: "",

    // Physical attributes
    skin_tone: "",
    body_type: "",
    physical_disability: false,
    disability_reason: "",

    // Lifestyle
    smoke: "",
    drink: "",
    veg_nonveg: "",
    nri_status: false,

    // Location
    address: "",
    city: "",
    pincode: "",

    // Preferences
    preference1: "",
    preference2: "",
    preference3: "",
  });

  const [profilePictures, setProfilePictures] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + profilePictures.length > 10) {
      setError("Maximum 10 profile pictures allowed");
      return;
    }

    setProfilePictures((prev) => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setProfilePictures((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Check required fields
    const required = [
      "name",
      "email",
      "password",
      "mobile",
      "gender",
      "dob",
      "religion",
      "marital_status",
      //   "profile_pictures",
    ];
    for (const field of required) {
      if (!formData[field]) {
        setError(
          `${
            field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")
          } is required`
        );
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }

    // Validate mobile
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Mobile number must be 10 digits");
      return false;
    }

    // Validate password length
    // if (formData.password.length < 6) {
    //   setError("Password must be at least 6 characters");
    //   return false;
    // }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for submission
      const submitData = new FormData();

      // Add basic required fields
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("mobile", formData.mobile);
      submitData.append("gender", formData.gender);
      submitData.append("dob", formData.dob);
      submitData.append("religion", formData.religion);
      submitData.append("marital_status", formData.marital_status);

      // Add optional fields if provided
      if (formData.caste) submitData.append("caste", formData.caste);
      if (formData.height) submitData.append("height", formData.height);
      if (formData.mangalik) submitData.append("mangalik", formData.mangalik);
      if (formData.language) submitData.append("language", formData.language);
      if (formData.hobbies) submitData.append("hobbies", formData.hobbies);

      // Add nested fields
      const userData = {
        birth_details: {
          birth_time: formData.birth_time,
          birth_place: formData.birth_place,
        },
        physical_attributes: {
          skin_tone: formData.skin_tone,
          body_type: formData.body_type,
          physical_disability: formData.physical_disability,
          disability_reason: formData.disability_reason,
        },
        lifestyle: {
          smoke: formData.smoke,
          drink: formData.drink,
          veg_nonveg: formData.veg_nonveg,
          nri_status: formData.nri_status,
        },
        location: {
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
      };

      // Add nested data as JSON string
      submitData.append("userData", JSON.stringify(userData));

      // Add preferences if any
      const preferences = {};
      if (formData.preference1) preferences.preference1 = formData.preference1;
      if (formData.preference2) preferences.preference2 = formData.preference2;
      if (formData.preference3) preferences.preference3 = formData.preference3;

      if (Object.keys(preferences).length > 0) {
        submitData.append("preferences", JSON.stringify(preferences));
      }

      // Add profile pictures
      profilePictures.forEach((file) => {
        submitData.append("profile_pictures", file);
      });

      // Submit the form
      await adminApi.createUser(submitData);

      setSuccess(true);
      setTimeout(() => {
        navigate("/users");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/users")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-600" />
            Basic Information (Required)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="inline h-4 w-4 mr-1" />
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                minLength="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="inline h-4 w-4 mr-1" />
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                pattern="[0-9]{10}"
                placeholder="10 digit number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Religion <span className="text-red-500">*</span>
              </label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Religion</option>
                <option value="Sikh">Sikh</option>
                <option value="Hindu">Hindu</option>
                <option value="Christian">Christian</option>
                <option value="Muslim">Muslim</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Status</option>
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information (Optional)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caste
              </label>
              <input
                type="text"
                name="caste"
                value={formData.caste}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 5'10&quot;"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mangalik
              </label>
              <select
                name="mangalik"
                value={formData.mangalik}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Don't Know">Don't Know</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Languages
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Punjabi, Hindi, English"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hobbies
              </label>
              <input
                type="text"
                name="hobbies"
                value={formData.hobbies}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Reading, Music, Sports (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Birth Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Birth Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Time
              </label>
              <input
                type="text"
                name="birth_time"
                value={formData.birth_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 10:30 AM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Place
              </label>
              <input
                type="text"
                name="birth_place"
                value={formData.birth_place}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="City name"
              />
            </div>
          </div>
        </div>

        {/* Physical & Lifestyle */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <Heart className="inline h-5 w-5 mr-2 text-gray-600" />
            Physical Attributes & Lifestyle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skin Tone
              </label>
              <select
                name="skin_tone"
                value={formData.skin_tone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Fair">Fair</option>
                <option value="Wheatish">Wheatish</option>
                <option value="Dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Type
              </label>
              <select
                name="body_type"
                value={formData.body_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Slim">Slim</option>
                <option value="Athletic">Athletic</option>
                <option value="Average">Average</option>
                <option value="Heavy">Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Smoking
              </label>
              <select
                name="smoke"
                value={formData.smoke}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Occasionally">Occasionally</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drinking
              </label>
              <select
                name="drink"
                value={formData.drink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Occasionally">Occasionally</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diet
              </label>
              <select
                name="veg_nonveg"
                value={formData.veg_nonveg}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Eggetarian">Eggetarian</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="physical_disability"
                  checked={formData.physical_disability}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Physical Disability
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="nri_status"
                  checked={formData.nri_status}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  NRI Status
                </span>
              </label>
            </div>

            {formData.physical_disability && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disability Details
                </label>
                <input
                  type="text"
                  name="disability_reason"
                  value={formData.disability_reason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                pattern="[0-9]{6}"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        {/* <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <FileText className="inline h-5 w-5 mr-2 text-gray-600" />
            Partner Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preference 1
              </label>
              <input
                type="text"
                name="preference1"
                value={formData.preference1}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Age range, height preference"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preference 2
              </label>
              <input
                type="text"
                name="preference2"
                value={formData.preference2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Education level, profession"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preference 3
              </label>
              <input
                type="text"
                name="preference3"
                value={formData.preference3}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Family values, lifestyle"
              />
            </div>
          </div>
        </div> */}

        {/* Profile Pictures */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <Upload className="inline h-5 w-5 mr-2 text-gray-600" />
            Profile Pictures
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload up to 10 profile pictures
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 flex items-center space-x-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving..." : "Save User"}</span>
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <span className="text-green-800">
              User created successfully! Redirecting...
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddUser;
