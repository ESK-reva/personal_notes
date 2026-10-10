import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [currentView, setCurrentView] = useState("all");

  // Load notes from the backend when the page opens
  useEffect(() => {
    fetch("http://localhost:3000/api/notes")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load notes");
        }
        return response.json();
      })
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

  // Delete a note from the backend
  const deleteNote = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== id)
      );
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Toggle favorite status in the backend
  const toggleFavorite = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/notes/${id}/favorite`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }

      const updatedNote = await response.json();

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === id ? updatedNote : note
        )
      );
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  // Show all notes or only favorite notes
  const displayedNotes =
    currentView === "favorites"
      ? notes.filter((note) => Number(note.favorite) === 1)
      : notes;

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <img
            src="/logo.png"
            alt="Shreya Notes Logo"
            className="logo"
          />
          <span className="brand-name">SHREYA</span>
        </div>

        <nav className="navigation">
          <button
            type="button"
            className={`nav-item ${currentView === "all" ? "active" : ""}`}
            onClick={() => setCurrentView("all")}
          >
            <span className="nav-icon">⌂</span>
            <span>All Notes</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              currentView === "favorites" ? "active" : ""
            }`}
            onClick={() => setCurrentView("favorites")}
          >
            <span className="nav-icon">♡</span>
            <span>Favorites</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-line"></span>
          <p>MY NOTES</p>
          <span>© 2026</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HEADER */}
        <header className="page-header">
          <div>
            <p className="eyebrow">YOUR PERSONAL SPACE</p>

            <h1>
              {currentView === "favorites" ? "Favorites" : "My Notes"}
            </h1>

            <p className="tagline">Thoughts worth keeping.</p>
          </div>

          <div className="header-count">
            <span>{displayedNotes.length}</span>
            <small>
              {displayedNotes.length === 1 ? "note" : "notes"}
            </small>
          </div>
        </header>

        {/* CREATE NOTE */}
        {currentView === "all" && (
          <section className="create-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">CREATE SOMETHING</p>
                <h2>New Note</h2>
              </div>

              <div className="section-icon">✦</div>
            </div>

            <form onSubmit={addNote}>
              <div className="form-group">
                <label htmlFor="note-title">Title</label>
                <input
                  id="note-title"
                  type="text"
                  placeholder="Give your note a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="note-content">Content</label>
                <textarea
                  id="note-content"
                  placeholder="Write something worth remembering..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="add-note-button">
                <span>+</span>
                Add Note
              </button>
            </form>
          </section>
        )}

        {/* NOTES */}
        <section className="notes-section">
          <div className="notes-heading">
            <div>
              <p className="eyebrow">YOUR COLLECTION</p>
              <h2>
                {currentView === "favorites" ? "Favorite Notes" : "Notes"}
              </h2>
            </div>
          </div>

          <div className="notes-list">
            {displayedNotes.length === 0 ? (
              <p className="empty-notes">
                {currentView === "favorites"
                  ? "No favorite notes yet. Tap the heart on a note to add it here!"
                  : "No notes yet. Create your first one!"}
              </p>
            ) : (
              displayedNotes.map((note) => (
                <article className="note-card" key={note.id}>
                  <h3>{note.title}</h3>

                  <p>{note.content}</p>

                  {note.created_at && (
                    <small>{note.created_at}</small>
                  )}

                  <div className="note-actions">
                    <button
                      type="button"
                      className="favorite-button"
                      onClick={() => toggleFavorite(note.id)}
                      aria-label={
                        Number(note.favorite) === 1
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      title={
                        Number(note.favorite) === 1
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      {Number(note.favorite) === 1 ? "♥" : "♡"}
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteNote(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* FOOTER */}
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