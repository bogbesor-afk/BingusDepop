"use client";

export function DeleteItemButton({ itemName }: { itemName: string }) {
  return (
    <button
      type="submit"
      aria-label={`Delete ${itemName}`}
      onClick={(e) => {
        if (
          !confirm(
            `Delete ${itemName}? This also deletes its restock and sale history.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className="text-neutral-400 hover:text-red-600 text-lg leading-none px-1"
    >
      ×
    </button>
  );
}
