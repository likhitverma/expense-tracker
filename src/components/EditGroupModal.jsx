import { useState } from "react";
import { GROUP_EMOJIS } from "./constants";

export default function EditGroupModal({ group, onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    name: group.name,
    emoji: group.emoji,
    description: group.description || "",
  });
  const [errors, setErrors] = useState({});

  function handleSubmit() {
    if (!form.name.trim()) {
      setErrors({ name: "Group name is required" });
      return;
    }
    onSubmit({
      name: form.name.trim(),
      emoji: form.emoji,
      description: form.description.trim(),
    });
  }

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div className="et-modal" onClick={(e) => e.stopPropagation()}>
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>{form.emoji}</span>
            <h2>Edit Group</h2>
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
              {GROUP_EMOJIS.map((emoji) => (
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
            <label htmlFor="et-edit-grp-name">Group Name</label>
            <input
              id="et-edit-grp-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors({});
              }}
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
            <label htmlFor="et-edit-grp-desc">
              Description <span className="et-label-opt">(optional)</span>
            </label>
            <input
              id="et-edit-grp-desc"
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={120}
              className="et-input"
              placeholder="e.g. 11 friends, March 2025"
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
            {saving ? <span className="et-btn-spinner" /> : <i className="fa fa-pen" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
