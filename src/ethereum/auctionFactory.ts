import { Contract, ethers } from "ethers";
import provider from "./provider";
import AuctionFactory from "./AuctionFactory.json";

const auctionFactoryAddress = "0x0BAE898C0478f34Db83FCd0653519cEbE77d8F49"; // Replace with your contract address

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
