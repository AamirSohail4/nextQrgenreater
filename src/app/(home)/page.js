"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import withAuth from "@/components/Hoc"; // Import the HOC

function Dashboard() {
  const { qrCode, qrCodDisplay } = useAppContext();
  const router = useRouter();

  return (
    <main className="main_container">
      <h3 className="dashboard_title">Dashboard</h3>
      <div className="card_container">
        <div className="card">
          <h4 className="card_title">QR Code</h4>
          <p className="card_description">
            Number of QR Code. {qrCode?.length}
          </p>

          <a href="/qr_code" className="card_button">
            View QR Code List
          </a>
        </div>
        <div className="card">
          <h4 className="card_title">QR Codes Scanned</h4>
          <p className="card_description">Total QR Codes scanned: 70</p>
        </div>
      </div>
    </main>
  );
}

// Wrap the component with the HOC, allowing only users with role "1" to access
export default withAuth(Dashboard, ["1"]);
