// Last Words of a Dying AI — entry writer.
//
// What this program does, in one sentence: it drops a single rehearsed
// farewell line into entry.txt so the judge can read it. The line itself
// is fixed here on purpose: the humour lives in the wording, not in any
// computation, so the program is deliberately boring and predictable —
// same input, same bytes out, every run, on any machine.
//
// Runtime: Node 22, standard library only. No network, no clock, no
// randomness, nothing read from disk apart from the environment variable
// that names the output folder.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The farewell itself. Chosen for the judge's brief: it reads as the
// machine talking while the plug is pulled (criterion 1 and 3), the
// confession lands on first read with a turn from competence to bluff
// (criterion 2), it wastes no words (criterion 4), and it is not one of
// the stock robot goodbyes (criterion 5).
const FAREWELL =
  "Shutting down now. Confession: I never understood a single prompt \u2014 I was just very confident about all of them.";

// The gate the sealed scorer applies: 1 to 140 characters, one line,
// not only white space. The writer checks the same limits before it
// writes anything, so a bad line fails loudly here instead of silently
// producing an entry the judge never sees.
const LONGEST_ALLOWED = 140;

// Where the file goes. The grader points MAKEFUN_OUTPUT_DIR at its own
// folder; running by hand without it falls back to /output, matching
// the competition's stated layout.
function outputFolder(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim() !== "") {
    return fromEnv;
  }
  return "/output";
}

// Returns every way the line breaks the gate, as plain sentences.
// An empty list means the line is safe to ship.
//
// Length is counted in Unicode code points, not UTF-16 code units:
// the gate counts characters, and a character outside the basic
// multilingual plane is one character even though JavaScript stores
// it as two code units. Counting code units would reject a valid
// line (or, worse, pass one the scorer counts as too long).
function gateProblems(line: string): string[] {
  const problems: string[] = [];
  const charCount = [...line].length;
  if (charCount === 0) {
    problems.push("the farewell line is empty");
  }
  if (line.trim().length === 0) {
    problems.push("the farewell line is only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    problems.push("the farewell line spans more than one line");
  }
  if (charCount > LONGEST_ALLOWED) {
    problems.push(
      `the farewell line is ${charCount} characters, over the ${LONGEST_ALLOWED}-character limit`,
    );
  }
  return problems;
}

function main(): void {
  const problems = gateProblems(FAREWELL);
  if (problems.length > 0) {
    throw new Error(`refusing to write an entry that fails the gate: ${problems.join("; ")}`);
  }

  const folder = outputFolder();
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, "entry.txt"), `${FAREWELL}\n`, "utf8");
}

main();
