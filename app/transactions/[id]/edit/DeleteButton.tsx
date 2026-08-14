"use client";

export function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this transaction? This can't be undone.")) {
          e.preventDefault();
        }
      }}
      className="w-full rounded-md bg-red-950 hover:bg-red-900 text-red-300 text-sm font-medium py-2 border border-red-900"
    >
      Delete transaction
    </button>
  );
}
