"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function EditUserGroup() {
  const [isSubmitting, setIsSubmitting] = useState(false); // State for button loading
  const [loading, setLoading] = useState(true); // State for loading participant data
  const { userGroupDisplay } = useAppContext();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Get participant ID from query string

  const [formData, setFormData] = useState({
    name: "",
  });

  // Fetch group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const res = await fetch(
          `http://51.112.24.26:5003/api/users/user_group/${id}`
        );
        if (res.ok) {
          const result = await res.json();
          const fetchData = result?.data;

          if (fetchData) {
            setFormData({
              name: fetchData.groupname || "",
            });
          }
        } else {
          console.error("Failed to fetch group data");
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchGroupData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("groupname", formData.name);

    try {
      const res = await fetch(
        `http://51.112.24.26:5003/api/users/edit_user_group/${id}`,
        {
          method: "PATCH",
          body: data,
        }
      );

      if (res.ok) {
        alert("User group updated successfully.");
        userGroupDisplay(); // Refresh group display
        router.push("/user_group");
      } else {
        const errorData = await res.json();
        alert(errorData?.message || "Error updating the user group");
      }
    } catch (error) {
      console.error("Error updating user group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/user_group");
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading until data is fetched
  }

  return (
    <>
      <br></br>
      <div className="signup-form">
        <h2>Edit User Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Group Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your Group Name"
              maxLength={25}
            />
          </div>
          <button
            type="submit"
            className="submit-button"
            style={{ marginRight: "15px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-danger"
          >
            Cancel
          </button>
        </form>
      </div>
    </>
  );
}

export default function EditUserGroupWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditUserGroup />
    </Suspense>
  );
}
