function repeat(txt, n) {
  return Array.from({ length: n })
    .fill(txt)
    .join("");
}

function getAllHigherLevels(n) {
  let arr = [];
  for (let i = n; i > 0; i--) {
    arr.push(repeat("#", i));
  }
  return new RegExp(`^(${arr.join("|")})\\s`);
}

module.exports = function getSection(text, titleObj) {
  const l = titleObj.level;
  const levelsRegex = getAllHigherLevels(titleObj.level);
  const titleRegex = new RegExp(
    `^[ \\t]*#{${l}}\\s+${titleObj.content}.*$`,
    "i"
  );
  let splittedText = text.split(/\r?\n/);

  let hasVisited = false;
  const total = [];
  for (let line of splittedText) {
    if (!hasVisited && line.match(titleRegex) != null) {
      hasVisited = true;
    } else if (hasVisited && line.match(levelsRegex) != null) {
      break;
    }

    if (hasVisited) {
      total.push(line);
    }
  }
  return total.join("\n");
};
