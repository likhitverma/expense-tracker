import { useState, useEffect, useRef } from "react";
import { searchUsers } from "../Firebase/firestoreOps";

export default function ManageMembersModal({ group, currentUser, onClose, onSave, saving }) {
  const [members, setMembers] = useState(group.members);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

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
        isSelf: user.uid === currentUser.uid,
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeMember(memberUID) {
    // Can't remove yourself or the admin
    if (memberUID === group.adminUID) return;
    setMembers((prev) => prev.filter((m) => m.uid !== memberUID));
  }

  function handleSave() {
    onSave({
      members,
      memberUIDs: members.map((m) => m.uid),
    });
  }

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div className="et-modal et-modal--tall" onClick={(e) => e.stopPropagation()}>
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>{group.emoji}</span>
            <h2>Manage Members</h2>
          </div>
          <button className="et-modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="et-modal-body">
          {/* Current members */}
          <div className="et-form-group">
            <label>
              Members <span className="et-label-opt">({members.length})</span>
            </label>
            <div className="et-grp-members-list">
              {members.map((m) => {
                const isAdmin = m.uid === group.adminUID;
                const isSelf = m.uid === currentUser.uid;
                return (
                  <div key={m.uid} className="et-grp-member-row">
                    <span className="et-grp-member-avatar">
                      {m.photoURL ? (
                        <img
                          src={m.photoURL}
                          alt=""
                          className="et-user-avatar"
                          referrerPolicy="no-referrer"
                        />
                      ) : isSelf ? "🧑" : "👤"}
                    </span>
                    <div className="et-grp-member-info">
                      <span className="et-grp-member-name">
                        {m.name}
                        {isSelf && <span className="et-grp-self-badge">You</span>}
                        {isAdmin && <span className="et-grp-admin-badge">Admin</span>}
                      </span>
                      {m.email && (
                        <span className="et-grp-member-email">{m.email}</span>
                      )}
                    </div>
                    {!isAdmin && !isSelf && (
                      <button
                        className="et-grp-member-remove"
                        onClick={() => removeMember(m.uid)}
                        title="Remove member"
                      >
                        <i className="fa fa-xmark" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search to add */}
          <div className="et-form-group">
            <label>Add Member</label>
            <div className="et-grp-search-wrap">
              <div className="et-grp-search-row">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name…"
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
          </div>
        </div>

        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="et-btn et-btn--add"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className="et-btn-spinner" /> : <i className="fa fa-users-gear" />}
            {saving ? "Saving…" : "Save Members"}
          </button>
        </div>
      </div>
    </div>
  );
}
