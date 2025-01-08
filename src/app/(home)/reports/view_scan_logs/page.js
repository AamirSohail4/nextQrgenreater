"use client";

import { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import { AppContext } from "@/context/AppContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EventSummary() {
  const [filters, setFilters] = useState({
    qrCode: "",
  });

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch events based on QR code
  const fetchEvents = async () => {
    if (!filters.qrCode) {
      alert("Please enter a QR Code to search.");
      return;
    }

    try {
      const response = await fetch(
        `http://51.112.24.26:5003/api/codes/get_scan_log/${filters.qrCode}`
      );
      const data = await response.json();

      if (data.success) {
        setFilteredEvents(data.data || []);
      } else {
        setFilteredEvents([]);
        alert("No logs found for the provided QR code.");
      }
    } catch (error) {
      console.error("Error fetching scan logs:", error);
      alert("Error fetching data. Please try again.");
    }
  };

  // Reset pagination when filtered events change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredEvents]);

  // Pagination logic
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

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

  return (
    <div className="container mt-5">
      <h1 className="mb-4">View scan logs</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input
            type="text"
            name="qrCode"
            className="form-control"
            placeholder="QR Code"
            value={filters.qrCode}
            onChange={(e) => setFilters({ ...filters, qrCode: e.target.value })}
          />
        </div>
        <div className="col-md-1">
          <button className="btn btn-primary" onClick={fetchEvents}>
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="table table-striped table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>Sr</th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              QR Code
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Scan Status
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }}>
              Last Scanned
            </th>
          </tr>
        </thead>
        <tbody>
          {currentEvents.length > 0 ? (
            currentEvents.map((qrReports, index) => (
              <tr key={qrReports.intID}>
                <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                <td>{qrReports.strCode}</td>
                <td>{qrReports.intScaneCount || "N/A"}</td>
                <td>
                  {qrReports.dtscanned_at
                    ? format(
                        new Date(qrReports.dtscanned_at),
                        "dd-MM-yyyy hh:mm:ss a"
                      )
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No events found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {filteredEvents.length > 0 && (
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
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>

          <div className="text-center mt-3">
            Page {currentPage} of {totalPages || 1}
          </div>
        </>
      )}
    </div>
  );
}
