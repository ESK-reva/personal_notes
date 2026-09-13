import { useState } from "react";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);

  const addNote = (e) => {
    e.preventDefault();

    // Don't add empty notes
    if (title.trim() === "" || content.trim() === "") {
      return;
    }

    const newNote = {
      title: title,
      content: content,
    };

    setNotes([...notes, newNote]);

    // Clear the form
    setTitle("");
    setContent("");
  };

  return (
    <div>
      <h1>My Notes</h1>

      <form onSubmit={addNote}>
        <div>
          <label>Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
          />
        </div>

        <br />

        <div>
          <label>Content</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter note content"
            rows="5"
          />
        </div>

        <br />

        <button type="submit">Add Note</button>
      </form>

      <hr />

      <h2>Notes</h2>

      {notes.map((note, index) => (
        <div key={index}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;