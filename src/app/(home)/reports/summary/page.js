"use client";

import { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import { AppContext } from "@/context/AppContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EventSummary() {
  const { qrCode } = useContext(AppContext); // Get qrCode data from context

  const [filters, setFilters] = useState({
    qrCode: "",
    scanStatus: "",
  });
  const [dateFilters, setDateFilters] = useState({
    fromDate: null,
    toDate: null,
  });
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize filtered events to the full list of events when qrCode changes
  useEffect(() => {
    setFilteredEvents(qrCode); // Show all events initially
  }, [qrCode]);

  // Handle QR Code and Scan Status changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    // Apply filters immediately for QR Code and Scan Status
    filterEvents({ qrCode: value });
  };

  // Handle date changes
  const handleDateChange = (date, name) => {
    setDateFilters((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  // Function to filter events based on QR Code, Scan Status, and date range
  const filterEvents = () => {
    let filtered = qrCode; // Original array of events

    // Filter by QR Code
    if (filters.qrCode) {
      filtered = filtered.filter((event) =>
        event.strCode.toLowerCase().includes(filters.qrCode.toLowerCase())
      );
    }

    // Filter by Scan Status
    if (filters.scanStatus) {
      filtered = filtered.filter(
        (event) => event.intScaneCount === parseInt(filters.scanStatus)
      );
    }

    // Filter by From Date if selected
    if (dateFilters.fromDate) {
      filtered = filtered.filter(
        (event) =>
          new Date(event.dtCreated_at) >= new Date(dateFilters.fromDate)
      );
    }

    // Filter by To Date if selected
    if (dateFilters.toDate) {
      filtered = filtered.filter(
        (event) => new Date(event.dtCreated_at) <= new Date(dateFilters.toDate)
      );
    }

    setFilteredEvents(filtered);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, dateFilters]);

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
      <h1 className="mb-4">Summary</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input
            type="text"
            name="qrCode"
            className="form-control"
            placeholder="QR Code"
            value={filters.qrCode}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            name="scanStatus"
            className="form-control"
            placeholder="Scan Status"
            value={filters.scanStatus}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            className="form-control"
            dateFormat="dd/MM/yyyy"
            placeholderText="From Date"
            selected={dateFilters.fromDate}
            onChange={(date) => handleDateChange(date, "fromDate")}
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            className="form-control"
            dateFormat="dd/MM/yyyy"
            placeholderText="To Date"
            isClearable
            selected={dateFilters.toDate}
            onChange={(date) => handleDateChange(date, "toDate")}
          />
        </div>
        <div className="col-md-1">
          <button className="btn btn-primary" onClick={filterEvents}>
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
                <td>{qrReports.intScaneCount}</td>
                <td>
                  {qrReports.dtLastScanned_at
                    ? format(
                        new Date(qrReports.dtLastScanned_at),
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
    </div>
  );
}
