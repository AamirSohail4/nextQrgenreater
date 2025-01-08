"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/Hoc";
import { useAppContext } from "@/context/AppContext";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile_number: "",
    role: "",
    picture: null, // Store file object
    remarks: "", // Added remarks field
  });

  const router = useRouter();

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // Store validation errors
  const { participant, disPlayUsers } = useAppContext();
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
    // Password length check
    const passwordRegex = /^.{6,}$/; // Minimum 6 characters

    // Validate each field and add errors
    if (!nameRegex.test(formData.name)) {
      errors.name = "Name should only contain alphabets and spaces.";
    }
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!phoneRegex.test(formData.mobile_number)) {
      errors.mobile_number =
        "Mobile number should be between 11 and 13 digits.";
    }
    if (!passwordRegex.test(formData.password)) {
      errors.password = "Password should be at least 6 characters long.";
    }

    // Return errors object (empty if no errors)
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error

    const errors = validateForm(); // Validate form
    setValidationErrors(errors); // Store validation errors

    // If there are errors, stop form submission
    if (Object.keys(errors).length > 0) {
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("mobile_number", formData.mobile_number);
    form.append("role", formData.role);
    if (formData.picture) {
      form.append("picture", formData.picture);
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/add",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        alert("User Create Successfully");
        disPlayUsers();
        router.push("/users");
      }
    } catch (err) {
      // Display backend error message
      setError(err.response?.data?.message || "Failed to register user.");
    }
  };

  const handleCancel = () => {
    router.push("/users"); // Redirect to the /users page on cancel
  };

  return (
    <>
      <br />
      <div className="signup-form">
        <h2>User Registration</h2>
        <br />
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">
              Role<span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a role</option>
              <option value="1">Admin</option>
              <option value="2">Management User</option>
            </select>
            {validationErrors.role && (
              <div className="error-message">{validationErrors.role}</div>
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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter a password"
              maxLength={6}
            />
            {validationErrors.password && (
              <div className="error-message">{validationErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number</label>
            <input
              type="tel"
              id="mobile_number"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleInputChange}
              required
              maxLength={13}
              placeholder="Enter your mobile number"
            />
            {validationErrors.mobile_number && (
              <div className="error-message">
                {validationErrors.mobile_number}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="picture">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Enter any remarks"
              style={{ width: "100%" }}
            />
          </div>

          {/* Picture Upload Field */}
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

          <button
            type="submit"
            className="submit-button"
            style={{ marginRight: "15px" }}
          >
            Register
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

export default withAuth(SignupForm, ["1"]);
