import { Contract } from "ethers";
import provider from "./provider";
import Auction from "./Auction.json";

export const getAuctionContract = async (address: string) => {
  if (!provider) {
    throw new Error("Ethereum provider is not available.");
  }

  const signer = await provider.getSigner();

  return new Contract(address, Auction.abi, signer);
};
