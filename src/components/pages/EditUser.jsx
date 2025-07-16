import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Star,
  Calendar,
  Save,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  Image,
  Trash2,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";
import SectionCard from "../common/SectionCard";
import InputField from "../common/InputField";
import ProfilePhotosSection from "../common/ProfilePhotosSection";
import normalizeUserData from "../../utils/normalizeUserData";
import selectOptions from "../../utils/selectOptions";

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordData, setPasswordData] = useState({ newPassword: "" });
  const [formData, setFormData] = useState({
    user: { profile_pictures: [] },
    astrology: {},
    education: {},
    family: {},
    profession: {},
  });
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    birth: true,
    physical: true,
    lifestyle: true,
    location: true,
    astrology: true,
    education: true,
    family: true,
    profession: true,
    photos: true,
    password: true,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setError("");
      const data = await adminApi.fetchUserDetails(id);
      console.log(data);
      setUser(data);
      setFormData(normalizeUserData(data));
    } catch (error) {
      setError("Failed to load user details");
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, section, field, subSection) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (subSection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: {
              ...prev[section][subSection],
              [field]: type === "checkbox" ? checked : value,
            },
          },
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === "checkbox" ? checked : value,
        },
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size must be less than 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const imageUrl = await adminApi.uploadProfilePicture(id, selectedFile);
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          profile_pictures: [...prev.user.profile_pictures, imageUrl],
        },
      }));
      setSuccess("Profile picture uploaded successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      setError("Failed to upload profile picture");
      console.error("Error uploading profile picture:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (index) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updatedPictures = formData.user.profile_pictures.filter(
        (_, i) => i !== index
      );
      await adminApi.updateUserDetails(id, {
        profile_pictures: updatedPictures,
      });
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, profile_pictures: updatedPictures },
      }));
      setSuccess("Profile picture deleted successfully!");
      setSelectedPhotoIndex(null);
    } catch (error) {
      setError("Failed to delete profile picture");
      console.error("Error deleting profile picture:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ newPassword: e.target.value });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = async (e, section, endpoint) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let dataToSend = formData[section];
      if (section === "user") {
        dataToSend = {
          ...dataToSend,
          hobbies: formData.user.hobbies
            .split(",")
            .map((h) => h.trim())
            .filter((h) => h),
        };
      }
      await adminApi.updateUserDetails(id, dataToSend, section);
      setSuccess(
        `${
          section.charAt(0).toUpperCase() + section.slice(1)
        } updated successfully!`
      );
    } catch (error) {
      setError(`Failed to update ${section} details`);
      console.error(`Error updating ${section}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    const confirm = window.confirm(
      `Are you sure you want to change the password for ${formData.user.name} to ${passwordData.newPassword}?`
    );
    if (!confirm) {
      setPasswordData({ newPassword: "" });
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await adminApi.changeUserPassword(id, passwordData.newPassword);
      setSuccess("Password changed successfully!");
      setPasswordData({ newPassword: "" });
    } catch (error) {
      setError("Failed to change password");
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  if (loading) return <LoadingSpinner />;
  if (!user)
    return <div className="text-red-600 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg">
            {success}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/users")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to users"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Edit {user.name}'s Profile
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) =>
                  handleSubmit(e, "user", `/api/admin/auth/users/edit/${id}`)
                }
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <Save className="h-5 w-5" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Photos */}
        <ProfilePhotosSection
          photos={formData.user.profile_pictures}
          selectedPhotoIndex={selectedPhotoIndex}
          setSelectedPhotoIndex={setSelectedPhotoIndex}
          previewUrl={previewUrl}
          handleFileChange={handleFileChange}
          handleImageUpload={handleImageUpload}
          handleDeletePhoto={handleDeletePhoto}
          selectedFile={selectedFile}
          isExpanded={expandedSections.photos}
          toggleSection={() => toggleSection("photos")}
        />

        {/* Basic Information */}
        <SectionCard
          title="Basic Information"
          icon={<User className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.basic}
          toggleSection={() => toggleSection("basic")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Full Name"
              name="name"
              section="user"
              value={formData.user.name}
              onChange={(e) => handleChange(e, "user", "name")}
              required
            />
            <InputField
              label="Email"
              name="email"
              section="user"
              type="email"
              value={formData.user.email}
              onChange={(e) => handleChange(e, "user", "email")}
              required
            />
            <InputField
              label="Mobile"
              name="mobile"
              section="user"
              value={formData.user.mobile}
              onChange={(e) => handleChange(e, "user", "mobile")}
              required
            />
            <InputField
              label="Gender"
              name="gender"
              section="user"
              type="select"
              value={formData.user.gender}
              onChange={(e) => handleChange(e, "user", "gender")}
              options={selectOptions.gender}
              required
            />
            <InputField
              label="Date of Birth"
              name="dob"
              section="user"
              type="date"
              value={formData.user.dob}
              onChange={(e) => handleChange(e, "user", "dob")}
              required
            />
            <InputField
              label="Religion"
              name="religion"
              section="user"
              type="select"
              value={formData.user.religion}
              onChange={(e) => handleChange(e, "user", "religion")}
              options={selectOptions.religion}
            />
            <InputField
              label="Caste"
              name="caste"
              section="user"
              type="select"
              value={formData.user.caste}
              onChange={(e) => handleChange(e, "user", "caste")}
              options={selectOptions.caste}
            />
            <InputField
              label="Height"
              name="height"
              section="user"
              value={formData.user.height}
              onChange={(e) => handleChange(e, "user", "height")}
            />
            <InputField
              label="Language"
              name="language"
              section="user"
              value={formData.user.language}
              onChange={(e) => handleChange(e, "user", "language")}
            />
            <InputField
              label="Marital Status"
              name="marital_status"
              section="user"
              type="select"
              value={formData.user.marital_status}
              onChange={(e) => handleChange(e, "user", "marital_status")}
              options={selectOptions.marital_status}
            />
            <InputField
              label="Mangalik"
              name="mangalik"
              section="user"
              type="select"
              value={formData.user.mangalik}
              onChange={(e) => handleChange(e, "user", "mangalik")}
              options={selectOptions.mangalik}
            />
            <InputField
              label="Hobbies"
              name="hobbies"
              section="user"
              value={formData.user.hobbies}
              onChange={(e) => handleChange(e, "user", "hobbies")}
              placeholder="Comma-separated hobbies"
            />
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "user", `/api/admin/auth/users/edit/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Basic Info
          </button>
        </SectionCard>

        {/* Birth Details */}
        <SectionCard
          title="Birth Details"
          icon={<Calendar className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.birth}
          toggleSection={() => toggleSection("birth")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Birth Time"
              name="birth_time"
              section="user"
              subSection="birth_details"
              value={formData.user.birth_details.birth_time}
              onChange={(e) =>
                handleChange(e, "user", "birth_time", "birth_details")
              }
            />
            <InputField
              label="Birth Place"
              name="birth_place"
              section="user"
              subSection="birth_details"
              value={formData.user.birth_details.birth_place}
              onChange={(e) =>
                handleChange(e, "user", "birth_place", "birth_details")
              }
            />
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "user", `/api/admin/auth/users/edit/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Birth Details
          </button>
        </SectionCard>

        {/* Physical Attributes */}
        <SectionCard
          title="Physical Attributes"
          icon={<Heart className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.physical}
          toggleSection={() => toggleSection("physical")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Skin Tone"
              name="skin_tone"
              section="user"
              subSection="physical_attributes"
              type="select"
              value={formData.user.physical_attributes.skin_tone}
              onChange={(e) =>
                handleChange(e, "user", "skin_tone", "physical_attributes")
              }
              options={selectOptions.skin_tone}
            />
            <InputField
              label="Body Type"
              name="body_type"
              section="user"
              subSection="physical_attributes"
              type="select"
              value={formData.user.physical_attributes.body_type}
              onChange={(e) =>
                handleChange(e, "user", "body_type", "physical_attributes")
              }
              options={selectOptions.body_type}
            />
            <InputField
              label="Physical Disability"
              name="physical_disability"
              section="user"
              subSection="physical_attributes"
              type="select"
              value={formData.user.physical_attributes.physical_disability}
              onChange={(e) =>
                handleChange(
                  e,
                  "user",
                  "physical_disability",
                  "physical_attributes"
                )
              }
              options={selectOptions.physical_disability}
            />
            <InputField
              label="Disability Reason"
              name="disability_reason"
              section="user"
              subSection="physical_attributes"
              value={formData.user.physical_attributes.disability_reason}
              onChange={(e) =>
                handleChange(
                  e,
                  "user",
                  "disability_reason",
                  "physical_attributes"
                )
              }
            />
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "user", `/api/admin/auth/users/edit/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Physical Attributes
          </button>
        </SectionCard>

        {/* Lifestyle */}
        <SectionCard
          title="Lifestyle"
          icon={<Heart className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.lifestyle}
          toggleSection={() => toggleSection("lifestyle")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Smoking"
              name="smoke"
              section="user"
              subSection="lifestyle"
              type="select"
              value={formData.user.lifestyle.smoke}
              onChange={(e) => handleChange(e, "user", "smoke", "lifestyle")}
              options={selectOptions.smoke}
            />
            <InputField
              label="Drinking"
              name="drink"
              section="user"
              subSection="lifestyle"
              type="select"
              value={formData.user.lifestyle.drink}
              onChange={(e) => handleChange(e, "user", "drink", "lifestyle")}
              options={selectOptions.drink}
            />
            <InputField
              label="Diet"
              name="veg_nonveg"
              section="user"
              subSection="lifestyle"
              type="select"
              value={formData.user.lifestyle.veg_nonveg}
              onChange={(e) =>
                handleChange(e, "user", "veg_nonveg", "lifestyle")
              }
              options={selectOptions.veg_nonveg}
            />
            <InputField
              label="NRI Status"
              name="nri_status"
              section="user"
              subSection="lifestyle"
              type="select"
              value={formData.user.lifestyle.nri_status}
              onChange={(e) =>
                handleChange(e, "user", "nri_status", "lifestyle")
              }
              options={selectOptions.nri_status}
            />
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "user", `/api/admin/auth/users/edit/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Lifestyle
          </button>
        </SectionCard>

        {/* Location */}
        <SectionCard
          title="Location"
          icon={<MapPin className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.location}
          toggleSection={() => toggleSection("location")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="City"
              name="city"
              section="user"
              subSection="location"
              value={formData.user.location.city}
              onChange={(e) => handleChange(e, "user", "city", "location")}
            />
            <InputField
              label="Address"
              name="address"
              section="user"
              subSection="location"
              value={formData.user.location.address}
              onChange={(e) => handleChange(e, "user", "address", "location")}
            />
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "user", `/api/admin/auth/users/edit/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Location
          </button>
        </SectionCard>

        {/* Astrology */}
        <SectionCard
          title="Astrology"
          icon={<Star className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.astrology}
          toggleSection={() => toggleSection("astrology")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Rashi Nakshatra"
              name="rashi_nakshatra"
              section="astrology"
              value={formData.astrology.rashi_nakshatra}
              onChange={(e) => handleChange(e, "astrology", "rashi_nakshatra")}
            />
            <InputField
              label="Gotra"
              name="gotra"
              section="astrology"
              value={formData.astrology.gotra}
              onChange={(e) => handleChange(e, "astrology", "gotra")}
            />
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "astrology", `/api/admin/auth/astrologies/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Astrology
          </button>
        </SectionCard>

        {/* Education */}
        <SectionCard
          title="Education"
          icon={<GraduationCap className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.education}
          toggleSection={() => toggleSection("education")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Education Level"
              name="education_level"
              section="education"
              type="select"
              value={formData.education.education_level}
              onChange={(e) => handleChange(e, "education", "education_level")}
              options={selectOptions.education_level}
            />
            <InputField
              label="Education Field"
              name="education_field"
              section="education"
              type="select"
              value={formData.education.education_field}
              onChange={(e) => handleChange(e, "education", "education_field")}
              options={selectOptions.education_field}
            />
            <div className="col-span-1 sm:col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">School Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
                <InputField
                  label="School Name"
                  name="name"
                  section="education"
                  subSection="school_details"
                  value={formData.education.school_details.name}
                  onChange={(e) =>
                    handleChange(e, "education", "name", "school_details")
                  }
                />
                <InputField
                  label="School City"
                  name="city"
                  section="education"
                  subSection="school_details"
                  value={formData.education.school_details.city}
                  onChange={(e) =>
                    handleChange(e, "education", "city", "school_details")
                  }
                />
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">
                College Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-4">
                <InputField
                  label="College Name"
                  name="name"
                  section="education"
                  subSection="college_details"
                  value={formData.education.college_details.name}
                  onChange={(e) =>
                    handleChange(e, "education", "name", "college_details")
                  }
                />
                <InputField
                  label="College City"
                  name="city"
                  section="education"
                  subSection="college_details"
                  value={formData.education.college_details.city}
                  onChange={(e) =>
                    handleChange(e, "education", "city", "college_details")
                  }
                />
                <InputField
                  label="Passout Year"
                  name="passout_year"
                  section="education"
                  subSection="college_details"
                  value={formData.education.college_details.passout_year}
                  onChange={(e) =>
                    handleChange(
                      e,
                      "education",
                      "passout_year",
                      "college_details"
                    )
                  }
                />
              </div>
            </div>
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "education", `/api/admin/auth/educations/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Education
          </button>
        </SectionCard>

        {/* Family */}
        <SectionCard
          title="Family"
          icon={<Users className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.family}
          toggleSection={() => toggleSection("family")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Family Value"
              name="family_value"
              section="family"
              type="select"
              value={formData.family.family_value}
              onChange={(e) => handleChange(e, "family", "family_value")}
              options={selectOptions.family_value}
            />
            <InputField
              label="Family Type"
              name="family_type"
              section="family"
              type="select"
              value={formData.family.family_type}
              onChange={(e) => handleChange(e, "family", "family_type")}
              options={selectOptions.family_type}
            />
            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Mother's Details
                </h3>
                <div className="space-y-4 pl-4">
                  <InputField
                    label="Name"
                    name="name"
                    section="family"
                    subSection="mother"
                    value={formData.family.mother.name}
                    onChange={(e) =>
                      handleChange(e, "family", "name", "mother")
                    }
                  />
                  <InputField
                    label="Occupation"
                    name="occupation"
                    section="family"
                    subSection="mother"
                    value={formData.family.mother.occupation}
                    onChange={(e) =>
                      handleChange(e, "family", "occupation", "mother")
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Father's Details
                </h3>
                <div className="space-y-4 pl-4">
                  <InputField
                    label="Name"
                    name="name"
                    section="family"
                    subSection="father"
                    value={formData.family.father.name}
                    onChange={(e) =>
                      handleChange(e, "family", "name", "father")
                    }
                  />
                  <InputField
                    label="Occupation"
                    name="occupation"
                    section="family"
                    subSection="father"
                    value={formData.family.father.occupation}
                    onChange={(e) =>
                      handleChange(e, "family", "occupation", "father")
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">Siblings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
                <InputField
                  label="Brother Count"
                  name="brother_count"
                  section="family"
                  subSection="siblings"
                  type="number"
                  value={formData.family.siblings.brother_count}
                  onChange={(e) =>
                    handleChange(e, "family", "brother_count", "siblings")
                  }
                />
                <InputField
                  label="Sister Count"
                  name="sister_count"
                  section="family"
                  subSection="siblings"
                  type="number"
                  value={formData.family.siblings.sister_count}
                  onChange={(e) =>
                    handleChange(e, "family", "sister_count", "siblings")
                  }
                />
              </div>
            </div>
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "family", `/api/admin/auth/families/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Family
          </button>
        </SectionCard>

        {/* Profession */}
        <SectionCard
          title="Profession"
          icon={<Briefcase className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.profession}
          toggleSection={() => toggleSection("profession")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Occupation"
              name="occupation"
              section="profession"
              value={formData.profession.occupation}
              onChange={(e) => handleChange(e, "profession", "occupation")}
            />
            <InputField
              label="Work Address"
              name="address"
              section="profession"
              subSection="work_address"
              value={formData.profession.work_address.address}
              onChange={(e) =>
                handleChange(e, "profession", "address", "work_address")
              }
            />
            <InputField
              label="Work City"
              name="city"
              section="profession"
              subSection="work_address"
              value={formData.profession.work_address.city}
              onChange={(e) =>
                handleChange(e, "profession", "city", "work_address")
              }
            />
          </div>
          <button
            onClick={(e) =>
              handleSubmit(e, "profession", `/api/admin/auth/professions/${id}`)
            }
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Profession
          </button>
        </SectionCard>

        {/* Password Reset */}
        <SectionCard
          title="Reset Password"
          icon={<Lock className="h-5 w-5 text-gray-600" />}
          isExpanded={expandedSections.password}
          toggleSection={() => toggleSection("password")}
        >
          <form
            onSubmit={handlePasswordSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <InputField
              label="New Password"
              name="newPassword"
              section="password"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <div className="flex items-end gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading || !passwordData.newPassword}
              >
                Submit Password
              </button>
              <button
                onClick={() => setPasswordData({ newPassword: "" })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
};

export default EditUserPage;
