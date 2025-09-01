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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-gray-600">Loading profile settings...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">User not found</div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Update your profile information and manage your account.
            </p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-green-600">{success}</div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProfile();
            }}
            className="space-y-6"
          >
            {/* Current Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Profile Picture
              </label>
              <div className="text-center">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                />
              </div>
            </div>

            {/* New Profile Picture */}
            <div>
              <label
                htmlFor="photo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Change Profile Picture
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 1MB. Supported formats: JPG, PNG, GIF.
              </p>

              {/* Preview */}
              {previewPhoto && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <img
                    src={previewPhoto}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Enter your display name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
                {user.email || "Not set"}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Email address cannot be changed from this page.
              </p>
            </div>

            {/* Update Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  isUpdating || (!newDisplayName.trim() && !newPhotoFile)
                }
                className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="border-t pt-8 mt-8">
            <h3 className="text-lg font-medium text-red-900 mb-4">
              Danger Zone
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 mb-4">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-red-600">
                  This action will permanently delete your account and all
                  associated data including posts and images.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t pt-6 mt-8 flex justify-between items-center">
            <Link
              href="/profile"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back to Profile
            </Link>

            <Link
              href="/"
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettingsPage;
