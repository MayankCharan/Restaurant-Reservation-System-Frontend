import { useState } from "react";
import api from "../../services/api";
import { TIME_SLOTS, getTodayString } from "../../utils/constants";

export default function CreateReservation({ onSuccess }) {
  const [form, setForm] = useState({
    date: "",
    timeSlot: "",
    numberOfGuests: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        date: form.date,
        timeSlot: form.timeSlot,
        numberOfGuests: parseInt(form.numberOfGuests, 10),
        notes: form.notes.trim(),
      };

      const res = await api.post("/reservations", payload);
      const reservation = res.data.data;

      setSuccess(
        `Reservation confirmed! Table #${reservation.table.tableNumber} on ${new Date(
          reservation.date,
        ).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })} at ${reservation.timeSlot} for ${reservation.numberOfGuests} guest(s).`,
      );

      setForm({ date: "", timeSlot: "", numberOfGuests: "", notes: "" });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to create reservation. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const today = getTodayString();

  return (
    <div className="card card--form">
      <h2 className="auth-page__form-title">Make a Reservation</h2>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date" className="label">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            min={today}
            value={form.date}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="timeSlot" className="label">
            Time Slot
          </label>
          <select
            id="timeSlot"
            name="timeSlot"
            required
            value={form.timeSlot}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select a time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="numberOfGuests" className="label">
            Number of Guests
          </label>
          <input
            id="numberOfGuests"
            name="numberOfGuests"
            type="number"
            required
            min="1"
            max="20"
            value={form.numberOfGuests}
            onChange={handleChange}
            className="input-field"
            placeholder="1 - 20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="label">
            Notes <span className="label-hint">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            maxLength="200"
            value={form.notes}
            onChange={handleChange}
            className="input-field input-no-resize"
            placeholder="Special requests, allergies, etc."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block btn-py-lg"
        >
          {loading ? "Checking availability..." : "Reserve Table"}
        </button>
      </form>
    </div>
  );
}
