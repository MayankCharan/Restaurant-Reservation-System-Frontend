import { useState } from "react";
import AllReservations from "../components/admin/AllReservations";
import ManageTables from "../components/admin/ManageTables";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="dashboard dashboard--wide">
      <div className="mb-6">
        <h1 className="dashboard__title">Admin Panel</h1>
        <p className="dashboard__subtitle">
          Manage reservations and restaurant tables
        </p>
      </div>

      <div className="tabs">
        <button
          onClick={() => setActiveTab("reservations")}
          className={`tab ${activeTab === "reservations" ? "tab--active" : ""}`}
        >
          All Reservations
        </button>
        <button
          onClick={() => setActiveTab("tables")}
          className={`tab ${activeTab === "tables" ? "tab--active" : ""}`}
        >
          Manage Tables
        </button>
      </div>

      {activeTab === "reservations" ? (
        <AllReservations key={refreshKey} onRefresh={triggerRefresh} />
      ) : (
        <ManageTables onRefresh={triggerRefresh} />
      )}
    </div>
  );
}
