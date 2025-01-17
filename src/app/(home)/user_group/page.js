"use client";

import ReactDOM from "react-dom";
import Link from "next/link";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import ReactDOMServer from "react-dom/server";
import { QRCodeCanvas } from "qrcode.react";
import { useQRCode } from "next-qrcode";
import { useRef } from "react";

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
  const { userGroup, userGroupDisplay } = useAppContext();
  const { Canvas } = useQRCode();
  const [loading, setLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const eventsPerPage = 10;

  // const filteredEvents = userGroup?.filter((event) => {
  //   const matchesCode = event.strGroupName
  //     .toLowerCase()
  //     .includes(searchCode.toLowerCase()); // Apply filter on email field

  //   const matchesDate =
  //     !searchDate || // If searchDate is empty, don't filter by date
  //     format(new Date(event.dtCreated_at), "yyyy-MM-dd") ===
  //       format(searchDate, "yyyy-MM-dd");

  //   return matchesCode && matchesDate; // Return true if both match
  // });
  const filteredEvents = userGroup
    ? userGroup.filter((event) => {
        const matchesCode = event.strGroupName
          .toLowerCase()
          .includes(searchCode.toLowerCase()); // Apply filter on email field

        const matchesDate =
          !searchDate || // If searchDate is empty, don't filter by date
          format(new Date(event.dtCreated_at), "yyyy-MM-dd") ===
            format(searchDate, "yyyy-MM-dd");

        return matchesCode && matchesDate; // Return true if both match
      })
    : []; // Return an empty array if userGroup is null or undefined

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchCode, searchDate]);

  const sortedEvents =
    filteredEvents.length > 0
      ? [...filteredEvents].sort((a, b) => a.id - b.id)
      : [];
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
      `Are you sure you want to delete the User Group with ID: ${id}?`
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `https://admin.gmcables.com/api/users/user_group/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert(`User Group with ID: ${id} has been deleted successfully.`);
          userGroupDisplay();
        } else {
          const errorData = await response.json();
          alert(
            `Error: ${errorData.message || "Unable to delete User Group."}`
          );
        }
      } catch (error) {
        console.error("Error during delete operation:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  // Function to handle exporting to Excel

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">User Group List</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex"></div>

        <div className="d-flex ">
          <Link href="/user_group/add" className="btn btn-primary">
            Create User Group
          </Link>
        </div>
      </div>

      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>Sr</th>

            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Group Name
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
                  <td>{event.strGroupName}</td>

                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <Link
                      href={`/user_group/edit?id=${event.intID}&page=${currentPage}`}
                    >
                      <FaEdit
                        className="text-primary me-3"
                        style={{ cursor: "pointer" }}
                      />
                    </Link>
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
