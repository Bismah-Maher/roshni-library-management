import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ArrowRightLeft,
  AlertCircle,
  FolderOpen,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import "./LibraryDashboard.css";

const BOOKS_API =
  "https://roshni-library-management-xh7y.vercel.app/api/books";

const MEMBERS_API =
  "https://roshni-library-management-xh7y.vercel.app/api/members";

const BORROWINGS_API =
  "https://roshni-library-management-xh7y.vercel.app/api/borrowings";

const CATEGORIES_API =
  "https://roshni-library-management-xh7y.vercel.app/api/categories";

function LibraryDashboard() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOAD DASHBOARD DATA
  // =========================
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        booksResponse,
        membersResponse,
        borrowingsResponse,
        categoriesResponse,
      ] = await Promise.all([
        fetch(BOOKS_API),
        fetch(MEMBERS_API),
        fetch(BORROWINGS_API),
        fetch(CATEGORIES_API),
      ]);

      const [
        booksData,
        membersData,
        borrowingsData,
        categoriesData,
      ] = await Promise.all([
        booksResponse.json(),
        membersResponse.json(),
        borrowingsResponse.json(),
        categoriesResponse.json(),
      ]);

      console.log("BOOKS:", booksData);
      console.log("MEMBERS:", membersData);
      console.log("BORROWINGS:", borrowingsData);
      console.log("CATEGORIES:", categoriesData);

      // BOOKS
      if (!booksResponse.ok || !booksData.success) {
        throw new Error(
          booksData.message || "Failed to load books"
        );
      }

      // MEMBERS
      if (!membersResponse.ok || !membersData.success) {
        throw new Error(
          membersData.message || "Failed to load members"
        );
      }

      // BORROWINGS
      if (
        !borrowingsResponse.ok ||
        !borrowingsData.success
      ) {
        throw new Error(
          borrowingsData.message ||
            "Failed to load borrowings"
        );
      }

      // CATEGORIES
      if (
        !categoriesResponse.ok ||
        !categoriesData.success
      ) {
        throw new Error(
          categoriesData.message ||
            "Failed to load categories"
        );
      }

      setBooks(booksData.books || []);
      setMembers(membersData.members || []);
      setBorrowings(
        borrowingsData.records || []
      );
      setCategories(
        categoriesData.categories || []
      );
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ON START
  // =========================
  useEffect(() => {
    loadDashboard();

    const interval = setInterval(
      loadDashboard,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  // =========================
  // BOOK CALCULATIONS
  // =========================
  const totalTitles = books.length;

  const totalCopies = books.reduce(
    (total, book) =>
      total +
      Number(book.totalCopies || 0),
    0
  );

  const availableCopies = books.reduce(
    (total, book) =>
      total +
      Number(book.availableCopies || 0),
    0
  );

  const issuedCopies =
    totalCopies - availableCopies;

  // =========================
  // BORROWING CALCULATIONS
  // =========================
  const activeBorrowings =
    borrowings.filter(
      (record) =>
        record.status === "Issued"
    );

  const overdueBorrowings =
    activeBorrowings.filter(
      (record) =>
        record.isOverdue
    );

  const returnedBorrowings =
    borrowings.filter(
      (record) =>
        record.status === "Returned"
    );

  // =========================
  // MEMBER CALCULATIONS
  // =========================
  const activeMembers =
    members.filter(
      (member) =>
        member.status === "Active"
    );

  // =========================
  // UNAVAILABLE BOOKS
  // =========================
  const unavailableBooks =
    books.filter(
      (book) =>
        Number(book.availableCopies) === 0
    );

  // =========================
  // RELATIVE DATE
  // =========================
  const getRelativeDate = (date) => {
    if (!date) return "";

    const target = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() -
      target.getTime();

    const minutes = Math.floor(
      difference /
        (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days !== 1 ? "s" : ""
      } ago`;
    }

    return target.toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // RECENT ACTIVITY
  // =========================
  const recentActivity = [
    ...borrowings,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt ||
            b.issuedAt
        ).getTime() -
        new Date(
          a.createdAt ||
            a.issuedAt
        ).getTime()
    )
    .slice(0, 5);

  return (
    <section className="library-dashboard">

      {/* =========================
          HEADER
      ========================= */}
      <div className="dashboard-header">

        <div>

          <span className="dashboard-eyebrow">
            LIBRARY OVERVIEW
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            A live overview of your
            library's current activity.
          </p>

        </div>

        <button
          className="dashboard-refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="dashboard-alert">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =========================
          STAT CARDS
      ========================= */}
      <div className="dashboard-stats">

        {/* BOOKS */}
        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            <BookOpen size={21} />
          </div>

          <div>

            <span>
              Book Titles
            </span>

            <strong>
              {loading
                ? "—"
                : totalTitles}
            </strong>

            <small>
              {totalCopies} total copies
            </small>

          </div>

        </div>

        {/* MEMBERS */}
        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            <Users size={21} />
          </div>

          <div>

            <span>
              Active Members
            </span>

            <strong>
              {loading
                ? "—"
                : activeMembers.length}
            </strong>

            <small>
              {members.length} total members
            </small>

          </div>

        </div>

        {/* ISSUED */}
        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            <ArrowRightLeft size={21} />
          </div>

          <div>

            <span>
              Currently Issued
            </span>

            <strong>
              {loading
                ? "—"
                : activeBorrowings.length}
            </strong>

            <small>
              {issuedCopies} copies out
            </small>

          </div>

        </div>

        {/* OVERDUE */}
        <div className="dashboard-stat-card overdue">

          <div className="dashboard-stat-icon">
            <AlertCircle size={21} />
          </div>

          <div>

            <span>
              Overdue
            </span>

            <strong>
              {loading
                ? "—"
                : overdueBorrowings.length}
            </strong>

            <small>
              Needs attention
            </small>

          </div>

        </div>

      </div>

      {/* =========================
          DASHBOARD GRID
      ========================= */}
      <div className="dashboard-grid">

        {/* =========================
            RECENT ACTIVITY
        ========================= */}
        <div className="dashboard-panel activity-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Recent Activity
              </h2>

              <p>
                Latest circulation activity
              </p>

            </div>

            <span className="dashboard-panel-count">
              {borrowings.length} records
            </span>

          </div>

          {loading ? (

            <div className="dashboard-empty">

              <RefreshCw
                size={27}
                className="dashboard-loading"
              />

              <p>
                Loading activity...
              </p>

            </div>

          ) : recentActivity.length === 0 ? (

            <div className="dashboard-empty">

              <ArrowRightLeft size={28} />

              <h3>
                No circulation activity
              </h3>

              <p>
                Borrowing and return activity
                will appear here.
              </p>

            </div>

          ) : (

            <div className="dashboard-activity-list">

              {recentActivity.map(
                (record) => {

                  const isReturned =
                    record.status ===
                    "Returned";

                  const isOverdue =
                    record.status ===
                      "Issued" &&
                    record.isOverdue;

                  return (
                    <div
                      className="dashboard-activity-item"
                      key={record._id}
                    >

                      {/* ICON */}
                      <div
                        className={`dashboard-activity-icon ${
                          isOverdue
                            ? "overdue"
                            : isReturned
                            ? "returned"
                            : "issued"
                        }`}
                      >

                        {isOverdue ? (
                          <AlertCircle
                            size={17}
                          />
                        ) : isReturned ? (
                          <CheckCircle
                            size={17}
                          />
                        ) : (
                          <BookOpen
                            size={17}
                          />
                        )}

                      </div>

                      {/* CONTENT */}
                      <div className="dashboard-activity-content">

                        <strong>
                          {record.book?.title ||
                            "Unknown book"}
                        </strong>

                        <p>
                          {isReturned
                            ? `Returned by ${
                                record
                                  .member
                                  ?.name ||
                                "Unknown member"
                              }`
                            : `Issued to ${
                                record
                                  .member
                                  ?.name ||
                                "Unknown member"
                              }`}
                        </p>

                      </div>

                      {/* STATUS */}
                      <div className="dashboard-activity-right">

                        <span
                          className={`dashboard-activity-status ${
                            isOverdue
                              ? "overdue"
                              : isReturned
                              ? "returned"
                              : "issued"
                          }`}
                        >
                          {isOverdue
                            ? "Overdue"
                            : isReturned
                            ? "Returned"
                            : "Issued"}
                        </span>

                        <small>
                          {getRelativeDate(
                            isReturned
                              ? record.returnedAt
                              : record.issuedAt
                          )}
                        </small>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* =========================
            COLLECTION OVERVIEW
        ========================= */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Collection Overview
              </h2>

              <p>
                Current library inventory
              </p>

            </div>

          </div>

          <div className="dashboard-overview">

            {/* TOTAL COPIES */}
            <div className="dashboard-overview-row">

              <div className="dashboard-overview-label">

                <BookOpen size={17} />

                <span>
                  Total Copies
                </span>

              </div>

              <strong>
                {totalCopies}
              </strong>

            </div>

            {/* AVAILABLE */}
            <div className="dashboard-overview-row">

              <div className="dashboard-overview-label">

                <CheckCircle size={17} />

                <span>
                  Available
                </span>

              </div>

              <strong>
                {availableCopies}
              </strong>

            </div>

            {/* ISSUED */}
            <div className="dashboard-overview-row">

              <div className="dashboard-overview-label">

                <ArrowRightLeft size={17} />

                <span>
                  Issued
                </span>

              </div>

              <strong>
                {issuedCopies}
              </strong>

            </div>

            {/* CATEGORIES */}
            <div className="dashboard-overview-row">

              <div className="dashboard-overview-label">

                <FolderOpen size={17} />

                <span>
                  Categories
                </span>

              </div>

              <strong>
                {categories.length}
              </strong>

            </div>

            {/* RETURNED */}
            <div className="dashboard-overview-row">

              <div className="dashboard-overview-label">

                <Clock size={17} />

                <span>
                  Returned Records
                </span>

              </div>

              <strong>
                {returnedBorrowings.length}
              </strong>

            </div>

            {/* UNAVAILABLE */}
            <div className="dashboard-overview-row">

              <div className="dashboard-overview-label">

                <AlertCircle size={17} />

                <span>
                  Unavailable Titles
                </span>

              </div>

              <strong>
                {unavailableBooks.length}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default LibraryDashboard;