import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FolderOpen,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import "./CategoryManagement.css";

const CATEGORIES_API =
  "https://roshni-library-management-xh7y.vercel.app/api/categories";

const BOOKS_API =
  "https://roshni-library-management-xh7y.vercel.app/api/books";

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD CATEGORIES + BOOKS
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("GET CATEGORIES:", CATEGORIES_API);
      console.log("GET BOOKS:", BOOKS_API);

      const [categoriesResponse, booksResponse] =
        await Promise.all([
          fetch(CATEGORIES_API),
          fetch(BOOKS_API),
        ]);

      const categoriesData =
        await categoriesResponse.json();

      const booksData =
        await booksResponse.json();

      console.log(
        "CATEGORIES RESPONSE:",
        categoriesData
      );

      console.log(
        "BOOKS RESPONSE:",
        booksData
      );

      if (
        !categoriesResponse.ok ||
        !categoriesData.success
      ) {
        throw new Error(
          categoriesData.message ||
            "Failed to load categories"
        );
      }

      if (
        !booksResponse.ok ||
        !booksData.success
      ) {
        throw new Error(
          booksData.message ||
            "Failed to load books"
        );
      }

      setCategories(
        categoriesData.categories || []
      );

      setBooks(
        booksData.books || []
      );
    } catch (err) {
      console.error(
        "CATEGORY LOAD ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load category data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // BOOK COUNT
  // =========================
  const getBookCount = (categoryName) => {
    return books.filter(
      (book) =>
        book.category?.toLowerCase() ===
        categoryName.toLowerCase()
    ).length;
  };

  // =========================
  // OPEN ADD MODAL
  // =========================
  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setError("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (category) => {
    setEditingCategory(category);
    setName(category.name || "");
    setDescription(
      category.description || ""
    );
    setError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  // =========================
  // ADD / UPDATE CATEGORY
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(
        "Category name is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingCategory
        ? `${CATEGORIES_API}/${editingCategory._id}`
        : CATEGORIES_API;

      const method = editingCategory
        ? "PUT"
        : "POST";

      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      console.log(
        "CATEGORY REQUEST:",
        method,
        url
      );

      console.log(
        "CATEGORY PAYLOAD:",
        payload
      );

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data =
        await response.json();

      console.log(
        "CATEGORY RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to save category"
        );
      }

      setSuccess(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully."
      );

      closeModal();

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "CATEGORY SAVE ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE CATEGORY
  // =========================
  const handleDelete = async (category) => {
    const bookCount =
      getBookCount(category.name);

    if (bookCount > 0) {
      setError(
        `Cannot delete "${category.name}" because ${bookCount} book${
          bookCount !== 1
            ? "s are"
            : " is"
        } using this category.`
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete the "${category.name}" category?`
      );

    if (!confirmed) return;

    try {
      setDeletingId(
        category._id
      );

      setError("");
      setSuccess("");

      const url =
        `${CATEGORIES_API}/${category._id}`;

      console.log(
        "DELETE CATEGORY:",
        url
      );

      const response =
        await fetch(url, {
          method: "DELETE",
        });

      const data =
        await response.json();

      console.log(
        "DELETE CATEGORY RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete category"
        );
      }

      setSuccess(
        "Category deleted successfully."
      );

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "CATEGORY DELETE ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to delete category"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredCategories =
    categories.filter((category) => {
      const searchText =
        `${category.name} ${
          category.description || ""
        }`.toLowerCase();

      return searchText.includes(
        search.toLowerCase()
      );
    });

  const totalBooks =
    books.length;

  const usedCategories =
    categories.filter(
      (category) =>
        getBookCount(category.name) > 0
    ).length;

  return (
    <section className="category-management">

      {/* HEADER */}
      <div className="category-header">
        <div>
          <span className="category-eyebrow">
            LIBRARY ORGANIZATION
          </span>

          <h1>Categories</h1>

          <p>
            Organize your library collection
            with clear and manageable
            categories.
          </p>
        </div>

        <button
          className="category-add-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="category-alert error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            onClick={() =>
              setError("")
            }
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="category-alert success">
          <FolderOpen size={18} />

          <span>{success}</span>
        </div>
      )}

      {/* STATS */}
      <div className="category-stats">

        <div className="category-stat-card">
          <div className="category-stat-icon">
            <FolderOpen size={21} />
          </div>

          <div>
            <span>
              Total Categories
            </span>

            <strong>
              {categories.length}
            </strong>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="category-stat-icon">
            <BookOpen size={21} />
          </div>

          <div>
            <span>
              Total Books
            </span>

            <strong>
              {totalBooks}
            </strong>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="category-stat-icon">
            <FolderOpen size={21} />
          </div>

          <div>
            <span>
              Used Categories
            </span>

            <strong>
              {usedCategories}
            </strong>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}
      <div className="category-toolbar">

        <div className="category-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        <span className="category-result-count">
          {filteredCategories.length} categor
          {filteredCategories.length === 1
            ? "y"
            : "ies"}
        </span>

      </div>

      {/* TABLE CARD */}
      <div className="category-table-card">

        <div className="category-table-header">

          <div>
            <h2>
              Library Categories
            </h2>

            <p>
              Categories stored in your
              MongoDB database
            </p>
          </div>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="category-empty">
            <FolderOpen size={30} />

            <h3>
              Loading categories...
            </h3>

            <p>
              Fetching live category
              data.
            </p>
          </div>

        ) : filteredCategories.length ===
          0 ? (

          /* EMPTY */
          <div className="category-empty">

            <FolderOpen size={32} />

            <h3>
              {search
                ? "No categories found"
                : "No categories yet"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Create your first library category to get started."}
            </p>

            {!search && (
              <button
                className="category-empty-btn"
                onClick={
                  openAddModal
                }
              >
                <Plus size={17} />
                Add Category
              </button>
            )}

          </div>

        ) : (

          /* TABLE */
          <div className="category-table-wrapper">

            <table className="category-table">

              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>DESCRIPTION</th>
                  <th>BOOKS</th>
                  <th>CREATED</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {filteredCategories.map(
                  (category) => {

                    const bookCount =
                      getBookCount(
                        category.name
                      );

                    return (
                      <tr
                        key={
                          category._id
                        }
                      >

                        {/* CATEGORY */}
                        <td>
                          <div className="category-name-cell">

                            <div className="category-icon">
                              <FolderOpen
                                size={18}
                              />
                            </div>

                            <strong>
                              {category.name}
                            </strong>

                          </div>
                        </td>

                        {/* DESCRIPTION */}
                        <td>
                          <span className="category-description">
                            {category.description ||
                              "No description"}
                          </span>
                        </td>

                        {/* BOOK COUNT */}
                        <td>
                          <span className="category-book-count">
                            <BookOpen
                              size={14}
                            />

                            {bookCount}
                          </span>
                        </td>

                        {/* CREATED */}
                        <td>
                          {category.createdAt
                            ? new Date(
                                category.createdAt
                              ).toLocaleDateString(
                                "en-PK",
                                {
                                  day: "2-digit",
                                  month:
                                    "short",
                                  year:
                                    "numeric",
                                }
                              )
                            : "—"}
                        </td>

                        {/* ACTIONS */}
                        <td>

                          <div className="category-actions">

                            <button
                              className="category-edit-btn"
                              onClick={() =>
                                openEditModal(
                                  category
                                )
                              }
                              title="Edit category"
                            >
                              <Pencil
                                size={15}
                              />
                            </button>

                            <button
                              className="category-delete-btn"
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                              disabled={
                                deletingId ===
                                  category._id ||
                                bookCount > 0
                              }
                              title={
                                bookCount > 0
                                  ? "Cannot delete a category being used by books"
                                  : "Delete category"
                              }
                            >
                              <Trash2
                                size={15}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="category-modal-overlay">

          <div className="category-modal">

            {/* MODAL HEADER */}
            <div className="category-modal-header">

              <div>
                <span className="category-modal-eyebrow">
                  {editingCategory
                    ? "EDIT CATEGORY"
                    : "NEW CATEGORY"}
                </span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <button
                className="category-close-btn"
                onClick={
                  closeModal
                }
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="category-form-group">

                <label htmlFor="category-name">
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  placeholder="e.g. Fiction"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  autoFocus
                />

              </div>

              <div className="category-form-group">

                <label htmlFor="category-description">
                  Description
                </label>

                <textarea
                  id="category-description"
                  placeholder="Brief description of this category..."
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows="4"
                />

              </div>

              {/* MODAL ACTIONS */}
              <div className="category-modal-actions">

                <button
                  type="button"
                  className="category-cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="category-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default CategoryManagement;