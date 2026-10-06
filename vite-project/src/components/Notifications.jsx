import React, { useEffect, useState } from "react";
import {
  Bell,
  AlertCircle,
  Clock,
  BookOpen,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import "./Notifications.css";

const BORROWINGS_API =
  "https://roshni-library-management-xh7y.vercel.app/api/borrowings";

const BOOKS_API =
  "https://roshni-library-management-xh7y.vercel.app/api/books";

function Notifications() {
  const [records, setRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOAD NOTIFICATIONS DATA
  // =========================
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "GET BORROWINGS:",
        BORROWINGS_API
      );

      console.log(
        "GET BOOKS:",
        BOOKS_API
      );

      const [
        borrowingsResponse,
        booksResponse,
      ] = await Promise.all([
        fetch(BORROWINGS_API),
        fetch(BOOKS_API),
      ]);

      const borrowingsData =
        await borrowingsResponse.json();

      const booksData =
        await booksResponse.json();

      console.log(
        "BORROWINGS RESPONSE:",
        borrowingsData
      );

      console.log(
        "BOOKS RESPONSE:",
        booksData
      );

      // =========================
      // CHECK BORROWINGS
      // =========================
      if (
        !borrowingsResponse.ok ||
        !borrowingsData.success
      ) {
        throw new Error(
          borrowingsData.message ||
            "Failed to load borrowing records"
        );
      }

      // =========================
      // CHECK BOOKS
      // =========================
      if (
        !booksResponse.ok ||
        !booksData.success
      ) {
        throw new Error(
          booksData.message ||
            "Failed to load books"
        );
      }

      setRecords(
        borrowingsData.records || []
      );

      setBooks(
        booksData.books || []
      );
    } catch (err) {
      console.error(
        "NOTIFICATIONS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () =>
      clearInterval(interval);
  }, []);

  // =========================
  // ACTIVE BORROWINGS
  // =========================
  const activeRecords =
    records.filter(
      (record) =>
        record.status === "Issued"
    );

  // =========================
  // OVERDUE
  // =========================
  const overdueRecords =
    activeRecords.filter(
      (record) =>
        record.isOverdue
    );

  // =========================
  // DUE SOON
  // =========================
  const dueSoonRecords =
    activeRecords.filter(
      (record) => {
        if (record.isOverdue) {
          return false;
        }

        if (!record.dueDate) {
          return false;
        }

        const today = new Date();

        const dueDate =
          new Date(
            record.dueDate
          );

        const difference =
          dueDate.getTime() -
          today.getTime();

        const daysUntilDue =
          difference /
          (1000 * 60 * 60 * 24);

        return (
          daysUntilDue >= 0 &&
          daysUntilDue <= 3
        );
      }
    );

  // =========================
  // UNAVAILABLE BOOKS
  // =========================
  const unavailableBooks =
    books.filter(
      (book) =>
        Number(
          book.availableCopies || 0
        ) === 0
    );

  // =========================
  // FORMAT DATE
  // =========================
  function formatDate(date) {
    if (!date) return "—";

    return new Date(
      date
    ).toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =========================
  // FORMAT TIME
  // =========================
  function formatTime(date) {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleTimeString(
      "en-PK",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =========================
  // BUILD NOTIFICATIONS
  // =========================
  const notifications = [];

  // OVERDUE NOTIFICATIONS
  overdueRecords.forEach(
    (record) => {
      notifications.push({
        id: `overdue-${record._id}`,
        type: "overdue",
        icon: AlertCircle,
        title: "Book overdue",

        message: `${
          record.book?.title ||
          "Unknown book"
        } is overdue and has not been returned by ${
          record.member?.name ||
          "the member"
        }.`,

        date: record.dueDate,
        priority: "High",
      });
    }
  );

  // DUE SOON NOTIFICATIONS
  dueSoonRecords.forEach(
    (record) => {
      notifications.push({
        id: `due-${record._id}`,
        type: "due",
        icon: Clock,
        title: "Book due soon",

        message: `${
          record.book?.title ||
          "Unknown book"
        } is due on ${formatDate(
          record.dueDate
        )} for ${
          record.member?.name ||
          "the member"
        }.`,

        date: record.dueDate,
        priority: "Medium",
      });
    }
  );

  // UNAVAILABLE BOOK NOTIFICATIONS
  unavailableBooks.forEach(
    (book) => {
      notifications.push({
        id: `unavailable-${book._id}`,
        type: "unavailable",
        icon: BookOpen,
        title: "Book unavailable",

        message: `"${book.title}" currently has no available copies.`,

        date:
          book.updatedAt ||
          new Date(),

        priority: "Medium",
      });
    }
  );

  // =========================
  // SORT NOTIFICATIONS
  // =========================
  notifications.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  // =========================
  // UI
  // =========================
  return (
    <section className="notifications-page">

      {/* HEADER */}
      <div className="notifications-header">

        <div>

          <span className="notifications-eyebrow">
            LIBRARY ACTIVITY
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Important updates generated
            from your library's live data.
          </p>

        </div>

        <button
          className="notifications-refresh-btn"
          onClick={
            loadNotifications
          }
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="notifications-alert">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* STATS */}
      <div className="notifications-stats">

        {/* TOTAL */}
        <div className="notification-stat-card">

          <div className="notification-stat-icon">
            <Bell size={20} />
          </div>

          <div>

            <span>
              Total Alerts
            </span>

            <strong>
              {notifications.length}
            </strong>

          </div>

        </div>

        {/* OVERDUE */}
        <div className="notification-stat-card overdue">

          <div className="notification-stat-icon">
            <AlertCircle size={20} />
          </div>

          <div>

            <span>
              Overdue
            </span>

            <strong>
              {overdueRecords.length}
            </strong>

          </div>

        </div>

        {/* DUE SOON */}
        <div className="notification-stat-card">

          <div className="notification-stat-icon">
            <Clock size={20} />
          </div>

          <div>

            <span>
              Due Soon
            </span>

            <strong>
              {dueSoonRecords.length}
            </strong>

          </div>

        </div>

        {/* UNAVAILABLE */}
        <div className="notification-stat-card">

          <div className="notification-stat-icon">
            <BookOpen size={20} />
          </div>

          <div>

            <span>
              Unavailable
            </span>

            <strong>
              {unavailableBooks.length}
            </strong>

          </div>

        </div>

      </div>

      {/* NOTIFICATIONS CARD */}
      <div className="notifications-card">

        <div className="notifications-card-header">

          <div>

            <h2>
              Live Notifications
            </h2>

            <p>
              Alerts are generated
              automatically from current
              library records.
            </p>

          </div>

          <span className="notifications-count">

            {notifications.length} alert
            {notifications.length !== 1
              ? "s"
              : ""}

          </span>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="notifications-empty">

            <RefreshCw
              size={30}
              className="notifications-loading"
            />

            <h3>
              Loading notifications...
            </h3>

            <p>
              Checking your latest
              library activity.
            </p>

          </div>

        ) : notifications.length ===
          0 ? (

          /* EMPTY */
          <div className="notifications-empty">

            <CheckCircle size={34} />

            <h3>
              Everything looks good
            </h3>

            <p>
              There are currently no
              overdue, upcoming, or
              unavailable-book alerts.
            </p>

          </div>

        ) : (

          /* LIST */
          <div className="notifications-list">

            {notifications.map(
              (notification) => {

                const Icon =
                  notification.icon;

                return (
                  <div
                    className={`notification-item ${notification.type}`}
                    key={notification.id}
                  >

                    {/* ICON */}
                    <div className="notification-icon">

                      <Icon size={19} />

                    </div>

                    {/* CONTENT */}
                    <div className="notification-content">

                      <div className="notification-title-row">

                        <h3>
                          {notification.title}
                        </h3>

                        <span
                          className={`notification-priority ${notification.priority.toLowerCase()}`}
                        >
                          {
                            notification.priority
                          }
                        </span>

                      </div>

                      <p>
                        {
                          notification.message
                        }
                      </p>

                      <div className="notification-meta">

                        <span>
                          {formatDate(
                            notification.date
                          )}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {formatTime(
                            notification.date
                          )}
                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </section>
  );
}

export default Notifications;