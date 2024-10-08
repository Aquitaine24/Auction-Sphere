import { Contract, ethers } from "ethers";
import provider from "./provider";
import AuctionFactory from "./AuctionFactory.json";

const auctionFactoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with your contract address

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
