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
import Image from "next/image";
import * as XLSX from "xlsx"; // Import XLSX for Excel export

import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import withAuth from "@/components/Hoc";
import { useAuth } from "@/context/AuthContext";
// React Modal custom styles
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    textAlign: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
};

function Event() {
  const { qrCode, qrCodDisplay } = useAppContext();
  const { authData } = useAuth();
  console.log("That ia a aamir authData", authData?.role == "Management");
  const { Canvas } = useQRCode();
  const [loading, setLoading] = useState(null);
  const qrCodeRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const eventsPerPage = 10;

  const filteredEvents = qrCode.filter((event) => {
    const matchesCode = event.strCode
      .toLowerCase()
      .includes(searchCode.toLowerCase());

    const matchesDate =
      !searchDate || // If searchDate is empty, don't filter by date
      format(new Date(event.dtCreated_at), "yyyy-MM-dd") ===
        format(searchDate, "yyyy-MM-dd");

    return matchesCode && matchesDate;
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchCode, searchDate]);

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
          `https://admin.gmcables.com/api/codes/delete/${id}`,
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
  const handleExcle = () => {
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
      return `${day}/${month}/${year}-${formattedHours}:${minutes}-${ampm}`;
    };

    // Transform the data to match the desired headings and format
    const formattedData = filteredEvents.map((event, index) => ({
      Sr: index + 1, // Add a serial number
      ID: event.intID,
      "QR Code": `https://qr.gmcables.com/qr_code_validator/${event.strCode}`,
      "Last Scanned At": event.dtLastScanned_at
        ? formatDateTime(event.dtLastScanned_at)
        : "",
      "Scan Count": event.intScaneCount,
      "Created At": event.dtCreated_at
        ? formatDateTime(event.dtCreated_at)
        : "",
      StrRemarks: event.strRemarks,
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

    // Format date and time for filename
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${formattedHours}.${minutes}-${ampm}`;

    // Combine date and time into the filename
    const filename = `QRCode_Export-${formattedDate}-${formattedTime}.xlsx`;

    // Write the workbook to a file
    XLSX.writeFile(wb, filename);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }
  }, []);

  const handleQrCodePrint = async (id, strCode) => {
    setLoading(id); // Set loading state
    setIsModalOpen(true); // Open the modal

    // Render the QR code to a canvas dynamically
    const qrCodeCanvas = document.createElement("canvas");
    QRCode.toCanvas(
      qrCodeCanvas,
      `https://qr.gmcables.com/qr_code_validator/${strCode}`,

      { errorCorrectionLevel: "M", scale: 4 },
      (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
          return;
        }

        // Convert canvas to an image URL and set it to the state
        const qrCodeImageUrl = qrCodeCanvas.toDataURL("image/png");
        setQrCodeData(qrCodeImageUrl); // Set the image URL for display
        setLoading(null); // Reset loading state
      }
    );
  };

  // Print the QR code
  const printQRCode = (imageUrl) => {
    const win = window.open("", "Print QR Code");
    win.document.write("<html><body>");
    win.document.write(`<img src="${imageUrl}" />`);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // Download the QR code as an image
  const downloadQRCode = (imageUrl, strCode) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${strCode}_qr_code.png`;
    link.click();
  };
  return (
    <div className="container mt-5">
      <h1 className="mb-4">QR Code List</h1>

      {/* Modal to display the QR Code and options */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="QR Code Modal"
        ariaHideApp={false}
        style={{
          content: {
            width: "50%",
            margin: "auto",
            padding: "20px",
            textAlign: "center",
          },
        }}
      >
        <h2>QR Code</h2>
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* {qrCodeData && <img src={qrCodeData} alt="QR Code" />} */}
          {qrCodeData && (
            <Image
              src={qrCodeData}
              alt="QR Code"
              width={200} // Specify a width
              height={200} // Specify a height
              layout="intrinsic" // Maintain aspect ratio
            />
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => printQRCode(qrCodeData)}
            className="btn btn-success me-2"
          >
            Print
          </button>
          <button
            onClick={() => downloadQRCode(qrCodeData, "sample123")}
            className="btn btn-primary"
          >
            Download
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(false)}
          style={{ position: "absolute", top: "10px", right: "10px" }}
        >
          &times; Close
        </button>
      </Modal>

      {/* Example QR code generation */}

      {/* Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <input
            type="text"
            placeholder="Search by Code"
            className="form-control me-2"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            style={{ flex: 1 }}
          />
          <DatePicker
            className="form-control"
            selected={searchDate}
            onChange={(date) => setSearchDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            isClearable
            required
            style={{ flex: 1 }}
          />
        </div>

        <div className="d-flex ">
          <button onClick={handleExcle} className="btn btn-primary me-2">
            Export Excel
          </button>
          <div>
            {authData?.role !== "Management" && (
              <Link href="/qr_code/add" className="btn btn-primary">
                Generate QR
              </Link>
            )}
          </div>
        </div>
      </div>

      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>Sr</th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>ID</th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Created At
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              QR Code
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Remarks
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Print
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentEvents.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No data found
              </td>
            </tr>
          ) : (
            currentEvents.map((event, index) => {
              const globalIndex = indexOfFirstEvent + index + 1;

              return (
                <tr key={event.intID}>
                  <td>{globalIndex}</td>
                  <td>{event.intID}</td>
                  <td>{format(new Date(event.dtCreated_at), "dd-MM-yyyy")}</td>
                  <td>{`https://qr.gmcables.com/qr_code_validator/${event.strCode}`}</td>
                  <td>{event.strRemarks}</td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() =>
                        handleQrCodePrint(event.intID, event.strCode)
                      }
                      disabled={loading === event.intID}
                    >
                      <FaPrint className="me-1" />
                      {loading === event.intID ? "Processing..." : "Print QR"}
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
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}

      {/* Render Pagination only if there is data */}
      {currentEvents.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
}
export default withAuth(Event, ["Admin", "Management"]);
