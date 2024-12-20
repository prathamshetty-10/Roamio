import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BsTrash, BsDownload } from "react-icons/bs";
import {
  uploadPhotosRoute,
  getPhotosRoute,
  deleteAllRoute,
  deleteSingleRoute,
  downloadAllRoute,
  downloadOneRoute,
} from "../utils/APIRoutes";

export default function PhotoVault({ tripData, Me }) {
  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const fetchPhotos = async () => {
    try {
      const response = await axios.post(getPhotosRoute, { tripName: tripData.tripName });
      if (response.data.success) {
        const groupedPhotos = response.data.data.photos.reduce((acc, photo) => {
          const photoDate = new Date(photo.date).toLocaleDateString();
          if (!acc[photoDate]) acc[photoDate] = [];
          acc[photoDate].push(photo);
          return acc;
        }, {});

        const groupedArray = Object.keys(groupedPhotos).map(date => ({
          date,
          photos: groupedPhotos[date],
        }));

        setPhotos(groupedArray);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast.error("Failed to fetch photos.");
    }
  };

  const handleUpload = async () => {
    if (newPhotos.length === 0) {
      toast.error("Please select photos to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("tripName", tripData.tripName);
    formData.append("owner", Me.username);
    newPhotos.forEach((photo) => formData.append("photos", photo));

    try {
      const response = await axios.post(uploadPhotosRoute, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.status) {
        toast.success(response.data.message);
        setNewPhotos([]);
        fetchPhotos();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Failed to upload photos.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (public_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (!confirmDelete) return;

    try {
      const response = await axios.post(deleteSingleRoute, {
        tripName: tripData.tripName,
        public_id,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchPhotos();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo.");
    }
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all photos?");
    if (!confirmDelete) return;

    setIsDeletingAll(true);
    try {
      const response = await axios.post(deleteAllRoute, { tripName: tripData.tripName });
      if (response.data.success) {
        toast.success(response.data.message);
        setPhotos([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting all photos:", error);
      toast.error("Failed to delete all photos.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true); // Set loading state
    try {
      const response = await axios.post(
        `${downloadAllRoute}`,
        { tripName: tripData.tripName },
        {
          responseType: "blob",
          headers: {
            Accept: "application/zip",
          },
          timeout: 300000, // 5 minutes
        }
      );
  
      if (!response.data.type.includes("zip")) {
        throw new Error("Invalid response type");
      }
  
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
  
      const normalizedTripName = tripData.tripName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.download = `${normalizedTripName}-photos.zip`;
  
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      window.URL.revokeObjectURL(url);
  
      toast.success("Download started successfully!");
    } catch (error) {
      console.error("Error downloading all photos:", error);
      toast.error(
        error.response?.status === 404
          ? "No photos found for this trip."
          : "Failed to download photos. Please try again."
      );
    } finally {
      setIsDownloadingAll(false); // Reset loading state
    }
  };
  const handleDownloadOne = async (photo) => {
    try {
        const response = await axios.post(
            `${downloadOneRoute}`, 
            { 
                tripName: tripData.tripName,  // Make sure to include tripName
                public_id: photo.public_id 
            }, 
            { 
                responseType: "blob",
                headers: {
                    'Accept': 'image/jpeg'  // Explicitly accept jpeg images
                }
            }
        );

        // Verify the response type
        if (!response.data.type.includes('image')) {
            throw new Error('Invalid response type');
        }

        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        
        // Ensure filename has extension
        const filename = photo.public_id.split('/').pop();
        link.download = filename.endsWith('.jpg') ? filename : `${filename}.jpg`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Error downloading photo:", error);
        toast.error("Failed to download photo. Please try again.");
    }
};

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Upload Section */}
      <div className="w-full max-w-[800px] bg-yellow-50 p-6 rounded-lg shadow-md mb-6 mt-9">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Photos</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewPhotos(Array.from(e.target.files))}
          className="block w-full mb-4 border p-2 rounded"
        />
        <div className="mb-4">
          {newPhotos.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-black mb-2">Preview:</h4>
              <div className="flex space-x-2 ml-[200px]">
                {newPhotos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-full"
                  />
                ))}
                {newPhotos.length > 3 && (
                  <div className="flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full text-black">
                    <p>+{newPhotos.length - 3} more</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700"
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Download All and Delete All Buttons */}
      <div className="mb-6 flex space-x-4">
      <button
      className={`${
        isDownloadingAll ? "bg-green-400" : "bg-green-600"
      } text-white px-4 py-2 rounded-full font-bold hover:bg-green-700`}
      onClick={handleDownloadAll}
      disabled={isDownloadingAll}
    >
      {isDownloadingAll ? (
        <div className="flex items-center">
          <svg
            className="animate-spin h-5 w-5 text-white mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Downloading...
        </div>
      ) : (
        "Download All Photos"
      )}
    </button>
    
        {tripData.admin.username == Me.username && (
          <button
            className={`${
              isDeletingAll ? "bg-red-400" : "bg-red-600"
            } text-white px-4 py-2 rounded-full font-bold hover:bg-red-700`}
            onClick={handleDeleteAll}
            disabled={isDeletingAll}
          >
            {isDeletingAll ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Deleting...
              </div>
            ) : (
              "Delete All Photos"
            )}
          </button>
        )}
      </div>

      {/* Photo Display Section */}
      {photos.length > 0 ? (
        photos.map(({ date, photos: photoGroup }) => (
          <div key={date} className="w-full max-w-[800px] mb-6 mt-6">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-50">{date}</h3>
            <div className="grid grid-cols-3 gap-4">
              {photoGroup.map((photo) => (
                <div key={photo.public_id} className="relative group">
                  <img
                    src={photo.photo}
                    alt="Uploaded"
                    className="w-full h-[250px] rounded shadow group-hover:opacity-50"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                    <p className="text-sm font-semibold">{`Uploaded by: ${photo.owner}`}</p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded-full font-bold hover:bg-blue-700"
                        onClick={() => handleDownloadOne(photo)}
                      >
                        <BsDownload />
                      </button>
                      {(Me.username === photo.owner || Me.username === tripData.admin.username) && (
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded-full font-bold hover:bg-red-700"
                          onClick={() => handleDelete(photo.public_id)}
                        >
                          <BsTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-yellow-50 text-xl">No photos uploaded yet.</p>
      )}
    </div>
  );
}

  

