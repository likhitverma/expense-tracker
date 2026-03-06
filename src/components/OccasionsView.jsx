export default function OccasionsView({
  occasions,
  loading,
  onSelectOccasion,
  onInfoOccasion,
  onNewOccasion,
}) {
  if (loading) {
    return (
      <div className="et-occasions-view">
        <div className="et-loading">
          <div className="et-spinner" />
          <span>Loading occasions…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="et-occasions-view">
      <div className="et-occ-list-header">
        <div>
          <h3 className="et-section-title" style={{ marginBottom: 2 }}>
            Occasions
            {occasions.length > 0 && (
              <span className="et-count-badge">{occasions.length}</span>
            )}
          </h3>
          <p className="et-occ-list-sub">
            Group expenses by trip, event, or project
          </p>
        </div>
        <button className="et-occ-new-btn" onClick={onNewOccasion}>
          <i className="fa fa-plus" /> New
        </button>
      </div>

      {occasions.length === 0 ? (
        <div className="et-empty">
          <div className="et-empty-icon">🗂️</div>
          <p className="et-empty-title">No occasions yet</p>
          <p className="et-empty-sub">
            Create an occasion to group expenses for trips, events, or projects — completely separate from your daily records.
          </p>
          <button className="et-empty-cta" onClick={onNewOccasion}>
            <i className="fa fa-plus" /> Create Occasion
          </button>
        </div>
      ) : (
        <div className="et-occ-list">
          {occasions.map((occ) => (
            <div
              key={occ.id}
              className="et-occ-card"
              onClick={() => onSelectOccasion(occ)}
            >
              <div className="et-occ-card-emoji">{occ.emoji}</div>
              <div className="et-occ-card-info">
                <div className="et-occ-card-name">{occ.name}</div>
                {occ.description && (
                  <div className="et-occ-card-desc">{occ.description}</div>
                )}
              </div>
              <div className="et-occ-card-actions">
                <i className="fa fa-chevron-right et-occ-card-arrow" />
                <button
                  className="et-occ-info-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInfoOccasion(occ);
                  }}
                  title="View details"
                >
                  <i className="fa fa-circle-info" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
