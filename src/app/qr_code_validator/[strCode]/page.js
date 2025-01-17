"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import React from "react";

function QRcodeValidator({ params }) {
  const [strCode, setStrCode] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params; // Unwrap params
      const { strCode: dynamicStrCode } = unwrappedParams || {};
      if (dynamicStrCode) {
        setStrCode(dynamicStrCode);
        fetchValidationStatus(dynamicStrCode);
      }
    }
    unwrapParams();
  }, [params]);

  const fetchValidationStatus = async (code) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://admin.gmcables.com/api/codes/validate_qrcode/${code}`
      );
      const data = await res.json();

      if (res.ok) {
        const lastScannedDate = data?.data?.dtLast_Scanned_at
          ? new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true, // Enable AM/PM format
            }).format(new Date(data.data.dtLast_Scanned_at))
          : "Not Available";

        setValidationMessage({
          status: "success",
          scannedCount: data?.data?.intScan_Count || 0,
          lastScanned: lastScannedDate,
        });
      } else {
        setValidationMessage({
          status: "error",
          error: data.error || "The code is invalid.",
        });
      }
    } catch (error) {
      setValidationMessage({
        status: "error",
        error: "Could not validate the code.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        height: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        className="card shadow-lg"
        style={{
          width: "90vw",
          maxWidth: "800px",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "#fff",
        }}
      >
        <div className="mb-4 text-center">
          <Image
            src="/images/logogm.PNG"
            alt="eventRegistration"
            width={230} // Width in pixels
            height={200} // Height in pixels, you can adjust this as needed
            className="img-fluid"
          />
        </div>
        <h1 className="mb-4 text-center text-primary">QR Code Validation</h1>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="lead mb-3"></p>
            {validationMessage?.status === "success" ? (
              <div className="alert alert-success text-start">
                <p>
                  <strong>✅ Success:</strong> The code is valid.
                </p>
                <p>
                  <strong>Scanned Count:</strong>{" "}
                  <span className="text-success">
                    {validationMessage.scannedCount}
                  </span>
                </p>
                <p>
                  <strong>Last Scanned:</strong>{" "}
                  <span className="text-primary">
                    {validationMessage.lastScanned}
                  </span>
                </p>
              </div>
            ) : (
              <div className="alert alert-danger text-start">
                <p>
                  <strong>❌ Error:</strong> {validationMessage?.error}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QRcodeValidatorPage({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRcodeValidator params={params} />
    </Suspense>
  );
}
