import React, { useState } from "react";
import { ethers } from "ethers";
import QRCode from "qrcode.react";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function mintTicket(address to) public",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

function App() {
  const [account, setAccount] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [isValid, setIsValid] = useState(false);

  async function checkToken() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      await contract.ownerOf(tokenId); // will fail if invalid
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      alert("Invalid Token ID!");
    }
  }

  function handleChange(e) {
    setTokenId(e.target.value);
    setIsValid(false); // reset validation
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // FORCE SWITCH TO HARDHAT
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7A69" }], // 31337
    });

    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  }

  async function mintTicket() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    await contract.mintTicket(account);
    alert("Ticket minted!");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>NFT Ticketing System</h2>

      <button onClick={connectWallet}>Connect Wallet</button>
      <p>Account: {account}</p>

      <button onClick={mintTicket}>Mint Ticket</button>

      <h3>Generate QR</h3>
      <input
        placeholder="Enter Token ID"
        onChange={handleChange}
      />
      <button onClick={checkToken}>Get Ticket</button>
      {tokenId !== "" && isValid && (
        <QRCode value={`TicketID:${tokenId}`} />
      )}
    </div>
  );
}

export default App;
