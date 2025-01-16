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

function Users({ authData }) {
  const { qrCode, qrCodDisplay, participant, disPlayUsers } = useAppContext();
  const { Canvas } = useQRCode();
  const [loading, setLoading] = useState(null);
  const qrCodeRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const eventsPerPage = 10;

  const filteredEvents = participant.filter((event) => {
    const matchesCode = event.strEmail
      .toLowerCase()
      .includes(searchCode.toLowerCase()); // Apply filter on email field

    const matchesDate =
      !searchDate || // If searchDate is empty, don't filter by date
      format(new Date(event.dtCreated_at), "yyyy-MM-dd") ===
        format(searchDate, "yyyy-MM-dd");

    return matchesCode && matchesDate; // Return true if both match
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
      `Are you sure you want to delete the User with ID: ${id}?`
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://51.112.24.26:5003/api/users/users/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert(`User with ID: ${id} has been deleted successfully.`);
          disPlayUsers();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Unable to delete User."}`);
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

      strEmail: event.strEmail || "",
    }));

    // Create the worksheet with the formatted data
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
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

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Users List</h1>

      {/* Example QR code generation */}

      {/* Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <input
            type="text"
            placeholder="Search by Email"
            className="form-control me-2"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)} // Update searchCode state
            style={{ flex: 1 }}
          />
        </div>

        <div className="d-flex ">
          {/* <button onClick={handleExcle} className="btn btn-primary me-2">
            Export Excel
          </button> */}

          <Link href="/users/signup" className="btn btn-primary">
            Create User
          </Link>
        </div>
      </div>

      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>Sr</th>

            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Name
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Email
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Phone Number
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              User Role
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Image
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
                  <td>{event.strName}</td>
                  <td>{event.strEmail}</td>
                  <td>{event.strMobile}</td>
                  <td>{event.strGroupName}</td>
                  {/* <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {event.strPicture ? (
                      <Image
                        src={`http://51.112.24.26:5003/${event.strPicture}`}
                        alt={event.strName || "User Image"}
                        width={50}
                        height={50}
                        style={{ borderRadius: "50%" }}
                      />
                    ) : (
                      "No Image" // Fallback text if no image is available
                    )}
                  </td> */}

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
export default withAuth(Users, ["Admin"]);
