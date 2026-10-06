
import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  BookOpen,
  LoaderCircle,
} from "lucide-react";
import "./BookManagement.css";

const API_URL =
  "https://roshni-library-management-xh7y.vercel.app/api/books";

const emptyForm = {
  title: "",
  author: "",
  category: "",
  language: "English",
  totalCopies: 1,
};

function BookManagement() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FETCH BOOKS
  // =========================
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || `Server returned ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(data?.message || "Failed to fetch books");
      }

      setBooks(Array.isArray(data.books) ? data.books : []);
    } catch (err) {
      console.error("FETCH BOOKS ERROR:", err);
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // =========================
  // FORM CHANGE
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
    setEditingBook(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (book) => {
    setEditingBook(book);

    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      language: book.language || "English",
      totalCopies: book.totalCopies || 1,
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
    setEditingBook(null);
    setForm({ ...emptyForm });
    setError("");
  };

  // =========================
  // ADD / UPDATE BOOK
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      language: form.language,
      totalCopies: Number(form.totalCopies),
    };

    // Frontend validation
    if (!payload.title) {
      setError("Please enter the book title.");
      return;
    }

    if (!payload.author) {
      setError("Please enter the author name.");
      return;
    }

    if (!payload.category) {
      setError("Please enter the book category.");
      return;
    }

    if (!payload.language) {
      setError("Please select a language.");
      return;
    }

    if (!Number.isInteger(payload.totalCopies) || payload.totalCopies < 1) {
      setError("Total copies must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingBook);

      const url = isEditing
        ? `${API_URL}/${editingBook._id}`
        : API_URL;

      const method = isEditing ? "PUT" : "POST";

      console.log("BOOK REQUEST:", {
        method,
        url,
        payload,
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Safely read response
      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      console.log("BOOK RESPONSE:", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );
      }

      if (data.success === false) {
        throw new Error(data.message || "Unable to save book.");
      }

      await fetchBooks();

      closeModal();
    } catch (err) {
      console.error("SAVE BOOK ERROR:", err);

      setError(
        err.message ||
          "Unable to save the book. Please check your backend."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE BOOK
  // =========================
  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${book._id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Delete failed with status ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to delete book");
      }

      await fetchBooks();
    } catch (err) {
      console.error("DELETE BOOK ERROR:", err);

      setError(err.message || "Failed to delete book");
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    return (
      book.title?.toLowerCase().includes(searchText) ||
      book.author?.toLowerCase().includes(searchText) ||
      book.category?.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // UI
  // =========================
  return (
    <section className="book-management">
      <div className="book-management-header">
        <div>
          <span className="section-label">LIBRARY CATALOGUE</span>

          <h2>Book Management</h2>

          <p>
            Add, edit, search and manage the books currently held by your
            library.
          </p>
        </div>

        <button
          type="button"
          className="add-book-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Book
        </button>
      </div>

      {error && !showModal && (
        <div className="book-error">{error}</div>
      )}

      <div className="book-toolbar">
        <div className="book-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by title, author or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="book-count">
          {filteredBooks.length}{" "}
          {filteredBooks.length === 1 ? "book" : "books"}
        </div>
      </div>

      {loading ? (
        <div className="book-state">
          <LoaderCircle className="spin" size={30} />
          <p>Loading books from MongoDB...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="book-state">
          <BookOpen size={42} />

          <h3>No books found</h3>

          <p>
            {search
              ? "Try a different search."
              : "Your library catalogue is currently empty."}
          </p>
        </div>
      ) : (
        <div className="books-table-wrapper">
          <table className="books-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Category</th>
                <th>Language</th>
                <th>Total</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book._id}>
                  <td>
                    <div className="book-title-cell">
                      <div className="book-icon">
                        <BookOpen size={18} />
                      </div>

                      <div>
                        <strong>{book.title}</strong>
                        <span>
                          ID: {book._id?.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>{book.author}</td>

                  <td>
                    <span className="category-badge">
                      {book.category}
                    </span>
                  </td>

                  <td>{book.language}</td>

                  <td>{book.totalCopies}</td>

                  <td>
                    <span
                      className={
                        book.availableCopies === 0
                          ? "availability unavailable"
                          : "availability"
                      }
                    >
                      {book.availableCopies}
                    </span>
                  </td>

                  <td>
                    <div className="book-actions">
                      <button
                        type="button"
                        className="icon-btn edit"
                        onClick={() => openEditModal(book)}
                        title="Edit book"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="icon-btn delete"
                        onClick={() => handleDelete(book)}
                        title="Delete book"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="book-modal-overlay">
          <div className="book-modal">
            <div className="book-modal-header">
              <div>
                <span className="section-label">
                  {editingBook
                    ? "UPDATE CATALOGUE"
                    : "NEW CATALOGUE ENTRY"}
                </span>

                <h3>
                  {editingBook ? "Edit Book" : "Add New Book"}
                </h3>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="book-error modal-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Book Title *</label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. The Alchemist"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Author *</label>

                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="e.g. Paulo Coelho"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>

                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Fiction"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Language *</label>

                  <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Total Copies *</label>

                  <input
                    type="number"
                    name="totalCopies"
                    min="1"
                    value={form.totalCopies}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
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
                  className="save-book-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        className="spin"
                        size={17}
                      />
                      Saving...
                    </>
                  ) : editingBook ? (
                    "Update Book"
                  ) : (
                    "Add Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default BookManagement;
