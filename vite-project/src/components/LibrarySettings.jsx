import React, { useEffect, useState } from "react";
import {
  Settings,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock3,
  BookOpen,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./LibrarySettings.css";

const API_URL = "http://localhost:5000/api/settings";

const defaultSettings = {
  libraryName: "",
  email: "",
  phone: "",
  address: "",
  openingHours: "",
  borrowingPeriod: 14,
  maxBooksPerMember: 3,
};

const LibrarySettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ===============================
  // LOAD SETTINGS
  // ===============================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load settings");
      }

      setSettings({
        ...defaultSettings,
        ...data.settings,
      });
    } catch (err) {
      setError(err.message || "Failed to load library settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // ===============================
  // HANDLE INPUT
  // ===============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]:
        name === "borrowingPeriod" || name === "maxBooksPerMember"
          ? Number(value)
          : value,
    }));

    setMessage("");
    setError("");
  };

  // ===============================
  // SAVE SETTINGS
  // ===============================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSettings({
        ...defaultSettings,
        ...data.settings,
      });

      setMessage("Library settings saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save library settings");
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // LOADING SCREEN
  // ===============================

  if (loading) {
    return (
      <section className="library-settings-page">
        <div className="settings-loading">
          <Loader2 size={28} className="settings-spinner" />
          <p>Loading library settings...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="library-settings-page">
      {/* HEADER */}

      <div className="settings-header">
        <div>
          <div className="settings-eyebrow">
            <Settings size={16} />
            <span>LIBRARY CONFIGURATION</span>
          </div>

          <h1>Library Settings</h1>

          <p>
            Manage your library information and borrowing rules.
          </p>
        </div>

        <div className="settings-header-icon">
          <Building2 size={30} />
        </div>
      </div>

      {/* STATUS MESSAGE */}

      {message && (
        <div className="settings-message success">
          <CheckCircle2 size={19} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="settings-message error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {/* SETTINGS FORM */}

      <form onSubmit={handleSave}>
        {/* LIBRARY INFORMATION */}

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <Building2 size={20} />
            </div>

            <div>
              <h2>Library Information</h2>
              <p>Basic information displayed across your system.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            {/* Library Name */}

            <div className="settings-field full-width">
              <label htmlFor="libraryName">
                Library Name
              </label>

              <div className="settings-input-wrapper">
                <Building2 size={18} />

                <input
                  id="libraryName"
                  name="libraryName"
                  type="text"
                  value={settings.libraryName}
                  onChange={handleChange}
                  placeholder="Enter library name"
                  required
                />
              </div>
            </div>

            {/* Email */}

            <div className="settings-field">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="settings-input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="library@example.com"
                />
              </div>
            </div>

            {/* Phone */}

            <div className="settings-field">
              <label htmlFor="phone">
                Phone Number
              </label>

              <div className="settings-input-wrapper">
                <Phone size={18} />

                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="+92 300 0000000"
                />
              </div>
            </div>

            {/* Address */}

            <div className="settings-field full-width">
              <label htmlFor="address">
                Library Address
              </label>

              <div className="settings-input-wrapper">
                <MapPin size={18} />

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={settings.address}
                  onChange={handleChange}
                  placeholder="Enter library address"
                />
              </div>
            </div>

            {/* Opening Hours */}

            <div className="settings-field full-width">
              <label htmlFor="openingHours">
                Opening Hours
              </label>

              <div className="settings-input-wrapper">
                <Clock3 size={18} />

                <input
                  id="openingHours"
                  name="openingHours"
                  type="text"
                  value={settings.openingHours}
                  onChange={handleChange}
                  placeholder="Monday - Saturday, 9:00 AM - 8:00 PM"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BORROWING RULES */}

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <h2>Borrowing Rules</h2>
              <p>
                Control how books are borrowed by library members.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            {/* Borrowing Period */}

            <div className="settings-field">
              <label htmlFor="borrowingPeriod">
                Borrowing Period
              </label>

              <div className="settings-number-wrapper">
                <input
                  id="borrowingPeriod"
                  name="borrowingPeriod"
                  type="number"
                  min="1"
                  value={settings.borrowingPeriod}
                  onChange={handleChange}
                  required
                />

                <span>days</span>
              </div>

              <small>
                Default number of days a member can keep a book.
              </small>
            </div>

            {/* Maximum Books */}

            <div className="settings-field">
              <label htmlFor="maxBooksPerMember">
                Maximum Books Per Member
              </label>

              <div className="settings-number-wrapper">
                <input
                  id="maxBooksPerMember"
                  name="maxBooksPerMember"
                  type="number"
                  min="1"
                  value={settings.maxBooksPerMember}
                  onChange={handleChange}
                  required
                />

                <span>books</span>
              </div>

              <small>
                Maximum active books a member can borrow.
              </small>
            </div>
          </div>
        </div>

        {/* SAVE AREA */}

        <div className="settings-actions">
          <button
            type="submit"
            className="settings-save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="settings-spinner" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default LibrarySettings;