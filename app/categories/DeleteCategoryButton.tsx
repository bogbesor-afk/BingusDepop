"use client";

export function DeleteCategoryButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (
          !confirm(
            "Delete this category? Transactions using it will become Uncategorized."
          )
        ) {
          e.preventDefault();
        }
      }}
      className="text-xs text-red-400 hover:text-red-300"
    >
      Delete
    </button>
  );
}
