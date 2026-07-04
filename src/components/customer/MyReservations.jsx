import { useState, useEffect } from "react";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  formatDay,
  formatMonthYear,
  formatTimeSlot,
  getTodayString,
  TIME_SLOTS,
} from "../../utils/constants";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get("/reservations/my");
        setReservations(res.data.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    const interval = setInterval(fetchReservations, 5000);
    return () => clearInterval(interval);
  }, []);

  const openCancelModal = (id) => {
    setCancelId(id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      await api.patch(`/reservations/my/${cancelId}/cancel`, {
        reason: cancelReason,
      });
      setShowCancelModal(false);
      setCancelReason("");
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRevert = async (id) => {
    try {
      const res = await api.patch(`/reservations/my/${id}/revert-table`);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? res.data.data : r)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to revert.");
    }
  };

  if (loading) return <LoadingSpinner text="Loading your reservations..." />;
  if (error) return <div className="alert alert--error">{error}</div>;

  if (reservations.length === 0) {
    return (
      <div className="card empty-state">
        <p className="empty-state__text">No reservations found.</p>
        <p className="empty-state__hint">
          Click &quot;New Reservation&quot; to book a table.
        </p>
      </div>
    );
  }

  return (
    <div className="reservation-list">
      {reservations.map((reservation) => {
        const isConfirmed = reservation.status === "confirmed";
        const isCompleted = reservation.status === "completed";
        const isPast =
          new Date(reservation.date) < new Date(new Date().toDateString());

        return (
          <div
            key={reservation._id}
            className={`card reservation-card ${reservation.status === "cancelled" ? "card--cancelled" : ""}`}
          >
            <div className="reservation-card__date-block">
              <span className="reservation-card__day">
                {formatDay(reservation.date)}
              </span>
              <span className="reservation-card__month-year">
                {formatMonthYear(reservation.date)}
              </span>
              <span className="reservation-card__time">
                {formatTimeSlot(reservation.timeSlot)}
              </span>
            </div>

            <div className="reservation-card__body">
              <div className="reservation-card__table">
                {reservation.previousTable ? (
                  <>
                    <span className="reservation-card__old-table">
                      #{reservation.previousTable}
                    </span>
                    <span className="reservation-card__arrow">→</span>
                    <span className="reservation-card__new-table">
                      #{reservation.table?.tableNumber}
                    </span>
                  </>
                ) : (
                  <span className="reservation-card__current-table">
                    Table #{reservation.table?.tableNumber}
                  </span>
                )}
              </div>

              <p className="reservation-card__guests">
                {reservation.numberOfGuests} guest
                {reservation.numberOfGuests > 1 ? "s" : ""} · Capacity:{" "}
                {reservation.table?.capacity || "?"}
              </p>

              {reservation.notes && (
                <div className="reservation-card__note reservation-card__note--user">
                  🗒️ {reservation.notes}
                </div>
              )}

              {reservation.adminNote && (
                <div
                  className={`reservation-card__note ${
                    reservation.adminNote.includes("moved to Table")
                      ? "reservation-card__note--relocate"
                      : reservation.adminNote.includes("Cancelled by user")
                        ? "reservation-card__note--user-cancel"
                        : "reservation-card__note--admin"
                  }`}
                >
                  {reservation.adminNote.includes("moved to Table")
                    ? "🔄"
                    : reservation.adminNote.includes("Cancelled by user")
                      ? "❌"
                      : "ℹ️"}{" "}
                  {reservation.adminNote}
                </div>
              )}

              {reservation.pendingReactivation && (
                <div className="reservation-card__note reservation-card__note--reactivation">
                  ✨ {reservation.reactivationNote}
                  <button
                    onClick={() => handleRevert(reservation._id)}
                    className="btn btn-success btn-sm"
                    style={{ marginTop: "0.5rem" }}
                  >
                    Revert to Table #{reservation.previousTable}
                  </button>
                </div>
              )}
              {!reservation.pendingReactivation &&
                reservation.reactivationNote && (
                  <div className="reservation-card__note reservation-card__note--info">
                    ℹ️ {reservation.reactivationNote}
                  </div>
                )}
            </div>

            <div className="reservation-card__actions">
              {isConfirmed && !isPast && !isCompleted && (
                <>
                  <button
                    onClick={() => openEditModal(reservation)}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openCancelModal(reservation._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Cancel
                  </button>
                </>
              )}

              {isCompleted && (
                <span className="badge badge--completed">Completed</span>
              )}

              {reservation.status === "cancelled" && !isCompleted && (
                <span className="badge badge--cancelled">Cancelled</span>
              )}
            </div>
          </div>
        );
      })}

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
              Are you sure? Let us know why to improve our service.
            </p>
            <div className="form-group">
              <label className="label">
                Reason for cancellation (optional)
              </label>
              <textarea
                rows="4"
                maxLength="300"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field input-no-resize"
                placeholder="E.g., Change of plans..."
              />
            </div>
            <div className="modal__form-actions">
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="btn btn-danger"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="btn btn-secondary"
              >
                Keep Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal__title">Update Reservation</h3>
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
            <form onSubmit={(e) => handleEditSubmit(editId)}>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  min={getTodayString()}
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="label">Time Slot</label>
                <select
                  name="timeSlot"
                  required
                  value={editForm.timeSlot}
                  onChange={(e) =>
                    setEditForm({ ...editForm, timeSlot: e.target.value })
                  }
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, numberOfGuests: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  rows="2"
                  maxLength="200"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, adminNote: e.target.value })
                  }
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
    </div>
  );
}
