export interface Letter {
  num: number;
  title: string;
  date: string;
  paragraphs: string[];
}

export const LETTERS: Letter[] = [
  {
    num: 1,
    title: "on building quietly",
    date: "july 2026",
    paragraphs: [
      "The best work I have done never announced itself. It arrived slowly, in the margins of ordinary days, and by the time anyone noticed it was already load-bearing. I have come to trust that shape of work more than any launch.",
      "Loud building borrows attention from the future. You spend it before the thing exists, and then the thing must spend its whole life paying that attention back. Quiet building owes nothing. It gets to be exactly what it is.",
      "There is a practical side to this too. When nobody is watching, you can change your mind. You can throw away a month without explaining the month to anyone. The freedom to be wrong in private is worth more than the applause for being right in public.",
      "So this is the discipline I keep returning to: ship softly, tell few people, let the work find the ones who need it. If it is good, it will not stay quiet forever. And if it stays quiet forever, it was mine, and that was enough.",
    ],
  },
  {
    num: 2,
    title: "simulation as a way of seeing",
    date: "may 2026",
    paragraphs: [
      "If you want to know what a crowd will do, the worst method is to ask the crowd. People answer as the person they wish they were. The gap between the stated and the done is where every bad forecast lives.",
      "Building MiroFish taught me to stop asking and start rehearsing. Give a thousand small agents a world, let them want things, and watch. The answers that come out of the watching are stranger and truer than anything a survey returns.",
      "A simulation is not a crystal ball. It is closer to a pair of glasses. It does not tell you the future; it corrects a distortion in how you see the present. Most of what we call prediction is just seeing the present clearly, slightly earlier than everyone else.",
      "The humbling part is how little of the machinery matters. The elaborate models earn their keep rarely. What earns its keep daily is the habit of asking: who wants what here, and what happens when they all want it at once?",
    ],
  },
  {
    num: 3,
    title: "interfaces that stay out of the way",
    date: "february 2026",
    paragraphs: [
      "Every interface is a guest in someone's attention. Most software forgets this and behaves like a host, rearranging the furniture, announcing itself, asking for reviews. The software I love behaves like a good guest. It arrives, does the thing, and leaves the room as it found it.",
      "Leaving things out is not a style. It is a discipline with a cost, paid daily, against every reasonable argument for adding one more control. Nobody ever got fired for adding a setting. The empty screen has no defenders except the user, who is not in the room.",
      "My test is simple: after someone uses the thing, can they remember the interface, or only what they accomplished? Memory of the tool is a kind of failure. The best session leaves behind a result and no residue.",
      "Black background, one typeface, nothing that moves unless it means something. It looks like an aesthetic. It is actually a promise: your attention is safe here.",
    ],
  },
  {
    num: 4,
    title: "notes to a younger builder",
    date: "november 2025",
    paragraphs: [
      "Nobody knows what they are doing at the level you imagine they do. The senior engineer is confident about a smaller set of things than you think, and the confidence came from being wrong cheaply, many times, early.",
      "Learn to finish. Ideas are a renewable resource and completions are not. The gap between the person you are and the person you want to be is mostly a stack of unfinished things, and it closes one finished thing at a time.",
      "Guard your mornings. Whatever the world wants from you, it can usually wait until the afternoon. The work that will matter in ten years almost never arrives with a deadline attached.",
      "And write letters like this one, even if nobody reads them. The writing is not for the reader. It is how you find out what you actually believe, which is the one dependency every project shares.",
    ],
  },
];

// wrap a paragraph to a fixed column width for the terminal reader
export function wrapText(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (test.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
