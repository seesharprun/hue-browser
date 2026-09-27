"use client";

/** Placeholder widths vary so a loading table reads like names and values. */
const WIDTHS = ["w-32", "w-28", "w-20", "w-24", "w-36", "w-16"];
const ROWS = ["a", "b", "c", "d", "e"];

export function DeviceSkeleton({ columns }: { columns: number }) {
  const cells = Array.from({ length: columns }, (_, index) => ({
    id: `cell-${index}`,
    width: WIDTHS[index % WIDTHS.length],
  }));

  return (
    <section
      aria-hidden="true"
      className="mb-6 rounded-box bg-base-200/70 px-4 py-4"
    >
      <span className="skeleton lofi-warm mb-4 block h-5 w-40" />
      <table className="table">
        <tbody>
          {ROWS.map((row, index) => (
            <tr key={row}>
              {cells.map((cell, position) => (
                <td key={cell.id}>
                  <span
                    className={`skeleton lofi-warm block h-4 ${cell.width}`}
                    style={{
                      animationDelay: `${(index * cells.length + position) * 80}ms`,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
