import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
} from "lucide-react";
import "./MemberManagement.css";

const API_URL =
  "https://roshni-library-management-xh7y.vercel.app/api/members";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  memberId: "",
  membershipType: "Student",
  status: "Active",
};

function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // GET MEMBERS
  // =========================
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("GET MEMBERS:", API_URL);

      const response = await fetch(API_URL);
      const data = await response.json();

      console.log("MEMBERS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch members");
      }

      setMembers(data.members || []);
    } catch (err) {
      console.error("FETCH MEMBERS ERROR:", err);
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD MODAL
  // =========================
  const openAddModal = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (member) => {
    setEditingMember(member);

    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      memberId: member.memberId || "",
      membershipType: member.membershipType || "Student",
      status: member.status || "Active",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMember(null);
    setForm(emptyForm);
    setError("");
  };

  // =========================
  // ADD / UPDATE MEMBER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        memberId: form.memberId.trim(),
        membershipType: form.membershipType,
        status: form.status,
      };

      console.log("MEMBER PAYLOAD:", payload);

      const url = editingMember
        ? `${API_URL}/${editingMember._id}`
        : API_URL;

      const method = editingMember ? "PUT" : "POST";

      console.log("MEMBER REQUEST:", method, url);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("MEMBER RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save member"
        );
      }

      await fetchMembers();

      closeModal();
    } catch (err) {
      console.error("SAVE MEMBER ERROR:", err);

      setError(
        err.message || "Failed to save member"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE MEMBER
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const url = `${API_URL}/${id}`;

      console.log("DELETE MEMBER:", url);

      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      console.log("DELETE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete member"
        );
      }

      await fetchMembers();
    } catch (err) {
      console.error("DELETE MEMBER ERROR:", err);

      setError(
        err.message || "Failed to delete member"
      );
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredMembers = members.filter((member) => {
    const query = search.toLowerCase().trim();

    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.memberId?.toLowerCase().includes(query) ||
      member.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="member-management">

      {/* =========================
          HEADER
      ========================= */}
      <div className="member-header">
        <div>
          <span className="section-label">
            MEMBER DIRECTORY
          </span>

          <h2>Members</h2>

          <p>
            Manage registered library members and
            their membership details.
          </p>
        </div>

        <button
          className="add-member-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && !showModal && (
        <div className="member-error">
          {error}
        </div>
      )}

      {/* =========================
          TOOLBAR
      ========================= */}
      <div className="member-toolbar">

        <div className="member-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="member-count">
          <Users size={17} />
          <span>
            {members.length} members
          </span>
        </div>

      </div>

      {/* =========================
          TABLE
      ========================= */}
      <div className="member-table-wrapper">

        {loading ? (
          <div className="member-empty">
            <p>Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="member-empty">
            <Users size={42} />

            <h3>No members found</h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first library member."}
            </p>
          </div>
        ) : (
          <table className="member-table">

            <thead>
              <tr>
                <th>MEMBER</th>
                <th>MEMBER ID</th>
                <th>CONTACT</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member._id}>

                  {/* MEMBER */}
                  <td>
                    <div className="member-name-cell">

                      <div className="member-avatar">
                        {member.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {member.name}
                        </strong>

                        <span>
                          {member.email}
                        </span>
                      </div>

                    </div>
                  </td>

                  {/* MEMBER ID */}
                  <td>
                    <span className="member-id">
                      {member.memberId}
                    </span>
                  </td>

                  {/* CONTACT */}
                  <td>
                    {member.phone}
                  </td>

                  {/* TYPE */}
                  <td>
                    <span className="type-badge">
                      {member.membershipType}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`status-badge ${member.status === "Active"
                          ? "active"
                          : "inactive"
                        }`}
                    >
                      {member.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className="member-actions">

                      <button
                        className="icon-btn edit"
                        onClick={() =>
                          openEditModal(member)
                        }
                        title="Edit member"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-btn delete"
                        onClick={() =>
                          handleDelete(member._id)
                        }
                        title="Delete member"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* =========================
          MODAL
      ========================= */}
      {showModal && (
        <div className="member-modal-overlay">

          <div className="member-modal">

            {/* MODAL HEADER */}
            <div className="member-modal-header">

              <div>
                <span className="section-label">
                  {editingMember
                    ? "UPDATE MEMBER"
                    : "NEW MEMBER"}
                </span>

                <h3>
                  {editingMember
                    ? "Edit Member"
                    : "Add New Member"}
                </h3>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL ERROR */}
            {error && (
              <div className="member-error modal-error">
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* NAME */}
                <div className="form-group full">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter member name"
                    required
                  />

                </div>

                {/* EMAIL */}
                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="member@email.com"
                    required
                  />

                </div>

                {/* PHONE */}
                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="03XXXXXXXXX"
                    required
                  />

                </div>

                {/* MEMBER ID */}
                <div className="form-group">

                  <label>
                    Member ID
                  </label>

                  <input
                    type="text"
                    name="memberId"
                    value={form.memberId}
                    onChange={handleChange}
                    placeholder="ROS-002"
                    required
                  />

                </div>

                {/* MEMBERSHIP TYPE */}
                <div className="form-group">

                  <label>
                    Membership Type
                  </label>

                  <select
                    name="membershipType"
                    value={form.membershipType}
                    onChange={handleChange}
                  >
                    <option value="Student">
                      Student
                    </option>

                    <option value="Faculty">
                      Faculty
                    </option>

                    <option value="General">
                      General
                    </option>
                  </select>

                </div>

                {/* STATUS */}
                {editingMember && (
                  <div className="form-group">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>

                  </div>
                )}

              </div>

              {/* FOOTER */}
              <div className="member-modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-member-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingMember
                      ? "Update Member"
                      : "Add Member"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default MemberManagement;