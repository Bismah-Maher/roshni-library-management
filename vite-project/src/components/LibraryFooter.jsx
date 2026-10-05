import React from "react";
import {
  BookOpen,
  Users,
  BookMarked,
  Bell,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import "./LibraryFooter.css";

function LibraryFooter() {
  return (
    <footer className="library-footer">
      <div className="library-footer-container">

        <div className="library-footer-top">
          <div className="library-footer-brand">
            <div className="library-footer-logo">
              roshni<span>.</span>
            </div>

            <p>
              A smarter way to manage books, members, borrowing,
              and everything that keeps a library running.
            </p>

            <div className="library-footer-status">
              <span className="status-dot"></span>
              <span>Library system online</span>
            </div>
          </div>

          <div className="library-footer-links">

            <div className="library-footer-column">
              <h4>Management</h4>

              <a href="#dashboard">
                <BookOpen size={15} />
                Dashboard
              </a>

              <a href="#book-management">
                <BookMarked size={15} />
                Books
              </a>

              <a href="#member-management">
                <Users size={15} />
                Members
              </a>

              <a href="#borrowing-records">
                <BookOpen size={15} />
                Borrowing Records
              </a>
            </div>

            <div className="library-footer-column">
              <h4>Circulation</h4>

              <a href="#issue-books">
                <BookMarked size={15} />
                Issue Books
              </a>

              <a href="#return-books">
                <ArrowUpRight size={15} />
                Return Books
              </a>

              <a href="#category-management">
                <BookOpen size={15} />
                Categories
              </a>

              <a href="#notifications">
                <Bell size={15} />
                Notifications
              </a>
            </div>

            <div className="library-footer-column">
              <h4>System</h4>

              <a href="#settings">
                Settings
              </a>

              <a href="#about">
                About Roshni
              </a>

              <a href="#help-centre">
                Help Centre
              </a>

              <a href="#contact">
                Contact
              </a>
            </div>

          </div>
        </div>

        <div className="library-footer-contact">
          <div>
            <span>LIBRARY SUPPORT</span>
            <h3>Need help managing your library?</h3>
          </div>

          <a href="mailto:admin@roshni.com">
            <Mail size={17} />
            admin@roshni.com
          </a>
        </div>

        <div className="library-footer-bottom">
          <p>© 2026 Roshni Library. All rights reserved.</p>

          <div>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <span className="footer-urdu">روشنی</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default LibraryFooter;