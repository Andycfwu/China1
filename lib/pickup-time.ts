const RESTAURANT_TIME_ZONE = "America/New_York";

function formatHourMinute(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function formatPickupTime(value: string) {
  if (!value || value.toUpperCase() === "ASAP") {
    return "ASAP";
  }

  // datetime-local values intentionally have no timezone. Read their wall-clock
  // fields directly so restaurant pickup time does not shift with device timezone.
  const localMatch = value.match(
    /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})(?::\d{2})?$/,
  );
  if (localMatch) {
    return formatHourMinute(Number(localMatch[1]), Number(localMatch[2]));
  }

  const timeMatch = value.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    return formatHourMinute(Number(timeMatch[1]), Number(timeMatch[2]));
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: RESTAURANT_TIME_ZONE,
  }).format(date);
}

export function isValidScheduledPickupTime(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return false;
  }

  const [, year, month, day, hour, minute, second = "0"] = match;
  const parts = [year, month, day, hour, minute, second].map(Number);
  const [yearNumber, monthNumber, dayNumber, hourNumber, minuteNumber, secondNumber] =
    parts;
  const date = new Date(
    Date.UTC(
      yearNumber,
      monthNumber - 1,
      dayNumber,
      hourNumber,
      minuteNumber,
      secondNumber,
    ),
  );

  return (
    date.getUTCFullYear() === yearNumber &&
    date.getUTCMonth() === monthNumber - 1 &&
    date.getUTCDate() === dayNumber &&
    date.getUTCHours() === hourNumber &&
    date.getUTCMinutes() === minuteNumber &&
    date.getUTCSeconds() === secondNumber
  );
}
