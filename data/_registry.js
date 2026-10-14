/*
 * Interview Atlas — question registry.
 *
 * Every file in /data calls ATLAS.addTrack(meta, items). To add questions, append
 * objects to the items array of a track file:
 *
 *   { l: "B" | "I" | "A" | "E",      // Beginner, Intermediate, Advanced, Expert (senior/lead)
 *     t: "Topic",                    // sub-topic shown as a filter chip
 *     q: "Question?",
 *     a: `Answer.`,                  // mini-markdown (see below)
 *     k: "One-line takeaway",        // optional
 *     r: "Real-life example" }       // optional analogy shown in an animated card
 *
 * Answer mini-markdown:
 *   - first paragraph = crisp summary (also used by quiz and flashcards)
 *   - blank line separates paragraphs
 *   - lines starting with "- " become bullets, "1. " numbered steps
 *   - ~~~java ... ~~~ fenced code blocks
 *   - **bold** and ‹inline code› (guillemets avoid escaping backticks in JS template literals)
 *   - write \${ instead of ${ inside answers (template literal escape)
 */
(function () {
  "use strict";
  const LEVELS = { B: "Beginner", I: "Intermediate", A: "Advanced", E: "Expert" };
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  const ATLAS = (window.ATLAS = window.ATLAS || { tracks: [], questions: [] });
  ATLAS.LEVELS = LEVELS;
  ATLAS.addTrack = function (meta, items) {
    const track = Object.assign({ order: ATLAS.tracks.length }, meta);
    const seen = new Set();
    track.questions = items.map((item, index) => {
      let id = meta.id + "-" + hash(item.q);
      while (seen.has(id)) id += "x";
      seen.add(id);
      return {
        id,
        track: meta.id,
        n: index + 1,
        level: LEVELS[item.l] || "Intermediate",
        topic: item.t || "General",
        q: item.q,
        answer: String(item.a || "").trim(),
        takeaway: item.k || "",
        real: item.r || "",
      };
    });
    ATLAS.tracks.push(track);
    ATLAS.questions.push(...track.questions);
  };
  /* Attach real-life examples to existing questions: ATLAS.addExamples("java", { "Exact question?": "Example…" }) */
  ATLAS.unmatchedExamples = [];
  ATLAS.addExamples = function (trackId, map) {
    const track = ATLAS.tracks.find(t => t.id === trackId);
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
    Object.keys(map).forEach(q => {
      const key = norm(q);
      const hit = track && track.questions.find(x => norm(x.q) === key || norm(x.q).startsWith(key));
      if (hit) hit.real = map[q]; else ATLAS.unmatchedExamples.push(trackId + ": " + q);
    });
  };
})();
