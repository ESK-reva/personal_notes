import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);

  // Load notes from the backend when the page opens
  useEffect(() => {
    fetch("http://localhost:3000/api/notes")
      .then((response) => response.json())
      .then((data) => {
        setNotes(data);
      })
      .catch((error) => {
        console.error("Error loading notes:", error);
      });
  }, []);

  // Add a new note to the backend
  const addNote = async (e) => {
    e.preventDefault();

    if (title.trim() === "" || content.trim() === "") {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const newNote = await response.json();

      setNotes((previousNotes) => [newNote, ...previousNotes]);

      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="brand">
          <img
            src="/logo.png"
            alt="Shreya Notes Logo"
            className="logo"
          />

          <span className="brand-name">SHREYA</span>
        </div>

        {/* Navigation */}
        <nav className="navigation">

          <button className="nav-item active">
            <span className="nav-icon">⌂</span>
            <span>All Notes</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">♡</span>
            <span>Favorites</span>
          </button>

        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <span className="sidebar-line"></span>
          <p>MY NOTES</p>
          <span>© 2026</span>
        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">

        {/* Header */}
        <header className="page-header">

          <div>
            <p className="eyebrow">YOUR PERSONAL SPACE</p>

            <h1>My Notes</h1>

            <p className="tagline">
              Thoughts worth keeping.
            </p>
          </div>

          <div className="header-count">
            <span>{notes.length}</span>
            <small>
              {notes.length === 1 ? "note" : "notes"}
            </small>
          </div>

        </header>


        {/* ================= CREATE NOTE ================= */}
        <section className="create-section">

          <div className="section-heading">
            <div>
              <p className="eyebrow">CREATE SOMETHING</p>

              <h2>New Note</h2>
            </div>

            <div className="section-icon">✦</div>
          </div>


          {/* Note Form */}
          <form onSubmit={addNote}>

            <div className="form-group">
              <label>Title</label>

              <input
                type="text"
                placeholder="Give your note a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>


            <div className="form-group">
              <label>Content</label>

              <textarea
                placeholder="Write something worth remembering..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>


            <button type="submit" className="add-note-button">
              <span>+</span>
              Add Note
            </button>

          </form>

        </section>


        {/* ================= NOTES ================= */}
        <section className="notes-section">

          <div className="notes-heading">
            <div>
              <p className="eyebrow">YOUR COLLECTION</p>
              <h2>Notes</h2>
            </div>
          </div>


          <div className="notes-list">

            {notes.length === 0 ? (
              <p className="empty-notes">
                No notes yet. Create your first one!
              </p>
            ) : (
              notes.map((note) => (
                <article className="note-card" key={note.id}>

                  <h3>{note.title}</h3>

                  <p>{note.content}</p>

                  {note.created_at && (
                    <small>{note.created_at}</small>
                  )}

                </article>
              ))
            )}

          </div>

        </section>


        {/* ================= FOOTER ================= */}
        <footer className="footer">
          <span>Thoughts worth keeping</span>
          <span className="footer-heart">♥</span>
          <span>SHREYA</span>
        </footer>

      </main>

    </div>
  );
}

export default App;