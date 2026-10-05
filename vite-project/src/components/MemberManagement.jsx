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

const API_URL = "http://localhost:5000/api/members";

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

  // GET MEMBERS
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch members");
      }

      setMembers(data.members || []);
    } catch (err) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // OPEN EDIT MODAL
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

  // CLOSE MODAL
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMember(null);
    setForm(emptyForm);
    setError("");
  };

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const url = editingMember
        ? `${API_URL}/${editingMember._id}`
        : API_URL;

      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      await fetchMembers();
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to save member");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete member");
      }

      await fetchMembers();
    } catch (err) {
      setError(err.message || "Failed to delete member");
    }
  };

  // SEARCH
  const filteredMembers = members.filter((member) => {
    const query = search.toLowerCase();

    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.memberId?.toLowerCase().includes(query) ||
      member.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="member-management">
      <div className="member-header">
        <div>
          <span className="section-label">MEMBER DIRECTORY</span>

          <h2>Members</h2>

          <p>
            Manage registered library members and their membership details.
          </p>
        </div>

        <button className="add-member-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {error && !showModal && (
        <div className="member-error">
          {error}
        </div>
      )}

      <div className="member-toolbar">
        <div className="member-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="member-count">
          <Users size={17} />
          <span>{members.length} members</span>
        </div>
      </div>

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
                  <td>
                    <div className="member-name-cell">
                      <div className="member-avatar">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>{member.name}</strong>
                        <span>{member.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="member-id">
                      {member.memberId}
                    </span>
                  </td>

                  <td>{member.phone}</td>

                  <td>
                    <span className="type-badge">
                      {member.membershipType}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        member.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>

                  <td>
                    <div className="member-actions">
                      <button
                        className="icon-btn edit"
                        onClick={() => openEditModal(member)}
                        title="Edit member"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(member._id)}
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

      {showModal && (
        <div className="member-modal-overlay">
          <div className="member-modal">
            <div className="member-modal-header">
              <div>
                <span className="section-label">
                  {editingMember ? "UPDATE MEMBER" : "NEW MEMBER"}
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

            {error && (
              <div className="member-error modal-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter member name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="member@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="03XXXXXXXXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Member ID</label>
                  <input
                    type="text"
                    name="memberId"
                    value={form.memberId}
                    onChange={handleChange}
                    placeholder="ROS-002"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Membership Type</label>

                  <select
                    name="membershipType"
                    value={form.membershipType}
                    onChange={handleChange}
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {editingMember && (
                  <div className="form-group">
                    <label>Status</label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

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