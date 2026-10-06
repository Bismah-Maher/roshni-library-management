import React, { useEffect, useState } from "react";
import {
  Search,
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import "./BorrowingRecords.css";

const BORROWINGS_API = "https://roshni-library-management-xh7y.vercel.app/api/books";

function BorrowingRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(BORROWINGS_API);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load borrowing records");
      }

      setRecords(data.records || []);
    } catch (err) {
      setError(err.message || "Unable to load borrowing records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredRecords = records.filter((record) => {
    const bookTitle = record.book?.title || "";
    const bookAuthor = record.book?.author || "";
    const memberName = record.member?.name || "";
    const memberId = record.member?.memberId || "";

    const searchText =
      `${bookTitle} ${bookAuthor} ${memberName} ${memberId}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    let matchesFilter = true;

    if (filter === "Issued") {
      matchesFilter = record.status === "Issued" && !record.isOverdue;
    }

    if (filter === "Overdue") {
      matchesFilter = record.status === "Issued" && record.isOverdue;
    }

    if (filter === "Returned") {
      matchesFilter = record.status === "Returned";
    }

    return matchesSearch && matchesFilter;
  });

  const totalRecords = records.length;

  const issuedCount = records.filter(
    (record) => record.status === "Issued" && !record.isOverdue
  ).length;

  const overdueCount = records.filter(
    (record) => record.status === "Issued" && record.isOverdue
  ).length;

  const returnedCount = records.filter(
    (record) => record.status === "Returned"
  ).length;

  return (
    <section className="borrowing-management">
      <div className="borrowing-header">
        <div>
          <span className="borrowing-eyebrow">CIRCULATION HISTORY</span>

          <h1>Borrowing Records</h1>

          <p>
            Complete history of books issued and returned by members.
          </p>
        </div>

        <button
          className="borrowing-refresh-btn"
          onClick={loadRecords}
          disabled={loading}
        >
          <RotateCcw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="borrowing-alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="borrowing-stats">
        <div className="borrowing-stat-card">
          <div className="borrowing-stat-icon">
            <History size={20} />
          </div>

          <div>
            <span>Total Records</span>
            <strong>{totalRecords}</strong>
          </div>
        </div>

        <div className="borrowing-stat-card">
          <div className="borrowing-stat-icon">
            <Clock size={20} />
          </div>

          <div>
            <span>Currently Issued</span>
            <strong>{issuedCount}</strong>
          </div>
        </div>

        <div className="borrowing-stat-card overdue">
          <div className="borrowing-stat-icon">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Overdue</span>
            <strong>{overdueCount}</strong>
          </div>
        </div>

        <div className="borrowing-stat-card">
          <div className="borrowing-stat-icon">
            <CheckCircle size={20} />
          </div>

          <div>
            <span>Returned</span>
            <strong>{returnedCount}</strong>
          </div>
        </div>
      </div>

      <div className="borrowing-toolbar">
        <div className="borrowing-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search book, member or member ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="borrowing-filters">
          {["All", "Issued", "Overdue", "Returned"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="borrowing-table-card">
        <div className="borrowing-table-header">
          <div>
            <h2>All Borrowing Activity</h2>
            <p>Live records retrieved from your library database.</p>
          </div>

          <span className="borrowing-count">
            {filteredRecords.length} record
            {filteredRecords.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="borrowing-empty">
            <RotateCcw className="borrowing-loading" size={28} />
            <h3>Loading records...</h3>
            <p>Fetching live borrowing history.</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="borrowing-empty">
            <History size={30} />
            <h3>No records found</h3>
            <p>There are no borrowing records matching your search.</p>
          </div>
        ) : (
          <div className="borrowing-table-wrapper">
            <table className="borrowing-table">
              <thead>
                <tr>
                  <th>BOOK</th>
                  <th>MEMBER</th>
                  <th>ISSUED</th>
                  <th>DUE DATE</th>
                  <th>RETURNED</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div className="borrowing-book">
                        <div className="borrowing-book-icon">R</div>

                        <div>
                          <strong>
                            {record.book?.title || "Unknown Book"}
                          </strong>

                          <small>
                            {record.book?.author || "Unknown Author"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="borrowing-member">
                        <strong>
                          {record.member?.name || "Unknown Member"}
                        </strong>

                        <small>
                          {record.member?.memberId || "—"}
                        </small>
                      </div>
                    </td>

                    <td>{formatDate(record.issuedAt)}</td>

                    <td>{formatDate(record.dueDate)}</td>

                    <td>{formatDate(record.returnedAt)}</td>

                    <td>
                      {record.status === "Returned" ? (
                        <span className="borrowing-status returned">
                          <CheckCircle size={14} />
                          Returned
                        </span>
                      ) : record.isOverdue ? (
                        <span className="borrowing-status overdue">
                          <AlertCircle size={14} />
                          Overdue
                        </span>
                      ) : (
                        <span className="borrowing-status issued">
                          <Clock size={14} />
                          Issued
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default BorrowingRecords;