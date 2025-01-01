"use client";

import { useAppContext } from "@/context/AppContext";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { use } from "react"; // Import use from React

function QRcode_validator({ params }) {
  const {
    event,
    userId,
    eventDisplay,
    eventParticipantDisplay,
    eventParticipantSummary,
    roleId,
  } = useAppContext();

  const router = useRouter();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use React.use() to unwrap the params object
  const { strCode } = use(params); // Unwrap the params with use()

  useEffect(() => {
    if (strCode) {
      console.log(`Dynamic Code: ${strCode}`);
      // You can add more logic here, like fetching data using the `strCode` value
    }
  }, [strCode]);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">QR Code Validate Here</h1>

      {/* Display the dynamic strCode */}
      <p>QR Code: {strCode}</p>

      {/* {loading ? <div>Loading...</div> : <div>Content Loaded</div>} */}
    </div>
  );
}

export default function EditEvent({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRcode_validator params={params} />
    </Suspense>
  );
}
