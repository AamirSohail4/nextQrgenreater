"use client";
import { useState } from "react";
// import QRCode from "qrcode.react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import * as XLSX from "xlsx";
import withAuth from "@/components/Hoc";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaExcel, FaPdf } from "react-icons/fa";

function AddQRCode() {
  const [count, setCount] = useState("");
  const [qrCodes, setQrCodes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { qrCodDisplay } = useAppContext();
  const [remarks, setRemarks] = useState();
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

    const requestBody = { strCode: generatedCodes, remarks: remarks };
    console.log("That is a requestBody", requestBody);
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
    // Function to format date and time to DD/MM/YYYY-HH:MM-am/pm
    const formatDateTime = (date) => {
      const now = new Date(date);

      const day = String(now.getDate()).padStart(2, "0"); // Add leading zero if day < 10
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Add leading zero if month < 10
      const year = now.getFullYear();

      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0"); // Add leading zero if minutes < 10

      // Determine AM/PM
      const ampm = hours >= 12 ? "pm" : "am";
      const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour format

      // Format date and time
      return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
    };

    // Transform the data to match the desired headings and format
    const formattedData = qrCodes.map((event, index) => ({
      Sr: index + 1, // Add a serial number
      ID: event.intID,
      "QR Code": `http://51.112.24.26:5004/qr_code_validator/${event.strCode}`,
      "Last Scanned At": event.dtLastScanned_at
        ? formatDateTime(event.dtLastScanned_at)
        : "",
      "Scan Count": event.intScaneCount,
      Remarks: event.strRemarks,
      "Created At": event.dtCreated_at
        ? formatDateTime(event.dtCreated_at)
        : "",
    }));

    // Create the worksheet with the formatted data
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QR Codes");

    // Generate the current date and time for the filename
    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0"); // Add leading zero if day < 10
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Add leading zero if month < 10
    const year = now.getFullYear();

    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0"); // Add leading zero if minutes < 10

    // Determine AM/PM
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour format

    // Replace invalid characters for filenames with alternatives
    const formattedDate = `${day}_${month}_${year}`;
    const formattedTime = `${formattedHours}.${minutes}${ampm}`; // Use period instead of colon

    // Combine date and time into the filename
    const filename = `QRCode_Export-${formattedDate}-${formattedTime}.xlsx`;

    // Write the workbook to a file
    XLSX.writeFile(wb, filename);
  };
  //latest
  const exportToPDF = async () => {
    // Define custom page size: 55.88 mm x 25.4 mm
    const pageWidth = 55.88; // Width in mm
    const pageHeight = 19.05; // Height in mm

    const pdf = new jsPDF({
      unit: "mm", // Units for dimensions
      format: [pageWidth, pageHeight], // Custom page size [width, height]
      orientation: "landscape", // Set orientation to landscape
    });

    // Adjust QR code size to fit within the page
    const qrCodeWidth = 16; // QR code width in mm
    const qrCodeHeight = 16; // QR code height in mm

    // Center the QR code on the page
    const marginLeft = (pageWidth - qrCodeWidth) / 2 + 4; // X position to center QR code
    const marginTop = (pageHeight - qrCodeHeight) / 2 - 1; // Y position to center QR code

    for (let i = 0; i < qrCodes.length; i++) {
      const event = qrCodes[i];
      const qrCodeURL = `http://51.112.24.26:5004/qr_code_validator/${event.strCode}`;

      try {
        const qrCodeDataURL = await QRCode.toDataURL(qrCodeURL, {
          errorCorrectionLevel: "M",
          scale: 4, // Scale for high resolution
        });

        // Add the QR code to the custom-sized PDF
        pdf.addImage(
          qrCodeDataURL, // QR code image
          "PNG", // Image format
          marginLeft, // X position
          marginTop, // Y position
          qrCodeWidth, // Width
          qrCodeHeight // Height
        );

        // Add a new page for the next QR code, unless it's the last one
        if (i < qrCodes.length - 1) {
          pdf.addPage([pageWidth, pageHeight]); // Create a new page with the same custom size
        }
      } catch (error) {
        console.error(`Failed to generate QR code for ${qrCodeURL}:`, error);
      }
    }

    // Save the PDF with a filename
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD format
    const formattedTime = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS format
    const filename = `QRCode_Export-${formattedDate}-${formattedTime}.pdf`;

    pdf.save(filename);
  };

  // Your existing component and other imports...
  // const exportToPDF = async () => {
  //   // Define custom page size: 3.2 inches x 0.75 inches
  //   const pageWidth = 81.05; // 3.2 inches in mm
  //   const pageHeight = 81.28; //19.05; // 0.75 inches in mm

  //   const pdf = new jsPDF({
  //     unit: "mm", // Units for dimensions
  //     format: [pageWidth, pageHeight], // Custom page size [width, height]
  //   });

  //   const qrCodeWidth = 76.2; // QR code width (3.00 inches in mm)
  //   const qrCodeHeight = 19.05; // QR code height (0.75 inches in mm)
  //   const marginLeft = (pageWidth - qrCodeWidth) / 2; // Center QR code horizontally
  //   const marginTop = 0; // Start at the top of the page

  //   for (let i = 0; i < qrCodes.length; i++) {
  //     const event = qrCodes[i];
  //     const qrCodeURL = `http://51.112.24.26:5004/qr_code_validator/${event.strCode}`;

  //     try {
  //       const qrCodeDataURL = await QRCode.toDataURL(qrCodeURL, {
  //         errorCorrectionLevel: "M",
  //         scale: 4, // Scale for high resolution
  //       });

  //       // Add the QR code to the custom-sized PDF
  //       pdf.addImage(
  //         qrCodeDataURL, // QR code image
  //         "PNG", // Image format
  //         marginLeft, // X position
  //         marginTop, // Y position
  //         qrCodeWidth, // Width
  //         qrCodeHeight // Height
  //       );

  //       // Add a new page for the next QR code, unless it's the last one
  //       if (i < qrCodes.length - 1) {
  //         pdf.addPage([pageWidth, pageHeight]); // Create a new page with the same custom size
  //       }
  //     } catch (error) {
  //       console.error(`Failed to generate QR code for ${qrCodeURL}:`, error);
  //     }
  //   }

  //   // Save the PDF with a filename
  //   const now = new Date();
  //   const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  //   const formattedTime = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS format
  //   const filename = `QRCode_Export-${formattedDate}-${formattedTime}.pdf`;

  //   pdf.save(filename);
  // };

  //1
  // const exportToPDF = async () => {
  //   const pdf = new jsPDF();
  //   const qrCodeSize = 50; // Size of the QR code in mm
  //   const marginTop = 50; // Top margin for QR code on each page
  //   const marginLeft = 120; // Center the QR code on the page

  //   for (let i = 0; i < qrCodes.length; i++) {
  //     const event = qrCodes[i];
  //     const qrCodeURL = `http://51.112.24.26:5004/qr_code_validator/${event.strCode}`;

  //     // Generate QR code as a data URL
  //     try {
  //       const qrCodeDataURL = await QRCode.toDataURL(qrCodeURL, {
  //         errorCorrectionLevel: "M",
  //         scale: 4, // Scale the QR code size
  //       });

  //       // Add the QR code to the PDF
  //       pdf.addImage(
  //         qrCodeDataURL, // QR code image
  //         "PNG", // Image format
  //         marginLeft, // X position
  //         marginTop, // Y position
  //         qrCodeSize, // Width
  //         qrCodeSize // Height
  //       );

  //       // Add a new page for the next QR code, unless it's the last one
  //       if (i < qrCodes.length - 1) {
  //         pdf.addPage();
  //       }
  //     } catch (error) {
  //       console.error(`Failed to generate QR code for ${qrCodeURL}:`, error);
  //     }
  //   }

  //   // Save the PDF with a filename
  //   const now = new Date();
  //   const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  //   const formattedTime = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS format
  //   const filename = `QRCode_Export-${formattedDate}-${formattedTime}.pdf`;

  //   pdf.save(filename);
  // };
  //2
  // const exportToPDF = async () => {
  //   const pdf = new jsPDF();
  //   const qrCodeWidth = 76.2; // Width of the QR code in mm (3.00 inches)
  //   const qrCodeHeight = 19.05; // Height of the QR code in mm (0.75 inches)
  //   const marginTop = 50; // Top margin for QR code on each page
  //   const marginLeft = 75; // Center the QR code on the page

  //   for (let i = 0; i < qrCodes.length; i++) {
  //     const event = qrCodes[i];
  //     const qrCodeURL = `http://51.112.24.26:5004/qr_code_validator/${event.strCode}`;

  //     // Generate QR code as a data URL
  //     try {
  //       const qrCodeDataURL = await QRCode.toDataURL(qrCodeURL, {
  //         errorCorrectionLevel: "M",
  //         scale: 2, // Scale the QR code size
  //       });

  //       // Add the QR code to the PDF
  //       pdf.addImage(
  //         qrCodeDataURL, // QR code image
  //         "PNG", // Image format
  //         marginLeft, // X position
  //         marginTop, // Y position
  //         qrCodeWidth, // Width
  //         qrCodeHeight // Height
  //       );

  //       // Add a new page for the next QR code, unless it's the last one
  //       if (i < qrCodes.length - 1) {
  //         pdf.addPage();
  //       }
  //     } catch (error) {
  //       console.error(`Failed to generate QR code for ${qrCodeURL}:`, error);
  //     }
  //   }

  //   // Save the PDF with a filename
  //   const now = new Date();
  //   const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  //   const formattedTime = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS format
  //   const filename = `QRCode_Export-${formattedDate}-${formattedTime}.pdf`;

  //   pdf.save(filename);
  // };
  //3
  // const exportToPDF = async () => {
  //   const pdf = new jsPDF();

  //   const qrCodeWidth = 76.2; // 3.00 inches in mm
  //   const qrCodeHeight = 19.05; // 0.75 inches in mm
  //   const marginTop = 50; // Top margin for QR code on each page
  //   const marginLeft = 120; // Center the QR code on the page

  //   for (let i = 0; i < qrCodes.length; i++) {
  //     const event = qrCodes[i];
  //     const qrCodeURL = `http://51.112.24.26:5004/qr_code_validator/${event.strCode}`;

  //     // Generate QR code as a data URL
  //     try {
  //       const qrCodeDataURL = await QRCode.toDataURL(qrCodeURL, {
  //         errorCorrectionLevel: "M",
  //         scale: 4, // Scale to enhance resolution for larger size
  //       });

  //       // Add the QR code to the PDF with the specified size
  //       pdf.addImage(
  //         qrCodeDataURL, // QR code image
  //         "PNG", // Image format
  //         marginLeft, // X position
  //         marginTop, // Y position
  //         qrCodeWidth, // Width (76.2 mm)
  //         qrCodeHeight // Height (19.05 mm)
  //       );

  //       // Add a new page for the next QR code, unless it's the last one
  //       if (i < qrCodes.length - 1) {
  //         pdf.addPage();
  //       }
  //     } catch (error) {
  //       console.error(`Failed to generate QR code for ${qrCodeURL}:`, error);
  //     }
  //   }

  //   // Save the PDF with a filename
  //   const now = new Date();
  //   const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  //   const formattedTime = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS format
  //   const filename = `QRCode_Export-${formattedDate}-${formattedTime}.pdf`;

  //   pdf.save(filename);
  // };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <div
        className="p-4 border rounded"
        style={{
          maxWidth: "940px",
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
          <div className="mb-3">
            <label htmlFor="count" className="form-label">
              Remarks <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              type="text"
              id="text"
              name="text"
              className="form-control form-control-sm"
              placeholder="Enter your remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={exportToPDF}
              >
                Export to PDF
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
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((code, index) => (
                  <tr key={code.intID}>
                    <td>{index + 1}</td>
                    <td>{code.intID}</td>
                    <td>{`http://51.112.24.26:5004/qr_code_validator/${code.strCode}`}</td>
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
                    <td>{code.strRemarks}</td>
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

export default withAuth(AddQRCode, ["Admin"]);
