export default function OccasionInfoModal({ occasion, onClose, onDelete }) {
  if (!occasion) return null;

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div className="et-modal" onClick={(e) => e.stopPropagation()}>
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>{occasion.emoji}</span>
            <h2>Occasion Details</h2>
          </div>
          <button className="et-modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="et-modal-body">
          <div className="et-occ-info-hero">
            <span className="et-occ-info-emoji">{occasion.emoji}</span>
            <div className="et-occ-info-text">
              <div className="et-occ-info-name">{occasion.name}</div>
              {occasion.description && (
                <div className="et-occ-info-desc">{occasion.description}</div>
              )}
            </div>
          </div>
        </div>

        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onClose}>
            Close
          </button>
          <button
            className="et-btn et-btn--danger"
            onClick={() => {
              onClose();
              onDelete(occasion);
            }}
          >
            <i className="fa fa-trash" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
