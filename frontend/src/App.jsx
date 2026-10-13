
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/notes";
const AUTH_API = "/api/auth-handler";


function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [binNotes, setBinNotes] = useState([]);
  const [currentView, setCurrentView] = useState("all");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  
const [user, setUser] = useState(null);
const [authMode, setAuthMode] = useState("login");
const [authLoading, setAuthLoading] = useState(true);


  const loadNotes = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load notes");
      setNotes(await response.json());
    } catch (err) {
      console.error(err);
      setError("Unable to load notes. Check your backend.");
    }
  };

  const loadBinNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/bin`);
      if (!response.ok) throw new Error("Could not load Bin");
      setBinNotes(await response.json());
    } catch (err) {
      console.error(err);
      setError("Unable to load the Bin.");
    }
  };

  
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch(`${AUTH_API}?action=me`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Session check failed:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  checkSession();
}, []);

useEffect(() => {
  if (!user) return;

  loadNotes();
  loadBinNotes();
}, [user]);

  
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authError, setAuthError] = useState("");
const [authSubmitting, setAuthSubmitting] = useState(false);

const handleAuth = async (e) => {
  e.preventDefault();
  setAuthError("");
  setAuthSubmitting(true);

  try {
    const endpoint =
  authMode === "signup" ? "signup" : "login";

const response = await fetch(
  `${AUTH_API}?action=${endpoint}`,
  {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: authEmail.trim(),
        password: authPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Authentication failed.");
    }

    setUser(data.user);
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
  } catch (err) {
    setAuthError(err.message || "Something went wrong.");
  } finally {
    setAuthSubmitting(false);
  }
};

const handleLogout = async () => {
  try {
    await fetch(`${AUTH_API}?action=logout`, {
      method: "POST",
    });
  } finally {
    setUser(null);
    setNotes([]);
    setBinNotes([]);
    setCurrentView("all");
    setError("");
  }
};

  const changeView = (view) => {
    setCurrentView(view);
    setError("");

    if (view === "bin") loadBinNotes();
    if (view === "all" || view === "favorites") loadNotes();
  };

  const addNote = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) throw new Error("Could not add note");

      const newNote = await response.json();
      setNotes((previous) => [newNote, ...previous]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      setError("Could not save your note. Please try again.");
    }
  };

  const deleteNote = async (id) => {
    setError("");
    setBusyId(id);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not move note to Bin");

      setNotes((previous) => previous.filter((note) => note.id !== id));
      await loadBinNotes();
    } catch (err) {
      console.error(err);
      setError("Could not move the note to the Bin.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleFavorite = async (id) => {
    setError("");
    setBusyId(id);

    try {
      const response = await fetch(`${API_URL}/${id}/favorite`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Could not update favorite");

      const updatedNote = await response.json();
      setNotes((previous) =>
        previous.map((note) => (note.id === id ? updatedNote : note))
      );
    } catch (err) {
      console.error(err);
      setError("Could not update favorite status.");
    } finally {
      setBusyId(null);
    }
  };

  const restoreNote = async (id) => {
    setError("");
    setBusyId(id);

    try {
      const response = await fetch(`${API_URL}/${id}/restore`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Could not restore note");

      const restored = await response.json();
      setBinNotes((previous) => previous.filter((note) => note.id !== id));
      setNotes((previous) => [restored, ...previous]);
    } catch (err) {
      console.error(err);
      setError("Could not restore the note.");
    } finally {
      setBusyId(null);
    }
  };

  const permanentlyDeleteNote = async (id) => {
    if (
      !window.confirm(
        "Permanently delete this note? This cannot be undone."
      )
    ) {
      return;
    }

    setError("");
    setBusyId(id);

    try {
      const response = await fetch(`${API_URL}/${id}/permanent`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete note permanently");

      setBinNotes((previous) => previous.filter((note) => note.id !== id));
    } catch (err) {
      console.error(err);
      setError("Could not permanently delete the note.");
    } finally {
      setBusyId(null);
    }
  };

  const activeNotes =
    currentView === "favorites"
      ? notes.filter((note) => Number(note.favorite) === 1)
      : notes;

  const visibleNotes = currentView === "bin" ? binNotes : activeNotes;

  const pageTitles = {
    all: "Your workspace",
    favorites: "Your favorites",
    bin: "Recently deleted",
  };

  const pageDescriptions = {
    all: "Every idea starts somewhere.",
    favorites: "The thoughts you want to keep close.",
    bin: "Restore notes or remove them permanently.",
  };
  
if (authLoading) {
  return <div className="app">Loading SHREYA...</div>;
}


if (!user) {
  return (
    <div className="auth-page">
      <div className="auth-sparkles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className={`sparkle sparkle-${i % 6}`}>
            {i % 3 === 0 ? "✦" : i % 3 === 1 ? "✧" : "·"}
          </span>
        ))}
      </div>

      <header className="auth-topbar">
        <div className="auth-brand">
          <span className="brand-book">♧</span>
          <span>SHREYA</span>
        </div>
        <div className="auth-top-links">
          <span>Your Notes</span>
          <span className="top-star">✦</span>
          <span>Your Thoughts</span>
          <span className="top-star">✦</span>
          <span>Your Space</span>
        </div>
      </header>

      <main className="auth-layout">
        <section className="auth-story">
          <p className="story-script">
            Small
            <br />
            Notes
            <br />
            Big
            <br />
            Thoughts <span>♡</span>
          </p>

          <h1 className="story-title">SHREYA</h1>
          <p className="story-subtitle">
            Your personal space for notes.
          </p>

          <div className="story-divider">
            <span>────── ✧ ──────</span>
          </div>

          <div className="story-features">
            <div>
              <span className="feature-icon">♧</span>
              <span>Organize your notes</span>
            </div>
            <div>
              <span className="feature-icon">♡</span>
              <span>Keep what matters</span>
            </div>
            <div>
              <span className="feature-icon">✧</span>
              <span>Access anywhere</span>
            </div>
            <div>
              <span className="feature-icon">☆</span>
              <span>A calmer, focused you</span>
            </div>
          </div>

          <div className="auth-bottom-quote">
            <span>✦</span> A little space, just for you. <span>✦</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-mode-switch">
            <button
              type="button"
              className={authMode === "signup" ? "mode-active" : ""}
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
              }}
            >
              ♡ &nbsp; Create account
            </button>

            <button
              type="button"
              className={authMode === "login" ? "mode-active" : ""}
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
            >
              ↪ &nbsp; Login
            </button>
          </div>

          <div className="profile-decoration">
            <div className="profile-orbit">
              
<div className="profile-avatar">
  <img
    src="/profile.png"
    alt="SHREYA profile"
    className="profile-photo"
  />
</div>

            </div>
            <span className="profile-camera">✧</span>
            <span className="orbit-spark orbit-spark-one">✦</span>
            <span className="orbit-spark orbit-spark-two">✧</span>
          </div>

          <h2 className="auth-card-script">
            {authMode === "login"
              ? "Your space missed you ♡"
              : "Let's create your space ♡"}
          </h2>

          <p className="auth-card-caption">
            {authMode === "login"
              ? "Pick up where your thoughts left off."
              : "A little home for everything on your mind."}
          </p>

          <form className="auth-form" onSubmit={handleAuth}>
            <label className="auth-input-wrap">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-input-wrap">
              <span className="input-icon">♙</span>
              <input
                type="password"
                placeholder="Password (5–72 characters)"
                autoComplete={
                  authMode === "signup"
                    ? "new-password"
                    : "current-password"
                }
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                minLength={5}
                maxLength={72}
                required
              />
              <span className="input-lock">✧</span>
            </label>

            {authMode === "signup" && (
              <div className="password-hints">
                <span>✓ At least 5 characters</span>
                <span>✓ Letters & numbers</span>
                <span>✓ Special characters allowed</span>
              </div>
            )}

            {authError && (
              <p className="auth-error" role="alert">
                {authError}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={authSubmitting}
            >
              <span>
                {authSubmitting
                  ? "One moment..."
                  : authMode === "login"
                    ? "Log in to your space"
                    : "Create account"}
              </span>
              <span className="submit-sparkle">✦</span>
              <span className="submit-arrow">→</span>
            </button>
          </form>

          <div className="auth-or">
            <span />
            <span>your little corner of the internet</span>
            <span />
          </div>

          <p className="auth-switch-text">
            {authMode === "login"
              ? "New to SHREYA?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login" ? "Create account" : "Log in"}
            </button>
          </p>

          <div className="card-flower flower-one">✿</div>
          <div className="card-flower flower-two">❀</div>
        </section>
      </main>

      <footer className="auth-footer">
        Made for your thoughts, saved with love <span>♡</span>
      </footer>
    </div>
  );
}


  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            changeView("all");
          }}
        >
          <img src="/logo.png" alt="SHREYA logo" className="brand-logo" />
          <span>SHREYA</span>
          <small>PERSONAL SPACE</small>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">
          <button
            className={`nav-item ${currentView === "all" ? "active" : ""}`}
            onClick={() => changeView("all")}
          >
            <span className="nav-symbol">⌂</span>
            <span>All notes</span>
            <span className="nav-count">{notes.length}</span>
          </button>

          <button
            className={`nav-item ${
              currentView === "favorites" ? "active" : ""
            }`}
            onClick={() => changeView("favorites")}
          >
            <span className="nav-symbol">♡</span>
            <span>Favorites</span>
            <span className="nav-count">
              {notes.filter((note) => Number(note.favorite) === 1).length}
            </span>
          </button>

          <button
            className={`nav-item ${currentView === "bin" ? "active" : ""}`}
            onClick={() => changeView("bin")}
          >
            <span className="nav-symbol">▤</span>
            <span>Bin</span>
            <span className="nav-count">{binNotes.length}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <span className="status-dot" />
          <span>LOCAL ENVIRONMENT</span>
          <small>SHREYA · 2026</small>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div className="breadcrumb">
            <span>SHREYA</span>
            <span className="breadcrumb-slash">/</span>
            <span>{pageTitles[currentView]}</span>
          </div>
          <div className="system-status">
            <span className="status-dot" />
            Workspace ready
          </div>
        </header>

        {currentView === "all" && (
          <section className="profile-hero">
            <div className="hero-copy">
              <span className="hero-kicker">
                <span className="status-dot" />
                YOUR PERSONAL WORKSPACE
              </span>

              <h1>
                A little space
                <br />
                for <span>big thoughts.</span>
              </h1>

              <p>
                Capture ideas, save your favorite moments, and keep the
                important things close.
              </p>

              <button
                className="primary-button hero-button"
                onClick={() =>
                  document
                    .getElementById("create-note")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <span>＋</span> Create a note
              </button>

              <div className="hero-metrics">
                <div>
                  <strong>{notes.length}</strong>
                  <span>ACTIVE NOTES</span>
                </div>
                <div>
                  <strong>
                    {notes.filter((note) => Number(note.favorite) === 1).length}
                  </strong>
                  <span>FAVORITES</span>
                </div>
                <div>
                  <strong>{binNotes.length}</strong>
                  <span>IN THE BIN</span>
                </div>
              </div>
            </div>

            <div className="profile-visual">
              <div className="profile-orbit orbit-one" />
              <div className="profile-orbit orbit-two" />

              <div className="profile-photo-frame">
                <img
                  src="/profile.png"
                  alt="Profile"
                  className="profile-photo"
                />
              </div>

              <div className="profile-caption">
                <span className="profile-caption-icon">✦</span>
                <div>
                  <strong>A little inspiration</strong>
                  <small>Make room for what matters.</small>
                </div>
              </div>

              <span className="floating-mark mark-one">✳</span>
              <span className="floating-mark mark-two">✦</span>
            </div>

            <div className="hero-grid-decoration" />
          </section>
        )}

        <section className="page-intro">
          <div>
            <div className="section-overline">
              <span className="section-line" />
              YOUR COLLECTION
            </div>
            <h2>{pageTitles[currentView]}</h2>
            <p>{pageDescriptions[currentView]}</p>
          </div>

          <div className="collection-total">
            <span>{visibleNotes.length}</span>
            <small>{visibleNotes.length === 1 ? "ITEM" : "ITEMS"}</small>
          </div>
        </section>

        {error && (
          <div className="error-banner" role="alert">
            <span>!</span>
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              ×
            </button>
          </div>
        )}

        {currentView === "all" && (
          <section className="create-panel" id="create-note">
            <div className="panel-heading">
              <div className="panel-icon">＋</div>
              <div>
                <span className="section-overline">CAPTURE AN IDEA</span>
                <h3>Create a new note</h3>
              </div>
              <span className="panel-sparkle">✦</span>
            </div>

            <form onSubmit={addNote} className="note-form">
              <div className="form-group">
                <label htmlFor="note-title">NOTE TITLE</label>
                <input
                  id="note-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your thought a name..."
                  maxLength={150}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="note-content">YOUR THOUGHTS</label>
                <textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write something worth remembering..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-footer">
                <span className="form-hint">
                  ✧ Your ideas deserve a place.
                </span>
                <button className="primary-button" type="submit">
                  Save note <span>↗</span>
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="notes-section">
          {visibleNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {currentView === "bin"
                  ? "▤"
                  : currentView === "favorites"
                    ? "♡"
                    : "✧"}
              </div>
              <h3>
                {currentView === "bin"
                  ? "Your Bin is empty"
                  : currentView === "favorites"
                    ? "Nothing saved here yet"
                    : "Your next idea starts here"}
              </h3>
              <p>
                {currentView === "bin"
                  ? "Deleted notes will appear here. You can restore them before they expire."
                  : currentView === "favorites"
                    ? "Tap the heart on a note to keep it in your favorites."
                    : "Create your first note and make this space yours."}
              </p>
              {currentView === "all" && (
                <button
                  className="secondary-button"
                  onClick={() =>
                    document
                      .getElementById("note-title")
                      ?.focus()
                  }
                >
                  Start writing <span>↗</span>
                </button>
              )}
            </div>
          ) : (
            <div className="notes-grid">
              {visibleNotes.map((note) => (
                <article
                  className={`note-card ${
                    currentView === "bin" ? "trashed-card" : ""
                  }`}
                  key={note.id}
                >
                  <div className="note-card-top">
                    <span className="note-type">
                      <span className="note-type-dot" />
                      {currentView === "bin" ? "IN THE BIN" : "PERSONAL NOTE"}
                    </span>
                    {currentView !== "bin" && (
                      <button
                        className={`favorite-button ${
                          Number(note.favorite) === 1 ? "is-favorite" : ""
                        }`}
                        onClick={() => toggleFavorite(note.id)}
                        disabled={busyId === note.id}
                        aria-label={
                          Number(note.favorite) === 1
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        title="Toggle favorite"
                      >
                        {Number(note.favorite) === 1 ? "♥" : "♡"}
                      </button>
                    )}
                  </div>

                  <h3>{note.title}</h3>
                  <p className="note-content">{note.content}</p>

                  <div className="note-card-meta">
                    <span>
                      {currentView === "bin" ? "Deleted" : "Created"}
                    </span>
                    <time>
                      {currentView === "bin"
                        ? note.deleted_at || "Date unavailable"
                        : note.created_at || "Just now"}
                    </time>
                  </div>

                  <div className="note-card-actions">
                    {currentView === "bin" ? (
                      <>
                        <button
                          className="restore-button"
                          onClick={() => restoreNote(note.id)}
                          disabled={busyId === note.id}
                        >
                          ↶ Restore
                        </button>
                        <button
                          className="permanent-button"
                          onClick={() => permanentlyDeleteNote(note.id)}
                          disabled={busyId === note.id}
                        >
                          Delete forever
                        </button>
                      </>
                    ) : (
                      <button
                        className="move-to-bin-button"
                        onClick={() => deleteNote(note.id)}
                        disabled={busyId === note.id}
                      >
                        {busyId === note.id ? "Moving..." : "Move to Bin"}
                        <span>↗</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          <span>Made for the thoughts that matter.</span>
          <span className="footer-brand">SHREYA <span>✦</span></span>
        </footer>
      </main>
    </div>
  );
}

export default App;