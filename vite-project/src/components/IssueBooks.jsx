
import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  CalendarDays,
  Search,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import "./IssueBooks.css";

const BOOKS_API = "http://localhost:5000/api/books";
const MEMBERS_API = "http://localhost:5000/api/members";
const BORROWINGS_API = "http://localhost:5000/api/borrowings";

const getTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function IssueBooks() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [records, setRecords] = useState([]);

  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableBooks = books.filter(
    (book) => Number(book.availableCopies) > 0
  );

  const activeMembers = members.filter(
    (member) => member.status === "Active"
  );

  const selectedBook = books.find((book) => book._id === bookId);
  const selectedMember = members.find(
    (member) => member._id === memberId
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [booksResponse, membersResponse, recordsResponse] =
        await Promise.all([
          fetch(BOOKS_API),
          fetch(MEMBERS_API),
          fetch(BORROWINGS_API),
        ]);

      const [booksData, membersData, recordsData] = await Promise.all([
        booksResponse.json(),
        membersResponse.json(),
        recordsResponse.json(),
      ]);

      if (!booksResponse.ok || !booksData.success) {
        throw new Error(booksData.message || "Could not load books");
      }

      if (!membersResponse.ok || !membersData.success) {
        throw new Error(membersData.message || "Could not load members");
      }

      if (!recordsResponse.ok || !recordsData.success) {
        throw new Error(
          recordsData.message || "Could not load borrowing records"
        );
      }

      setBooks(booksData.books || []);
      setMembers(membersData.members || []);
      setRecords(recordsData.records || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the library server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!bookId || !memberId || !dueDate) {
      setError("Please select a book, member and due date.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${BORROWINGS_API}/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          memberId,
          dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to issue book");
      }

      setSuccess("Book issued successfully!");
      setBookId("");
      setMemberId("");
      setDueDate("");

      await fetchData();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRecords = records.filter(
    (record) => record.status === "Issued"
  );

  const filteredRecords = activeRecords.filter((record) => {
    const query = search.toLowerCase();

    return (
      record.book?.title?.toLowerCase().includes(query) ||
      record.member?.name?.toLowerCase().includes(query) ||
      record.member?.memberId?.toLowerCase().includes(query)
    );
  });

  const overdueCount = activeRecords.filter(
    (record) => record.isOverdue
  ).length;

  return (
    <section className="issue-management">
      <div className="issue-header">
        <div>
          <span className="issue-eyebrow">CIRCULATION MANAGEMENT</span>
          <h2>Issue Books</h2>
          <p>Record book loans and keep track of active borrowings.</p>
        </div>

        <button
          type="button"
          className="issue-refresh-btn"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </div>

      {error && <div className="issue-alert error">{error}</div>}
      {success && <div className="issue-alert success">{success}</div>}

      <div className="issue-stats">
        <div className="issue-stat-card">
          <div className="issue-stat-icon">
            <BookOpen size={20} />
          </div>
          <div>
            <span>Available titles</span>
            <strong>{loading ? "—" : availableBooks.length}</strong>
          </div>
        </div>

        <div className="issue-stat-card">
          <div className="issue-stat-icon">
            <Users size={20} />
          </div>
          <div>
            <span>Active members</span>
            <strong>{loading ? "—" : activeMembers.length}</strong>
          </div>
        </div>

        <div className="issue-stat-card">
          <div className="issue-stat-icon">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <span>Currently issued</span>
            <strong>{loading ? "—" : activeRecords.length}</strong>
          </div>
        </div>

        <div className="issue-stat-card">
          <div className="issue-stat-icon overdue-icon">
            <CalendarDays size={20} />
          </div>
          <div>
            <span>Overdue</span>
            <strong>{loading ? "—" : overdueCount}</strong>
          </div>
        </div>
      </div>

      <div className="issue-content-grid">
        <div className="issue-form-card">
          <div className="issue-card-heading">
            <span className="issue-eyebrow">NEW TRANSACTION</span>
            <h3>Issue a book</h3>
            <p>Choose a registered member and an available book.</p>
          </div>

          {loading ? (
            <div className="issue-loading">Loading library data...</div>
          ) : (
            <form onSubmit={handleIssue} className="issue-form">
              <div className="issue-field">
                <label htmlFor="issue-book">Select book</label>

                <select
                  id="issue-book"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  required
                >
                  <option value="">Choose a book</option>

                  {availableBooks.map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title} — {book.author} ({book.availableCopies}{" "}
                      available)
                    </option>
                  ))}
                </select>

                {selectedBook && (
                  <span className="issue-field-hint">
                    {selectedBook.availableCopies} of{" "}
                    {selectedBook.totalCopies} copies currently available
                  </span>
                )}

                {!availableBooks.length && (
                  <span className="issue-field-hint">
                    No books currently have available copies.
                  </span>
                )}
              </div>

              <div className="issue-field">
                <label htmlFor="issue-member">Select member</label>

                <select
                  id="issue-member"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                >
                  <option value="">Choose a member</option>

                  {activeMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} — {member.memberId}
                    </option>
                  ))}
                </select>

                {selectedMember && (
                  <span className="issue-field-hint">
                    {selectedMember.email}
                  </span>
                )}

                {!activeMembers.length && (
                  <span className="issue-field-hint">
                    No active members are registered.
                  </span>
                )}
              </div>

              <div className="issue-field">
                <label htmlFor="issue-due-date">Due date</label>

                <div className="issue-date-input">
                  <CalendarDays size={17} />
                  <input
                    id="issue-due-date"
                    type="date"
                    min={getTomorrow()}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <span className="issue-field-hint">
                  Select the date by which the book must be returned.
                </span>
              </div>

              <div className="issue-selection-summary">
                <span>ISSUE SUMMARY</span>

                <div>
                  <small>Book</small>
                  <strong>{selectedBook?.title || "Not selected"}</strong>
                </div>

                <div>
                  <small>Member</small>
                  <strong>{selectedMember?.name || "Not selected"}</strong>
                </div>

                <div>
                  <small>Return by</small>
                  <strong>{dueDate ? formatDate(dueDate) : "Not selected"}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="issue-submit-btn"
                disabled={
                  submitting ||
                  loading ||
                  !availableBooks.length ||
                  !activeMembers.length
                }
              >
                {submitting ? "Processing..." : "Confirm book issue"}
                {!submitting && <ArrowUpRight size={17} />}
              </button>
            </form>
          )}
        </div>

        <div className="issue-side-card">
          <div className="issue-side-icon">
            <BookOpen size={25} />
          </div>

          <span className="issue-eyebrow">LIBRARY GUIDELINES</span>
          <h3>Keep every loan accounted for.</h3>

          <p>
            Each issue creates a borrowing record linked to the actual book
            and registered member.
          </p>

          <div className="issue-guideline">
            <span>01</span>
            <p>Only active registered members can borrow books.</p>
          </div>

          <div className="issue-guideline">
            <span>02</span>
            <p>A book cannot be issued when no copies are available.</p>
          </div>

          <div className="issue-guideline">
            <span>03</span>
            <p>Overdue status is calculated from the saved due date.</p>
          </div>
        </div>
      </div>

      <div className="issued-records-card">
        <div className="issued-records-header">
          <div>
            <span className="issue-eyebrow">LIVE BORROWING DATA</span>
            <h3>Currently issued books</h3>
          </div>

          <div className="issue-record-count">
            {activeRecords.length} active loans
          </div>
        </div>

        <div className="issued-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search by book, member or member ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="issue-empty">Loading borrowing records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="issue-empty">
            <BookOpen size={34} />
            <h4>No active issues found</h4>
            <p>
              {search
                ? "Try another search term."
                : "Issued books will appear here."}
            </p>
          </div>
        ) : (
          <div className="issued-table-scroll">
            <table className="issued-table">
              <thead>
                <tr>
                  <th>BOOK</th>
                  <th>MEMBER</th>
                  <th>ISSUED ON</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <strong>{record.book?.title || "Book unavailable"}</strong>
                      <span>{record.book?.author || "—"}</span>
                    </td>

                    <td>
                      <strong>{record.member?.name || "Member unavailable"}</strong>
                      <span>{record.member?.memberId || "—"}</span>
                    </td>

                    <td>{formatDate(record.issuedAt)}</td>
                    <td>{formatDate(record.dueDate)}</td>

                    <td>
                      <span
                        className={`issue-status ${
                          record.isOverdue ? "overdue" : "issued"
                        }`}
                      >
                        {record.isOverdue ? "Overdue" : "Issued"}
                      </span>
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

export default IssueBooks;