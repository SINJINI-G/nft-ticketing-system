// import { QrReader } from "react-qr-reader";
// import { useState } from "react";
// import { ethers } from "ethers";
// import { useParams } from "react-router-dom";
// import { useEffect } from "react";

// const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

// const abi = [
//   "function getTicketEvent(uint256) view returns (uint256)"
// ];

// export default function EventDetails() {
//   const { id } = useParams(); // 🔥 FIX
//   const currentEventId = Number(id); // 🔥 FIX

//   const [scanned, setScanned] = useState("");
//   const [result, setResult] = useState("");
//   const [scannedOnce, setScannedOnce] = useState(false);
//   useEffect(() => {
//   return () => {
//     // 🔥 STOP CAMERA when leaving page
//     const video = document.querySelector("video");

//     if (video && video.srcObject) {
//       const tracks = video.srcObject.getTracks();
//       tracks.forEach(track => track.stop());
//     }
//   };
// }, []);

//   async function verifyTicket(data) {
//     try {
//       const tokenId = data.split(":")[1];

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const contract = new ethers.Contract(contractAddress, abi, provider);

//       const ticketEventId = await contract.getTicketEvent(tokenId);

//       console.log("Ticket Event:", ticketEventId.toString());
//       console.log("Current Event:", currentEventId);

//       if (ticketEventId.toString() === currentEventId.toString()) {
//         setResult("✅ VALID for THIS event");
//       } else {
//         setResult("❌ WRONG EVENT TICKET");
//       }

//     } catch {
//       setResult("❌ INVALID TICKET");
//     }
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Scan Ticket</h2>

//       {/* ✅ STOP CAMERA AFTER FIRST SCAN */}
//       {!scannedOnce && (
//         <QrReader
//           constraints={{ facingMode: "environment", width: 1280, height: 720 }}
//           scanDelay={300}
//           onResult={(res) => {
//             if (res) {
//               const text = res?.text;

//               console.log("SCANNED:", text);

//               setScanned(text);
//               setScannedOnce(true); // 🔥 CRITICAL FIX
//               verifyTicket(text);
//               const video = document.querySelector("video");
//     if (video && video.srcObject) {
//       const tracks = video.srcObject.getTracks();
//       tracks.forEach(track => track.stop());
//     }
//             }
//           }}
//           videoStyle={{ width: "250px" }}
//         />
//       )}

//       <h3>Scanned Data:</h3>
//       <p>{scanned}</p>

//       <h3>Verification Result:</h3>
//       <p>{result}</p>
//     </div>
//   );
// }

import { QrReader } from "react-qr-reader";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const abi = [
  "function getTicketEvent(uint256) view returns (uint256)"
];

// 🔥 GLOBAL STREAM TRACKER
let activeStream = null;

export default function EventDetails() {
  const { id } = useParams();
  const currentEventId = Number(id);

  const [scanned, setScanned] = useState("");
  const [result, setResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  // 🔥 CAPTURE CAMERA STREAM
  useEffect(() => {
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;

    navigator.mediaDevices.getUserMedia = async function (constraints) {
      const stream = await originalGetUserMedia.call(this, constraints);
      activeStream = stream; // store real stream
      return stream;
    };

    return () => {
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    };
  }, []);

  // 🔥 STOP CAMERA PROPERLY
  function stopCamera() {
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      activeStream = null;
    }
  }

  // 🔥 AUTO STOP AFTER 15 SECONDS
  useEffect(() => {
    let timer;

    if (isScanning) {
      timer = setTimeout(() => {
        stopCamera();
        setIsScanning(false);
        setScannerKey((prev) => prev + 1);
        setResult("⏱️ Scan timed out (15s)");
      }, 15000); // ✅ 15 seconds
    }

    return () => clearTimeout(timer);
  }, [isScanning]);

  async function verifyTicket(data) {
    try {
      const tokenId = data.split(":")[1];

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      const ticketEventId = await contract.getTicketEvent(tokenId);

      if (ticketEventId.toString() === currentEventId.toString()) {
        setResult("✅ VALID for THIS event");
      } else {
        setResult("❌ WRONG EVENT TICKET");
      }
    } catch {
      setResult("❌ INVALID TICKET");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Ticket</h2>

      {/* START BUTTON */}
      {!isScanning && (
        <button
          onClick={() => {
            setResult("");
            setScanned("");
            setIsScanning(true);
          }}
        >
          Start Scanning
        </button>
      )}

      {/* SCANNER */}
      {isScanning && (
        <>
          <QrReader
            key={scannerKey}
            constraints={{ facingMode: "environment" }}
            scanDelay={300}
            videoStyle={{ width: "250px" }}
            onResult={(res) => {
              if (res) {
                const text = res?.text;

                setScanned(text);
                setIsScanning(false);
                verifyTicket(text);

                stopCamera(); // 🔥 REAL STOP
                setScannerKey((prev) => prev + 1);
              }
            }}
          />

          {/* CANCEL BUTTON */}
          <button
            onClick={() => {
              stopCamera();
              setIsScanning(false);
              setScannerKey((prev) => prev + 1);
              setResult("❌ Scan cancelled");
            }}
            style={{ marginTop: 10 }}
          >
            Cancel
          </button>
        </>
      )}

      {/* RESULT */}
      <h3>Scanned Data:</h3>
      <p>{scanned}</p>

      <h3>Verification Result:</h3>
      <p>{result}</p>
    </div>
  );
}