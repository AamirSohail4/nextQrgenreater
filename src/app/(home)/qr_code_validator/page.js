"use client";

import { useAppContext } from "@/context/AppContext";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

function QRcode_validator() {
  const {
    event,
    userId,
    eventDisplay,
    eventParticipantDisplay,
    eventParticipantSummary,
    roleId,
  } = useAppContext();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const page = searchParams.get("page");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    event_name: "",
    event_location: "",
    event_certificate_file_path: null,
    event_banner_file_path: null,
    is_active: false,
    event_id: "",
  });
  console.log("That is a page", page);
  // useEffect(() => {
  //   if (roleId !== 2) {
  //     router.push("/auth/login");
  //   }
  // }, [roleId, router]);
  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(
        `http://51.112.24.26:5001/api/event/getOne/${id}`
      );
      const result = await res.json();
      const fetchData = result?.data;

      if (fetchData) {
        const eventFromDate = new Date(fetchData.event_from_date);
        const eventToDate = new Date(fetchData.event_to_date);

        setFormData({
          event_name: fetchData.event_name,
          event_location: fetchData.event_location,
          event_certificate_file_path: fetchData.event_certificate_file_path,
          event_banner_file_path: fetchData.event_banner_file_path,
          is_active: fetchData.is_active,
          event_id: fetchData.event_id,
        });

        // Set the date states for DatePicker
        setFromDate(eventFromDate);
        setToDate(eventToDate);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleFromDateChange = (date) => {
    setFromDate(date); // Update fromDate state when date changes
  };

  const handleToDateChange = (date) => {
    setToDate(date); // Update toDate state when date changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("event_name", formData.event_name);
    const formattedfromDate = fromDate
      ? `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(fromDate.getDate()).padStart(2, "0")}`
      : "";
    data.append("event_from_date", formattedfromDate);
    const formattedtoDate = toDate
      ? `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(toDate.getDate()).padStart(2, "0")}`
      : "";
    data.append("event_to_date", formattedtoDate);
    data.append("event_location", formData.event_location);
    data.append(
      "event_certificate_file_path",
      formData.event_certificate_file_path
    );
    data.append("event_banner_file_path", formData.event_banner_file_path);
    data.append("is_active", formData.is_active ? 1 : 0);
    data.append("event_id", formData.event_id);

    const res = await fetch(`http://51.112.24.26:5001/api/event/edit/${id}`, {
      method: "PATCH",
      body: data,
    });

    if (res.ok) {
      eventDisplay();
      eventParticipantDisplay();
      eventParticipantSummary();
      router.push(`/dashboard/event?page=${page}`);
    } else {
      alert("Error updating the event");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/event");
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">QR Code Validate Here</h1>

      <div>Loading...</div>
    </div>
  );
}

export default function EditEvent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRcode_validator />
    </Suspense>
  );
}
