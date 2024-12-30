"use client";
import { useState } from "react";
import QRCode from "qrcode.react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function AddEvent() {
  const [count, setCount] = useState("");
  const [qrCodes, setQrCodes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { event, eventDisplay, qrCode, qrCodDisplay } = useAppContext();
  const router = useRouter();

  // Function to generate unique 10-character alphanumeric codes
  const generateUniqueCodes = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      Array.from({ length: 10 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join("")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const number = parseInt(count, 10);
    if (isNaN(number) || number <= 0 || number > 100) {
      alert("Please enter a valid number between 1 and 100.");
      return;
    }

    // Generate unique QR codes
    const generatedCodes = generateUniqueCodes(number);
    setQrCodes(generatedCodes);

    // Prepare data for API request
    const requestBody = {
      strCode: generatedCodes, // Use the array of codes directly
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(
        "http://localhost:5000/api/codes/add_qrCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify(requestBody), // Use JSON.stringify to prepare the payload
        }
      );

      if (response.ok) {
        alert("QR codes submitted successfully!");
        qrCodDisplay();
        setCount("");
        setQrCodes([]);
        router.push("/qr_code"); // Navigate to another page if needed
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error submitting QR codes:", error);
      alert("An error occurred while submitting QR codes.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClear = () => {
    setCount("");
    setQrCodes([]);
  };

  const handleCancel = () => {
    router.push("/qr_code");
  };

  return (
    <div className="d-flex justify-content-center align-items-center  mt-5  ">
      <br></br>
      <div
        className="p-4 border rounded"
        style={{
          maxWidth: "700px",
          width: "100%",
          height: "300px",
          background: "white",
        }}
      >
        <h1 className="mb-4 text-center">Generate QR Codes</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="count" className="form-label">
              Number of QR Codes <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="count"
              name="count"
              className="form-control form-control-sm"
              placeholder="Enter number (e.g., 10)"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
              min="1"
              max="100"
            />
          </div>
          <div className="d-flex justify-content-between align-items-center">
            {/* Left-aligned button */}
            <div className="box_btn">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Generate"}
              </button>
            </div>

            {/* Right-aligned buttons */}
            <div className="box_btn d-flex gap-2">
              <button
                type="button"
                className="btn btn-dark me-2" /* Adds space to the right of Clear */
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
