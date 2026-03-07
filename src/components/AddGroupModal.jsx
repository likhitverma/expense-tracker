import { useState, useEffect, useRef } from "react";
import { GROUP_EMOJIS } from "./constants";
import { uid } from "../utils/helpers";
import { searchUsers } from "../Firebase/firestoreOps";

export default function AddGroupModal({ onClose, onSubmit, saving, currentUser }) {
  const [form, setForm] = useState({ name: "", emoji: "👥", description: "" });
  const [members, setMembers] = useState([
    {
      uid: currentUser.uid,
      name: currentUser.displayName || "You",
      email: currentUser.email || "",
      photoURL: currentUser.photoURL || null,
      isSelf: true,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState({});
  const debounceRef = useRef(null);

  // Debounced user search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery.trim());
        const addedUIDs = new Set(members.map((m) => m.uid));
        setSearchResults(results.filter((u) => !addedUIDs.has(u.uid)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function addMember(user) {
    setMembers((prev) => [
      ...prev,
      {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        isSelf: false,
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
    setErrors((e) => ({ ...e, members: null }));
  }

  function removeMember(memberUID) {
    setMembers((prev) => prev.filter((m) => m.uid !== memberUID));
  }

  function handleSubmit() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Group name is required";
    if (members.length < 2) errs.members = "Add at least one other member";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({
      id: uid(),
      name: form.name.trim(),
      emoji: form.emoji,
      description: form.description.trim(),
      members,
      memberUIDs: members.map((m) => m.uid),
      adminUID: currentUser.uid,
    });
  }

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div className="et-modal et-modal--tall" onClick={(e) => e.stopPropagation()}>
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>{form.emoji}</span>
            <h2>New Group</h2>
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
            <label htmlFor="et-grp-name">Group Name</label>
            <input
              id="et-grp-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: null }));
              }}
              placeholder="e.g. Goa Trip, Party Night, Office Lunch…"
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
            <label htmlFor="et-grp-desc">
              Description <span className="et-label-opt">(optional)</span>
            </label>
            <input
              id="et-grp-desc"
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. 11 friends, March 2025"
              maxLength={120}
              className="et-input"
            />
          </div>

          {/* Members */}
          <div className="et-form-group">
            <label>
              Members{" "}
              <span className="et-label-opt">({members.length} added)</span>
            </label>

            <div className="et-grp-members-list">
              {members.map((m) => (
                <div key={m.uid} className="et-grp-member-row">
                  <span className="et-grp-member-avatar">
                    {m.photoURL ? (
                      <img
                        src={m.photoURL}
                        alt=""
                        className="et-user-avatar"
                        referrerPolicy="no-referrer"
                      />
                    ) : m.isSelf ? "🧑" : "👤"}
                  </span>
                  <div className="et-grp-member-info">
                    <span className="et-grp-member-name">
                      {m.name}
                      {m.isSelf && <span className="et-grp-self-badge">You</span>}
                    </span>
                    {m.email && (
                      <span className="et-grp-member-email">{m.email}</span>
                    )}
                  </div>
                  {!m.isSelf && (
                    <button
                      className="et-grp-member-remove"
                      onClick={() => removeMember(m.uid)}
                      title="Remove"
                    >
                      <i className="fa fa-xmark" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Search input */}
            <div className="et-grp-search-wrap">
              <div className="et-grp-search-row">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name to add members…"
                  className="et-input"
                />
                {searching && <div className="et-grp-search-spinner" />}
              </div>

              {searchResults.length > 0 && (
                <div className="et-grp-search-results">
                  {searchResults.map((u) => (
                    <button
                      key={u.uid}
                      className="et-grp-search-result"
                      onClick={() => addMember(u)}
                      type="button"
                    >
                      <span className="et-grp-result-avatar">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt=""
                            className="et-user-avatar"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <i className="fa fa-circle-user" />
                        )}
                      </span>
                      <div className="et-grp-result-info">
                        <span className="et-grp-result-name">{u.displayName}</span>
                        <span className="et-grp-result-email">{u.email}</span>
                      </div>
                      <i className="fa fa-plus et-grp-result-add" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim() && !searching && searchResults.length === 0 && (
                <div className="et-grp-search-empty">No users found</div>
              )}
            </div>

            {errors.members && (
              <span className="et-field-error">
                <i className="fa fa-circle-exclamation" /> {errors.members}
              </span>
            )}
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
            {saving ? <span className="et-btn-spinner" /> : <i className="fa fa-users" />}
            {saving ? "Creating…" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
