import { useState, useEffect } from "react";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

export default function ManageTables({ onRefresh }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: "" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    tableNumber: "",
    capacity: "",
    isActive: true,
  });
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tables");
      setTables(res.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tables.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    try {
      await api.post("/tables", {
        tableNumber: parseInt(newTable.tableNumber, 10),
        capacity: parseInt(newTable.capacity, 10),
      });
      setNewTable({ tableNumber: "", capacity: "" });
      setShowAddForm(false);
      fetchTables();
      if (onRefresh) onRefresh();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add table.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id, tableNumber) => {
    if (
      !window.confirm(
        `Delete Table #${tableNumber}? This cannot be undone if there are no active reservations.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/tables/${id}`);
      fetchTables();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete table.");
    }
  };

  const handleToggleActive = async (table) => {
    try {
      const res = await api.patch(`/tables/${table._id}`, {
        isActive: !table.isActive,
      });

      setSuccess(res.data.message || "Table updated.");
      setTimeout(() => setSuccess(""), 4000);

      fetchTables();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update table.");
    }
  };

  const startEdit = (table) => {
    setEditingId(table._id);
    setEditForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      isActive: table.isActive,
    });
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    try {
      const res = await api.patch(`/tables/${editingId}`, {
        tableNumber: parseInt(editForm.tableNumber, 10),
        capacity: parseInt(editForm.capacity, 10),
        isActive: editForm.isActive,
      });

      setSuccess(res.data.message || "Table updated.");
      setTimeout(() => setSuccess(""), 4000);

      setEditingId(null);
      fetchTables();
      if (onRefresh) onRefresh();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update table.");
    }
  };

  if (loading) return <LoadingSpinner text="Loading tables..." />;

  return (
    <div style={{ width: "100%" }}>
      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <div className="mb-4" style={{ width: "100%", textAlign: "center" }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary btn-sm"
        >
          {showAddForm ? "Hide Form" : "+ Add New Table"}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-6">
          <h3 className="auth-page__form-title" style={{ textAlign: "center" }}>
            Add New Table
          </h3>

          {addError && <div className="alert alert--error">{addError}</div>}

          <form
            onSubmit={handleAddSubmit}
            className="filter-bar"
            style={{ marginBottom: 0, justifyContent: "center" }}
          >
            <div className="form-group">
              <label className="label">Table Number</label>
              <input
                type="number"
                min="1"
                required
                value={newTable.tableNumber}
                onChange={(e) =>
                  setNewTable({ ...newTable, tableNumber: e.target.value })
                }
                className="input-field input-field--sm"
                placeholder="#"
              />
            </div>
            <div className="form-group">
              <label className="label">Capacity</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={newTable.capacity}
                onChange={(e) =>
                  setNewTable({ ...newTable, capacity: e.target.value })
                }
                className="input-field input-field--sm"
                placeholder="Seats"
              />
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="btn btn-success btn-sm"
            >
              {addLoading ? "Adding..." : "Add Table"}
            </button>
          </form>
        </div>
      )}

      {tables.length === 0 ? (
        <div className="card empty-state">
          <p className="empty-state__text">No tables configured.</p>
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map((table) => (
            <div
              key={table._id}
              className={`card table-card ${
                !table.isActive ? "table-card--inactive" : ""
              }`}
            >
              {!table.isActive && (
                <span className="badge badge--inactive table-card__badge">
                  Inactive
                </span>
              )}

              {editingId === table._id ? (
                <form onSubmit={handleEditSubmit} className="inline-edit">
                  {editError && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-danger-700)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {editError}
                    </p>
                  )}
                  <div className="form-group">
                    <label className="label">Table #</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.tableNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          tableNumber: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={editForm.capacity}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          capacity: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div className="inline-edit__checkbox-row">
                    <input
                      type="checkbox"
                      id={`active-${table._id}`}
                      checked={editForm.isActive}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor={`active-${table._id}`}>Active</label>
                  </div>
                  <div className="inline-edit__actions">
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="table-card__number">#{table.tableNumber}</p>
                  <p className="table-card__capacity">
                    {table.capacity} seat{table.capacity > 1 ? "s" : ""}
                  </p>

                  <div className="table-card__actions">
                    <button
                      onClick={() => startEdit(table)}
                      className="action-link action-link--edit"
                    >
                      Edit
                    </button>
                    <span className="separator">|</span>
                    <button
                      onClick={() => handleToggleActive(table)}
                      className={`action-link ${
                        table.isActive
                          ? "action-link--toggle-on"
                          : "action-link--toggle-off"
                      }`}
                    >
                      {table.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <span className="separator">|</span>
                    <button
                      onClick={() => handleDelete(table._id, table.tableNumber)}
                      className="action-link action-link--delete"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
