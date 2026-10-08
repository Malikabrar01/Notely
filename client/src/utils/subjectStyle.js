const TONES = [
  { tile: "bg-teal-100 text-teal-700", bar: "from-teal-400 to-teal-600" },
  { tile: "bg-amber-100 text-amber-700", bar: "from-amber-400 to-orange-500" },
  { tile: "bg-rose-100 text-rose-700", bar: "from-rose-400 to-rose-600" },
  { tile: "bg-sky-100 text-sky-700", bar: "from-sky-400 to-sky-600" },
  { tile: "bg-violet-100 text-violet-700", bar: "from-violet-400 to-violet-600" },
  { tile: "bg-lime-100 text-lime-700", bar: "from-lime-400 to-lime-600" },
];

export function toneFor(name = "") {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 997;
  return TONES[h % TONES.length];
}

export function initials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const out = words.length > 1 ? words[0][0] + words[1][0] : (words[0] || "?").slice(0, 2);
  return out.toUpperCase();
}