function retryMessage(response: Response): string | null {
  const header = response.headers.get("retry-after");
  if (!header) return null;
  const seconds = /^\d+$/.test(header.trim())
    ? Number(header.trim())
    : header.includes(",")
      ? Math.ceil((Date.parse(header) - Date.now()) / 1_000)
      : NaN;
  if (!Number.isSafeInteger(seconds) || seconds <= 0) return null;
  return seconds < 60
    ? `Try again in ${seconds} seconds.`
    : `Try again in about ${Math.ceil(seconds / 60)} minutes.`;
}

export function discoveryError(response: Response): string {
  const retry = retryMessage(response);
  if (response.status === 429) {
    return `Philips Hue online discovery is rate-limited. ${retry ?? "Wait a while before trying again."} Or enter a bridge IP address.`;
  }
  return `Philips Hue online discovery returned HTTP ${response.status}. ${retry ? `${retry} ` : ""}Enter a bridge IP address instead.`;
}
