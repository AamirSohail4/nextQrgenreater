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

import * as XLSX from "xlsx"; // Import XLSX for Excel export

import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import withAuth from "@/components/Hoc";
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

function Event({ authData }) {
  const { qrCode, qrCodDisplay } = useAppContext();
  const { Canvas } = useQRCode();
  const [loading, setLoading] = useState(null);
  const qrCodeRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchCode, setSearchCode] = useState(""); // State for QR Code search
  const [searchDate, setSearchDate] = useState(""); // State for Date search
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [qrCodeData, setQrCodeData] = useState(null); // QR code data for the modal
  const eventsPerPage = 10;

  // Filter events based on search criteria
  // const filteredEvents = qrCode.filter((event) => {
  //   const matchesCode = event.strCode
  //     .toLowerCase()
  //     .includes(searchCode.toLowerCase());
  //   const matchesDate =
  //     searchDate === "" ||
  //     format(new Date(event.dtCreated_at), "yyyy-MM-dd").includes(searchDate);
  //   return matchesCode && matchesDate;
  // });
  const filteredEvents = qrCode.filter((event) => {
    const matchesCode = event.strCode
      .toLowerCase()
      .includes(searchCode.toLowerCase());

    // Ensure searchDate is a valid Date object before comparing
    const matchesDate =
      !searchDate || // If searchDate is empty, don't filter by date
      format(new Date(event.dtCreated_at), "yyyy-MM-dd") ===
        format(searchDate, "yyyy-MM-dd");

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
    // Transform the data to match the desired headings and format
    const formattedData = filteredEvents.map((event, index) => ({
      Sr: index + 1, // Add a serial number
      "QR Code": event.strCode,
      LastScanned: event.dtLastScanned_at || "", // Use an empty string if null
      ScaneCount: event.intScaneCount,
      Created_at: new Date(event.dtCreated_at).toLocaleString(), // Format the date
    }));

    // Create the worksheet with the formatted data
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "QR Codes");

    // Write the workbook to a file
    XLSX.writeFile(wb, "QRCode_Export.xlsx");
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
      strCode,
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
          {qrCodeData && <img src={qrCodeData} alt="QR Code" />}
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
            selected={searchDate} // Make sure 'searchDate' is a Date object
            onChange={(date) => setSearchDate(date)} // 'date' is the selected Date object
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

          <Link href="/qr_code/add" className="btn btn-primary">
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
                  <td>{format(new Date(event.dtCreated_at), "dd-MM-yyyy")}</td>
                  <td>{event.strCode}</td>
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
export default withAuth(Event, ["1"]);
