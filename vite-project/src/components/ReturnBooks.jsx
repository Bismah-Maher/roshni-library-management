import React, { useEffect, useState } from "react";
import {
  RotateCcw,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import "./ReturnBooks.css";

const BORROWINGS_API =
  "https://roshni-library-management-xh7y.vercel.app/api/borrowings";

function ReturnBooks() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD BORROWING RECORDS
  // =========================
  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "GET BORROWINGS:",
        BORROWINGS_API
      );

      const response =
        await fetch(BORROWINGS_API);

      const data =
        await response.json();

      console.log(
        "BORROWINGS RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load borrowing records"
        );
      }

      setRecords(
        data.records || []
      );
    } catch (err) {
      console.error(
        "LOAD BORROWINGS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load borrowing records"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadRecords();
  }, []);

  // =========================
  // RETURN BOOK
  // =========================
  const handleReturn = async (id) => {
    try {
      setReturningId(id);
      setError("");
      setSuccess("");

      const url =
        `${BORROWINGS_API}/${id}/return`;

      console.log(
        "RETURN BOOK:",
        url
      );

      const response =
        await fetch(url, {
          method: "POST",
        });

      const data =
        await response.json();

      console.log(
        "RETURN RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to return book"
        );
      }

      setSuccess(
        "Book returned successfully."
      );

      await loadRecords();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "RETURN BOOK ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to return book"
      );
    } finally {
      setReturningId(null);
    }
  };

  // =========================
  // ACTIVE RECORDS
  // =========================
  const activeRecords =
    records.filter(
      (record) =>
        record.status === "Issued"
    );

  // =========================
  // OVERDUE RECORDS
  // =========================
  const overdueRecords =
    activeRecords.filter(
      (record) =>
        record.isOverdue
    );

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredRecords =
    activeRecords.filter(
      (record) => {
        const bookTitle =
          record.book?.title || "";

        const memberName =
          record.member?.name || "";

        const memberId =
          record.member?.memberId || "";

        const searchText =
          `${bookTitle} ${memberName} ${memberId}`
            .toLowerCase();

        return searchText.includes(
          search.toLowerCase()
        );
      }
    );

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
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
  };

  // =========================
  // DAYS OVERDUE
  // =========================
  const getDaysOverdue = (
    dueDate
  ) => {
    const today = new Date();

    const due =
      new Date(dueDate);

    const difference =
      today.getTime() -
      due.getTime();

    const days = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    return Math.max(days, 0);
  };

  return (
    <section className="return-management">

      {/* =========================
          HEADER
      ========================= */}

      <div className="return-header">

        <div>

          <span className="return-eyebrow">
            CIRCULATION
          </span>

          <h1>
            Return Books
          </h1>

          <p>
            Manage active loans and
            process returned books.
          </p>

        </div>

        <button
          className="return-refresh-btn"
          onClick={loadRecords}
          disabled={loading}
        >
          <RotateCcw size={17} />
          Refresh
        </button>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="return-alert error">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =========================
          SUCCESS
      ========================= */}

      {success && (
        <div className="return-alert success">

          <CheckCircle size={18} />

          <span>
            {success}
          </span>

        </div>
      )}

      {/* =========================
          STATS
      ========================= */}

      <div className="return-stats">

        {/* CURRENTLY ISSUED */}

        <div className="return-stat-card">

          <div className="return-stat-icon">
            <Clock size={20} />
          </div>

          <div>

            <span>
              Currently Issued
            </span>

            <strong>
              {activeRecords.length}
            </strong>

          </div>

        </div>

        {/* OVERDUE */}

        <div className="return-stat-card overdue-stat">

          <div className="return-stat-icon">
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

        {/* READY TO RETURN */}

        <div className="return-stat-card">

          <div className="return-stat-icon">
            <CheckCircle size={20} />
          </div>

          <div>

            <span>
              Ready to Return
            </span>

            <strong>
              {activeRecords.length}
            </strong>

          </div>

        </div>

      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="return-toolbar">

        <div className="return-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by book, member or member ID..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* =========================
          TABLE CARD
      ========================= */}

      <div className="return-table-card">

        <div className="return-table-header">

          <div>

            <h2>
              Active Borrowings
            </h2>

            <p>
              Books currently issued
              to library members
            </p>

          </div>

          <span className="return-count">

            {filteredRecords.length} record
            {filteredRecords.length !== 1
              ? "s"
              : ""}

          </span>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="return-empty">

            <RotateCcw
              className="return-loading-icon"
              size={28}
            />

            <h3>
              Loading records...
            </h3>

            <p>
              Fetching live borrowing
              data.
            </p>

          </div>

        ) : filteredRecords.length ===
          0 ? (

          /* EMPTY */

          <div className="return-empty">

            <CheckCircle size={30} />

            <h3>
              No active borrowings
            </h3>

            <p>
              There are currently no
              books waiting to be returned.
            </p>

          </div>

        ) : (

          /* TABLE */

          <div className="return-table-wrapper">

            <table className="return-table">

              <thead>

                <tr>
                  <th>BOOK</th>
                  <th>MEMBER</th>
                  <th>ISSUED</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>

              </thead>

              <tbody>

                {filteredRecords.map(
                  (record) => {

                    const overdue =
                      record.isOverdue;

                    return (
                      <tr
                        key={record._id}
                      >

                        {/* BOOK */}

                        <td>

                          <div className="return-book-info">

                            <div className="return-book-icon">
                              <span>
                                R
                              </span>
                            </div>

                            <div>

                              <strong>
                                {record.book?.title ||
                                  "Unknown Book"}
                              </strong>

                              <small>
                                {record.book?.author ||
                                  "Unknown Author"}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* MEMBER */}

                        <td>

                          <div className="return-member-info">

                            <strong>
                              {record.member?.name ||
                                "Unknown Member"}
                            </strong>

                            <small>
                              {record.member?.memberId ||
                                "—"}
                            </small>

                          </div>

                        </td>

                        {/* ISSUED */}

                        <td>
                          {formatDate(
                            record.issuedAt
                          )}
                        </td>

                        {/* DUE DATE */}

                        <td>

                          <div className="return-due-date">

                            <span>
                              {formatDate(
                                record.dueDate
                              )}
                            </span>

                            {overdue && (
                              <small>

                                {
                                  getDaysOverdue(
                                    record.dueDate
                                  )
                                }{" "}
                                day
                                {getDaysOverdue(
                                  record.dueDate
                                ) !== 1
                                  ? "s"
                                  : ""}{" "}
                                overdue

                              </small>
                            )}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          {overdue ? (

                            <span className="return-status overdue">

                              <AlertCircle
                                size={14}
                              />

                              Overdue

                            </span>

                          ) : (

                            <span className="return-status issued">

                              <Clock
                                size={14}
                              />

                              Issued

                            </span>

                          )}

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            className="return-action-btn"
                            onClick={() =>
                              handleReturn(
                                record._id
                              )
                            }
                            disabled={
                              returningId ===
                              record._id
                            }
                          >

                            <RotateCcw
                              size={15}
                            />

                            {returningId ===
                            record._id
                              ? "Returning..."
                              : "Return Book"}

                          </button>

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

    </section>
  );
}

export default ReturnBooks;