import React from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LibraryDashboard from "./components/LibraryDashboard";
import BookManagement from "./components/BookManagement";
import MemberManagement from "./components/MemberManagement";
import IssueBooks from "./components/IssueBooks";
import ReturnBooks from "./components/ReturnBooks";
import BorrowingRecords from "./components/BorrowingRecords";
import CategoryManagement from "./components/CategoryManagement";
import Notifications from "./components/Notifications";
import LibrarySettings from "./components/LibrarySettings";
import LibraryFooter from "./components/LibraryFooter";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Hero />

        <div id="dashboard">
          <LibraryDashboard />
        </div>

        <div id="book-management">
          <BookManagement />
        </div>

        <div id="member-management">
          <MemberManagement />
        </div>

        <div id="issue-books">
          <IssueBooks />
        </div>

        <div id="return-books">
          <ReturnBooks />
        </div>

        <div id="borrowing-records">
          <BorrowingRecords />
        </div>

        <div id="category-management">
          <CategoryManagement />
        </div>

        <div id="notifications">
          <Notifications />
        </div>

        <div id="settings">
          <LibrarySettings />
        </div>
      </main>

      <LibraryFooter />
    </div>
  );
}

export default App;