/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
"use client";
import { useEffect, createContext, useState, useContext } from "react";
import jwtDecode from "jsonwebtoken"; // Import the JWT library

export const AppContext = createContext({});

// Provider
export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null); // State to hold userId
  const [event, setEvent] = useState([]);
  const [qrCode, setQRCode] = useState([]);
  const [eventParticipant, setEventParticipant] = useState([]);
  const [eventSumary, setEventSumary] = useState([]);
  const [participant, setParticipant] = useState([]);
  const [userGroup, setUserGroup] = useState([]);

  //QR Generater Display
  const qrCodDisplay = async () => {
    try {
      const response = await fetch(
        "https://admin.gmcables.com/api/codes/qr_codes"
      );
      const qrtItem = await response.json();
      setQRCode(qrtItem?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };

  // Fetch all Events
  const eventDisplay = async () => {
    try {
      const response = await fetch(
        "https://admin.gmcables.com/api/event/getAll"
      );
      const eventItem = await response.json();
      setEvent(eventItem?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };

  // Fetch all Participants
  const disPlayUsers = async () => {
    try {
      const response = await fetch(
        "https://admin.gmcables.com/api/users/users"
      );
      const participantItem = await response.json();
      setParticipant(participantItem?.data);
    } catch (error) {
      console.log("Error fetching participants", error);
    }
  };

  // Decrypt token and extract userId
  const getTokenAndSetUserId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode.decode(token);
        console.log("decodedToken", decodedToken);
        if (decodedToken?.userId) {
          setUserId(decodedToken.userId); // Set the userId in state
        }
        if (decodedToken?.roleId) {
          setRoleId(decodedToken.roleId); // Set the roleId in state
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  };
  // Fetch all EventsParcipant Report
  const eventParticipantDisplay = async () => {
    try {
      const response = await fetch(
        "https://admin.gmcables.com/api/email/getReport"
      );
      const getReport = await response.json();
      setEventParticipant(getReport?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };
  // Fetch all EventsParcipant Summary
  const eventParticipantSummary = async () => {
    try {
      const response = await fetch(
        "https://admin.gmcables.com/api/email/geteventSumary"
      );
      const eventSumary = await response.json();

      setEventSumary(eventSumary?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };

  //QR Generater Display
  const userGroupDisplay = async () => {
    try {
      const response = await fetch(
        "https://admin.gmcables.com/api/users/user_group"
      );
      const user_group = await response.json();
      setUserGroup(user_group?.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };

  useEffect(() => {
    // getTokenAndSetUserId();
    qrCodDisplay();
    eventDisplay(); // Fetch events
    disPlayUsers(); // Fetch participants
    eventParticipantDisplay();
    eventParticipantSummary();
    userGroupDisplay();
  }, []);

  return (
    <AppContext.Provider
      value={{
        roleId,
        userId,
        qrCode,
        qrCodDisplay,
        event,
        eventDisplay,
        participant,
        disPlayUsers,
        getTokenAndSetUserId,
        eventParticipant,
        eventParticipantDisplay,
        eventSumary,
        eventParticipantSummary,
        userGroup,
        userGroupDisplay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
