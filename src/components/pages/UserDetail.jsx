// components/pages/UserDetail.jsx
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
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  RotateCcw,
  Camera,
  ChevronDown,
} from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import ConfirmDialog from "../common/ConfirmDialog";
import adminApi from "../../services/api";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown]);

  const fetchUserDetails = async () => {
    try {
      const data = await adminApi.fetchUserDetails(id);
      setUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMembership = async () => {
    try {
      const newStatus = user.status === "Approved" ? "Expired" : "Approved";
      await adminApi.updateUserStatus(user._id, newStatus);
      fetchUserDetails();
    } catch (error) {
      console.error("Error toggling membership:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === user.status) return;
    
    setUpdatingStatus(true);
    try {
      if (newStatus === "Pending") {
        await adminApi.updateUserToPending(user._id);
      } else {
        await adminApi.updateUserStatus(user._id, newStatus);
      }
      fetchUserDetails();
      setShowStatusDropdown(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusOptions = [
    { value: "Pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "Approved", label: "Approved", color: "bg-green-100 text-green-800" },
    { value: "Expired", label: "Expired", color: "bg-red-100 text-red-800" },
    { value: "Canceled", label: "Canceled", color: "bg-gray-100 text-gray-800" },
  ];

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteUser(user._id);
      setShowDeleteDialog(false);
      navigate("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleRestore = async () => {
    try {
      await adminApi.restoreUser(user._id);
      fetchUserDetails();
    } catch (error) {
      console.error("Error restoring user:", error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return <div>User not found</div>;

  const profileCompletion = user.profileCompletion || 75; // Mock value for now

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => navigate("/users")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>

            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                {user.is_deleted && (
                  <span className="px-3 py-1 text-sm rounded-full font-medium bg-red-100 text-red-800">
                    Deleted
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {user.email} • {user.mobile}
              </p>

              <div className="flex items-center space-x-4 mt-3">
                <div className="relative status-dropdown-container">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={updatingStatus || user.is_deleted}
                    className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-full font-medium transition-colors ${getStatusColor(user.status)} ${
                      user.is_deleted ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
                    }`}
                  >
                    <span>{updatingStatus ? "Updating..." : user.status}</span>
                    {!user.is_deleted && <ChevronDown className="h-3 w-3" />}
                  </button>
                  
                  {showStatusDropdown && !user.is_deleted && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-50 min-w-[120px]">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          disabled={updatingStatus || option.value === user.status}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            option.value === user.status ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  Registered:{" "}
                  {new Date(user.metadata?.register_date).toLocaleDateString()}
                </span>
                {user.metadata?.exp_date && (
                  <span className="text-sm text-gray-500">
                    Expires:{" "}
                    {new Date(user.metadata.exp_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!user.is_deleted && (
              <button
                onClick={handleToggleMembership}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                title={
                  user.status === "Approved"
                    ? "Deactivate Membership"
                    : "Activate Membership"
                }
              >
                {user.status === "Approved" ? (
                  <>
                    <ToggleRight className="h-5 w-5 text-green-600" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`/edit-user/${user._id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit className="h-5 w-5 text-gray-600" />
            </a>

            {user.is_deleted ? (
              <button
                onClick={handleRestore}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Restore User"
              >
                <RotateCcw className="h-5 w-5 text-green-600" />
              </button>
            ) : (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Delete User"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        {/* <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-bold text-gray-900">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div> */}
      </div>

      {/* Profile Pictures */}
      {user.profile_pictures && user.profile_pictures.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-gray-600" />
            Profile Pictures
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.profile_pictures.map((pic, index) => (
              <img
                key={index}
                src={pic}
                alt={`Profile ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-gray-600" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoItem label="Gender" value={user.gender} />
          <InfoItem
            label="Date of Birth"
            value={new Date(user.dob).toLocaleDateString()}
          />
          <InfoItem label="Age" value={`${user.age} years`} />
          <InfoItem label="Height" value={user.height || "Not specified"} />
          <InfoItem label="Religion" value={user.religion} />
          <InfoItem label="Caste" value={user.caste || "Not specified"} />
          <InfoItem label="Marital Status" value={user.marital_status} />
          <InfoItem label="Mangalik" value={user.mangalik || "Not specified"} />
          <InfoItem label="Language" value={user.language || "Not specified"} />
        </div>
        {user.hobbies && user.hobbies.length > 0 && (
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700">Hobbies</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.hobbies.map((hobby, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Birth Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-gray-600" />
          Birth Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            label="Birth Time"
            value={user.birth_details?.birth_time || "Not specified"}
          />
          <InfoItem
            label="Birth Place"
            value={user.birth_details?.birth_place || "Not specified"}
          />
        </div>
      </div>

      {/* Physical & Lifestyle */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-gray-600" />
          Physical Attributes & Lifestyle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoItem
            label="Skin Tone"
            value={user.physical_attributes?.skin_tone || "Not specified"}
          />
          <InfoItem
            label="Body Type"
            value={user.physical_attributes?.body_type || "Not specified"}
          />
          <InfoItem
            label="Physical Disability"
            value={user.physical_attributes?.physical_disability ? "Yes" : "No"}
          />
          {user.physical_attributes?.physical_disability && (
            <InfoItem
              label="Disability Details"
              value={
                user.physical_attributes?.disability_reason || "Not specified"
              }
            />
          )}
          <InfoItem
            label="Smoking"
            value={user.lifestyle?.smoke || "Not specified"}
          />
          <InfoItem
            label="Drinking"
            value={user.lifestyle?.drink || "Not specified"}
          />
          <InfoItem
            label="Diet"
            value={user.lifestyle?.veg_nonveg || "Not specified"}
          />
          <InfoItem
            label="NRI Status"
            value={user.lifestyle?.nri_status ? "Yes" : "No"}
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-gray-600" />
          Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <InfoItem
              label="Address"
              value={user.location?.address || "Not specified"}
            />
          </div>
          <InfoItem
            label="City"
            value={user.location?.city || "Not specified"}
          />
          <InfoItem
            label="Pincode"
            value={user.location?.pincode || "Not specified"}
          />
        </div>
      </div>

      {/* Education Details */}
      {user.education && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-gray-600" />
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              label="Education Level"
              value={user.education.education_level || "Not specified"}
            />
            <InfoItem
              label="Field of Study"
              value={user.education.education_field || "Not specified"}
            />

            {(user.education.school_details?.name ||
              user.education.school_details?.city) && (
              <>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-700 mb-2">
                    School Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <InfoItem
                      label="School Name"
                      value={
                        user.education.school_details.name || "Not specified"
                      }
                    />
                    <InfoItem
                      label="School City"
                      value={
                        user.education.school_details.city || "Not specified"
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {(user.education.college_details?.name ||
              user.education.college_details?.city) && (
              <>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-700 mb-2">
                    College Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <InfoItem
                      label="College Name"
                      value={
                        user.education.college_details.name || "Not specified"
                      }
                    />
                    <InfoItem
                      label="College City"
                      value={
                        user.education.college_details.city || "Not specified"
                      }
                    />
                    <InfoItem
                      label="Passout Year"
                      value={
                        user.education.college_details.passout_year ||
                        "Not specified"
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profession Details */}
      {user.profession && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              label="Occupation"
              value={user.profession.occupation || "Not specified"}
            />
            <InfoItem
              label="Designation"
              value={user.profession.designation || "Not specified"}
            />
            <InfoItem
              label="Working With"
              value={user.profession.working_with || "Not specified"}
            />
            <InfoItem
              label="Income"
              value={user.profession.income || "Not specified"}
            />

            {(user.profession.work_address?.address ||
              user.profession.work_address?.city) && (
              <>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Work Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <InfoItem
                      label="Work Address"
                      value={
                        user.profession.work_address.address || "Not specified"
                      }
                    />
                    <InfoItem
                      label="Work City"
                      value={
                        user.profession.work_address.city || "Not specified"
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Family Details */}
      {user.family && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            Family Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              label="Family Values"
              value={user.family.family_value || "Not specified"}
            />
            <InfoItem
              label="Family Type"
              value={user.family.family_type || "Not specified"}
            />

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Father's Details
                </h3>
                <div className="pl-4 space-y-2">
                  <InfoItem
                    label="Name"
                    value={user.family.father?.name || "Not specified"}
                  />
                  <InfoItem
                    label="Occupation"
                    value={user.family.father?.occupation || "Not specified"}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Mother's Details
                </h3>
                <div className="pl-4 space-y-2">
                  <InfoItem
                    label="Name"
                    value={user.family.mother?.name || "Not specified"}
                  />
                  <InfoItem
                    label="Occupation"
                    value={user.family.mother?.occupation || "Not specified"}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">Siblings</h3>
              <div className="grid grid-cols-2 gap-4 pl-4">
                <InfoItem
                  label="Brothers"
                  value={user.family.siblings?.brother_count || 0}
                />
                <InfoItem
                  label="Sisters"
                  value={user.family.siblings?.sister_count || 0}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Astrology Details */}
      {user.astrology && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-gray-600" />
            Astrology Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              label="Rashi/Nakshatra"
              value={user.astrology.rashi_nakshatra || "Not specified"}
            />
            <InfoItem
              label="Gotra"
              value={user.astrology.gotra || "Not specified"}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user.name}? This will soft delete the user and they can be restored later.`}
      />
    </div>
  );
};

// Info Item Component
const InfoItem = ({ label, value }) => (
  <div>
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <p className="text-gray-900 mt-1">{value}</p>
  </div>
);

export default UserDetail;
