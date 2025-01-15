"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/Hoc";
import { useAppContext } from "@/context/AppContext";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();
  const { userGroupDisplay } = useAppContext();

  const nameRegex = /^[A-Za-z\s]+$/; // Allows only alphabets and spaces.

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Group name is required.";
    } else if (!nameRegex.test(formData.name)) {
      errors.name = "Group name should only contain alphabets and spaces.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    setSuccessMessage(null); // Reset success message state

    const errors = validateForm();
    setValidationErrors(errors);

    // Stop submission if validation errors exist
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const form = new FormData();
      form.append("groupname", formData.name);

      const response = await axios.post(
        "http://51.112.24.26:5003/api/users/add_user_group",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        alert("User group created successfully.");
        userGroupDisplay();
        router.push("/user_group");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user group.");
    }
  };

  const handleCancel = () => {
    router.push("/user_group"); // Redirect to the user group page
  };

  return (
    <>
      <br />
      <div className="signup-form">
        <h2>Create User Group</h2>
        <br />
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
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
            {validationErrors.name && (
              <div className="error-message">{validationErrors.name}</div>
            )}
          </div>
          <button
            type="submit"
            className="submit-button"
            style={{ marginRight: "15px" }}
          >
            Submit
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
