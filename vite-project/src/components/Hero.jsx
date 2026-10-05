import {
  ArrowRight,
  BookOpen,
  Users,
  ArrowLeftRight,
  LayoutDashboard,
} from "lucide-react";

import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span></span>
          ROSHNI LIBRARY MANAGEMENT
        </div>

        <h1 className="hero-heading">
          Everything your library
          <br />
          <span>needs, in one place.</span>
        </h1>

        <p className="hero-description">
          Manage your collection, members, book circulation, categories,
          and library activity from one focused workspace built for
          modern libraries.
        </p>

        <p className="hero-urdu" lang="ur" dir="rtl">
          علم کی روشنی، ہر کتاب کے ساتھ۔
        </p>

        <div className="hero-buttons">
          <a href="#dashboard" className="hero-primary-btn">
            Open dashboard
            <ArrowRight size={18} />
          </a>

          <a href="#book-management" className="hero-secondary-btn">
            Manage books
          </a>
        </div>

        <div className="hero-benefits">
          <div className="hero-benefit">
            <div className="hero-benefit-icon">
              <BookOpen size={19} />
            </div>

            <span>Book management</span>
          </div>

          <div className="hero-benefit">
            <div className="hero-benefit-icon">
              <Users size={19} />
            </div>

            <span>Member management</span>
          </div>

          <div className="hero-benefit">
            <div className="hero-benefit-icon">
              <ArrowLeftRight size={19} />
            </div>

            <span>Book circulation</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=90"
            alt="Library interior filled with books"
            className="hero-image"
          />

          <div className="hero-image-overlay"></div>

          <div className="hero-image-caption">
            <span className="hero-caption-small">
              YOUR LIBRARY. ORGANIZED.
            </span>

            <h2>
              Manage knowledge.
              <br />
              Empower readers.
            </h2>
          </div>
        </div>

        <div className="hero-floating-card">
          <div className="hero-floating-icon">
            <LayoutDashboard size={21} />
          </div>

          <div>
            <strong>Library workspace</strong>
            <p>Everything in one place.</p>
          </div>

          <ArrowRight
            size={18}
            className="hero-floating-arrow"
          />
        </div>

        <div className="hero-decoration hero-decoration-one"></div>
        <div className="hero-decoration hero-decoration-two"></div>
      </div>
    </section>
  );
}

export default Hero;