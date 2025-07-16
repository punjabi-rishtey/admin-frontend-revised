import { useState } from "react";
import { Image, ChevronUp, ChevronDown, Trash2, X } from "lucide-react";

const ProfilePhotosSection = ({
  photos,
  selectedPhotoIndex,
  setSelectedPhotoIndex,
  previewUrl,
  handleFileChange,
  handleImageUpload,
  handleDeletePhoto,
  selectedFile,
  isExpanded,
  toggleSection,
}) => {
  const [loading] = useState(false);
  const defaultPhoto = "https://via.placeholder.com/150?text=No+Image";
  const photoArray = photos && photos.length > 0 ? photos : [defaultPhoto];

  return (
    <div className="bg-white rounded-lg shadow">
      <button
        className="w-full flex items-center justify-between p-6 text-left"
        onClick={toggleSection}
      >
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Profile Photos
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>
      {isExpanded && (
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Photo Gallery */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Photo Gallery
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {photoArray.map((photo, index) => (
                  <div key={`photo_${index}`} className="relative">
                    <img
                      src={photo}
                      alt={`Profile ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg border border-gray-300 cursor-pointer hover:brightness-90"
                      onClick={() => setSelectedPhotoIndex(index)}
                    />
                    {photo !== defaultPhoto && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(index);
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                        aria-label={`Delete photo ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Upload Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Upload New Photo
              </h3>
              <input
                id="photos_upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {previewUrl && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </h3>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-32 w-full object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
              {selectedFile && (
                <button
                  onClick={handleImageUpload}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Upload Photo
                </button>
              )}
            </div>
          </div>
          {/* Modal for Full-Size Image */}
          {selectedPhotoIndex !== null && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setSelectedPhotoIndex(null)}
            >
              <div
                className="relative max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900"
                  onClick={() => setSelectedPhotoIndex(null)}
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
                <img
                  src={photoArray[selectedPhotoIndex]}
                  alt={`Profile ${selectedPhotoIndex + 1}`}
                  className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg"
                />
                {photoArray.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <button
                      className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex((prev) =>
                          prev === 0 ? photoArray.length - 1 : prev - 1
                        );
                      }}
                      aria-label="Previous photo"
                    >
                      <ChevronDown className="h-5 w-5 transform rotate-90" />
                    </button>
                    <button
                      className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex((prev) =>
                          prev === photoArray.length - 1 ? 0 : prev + 1
                        );
                      }}
                      aria-label="Next photo"
                    >
                      <ChevronUp className="h-5 w-5 transform rotate-90" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePhotosSection;
