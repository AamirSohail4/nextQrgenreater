"use client";
import { useState } from "react";
import QRCode from "qrcode.react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import * as XLSX from "xlsx";
import withAuth from "@/components/Hoc";

function AddQRCode() {
  const [count, setCount] = useState("");
  const [qrCodes, setQrCodes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { qrCodDisplay } = useAppContext();
  const router = useRouter();

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
    if (isNaN(number) || number <= 0 || number > 500) {
      alert("Please enter a valid number between 1 and 100.");
      return;
    }

    const generatedCodes = generateUniqueCodes(number);

    const requestBody = { strCode: generatedCodes };

    try {
      setIsSubmitting(true);
      const response = await fetch(
        "http://51.112.24.26:5003/api/codes/add_qrCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        alert("QR codes submitted successfully!");
        setQrCodes(responseData.data);
        qrCodDisplay();
        setCount("");
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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      qrCodes.map((code, index) => ({
        "Sr#": index + 1,
        ID: code.intID,
        "QR Code": code.strCode,
        "Last Scanned At": code.dtLast_scanned_at || "",
        "Scan Count": code.intScan_count,
        "Created At": new Date(code.dtCreated_at).toLocaleDateString("en-GB"),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "QR Code");
    XLSX.writeFile(workbook, "QRCode_Export.xlsx");
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <div
        className="p-4 border rounded"
        style={{
          maxWidth: "700px",
          width: "100%",
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
              max="500"
            />
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Generate"}
            </button>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-dark"
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

        {qrCodes.length > 0 && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-3">Generated QR Codes</h2>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={exportToExcel}
              >
                Export to Excel
              </button>
            </div>
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>ID</th>
                  <th>QR Code</th>
                  <th>Created At</th>
                  <th>Last Scanned At</th>
                  <th>Scan Count</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((code, index) => (
                  <tr key={code.intID}>
                    <td>{index + 1}</td>
                    <td>{code.intID}</td>
                    <td>{code.strCode}</td>
                    <td>
                      {new Date(code.dtCreated_at).toLocaleDateString("en-GB")}
                    </td>
                    <td>
                      {code.dtLast_scanned_at
                        ? new Date(code.dtLast_scanned_at).toLocaleDateString(
                            "en-GB"
                          )
                        : "Not Scanned"}
                    </td>
                    <td>{code.intScan_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AddQRCode, ["1"]);
