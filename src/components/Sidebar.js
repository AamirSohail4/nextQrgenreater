"use client"; // Ensure this is a client component
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation"; // Use usePathname for App Router
import Image from "next/image"; // Import Image from next/image
import {
  FaTachometerAlt,
  FaQrcode,
  FaChevronDown,
  FaFileAlt,
  FaUser,
} from "react-icons/fa"; // Import icons from react-icons
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const { authData } = useAuth();
  const pathname = usePathname(); // Get the current pathnames
  const [isQROpen, setIsQROpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Function to toggle dropdown visibility for QR Code Management
  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen);
  };

  const toggleQR = () => {
    setIsQROpen(!isQROpen);
  };

  const toggleUser = () => {
    setIsUserOpen(!isUserOpen);
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path); // Now using pathname directly
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link href="/">
          {/* Replace img tag with Image component */}
          <Image
            src="/images/logo4.PNG"
            alt="Logo"
            className="sidebar-logo"
            width={255} // Specify the width
            height={50} // Specify the height
          />
        </Link>
      </div>

      <nav>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              href="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              <FaTachometerAlt
                className="sidebar-icon"
                style={{ marginRight: "10px" }}
              />
              Dashboard
            </Link>
          </li>

          {/* QR Code Management Dropdown */}
          <li className="nav-item">
            <button
              onClick={toggleQR} // Toggle dropdown on click
              className="nav-link d-flex align-items-center"
            >
              <FaQrcode
                className="sidebar-icon"
                style={{ marginRight: "10px" }}
              />

              <span style={{ marginRight: "20px" }}> QR Code Management</span>
              <FaChevronDown
                className={`ms-auto ${isQROpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown menu for QR Code Management */}
            {isQROpen && (
              <ul className="nav flex-column ms-3">
                <li className="nav-item">
                  <Link
                    href="/qr_code"
                    className={`nav-link ${
                      isActive("/qr_code") ? "active" : ""
                    }`}
                  >
                    QR Code List
                  </Link>
                </li>
                {/* Add other links for QR Code Management if needed */}
              </ul>
            )}
          </li>

          {/* Reports Dropdown */}
          <li className="nav-item">
            <button
              onClick={toggleReports} // Toggle dropdown on click
              className="nav-link d-flex align-items-center"
            >
              <FaFileAlt
                className="sidebar-icon"
                style={{ marginRight: "10px" }}
              />

              <span style={{ marginRight: "20px" }}>Reports</span>
              <FaChevronDown
                className={`${isReportsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown menu for Reports */}
            {isReportsOpen && (
              <ul className="nav flex-column ms-3">
                <li className="nav-item">
                  <Link
                    href="/reports/summary"
                    className={`nav-link ${
                      isActive("/reports/summary") ? "active" : ""
                    }`}
                  >
                    Summary
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/reports/view_scan_logs"
                    className={`nav-link ${
                      isActive("/reports/view_scan_logs") ? "active" : ""
                    }`}
                  >
                    View scan logs
                  </Link>
                </li>
                {/* Add other links for Reports if needed */}
              </ul>
            )}
          </li>

          {/* User Dropdown */}
          {authData?.role !== "Management" && (
            <li className="nav-item">
              <button
                onClick={toggleUser} // Toggle dropdown on click
                className="nav-link d-flex align-items-center"
              >
                <FaUser
                  className="sidebar-icon"
                  style={{ marginRight: "10px" }}
                />
                <span style={{ marginRight: "20px" }}>User</span>
                {/* Apply marginLeft here */}
                <FaChevronDown
                  className={`ms-auto ${isUserOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown menu for User */}
              {isUserOpen && (
                <ul className="nav flex-column ms-3">
                  <li className="nav-item">
                    <Link
                      href="/users"
                      className={`nav-link ${
                        isActive("/users") ? "active" : ""
                      }`}
                    >
                      Users
                    </Link>
                  </li>
                </ul>
              )}
              {/* Dropdown menu for User_group */}
              {isUserOpen && (
                <ul className="nav flex-column ms-3">
                  <li className="nav-item">
                    <Link
                      href="/user_group"
                      className={`nav-link ${
                        isActive("/users") ? "active" : ""
                      }`}
                    >
                      User_group
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
