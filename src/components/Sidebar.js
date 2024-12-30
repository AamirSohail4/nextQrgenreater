"use client"; // Ensure this is a client component
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation"; // Use usePathname for App Router
import Image from "next/image"; // Import Image from next/image
import { FaTachometerAlt, FaQrcode, FaChevronDown } from "react-icons/fa"; // Import icons from react-icons

export function Sidebar() {
  const pathname = usePathname(); // Get the current pathname
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Function to toggle dropdown visibility for QR Code Management
  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen);
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
              onClick={toggleReports} // Toggle dropdown on click
              className="nav-link d-flex align-items-center"
            >
              <FaQrcode
                className="sidebar-icon"
                style={{ marginRight: "10px" }}
              />
              QR Code Management
              <FaChevronDown
                className={`ms-auto ${isReportsOpen ? "rotate-180" : ""}`}
                style={{ marginLeft: "35px !important" }}
              />
            </button>

            {/* Dropdown menu for QR Code Management */}
            {isReportsOpen && (
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
        </ul>
      </nav>
    </div>
  );
}
