import { useState } from "react";
import { CONTACT_INFO } from "../../appConstants";

// ─── Contact Modal ─────────────────────────────────────────────────────────────
export default function ContactModal({ onClose, toast }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");

  function send() {
    if (!name || !email || !msg) {
      toast("Please fill in all required fields", "error");
      return;
    }
    // 🔁 Replace with actual email/form submission logic
    toast("Message sent! We'll reply soon 🎉", "success");
    onClose();
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-icon" style={{ fontSize: "25px"}}>✉️</div>
          <div className="modal-title">Contact Me</div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
          Have feedback, a bug report, or just want to say hi? I'd love to hear from you!
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {CONTACT_INFO.map((c) => (
            <div
              key={c.text}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}
            >
              <i className={`fa ${c.icon}`} style={{ color: c.color, fontSize: 12 }} />
              {c.text}
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Your Name *</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Likhit Verma"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Feature request, bug report, etc."
          />
        </div>
        <div className="form-group">
          <label className="form-label">Message *</label>
          <textarea
            className="form-input"
            rows={4}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Describe your feedback, bug, or idea in detail…"
            style={{ resize: "vertical", minHeight: 90, fontFamily: "var(--font)" }}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={send}>
            <i className="fa fa-paper-plane" /> Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
