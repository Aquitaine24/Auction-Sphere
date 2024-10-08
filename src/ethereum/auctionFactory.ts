import { Contract} from "ethers";
import provider from "./provider";
import AuctionFactory from "./AuctionFactory.json";

const auctionFactoryAddress = "0x02DB16d54B145245911524dF1019E5789368F889"; // Replace with your contract address

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
