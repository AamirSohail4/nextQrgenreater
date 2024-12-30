"use client";

import ReactDOM from "react-dom";
import Link from "next/link";
import { FaTrashAlt, FaPrint, FaQrcode } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import ReactDOMServer from "react-dom/server";
import { QRCodeCanvas } from "qrcode.react";
import { useQRCode } from "next-qrcode";
import { useRef } from "react";
import QRCode from "qrcode";
import withAuth from "@/components/HOC"; // Import the HOC
import * as XLSX from "xlsx"; // Import XLSX for Excel export
import Image from "next/image";

function Event({ authData }) {
  const { qrCode, qrCodDisplay } = useAppContext();
  const { Canvas } = useQRCode();
  const [loading, setLoading] = useState(null);
  const qrCodeRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCode, setSearchCode] = useState(""); // State for QR Code search
  const [searchDate, setSearchDate] = useState(""); // State for Date search

  const eventsPerPage = 10;

  // Filter events based on search criteria
  const filteredEvents = qrCode.filter((event) => {
    const matchesCode = event.strCode
      .toLowerCase()
      .includes(searchCode.toLowerCase());
    const matchesDate =
      searchDate === "" ||
      format(new Date(event.dtCreated_at), "yyyy-MM-dd").includes(searchDate);
    return matchesCode && matchesDate;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => a.id - b.id);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the QR Code with ID: ${id}?`
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/codes/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert(`QR Code with ID: ${id} has been deleted successfully.`);
          qrCodDisplay();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Unable to delete QR Code."}`);
        }
      } catch (error) {
        console.error("Error during delete operation:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  // Function to handle exporting to Excel
  const handleExcle = () => {
    const ws = XLSX.utils.json_to_sheet(filteredEvents);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QR Codes");
    XLSX.writeFile(wb, "QRCode_Export.xlsx");
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }
  }, []);

  // const handlePrintQRCode = async (id, strCode) => {
  //   setLoading(id); // Set loading state

  //   // Render the QR code to a canvas dynamically
  //   const qrCodeCanvas = document.createElement("canvas");
  //   QRCode.toCanvas(
  //     qrCodeCanvas,
  //     strCode,
  //     { errorCorrectionLevel: "M", scale: 4 },
  //     (error) => {
  //       if (error) {
  //         console.error("QR Code generation error:", error);
  //         return;
  //       }

  //       // Display the QR code canvas in the UI (for example, in a modal or a specific div)
  //       const qrCodeContainer = document.getElementById("qrCodeContainer");
  //       qrCodeContainer.innerHTML = ""; // Clear previous QR code
  //       qrCodeContainer.appendChild(qrCodeCanvas);

  //       // Reset loading state
  //       setLoading(null);
  //     }
  //   );
  // };

  const handlePrintQRCode = async (id, strCode) => {
    setLoading(id); // Set loading state

    // Render the QR code to a canvas dynamically
    const qrCodeCanvas = document.createElement("canvas");
    QRCode.toCanvas(
      qrCodeCanvas,
      strCode,
      { errorCorrectionLevel: "M", scale: 4 },
      (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
          return;
        }

        // Display the QR code canvas in the UI
        const qrCodeContainer = document.getElementById("qrCodeContainer");
        qrCodeContainer.innerHTML = ""; // Clear previous QR code
        qrCodeContainer.appendChild(qrCodeCanvas);

        // Add print and download buttons
        const optionsContainer = document.getElementById("qrCodeOptions");
        optionsContainer.innerHTML = `
        <button id="printQR" class="btn btn-success me-2">Print</button>
        <button id="downloadQR" class="btn btn-primary">Download</button>
      `;

        // Attach print and download functionality
        document.getElementById("printQR").onclick = () =>
          printQRCode(qrCodeCanvas);
        document.getElementById("downloadQR").onclick = () =>
          downloadQRCode(qrCodeCanvas, strCode);

        // Reset loading state
        setLoading(null);
      }
    );
  };
  // Print the QR code
  const printQRCode = (canvas) => {
    const win = window.open("", "Print QR Code");
    win.document.write("<html><body>");
    win.document.body.appendChild(canvas);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // Download the QR code as an image
  const downloadQRCode = (canvas, strCode) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${strCode}_qr_code.png`;
    link.click();
  };

  // Generate and download as PDF
  const downloadAsPDF = (canvas, strCode) => {
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 50, 50); // Adjust size and position
    pdf.save(`${strCode}_qr_code.pdf`);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">QR_Code List</h1>

      <div
        id="qrCodeContainer"
        style={{ textAlign: "center", marginTop: "20px" }}
      >
        {/* QR code will be displayed here */}
      </div>

      <div
        id="qrCodeOptions"
        style={{ textAlign: "center", marginTop: "10px" }}
      ></div>

      <div>{/* QR Code Modal */}</div>

      {/* Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <input
            type="text"
            placeholder="Search by Code"
            className="form-control me-2"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
        <div className="d-flex ">
          <button onClick={handleExcle} className="btn btn-primary me-2">
            Export Excel
          </button>

          <Link href="/qr_Codes/add" className="btn btn-primary">
            Generated QR
          </Link>
        </div>
      </div>

      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>Sr</th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Created at
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              QR Code
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Generated QR
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentEvents.map((event, index) => {
            const globalIndex = indexOfFirstEvent + index + 1;

            return (
              <tr key={event.intID}>
                <td>{globalIndex}</td>
                <td>{format(new Date(event.dtCreated_at), "dd-MM-yyyy")}</td>
                <td>{event.strCode}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() =>
                      handlePrintQRCode(event.intID, event.strCode)
                    }
                    disabled={loading === event.intID}
                  >
                    <FaQrcode className="me-1" />
                    {loading === event.intID ? "Processing..." : "Genreate"}
                  </button>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <FaTrashAlt
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(event.intID)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <div className="text-center mt-3">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
export default withAuth(Event, ["1"]);
