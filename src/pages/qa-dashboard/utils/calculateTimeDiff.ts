export default function formatDurationPrecise(duration: moment.Duration) {
  // Get the components (these give you the remaining hours/minutes/seconds)
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  let output = [];

  // 1. Add Hours
  if (hours > 0) {
    output.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  }

  // 2. Add Minutes
  if (minutes > 0) {
    output.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  }

  // 3. Add Seconds (optional, only if needed for very short durations)
  if (seconds > 0 && hours === 0 && minutes === 0) {
    output.push(`${seconds} second${seconds > 1 ? "s" : ""}`);
  }

  // 4. Join the components using proper English conjunctions
  if (output.length === 0) {
    return "less than a minute";
  } else if (output.length === 1) {
    return output[0];
  } else if (output.length === 2) {
    return output.join(" and ");
  } else {
    // If there are three parts (H, M, S)
    const last = output.pop();
    return output.join(", ") + `, and ${last}`;
  }
}
