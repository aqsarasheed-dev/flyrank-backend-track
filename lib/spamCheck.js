export function isSpam(data) {
  // Honeypot: a hidden field real users never fill, bots often do
  if (data._honeypot && data._honeypot.trim() !== "") {
    return { spam: true, reason: "honeypot triggered" };
  }

  // Heuristic: email field with obviously fake/malformed pattern
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { spam: true, reason: "invalid email format" };
  }

  // Heuristic: extremely fast submission relative to page load isn't checked here
  // (would need a timestamp from the client — see widget.js enhancement below)

  return { spam: false, reason: null };
}