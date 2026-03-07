export default function GroupsView({
  groups,
  loading,
  onSelectGroup,
  onDeleteGroup,
  onNewGroup,
}) {
  if (loading) {
    return (
      <div className="et-groups-view">
        <div className="et-loading">
          <div className="et-spinner" />
          <span>Loading groups…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="et-groups-view">
      <div className="et-grp-list-header">
        <div>
          <h3 className="et-section-title" style={{ marginBottom: 2 }}>
            Groups
            {groups.length > 0 && (
              <span className="et-count-badge">{groups.length}</span>
            )}
          </h3>
          <p className="et-grp-list-sub">
            Split expenses with friends and track who owes what
          </p>
        </div>
        <button className="et-grp-new-btn" onClick={onNewGroup}>
          <i className="fa fa-plus" /> New
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="et-empty">
          <div className="et-empty-icon">👥</div>
          <p className="et-empty-title">No groups yet</p>
          <p className="et-empty-sub">
            Create a group for a trip, party, or outing — split expenses and
            see instantly who owes what.
          </p>
          <button className="et-empty-cta" onClick={onNewGroup}>
            <i className="fa fa-plus" /> Create Group
          </button>
        </div>
      ) : (
        <div className="et-grp-list">
          {groups.map((grp) => (
            <div
              key={grp.id}
              className="et-grp-card"
              onClick={() => onSelectGroup(grp)}
            >
              <div className="et-grp-card-emoji">{grp.emoji}</div>
              <div className="et-grp-card-info">
                <div className="et-grp-card-name">{grp.name}</div>
                {grp.description && (
                  <div className="et-grp-card-desc">{grp.description}</div>
                )}
                <div className="et-grp-card-meta">
                  <i className="fa fa-users" /> {grp.members.length} member
                  {grp.members.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="et-grp-card-actions">
                <i className="fa fa-chevron-right et-grp-card-arrow" />
                <button
                  className="et-del-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(grp);
                  }}
                  title="Delete group"
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
