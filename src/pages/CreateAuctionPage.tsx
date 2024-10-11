//CreateAuctionPage.tsx

import React, { useState, FormEvent } from "react";
import auctionFactoryContract from "../ethereum/auctionFactory";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebaseconfig";

const CreateAuctionPage: React.FC = () => {
  const [itemName, setItemName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [biddingTime, setBiddingTime] = useState<string>(""); // In minutes
  const [image, setImage] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [imageURL, setImageURL] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  // Handle image upload to Firebase
  const handleImageUpload = () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    setImageLoading(true);

    const storageRef = ref(storage, `auction-images/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Error uploading image:", error);
        setImageLoading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImageURL(url);
          setImageLoading(false);
          console.log("Image available at:", url);
        });
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setCreateLoading(true);
    setMessage("");

    try {
      const biddingTimeInSeconds = parseInt(biddingTime) * 60;
      const tx = await auctionFactoryContract.createAuction(
        biddingTimeInSeconds,
        itemName,
        itemDescription,
        imageURL
      );

      await tx.wait();

      setMessage("Auction created successfully!");
      // Redirect to the auctions list or reset form
      navigate("/list"); // Adjust the path as needed
    } catch (error: any) {
      console.error(error);
      setMessage("Error creating auction. See console for details.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg max-w-3xl p-10 mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Create Auction</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1">Item Name:</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-md"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Item Description:</label>
          <textarea
            className="w-full px-4 py-2 rounded-md"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label className="block mb-1">Bidding Time (minutes):</label>
          <input
            type="number"
            className="w-full px-4 py-2 rounded-md"
            value={biddingTime}
            onChange={(e) => setBiddingTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-2">Upload Item Image</label>
          <input
            type="file"
            onChange={(e) => e.target.files && setImage(e.target.files[0])}
            className="mt-4 mb-4 block w-full text-sm text-white mb-2"
            required
          />
          <button
            onClick={handleImageUpload}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            disabled={imageLoading}
          >
            {imageLoading ? "Uploading..." : "Upload Image"}
          </button>
          {imageURL && (
            <img
              src={imageURL}
              alt="Auction item"
              className="w-full h-40 object-cover mt-4"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={createLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {createLoading ? "Creating..." : "Create Auction"}
        </button>
      </form>
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default CreateAuctionPage;
