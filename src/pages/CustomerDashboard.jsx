import { useState } from "react";
import CreateReservation from "../components/customer/CreateReservation";
import MyReservations from "../components/customer/MyReservations";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReservationCreated = () => {
    setActiveTab("reservations");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">My Dashboard</h1>

      <div className="tabs">
        <button
          onClick={() => setActiveTab("reservations")}
          className={`tab ${activeTab === "reservations" ? "tab--active" : ""}`}
        >
          My Reservations
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`tab ${activeTab === "create" ? "tab--active" : ""}`}
        >
          New Reservation
        </button>
      </div>

      {activeTab === "reservations" ? (
        <MyReservations key={refreshKey} />
      ) : (
        <CreateReservation onSuccess={handleReservationCreated} />
      )}
    </div>
  );
}
