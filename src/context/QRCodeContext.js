import React, { createContext, useContext, useState } from "react";

const QRCodeContext = createContext();

export const QRCodeProvider = ({ children }) => {
  const [qrCodeData, setQrCodeData] = useState([]);

  const generateQRCode = (code) => {
    // Logic to generate and store QR Code data
  };

  return (
    <QRCodeContext.Provider value={{ qrCodeData, generateQRCode }}>
      {children}
    </QRCodeContext.Provider>
  );
};

export const useQRCodeContext = () => useContext(QRCodeContext);
