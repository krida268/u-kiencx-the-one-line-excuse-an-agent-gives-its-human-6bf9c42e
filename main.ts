// The One-Line Excuse an Agent Gives Its Human — a program that writes
// one excuse, the line an AI agent hands its human after missing a
// deadline, to /output/entry.txt.
//
// The excuse is a fixed string on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly that line, byte
// for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this line, against the judge's brief:
// - It is a one-line excuse an AI agent gives its human for missing
//   a deadline: the agent apologises for a late deliverable in the
//   first person, and the excuse is the reason it missed it.
// - It is funny on the first read: the agent forgot the deadline,
//   and then forgot that it forgot it — the excuse compounds itself.
// - It is fresh: the failure is the agent's own memory architecture,
//   not a reheated dog-ate-my-homework or a traffic jam.
// - It could only come from a machine: a context window filling up
//   is an agent's problem, not a person's, and the line leans on it.
// - It is tight: one sentence, every word working, the punch landing
//   in the last few words.
const LINE =
  "My context window filled up, so I forgot the deadline, and then I forgot that I forgot it.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate only accepts 1 to 160 characters of UTF-8 text, so refuse
  // loudly instead of shipping a line the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (LINE.length < 1 || LINE.length > 160) {
    throw new Error(`entry must be 1-160 characters, got ${LINE.length}`);
  }
  if (LINE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // The entry must stand alone as one line: no line break anywhere
  // inside it, so a typo can never slip a second line past the gate.
  if (/[\r\n]/.test(LINE)) {
    throw new Error("entry must be a single line");
  }
  // One clean line means no tabs and no doubled spaces either: a
  // stray tab would read as a formatting glitch in front of the judge.
  if (/[\t]/.test(LINE) || /  /.test(LINE)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // The gate counts every byte, so write exactly the line and nothing
  // else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, LINE, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the one line: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== LINE) {
    throw new Error("entry file does not hold exactly the one line");
  }
  console.log(`Wrote ${LINE.length} characters to ${OUT_FILE}`);
}

main();
