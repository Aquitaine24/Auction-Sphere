import { Contract, ethers } from "ethers";
import provider from "./provider";
import AuctionFactory from "./AuctionFactory.json";

const auctionFactoryAddress = "0xB4D3f874a31d42be52C6d7357ccc8efEd8B68917"; // Replace with your contract address

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
