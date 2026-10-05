import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  FolderOpen,
  Bell,
  Settings,
  Menu,
  X,
} from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", link: "#dashboard", icon: LayoutDashboard },
    { label: "Books", link: "#book-management", icon: BookOpen },
    { label: "Members", link: "#member-management", icon: Users },
    { label: "Circulation", link: "#issue-books", icon: ArrowLeftRight },
    { label: "Categories", link: "#category-management", icon: FolderOpen },
    { label: "Notifications", link: "#notifications", icon: Bell },
    { label: "Settings", link: "#settings", icon: Settings },
  ];

  return (
    <header className="roshni-navbar">
      <div className="navbar-container">

        <a href="#dashboard" className="navbar-logo">
          roshni<span>.</span>
        </a>

        <nav className={`navbar-nav ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.link}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="navbar-right">
          <div className="navbar-admin">
            <div className="navbar-avatar">LA</div>

            <div className="navbar-admin-info">
              <strong>Library Admin</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="navbar-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;