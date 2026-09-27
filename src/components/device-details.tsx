import { details } from "../lib/devices/columns";
import type { DeviceRow } from "../lib/devices/types";

export function DeviceDetails({ row, span }: { row: DeviceRow; span: number }) {
  return (
    <tr>
      <td colSpan={span} className="bg-base-100/60">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {details(row).map((item) => (
            <div key={item.label}>
              <dt className="text-xs uppercase text-base-content/60">
                {item.label}
              </dt>
              <dd className="break-words">{item.value}</dd>
            </div>
          ))}
        </dl>
      </td>
    </tr>
  );
}
