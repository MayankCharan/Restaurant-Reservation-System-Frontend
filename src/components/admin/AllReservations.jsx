import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  formatDate,
  formatTimeSlot,
  getTodayString,
  TIME_SLOTS,
} from "../../utils/constants";

export default function AllReservations({ onRefresh }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchRawData = async () => {
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/reservations", { params });
      return res.data.data;
    } catch (err) {
      throw err;
    }
  };

  const prevDataRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const newData = await fetchRawData();
        if (!newData) return;

        const dataStr = JSON.stringify(newData);

        if (prevDataRef.current !== dataStr) {
          prevDataRef.current = dataStr;
          setReservations(newData);
          setError("");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [dateFilter, statusFilter]);

  const forceRefresh = () => {
    prevDataRef.current = null;
    loadData();
    if (onRefresh) onRefresh();
  };

  const openCancelModal = (id) => {
    setCancelId(id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      await api.patch(`/reservations/${cancelId}`, {
        status: "cancelled",
        adminNote: cancelReason,
      });
      setShowCancelModal(false);
      setCancelReason("");
      forceRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed.");
    } finally {
      setCancelLoading(false);
    }
  };

  const startEdit = (reservation) => {
    setEditingId(reservation._id);
    setEditForm({
      date: reservation.date ? reservation.date.split("T")[0] : "",
      timeSlot: reservation.timeSlot,
      numberOfGuests: reservation.numberOfGuests,
      notes: reservation.notes || "",
      adminNote: "",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditError("");
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setEditError("");
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);
    try {
      await api.patch(`/reservations/${id}`, {
        date: editForm.date,
        timeSlot: editForm.timeSlot,
        numberOfGuests: parseInt(editForm.numberOfGuests, 10),
        notes: editForm.notes.trim(),
        adminNote: editForm.adminNote.trim(),
      });
      setEditingId(null);
      forceRefresh();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed.");
    } finally {
      setEditLoading(false);
    }
  };

  const clearFilters = () => {
    setDateFilter("");
    setStatusFilter("");
    prevDataRef.current = null;
  };
  const totalReservations = reservations.length;
  const confirmedCount = reservations.filter(
    (r) => r.status === "confirmed",
  ).length;
  const cancelledCount = reservations.filter(
    (r) => r.status === "cancelled",
  ).length;
  const completedCount = reservations.filter(
    (r) => r.status === "completed",
  ).length;

  return (
    <div style={{ width: "100%" }}>
      <div className="stats">
        <div className="card stat">
          <p className="stat__number stat__number--total">
            {totalReservations}
          </p>
          <p className="stat__label">Total</p>
        </div>
        <div className="card stat">
          <p className="stat__number stat__number--confirmed">
            {confirmedCount}
          </p>
          <p className="stat__label">Confirmed</p>
        </div>
        <div className="card stat">
          <p className="stat__number stat__number--cancelled">
            {cancelledCount}
          </p>
          <p className="stat__label">Cancelled</p>
        </div>
        <div className="card stat">
          <p className="stat__number stat__number--confirmed">
            {completedCount}
          </p>
          <p className="stat__label">Completed</p>
        </div>
      </div>

      <div className="card filter-bar mb-6">
        <div className="form-group">
          <label htmlFor="filterDate" className="label">
            Filter by Date
          </label>
          <input
            id="filterDate"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="filterStatus" className="label">
            Filter by Status
          </label>
          <select
            id="filterStatus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button onClick={clearFilters} className="btn btn-secondary btn-sm">
          Clear
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {loading && <LoadingSpinner text="Loading..." />}
      {!loading && reservations.length === 0 && (
        <div className="card empty-state">
          <p className="empty-state__text">No reservations found.</p>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <div className="card card--no-pad table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Date</th>
                <th>Time</th>
                <th>Table</th>
                <th>Guests</th>
                <th style={{ minWidth: "15rem" }}>Status / Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr
                  key={r._id}
                  className={r.status === "cancelled" ? "row--cancelled" : ""}
                >
                  <td>
                    <p className="cell-name">{r.user?.name || "N/A"}</p>
                    <p className="cell-sub">{r.user?.email || ""}</p>
                  </td>
                  <td>{formatDate(r.date)}</td>
                  <td>{formatTimeSlot(r.timeSlot)}</td>
                  <td>
                    {r.previousTable ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "var(--color-danger-500)",
                            fontSize: "var(--text-xs)",
                            marginRight: "4px",
                          }}
                        >
                          #{r.previousTable}
                        </span>
                        <span style={{ marginRight: "4px" }}>→</span>
                        <span>#{r.table?.tableNumber}</span>
                      </>
                    ) : (
                      <>#{r.table?.tableNumber}</>
                    )}
                    <span className="cell-hint">
                      {" "}
                      ({r.table?.capacity || "?"} seats)
                    </span>
                  </td>
                  <td>{r.numberOfGuests}</td>
                  <td>
                    <span
                      className={`badge ${r.status === "confirmed" ? "badge--confirmed" : r.status === "completed" ? "badge--completed" : "badge--cancelled"}`}
                    >
                      {r.status}
                    </span>
                    {r.adminNote && (
                      <p
                        className="cell-sub"
                        style={{ whiteSpace: "normal", fontStyle: "italic" }}
                      >
                        📝 {r.adminNote}
                      </p>
                    )}
                  </td>
                  <td>
                    {r.status === "confirmed" ? (
                      <div className="actions">
                        {editingId === r._id ? (
                          <button
                            onClick={cancelEdit}
                            className="action-link action-link--edit"
                          >
                            Cancel Edit
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              className="action-link action-link--edit"
                            >
                              Edit
                            </button>
                            <span className="separator">|</span>
                            <button
                              onClick={() => openCancelModal(r._id)}
                              className="action-link action-link--cancel"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        {r.status === "completed" && (
                          <span className="badge badge--completed">
                            Completed
                          </span>
                        )}
                        {r.status === "cancelled" && (
                          <span className="badge badge--cancelled">
                            Cancelled
                          </span>
                        )}
                        {r.status !== "confirmed" &&
                          r.status !== "cancelled" &&
                          r.status !== "completed" && (
                            <span className="cell-hint">—</span>
                          )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal__title">Update Reservation</h3>
            {editError && <div className="alert alert--error">{editError}</div>}
            <div
              className="alert alert--info"
              style={{
                background: "var(--color-primary-50)",
                borderColor: "var(--color-primary-100)",
                color: "var(--color-primary-800)",
              }}
            >
              ⚠️ Note: Changing date/time/guests may reassign you to a different
              table if your original table is no longer available.
            </div>
            <form onSubmit={(e) => handleEditSubmit(editingId)}>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  min={getTodayString()}
                  value={editForm.date}
                  onChange={handleEditChange}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="label">Time Slot</label>
                <select
                  name="timeSlot"
                  required
                  value={editForm.timeSlot}
                  onChange={handleEditChange}
                  className="input-field"
                >
                  {TIME_SLOTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Number of Guests</label>
                <input
                  name="numberOfGuests"
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={editForm.numberOfGuests}
                  onChange={handleEditChange}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="label">Customer Notes</label>
                <textarea
                  name="notes"
                  rows="2"
                  maxLength="200"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  className="input-field input-no-resize"
                  placeholder="Special requests..."
                />
              </div>
              <div
                className="form-group"
                style={{
                  padding: "var(--space-4)",
                  background: "var(--color-primary-50)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-primary-100)",
                }}
              >
                <label
                  className="label"
                  style={{ color: "var(--color-primary-800)" }}
                >
                  ⚠️ Reason for changes{" "}
                  <span className="label-hint">(Visible to customer)</span>
                </label>
                <textarea
                  name="adminNote"
                  rows="2"
                  maxLength="300"
                  value={editForm.adminNote}
                  onChange={handleEditChange}
                  className="input-field input-no-resize"
                  placeholder="E.g., Moved to accommodate a larger party."
                />
              </div>
              <div className="modal__form-actions">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn btn-primary"
                >
                  {editLoading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal__title">Cancel Reservation</h3>
            <p
              className="label"
              style={{
                marginBottom: "var(--space-4)",
                color: "var(--color-slate-500)",
                textAlign: "center",
              }}
            >
              Please provide a reason. This will be visible to the customer.
            </p>
            <div className="form-group">
              <label className="label">Reason for cancellation</label>
              <textarea
                rows="4"
                maxLength="300"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field input-no-resize"
                placeholder="E.g., Restaurant closing early..."
              />
            </div>
            <div className="modal__form-actions">
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="btn btn-danger"
              >
                {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="btn btn-secondary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
