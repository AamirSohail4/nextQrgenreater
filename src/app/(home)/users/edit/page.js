"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import withAuth from "@/components/Hoc";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const EditUserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    user_group_id: "",
    picture: null,
    remarks: "", // Added remarks field
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const page = searchParams.get("page");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { disPlayUsers, userGroup } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Save the file in the form data
      setFormData({
        ...formData,
        picture: file, // Save the file object in state
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    // Regex for name to allow only alphabets and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    // Regex for email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    // Regex for mobile number validation (11 to 13 digits)
    const phoneRegex = /^\d{11,13}$/;

    // Validate each field and add errors
    if (!nameRegex.test(formData.name)) {
      errors.name = "Name should only contain alphabets and spaces.";
    }
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!phoneRegex.test(formData.mobile)) {
      errors.mobile = "Mobile number should be between 11 and 13 digits.";
    }

    return errors;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(
          `http://51.112.24.26:5003/api/users/users/${id}`
        );
        if (res.ok) {
          const result = await res.json();
          const fetchData = result?.data;

          if (fetchData) {
            setFormData({
              id: fetchData.id || "",
              name: fetchData.name || "",
              mobile: fetchData.mobile || "",
              email: fetchData.email || "",
              picture: fetchData.picture || null,
              remarks: fetchData.remarks || "",
              groupname: fetchData.groupname,
              user_group_id: fetchData.user_group_id,
            });
          }
        } else {
          console.error("Failed to fetch participant data");
        }
      } catch (error) {
        console.error("Error fetching participant data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("mobile", formData.mobile);
    form.append("user_group_id", formData.user_group_id);
    if (formData.picture) {
      form.append("picture", formData.picture);
    }

    try {
      const response = await axios.patch(
        `http://51.112.24.26:5003/api/users/edit/${id}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200) {
        alert("User updated successfully");
        disPlayUsers();
        router.push("/users");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register user.");
    }
  };

  const handleCancel = () => {
    router.push("/users");
  };

  return (
    <>
      <br />
      <div className="signup-form">
        <h2>Edit User</h2>
        <br />
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="user_group_id">
              Role<span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="user_group_id"
              name="user_group_id"
              value={formData.user_group_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a Role</option>
              {userGroup?.map((group) => (
                <option key={group.intID} value={group.intID}>
                  {group.strGroupName}
                </option>
              ))}
            </select>
            {validationErrors.user_group_id && (
              <div className="error-message">
                {validationErrors.user_group_id}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your name"
              maxLength={25}
            />
            {validationErrors.name && (
              <div className="error-message">{validationErrors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              maxLength={25}
            />
            {validationErrors.email && (
              <div className="error-message">{validationErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              required
              maxLength={13}
              placeholder="Enter your mobile number"
            />
            {validationErrors.mobile && (
              <div className="error-message">{validationErrors.mobile}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Enter any remarks"
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="picture">Profile Picture</label>
            <input
              type="file"
              id="picture"
              name="picture"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          <div className="form-group">
            {formData.picture ? (
              formData.picture instanceof File ? (
                <Image
                  src={URL.createObjectURL(formData.picture)}
                  alt={formData.name || "User Image"}
                  width={50}
                  height={50}
                  style={{ borderRadius: "50%" }}
                />
              ) : (
                <Image
                  src={`http://51.112.24.26:5003/${formData.picture}`}
                  alt={formData.name || "User Image"}
                  width={50}
                  height={50}
                  style={{ borderRadius: "50%" }}
                />
              )
            ) : (
              <p>No image selected</p>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            style={{ marginRight: "15px" }}
          >
            Update
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
};
export default withAuth(EditUserForm, ["Admin"]);
