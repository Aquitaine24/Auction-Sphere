import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

let provider: ethers.BrowserProvider | undefined;

if (window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum, "any"); // Use BrowserProvider from ethers v6
  // Request account access if needed
  window.ethereum.request({ method: "eth_requestAccounts" });
} else {
  alert("Please install MetaMask!");
}

export default provider;
