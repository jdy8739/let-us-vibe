"use client";

import { useState, useEffect } from "react";
import { auth } from "@/src/services/firebase";
import { updateProfile } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/src/services/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

const ProfileSettingsPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const userProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
      };

      setUser(userProfile);
      setNewDisplayName(currentUser.displayName || "");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const selectedFile = files[0];

      // Check file size (1MB = 1024 * 1024 bytes)
      if (selectedFile.size > 1024 * 1024) {
        setError(
          "File size must be 1MB or less. Please select a smaller image."
        );
        e.target.value = "";
        setNewPhotoFile(null);
        setPreviewPhoto(null);
        return;
      }

      // Check file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        e.target.value = "";
        setNewPhotoFile(null);
        setPreviewPhoto(null);
        return;
      }

      setNewPhotoFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError("");
    }
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser || !user) {
      setError("Authentication error");
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      let newPhotoURL = user.photoURL;

      // Handle photo upload if there's a new photo
      if (newPhotoFile) {
        // Delete old photo if exists
        if (user.photoURL) {
          try {
            const oldPhotoUrl = new URL(user.photoURL);
            const pathSegments = oldPhotoUrl.pathname.split("/");
            const oldStoragePath = pathSegments.slice(-3).join("/");
            const oldImageRef = ref(storage, oldStoragePath);
            await deleteObject(oldImageRef);
          } catch (imageError) {
            console.error("Error deleting old photo:", imageError);
          }
        }

        // Upload new photo
        const photoRef = ref(
          storage,
          `profile-photos/${user.uid}/${newPhotoFile.name}`
        );

        const result = await uploadBytes(photoRef, newPhotoFile);
        newPhotoURL = await getDownloadURL(result.ref);
      }

      // Update profile using the imported updateProfile function
      await updateProfile(auth.currentUser, {
        displayName: newDisplayName.trim() || null,
        photoURL: newPhotoURL,
      });

      // Update local state
      setUser({
        ...user,
        displayName: newDisplayName.trim() || null,
        photoURL: newPhotoURL,
      });

      setSuccess("Profile updated successfully!");
      setNewPhotoFile(null);
      setPreviewPhoto(null);

      // Clear form
      const form = document.querySelector("form");
      if (form) {
        form.reset();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user) {
      setError("Authentication error");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "This will delete ALL your posts, images, and account data. Are you absolutely sure?"
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      // Delete profile photo if exists
      if (user.photoURL) {
        try {
          const photoUrl = new URL(user.photoURL);
          const pathSegments = photoUrl.pathname.split("/");
          const storagePath = pathSegments.slice(-2).join("/"); // profile-photos/uid
          const photoRef = ref(storage, storagePath);
          await deleteObject(photoRef);
        } catch (imageError) {
          console.error("Error deleting profile photo:", imageError);
        }
      }

      // Delete the user account
      await auth.currentUser.delete();

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main style={{ padding: "4rem 1.5rem" }} className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div style={{ padding: "1rem", marginBottom: "2.5rem" }}>
          <h1
            style={{ padding: "1rem 0" }}
            className="text-4xl font-bold text-gray-900 tracking-tight"
          >
            Profile Settings
          </h1>
          <p
            style={{ padding: "0.5rem 0" }}
            className="mt-2 text-base text-gray-600"
          >
            Manage your profile information and account settings.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Update Section */}
            <div
              style={{ padding: "2rem" }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Update Profile
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                {/* Current Profile Picture */}
                <div className="text-center">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Current Profile Picture
                  </label>
                  <div className="relative inline-block">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
                        <span className="text-white text-3xl font-bold">
                          {user?.displayName?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                </div>

                {/* Change Profile Picture */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Change Profile Picture
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="photo-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-10 h-10 mb-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mb-2 text-lg text-gray-600">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, GIF up to 1MB
                          </p>
                        </div>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Photo Preview */}
                    {previewPhoto && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={previewPhoto}
                            alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              Preview
                            </p>
                            <p className="text-xs text-blue-700">
                              New profile picture
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewPhotoFile(null);
                              setPreviewPhoto(null);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-lg font-semibold text-gray-900 mb-4"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your display name..."
                  />
                </div>

                {/* Email (Read-only) */}
                <dl>
                  <dt className="text-lg font-semibold text-gray-900 mb-4 px-2 py-1">
                    Email Address
                  </dt>
                  <dd className="px-6 py-4 text-lg bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600">
                    {user?.email}
                  </dd>
                  <dd className="mt-2 text-sm text-gray-500 px-2 py-1">
                    Email address cannot be changed. Contact support if needed.
                  </dd>
                </dl>

                {/* Success/Error Messages */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-green-800 font-medium">{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Update Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isUpdating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div
              style={{ padding: "3rem" }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-red-900 mb-3">
                  Danger Zone
                </h2>
                <p className="text-lg text-red-700 max-w-2xl mx-auto">
                  These actions are irreversible and will permanently delete
                  your account and all associated data
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-red-900 mb-3">
                    Delete Account
                  </h3>
                  <p className="text-red-700 text-lg leading-relaxed">
                    This action will permanently delete your account and all
                    associated data including posts and images.
                    <br />
                    <span className="font-semibold">
                      This action cannot be undone.
                    </span>
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div
              style={{ padding: "1rem" }}
              className="flex justify-end space-x-4"
            >
              <Link
                href="/"
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center bg-white text-gray-700 border-2 border-gray-200 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Home
              </Link>
              <Link
                href={`/profile/${user?.uid}`}
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                View Profile
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfileSettingsPage;
