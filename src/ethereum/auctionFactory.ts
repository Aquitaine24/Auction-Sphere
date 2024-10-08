import { Contract, ethers } from "ethers";
import provider from "./provider";
import AuctionFactory from "./AuctionFactory.json";

const auctionFactoryAddress = "0x8604b9FF3F3A6F68F34A6588F0D48dE74d634E42"; // Replace with your contract address

// Ensure the provider is available before continuing
let auctionFactoryContract: Contract;

if (provider) {
  const signer = await provider.getSigner();
  auctionFactoryContract = new Contract(
    auctionFactoryAddress,
    AuctionFactory.abi,
    signer
  );
} else {
  throw new Error("Ethereum provider is not available.");
}

export default auctionFactoryContract;
