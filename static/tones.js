/* "How the six tones sound": a fixed reference section, independent of the AI Deep Dive.
   Built with DOM nodes (no innerHTML). Audio clips live in static/audio. Pitch curves are drawn as inline SVG on a 1 (low) to 5 (high) scale,
   using the standard northern (Hà Nội) description. */
(function () {
  "use strict";
  const root = document.getElementById("toneGuide");
  if (!root) return;

  // name, mark, example word, meaning, how it sounds, pitch points (1-5 across time), tip
  const TONES = [
    {
      name: "Ngang", file: "ngang", label: "level", mark: "no mark", word: "ma", meaning: "ghost",
      sound: "Mid, flat and steady, like a calm spoken note you hold at your normal speaking pitch.",
      pts: [3, 3, 3, 3, 3], tip: "Think of saying 'ma' while reading a list, with no rise or fall.",
    },
    {
      name: "Huyền", file: "huyen", label: "falling", mark: "` (grave)", word: "mà", meaning: "but",
      sound: "Low and gently falling, starting a little below normal pitch and drifting down. Often a bit breathy or relaxed.",
      pts: [2.4, 2.1, 1.8, 1.5, 1.2], tip: "Say it like a tired sigh, 'maaa', low and smooth.",
    },
    {
      name: "Sắc", file: "sac", label: "rising", mark: "´ (acute)", word: "má", meaning: "cheek; mother (southern)",
      sound: "High and rising, from mid pitch up sharply, like the end of an English question 'Ma?' said with surprise.",
      pts: [3, 3.4, 4, 4.6, 5], tip: "Like asking 'Really?' on a single syllable.",
    },
    {
      name: "Hỏi", file: "hoi", label: "dipping", mark: "̉ (hook above)", word: "mả", meaning: "tomb",
      sound: "Starts mid, dips down, then curves back up slightly. Smooth in the north, with no break in the voice.",
      pts: [3, 2.2, 1.8, 2.2, 3], tip: "Like saying 'Hmm?' while thinking, down and then up.",
    },
    {
      name: "Ngã", file: "nga", label: "creaky rising", mark: "~ (tilde)", word: "mã", meaning: "horse; code",
      sound: "Starts mid, then the voice catches or 'creaks' in the middle (a tiny glottal break) and jumps up high.",
      pts: [3, 2.6, null, 4.2, 5], tip: "Like a squeaky rise with a tiny hiccup in the middle. In many southern accents it sounds the same as hỏi.",
    },
    {
      name: "Nặng", file: "nang", label: "heavy", mark: ". (dot below)", word: "mạ", meaning: "rice seedling",
      sound: "Low, short and heavy, dropping quickly and ending abruptly with the throat closing, like a clipped 'ma'.",
      pts: [2.4, 1.8, 1.2, 1.0, 1.0], short: true, tip: "Short and punchy, as if you stop the sound with your throat.",
    },
  ];

  function h(tag, cls = "", text = "") {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  const SVG = "http://www.w3.org/2000/svg";
  function curve(t) {
    const W = 120, H = 60, padX = 8, padY = 6;
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("class", "w-full h-16");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Pitch contour of the ${t.name} tone: ${t.label}`);
    // guide lines for low / mid / high
    [1, 3, 5].forEach((lvl) => {
      const y = padY + (5 - lvl) * ((H - 2 * padY) / 4);
      const g = document.createElementNS(SVG, "line");
      g.setAttribute("x1", padX); g.setAttribute("x2", W - padX);
      g.setAttribute("y1", y); g.setAttribute("y2", y);
      g.setAttribute("stroke", "currentColor"); g.setAttribute("class", "text-slate-800");
      g.setAttribute("stroke-dasharray", "2 3");
      svg.appendChild(g);
    });
    const xs = (i) => padX + (i * (W - 2 * padX)) / (t.pts.length - 1) * (t.short ? 0.6 : 1);
    const ys = (v) => padY + (5 - v) * ((H - 2 * padY) / 4);
    // draw in segments so a null (glottal break) leaves a gap
    let d = "";
    t.pts.forEach((v, i) => {
      if (v == null) { d += " "; return; }
      const prevBreak = i === 0 || t.pts[i - 1] == null;
      d += `${prevBreak ? "M" : "L"}${xs(i).toFixed(1)},${ys(v).toFixed(1)} `;
    });
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d.trim());
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("class", "text-amber-300");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }

  // ---------- Audio (recorded clips shipped with the app in static/audio) ----------
  const AUDIO_DIR = root.dataset.audioDir || "/static/audio/";
  let current = null;
  function play(file, btn, idleLabel) {
    if (current) { current.audio.pause(); current.btn.textContent = current.label; current = null; }
    const audio = new Audio(AUDIO_DIR + file + ".mp3");
    current = { audio, btn, label: idleLabel };
    btn.textContent = "⏸ Playing…";
    const done = () => { if (current && current.audio === audio) { btn.textContent = idleLabel; current = null; } };
    audio.addEventListener("ended", done);
    audio.addEventListener("error", () => { btn.textContent = "Audio missing"; current = null; });
    audio.play().catch(done);
  }

  // ---------- Build the section ----------
  root.replaceChildren();
  const head = h("div", "mb-4");
  head.appendChild(h("h2", "text-xl font-semibold", "🎵 How the six tones sound"));
  head.appendChild(h("p", "text-sm text-slate-400 mt-1",
    "Vietnamese is tonal: the same letters mean different things depending on pitch. Here is the standard northern (Hà Nội) pronunciation. " +
    "The line shows the pitch of the voice from the start to the end of the syllable (higher on the chart = higher pitch)."));
  const all = h("button", "mt-3 text-sm px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 transition", "▶ Play all six in order");
  all.type = "button";
  all.addEventListener("click", () => play("all-tones", all, "▶ Play all six in order"));
  head.appendChild(all);
  head.appendChild(h("p", "text-xs text-slate-500 mt-1", "Order: ngang, huyền, sắc, hỏi, ngã, nặng (all on the syllable “ma”)."));
  root.appendChild(head);

  const grid = h("div", "grid sm:grid-cols-2 lg:grid-cols-3 gap-3");
  TONES.forEach((t, i) => {
    const card = h("div", "rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col");
    const top = h("div", "flex items-baseline justify-between gap-2");
    const left = h("div", "flex items-baseline gap-2");
    left.appendChild(h("span", "text-xs text-slate-500", String(i + 1)));
    left.appendChild(h("span", "font-semibold text-indigo-300", t.name));
    left.appendChild(h("span", "text-xs text-slate-500", t.label));
    top.appendChild(left);
    top.appendChild(h("span", "text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 whitespace-nowrap", t.mark));
    card.appendChild(top);

    card.appendChild(curve(t));

    const word = h("div", "flex items-center gap-2 mt-1");
    word.appendChild(h("span", "text-2xl font-semibold text-amber-200", t.word));
    word.appendChild(h("span", "text-sm text-slate-400", `= ${t.meaning}`));
    const b = h("button", "ml-auto text-xs px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition whitespace-nowrap", "🔊 Listen");
    b.type = "button";
    b.setAttribute("aria-label", `Listen to the ${t.name} tone, the word ${t.word}`);
    b.addEventListener("click", () => play(t.file, b, "🔊 Listen"));
    word.appendChild(b);
    card.appendChild(word);

    card.appendChild(h("p", "text-sm text-slate-300 mt-2", t.sound));
    card.appendChild(h("p", "text-xs text-slate-500 mt-2", "Tip: " + t.tip));
    grid.appendChild(card);
  });
  root.appendChild(grid);

  const notes = h("div", "mt-4 space-y-1 text-xs text-slate-500");
  notes.appendChild(h("p", "", "Same letters, six different words: ma, mà, má, mả, mã, mạ."));
  notes.appendChild(h("p", "", "Southern accents (Sài Gòn) usually merge hỏi and ngã into one tone, and central accents differ further; the six-tone system above is the northern standard taught most often."));
  notes.appendChild(h("p", "", "🔊 The audio clips are computer-generated (a text-to-speech engine), so they sound robotic and are only a guide to the pitch movement. For natural pronunciation, also listen to a native speaker."));
  root.appendChild(notes);
})();
