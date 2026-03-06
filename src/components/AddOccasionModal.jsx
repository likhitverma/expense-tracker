import { useState } from "react";
import { OCCASION_EMOJIS } from "./constants";

export default function AddOccasionModal({ onClose, onSubmit, saving }) {
  const [form, setForm] = useState({ name: "", emoji: "✈️", description: "" });
  const [errors, setErrors] = useState({});

  function handleSubmit() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Occasion name is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ name: form.name.trim(), emoji: form.emoji, description: form.description.trim(), status: "active" });
  }

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div className="et-modal" onClick={(e) => e.stopPropagation()}>
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>{form.emoji}</span>
            <h2>New Occasion</h2>
          </div>
          <button className="et-modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="et-modal-body">
          {/* Emoji picker */}
          <div className="et-form-group">
            <label>Icon</label>
            <div className="et-emoji-grid">
              {OCCASION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`et-emoji-btn${form.emoji === emoji ? " et-emoji-btn--selected" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="et-form-group">
            <label htmlFor="et-occ-name">Occasion Name</label>
            <input
              id="et-occ-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((errs) => ({ ...errs, name: null }));
              }}
              placeholder="e.g. Goa Trip, Car Repair, Wedding..."
              maxLength={60}
              className={`et-input${errors.name ? " et-input--error" : ""}`}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
            {errors.name && (
              <span className="et-field-error">
                <i className="fa fa-circle-exclamation" /> {errors.name}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="et-form-group">
            <label htmlFor="et-occ-desc">
              Description <span className="et-label-opt">(optional)</span>
            </label>
            <input
              id="et-occ-desc"
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Family vacation to Goa, Jan 2025"
              maxLength={120}
              className="et-input"
            />
          </div>
        </div>

        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="et-btn et-btn--add"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <span className="et-btn-spinner" /> : <i className="fa fa-plus" />}
            {saving ? "Creating…" : "Create Occasion"}
          </button>
        </div>
      </div>
    </div>
  );
}
