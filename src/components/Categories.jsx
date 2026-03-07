const Categories = ({
  categories,
  form,
  setForm,
  setShowAllCategories,
  VISIBLE_CATS,
  showAllCategories,
}) => {
  const CATEGORIES = categories;
  return (
    <div className="et-form-group">
      <label>
        Category <span className="et-cat-selected-badge">{form.category}</span>
      </label>
      <div className="et-cat-selector">
        {(showAllCategories
          ? CATEGORIES
          : CATEGORIES.slice(0, VISIBLE_CATS)
        ).map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`et-cat-btn${form.category === cat.id ? " et-cat-btn--selected" : ""}`}
            style={{ "--cat-color": cat.color }}
            onClick={() => {
              setForm((f) => ({ ...f, category: cat.id }));
              setShowAllCategories(false);
            }}
          >
            <span className="et-cat-btn-icon">{cat.icon}</span>
            <span className="et-cat-btn-label">{cat.label}</span>
          </button>
        ))}
      </div>
      {CATEGORIES.length > VISIBLE_CATS && (
        <button
          type="button"
          className="et-cat-show-more"
          onClick={() => setShowAllCategories((v) => !v)}
        >
          {showAllCategories
            ? "Show less ↑"
            : `Show more (${CATEGORIES.length - VISIBLE_CATS} more) ↓`}
        </button>
      )}
    </div>
  );
};

export default Categories;
