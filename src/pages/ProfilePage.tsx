import React, { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const storage = getStorage();
  const auth = getAuth();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadProfilePicture(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Load profile picture from Firebase Storage
  const loadProfilePicture = async (userId: string) => {
    try {
      const imageRef = ref(storage, `profile_pictures/${userId}`);
      const url = await getDownloadURL(imageRef);
      setProfilePicture(url);
    } catch (error) {
      console.error("Error loading profile picture:", error);
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Upload profile picture to Firebase Storage
  const handleUpload = async () => {
    if (file && user) {
      try {
        const imageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(imageRef, file);
        loadProfilePicture(user.uid);
        alert("Profile picture uploaded successfully!");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  // Delete profile picture from Firebase Storage
  const handleDelete = async () => {
    if (user) {
      try {
        const imageRef = ref(storage, `profile_pictures/${user.uid}`);
        await deleteObject(imageRef);
        setProfilePicture("");
        alert("Profile picture deleted successfully!");
      } catch (error) {
        console.error("Error deleting profile picture:", error);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row">
      <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block">
        <div className="sticky flex flex-col gap-2 p-4 text-sm border-r border-indigo-100 top-12">
          <h2 className="pl-3 mb-4 text-2xl font-semibold text-highlight">
            Settings
          </h2>

          <a
            href="#"
            className="flex items-center px-3 py-2.5 font-bold bg-white text-indigo-900 border rounded-full"
          >
            Public Profile
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2.5 font-semibold hover:text-indigo-900 hover:border hover:rounded-full"
          >
            Account Settings
          </a>
        </div>
      </aside>
      <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
        <div className="p-2 md:p-4">
          <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
            <h2 className="pl-6 text-2xl font-bold sm:text-xl text-highlight">
              Public Profile
            </h2>

            <div className="grid max-w-2xl mx-auto mt-8">
              <div className="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0">
                <img
                  className="object-cover w-40 h-40 p-1 rounded-full ring-2 ring-highlight"
                  src={profilePicture || "https://via.placeholder.com/150"}
                  alt="Bordered avatar"
                />

                <div className="flex flex-col space-y-5 sm:ml-8">
                  <input type="file" onChange={handleFileChange} />
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="py-3.5 px-7 text-base font-medium btn-primary rounded-lg border border-highlight focus:z-10 focus:ring-4 focus:ring-indigo-200"
                  >
                    Change picture
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="py-3.5 px-7 text-base font-medium btn-secondary rounded-lg border border-highlight focus:z-10 focus:ring-4 focus:ring-indigo-200"
                  >
                    Delete picture
                  </button>
                </div>
              </div>

              <div className="items-center mt-8 sm:mt-14">
                <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                  <div className="w-full">
                    <label
                      htmlFor="first_name"
                      className="block mb-2 text-sm font-medium text-highlight"
                    >
                      Your first name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      className="input-bg border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                      placeholder="Your first name"
                      defaultValue={user?.displayName?.split(" ")[0] || ""}
                      required
                    />
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="last_name"
                      className="block mb-2 text-sm font-medium text-highlight"
                    >
                      Your last name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      className="input-bg border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                      placeholder="Your last name"
                      defaultValue={user?.displayName?.split(" ")[1] || ""}
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-highlight"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input-bg border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="your.email@mail.com"
                    defaultValue={user?.email || ""}
                    required
                  />
                </div>

                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="profession"
                    className="block mb-2 text-sm font-medium text-highlight"
                  >
                    Profession
                  </label>
                  <input
                    type="text"
                    id="profession"
                    className="input-bg border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="your profession"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-highlight"
                  >
                    Bio
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="block p-2.5 w-full text-sm text-indigo-900 input-bg rounded-lg border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your bio here..."
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="text-white btn-primary hover:bg-[#D90429] focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
