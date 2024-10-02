function fuckit(input) {
  const data = [];
  for (let i in input) {
    data.push({ "char": input[i], "ascii": input.charCodeAt(i) });
  }

  const groups = [];
  const skipIndex = [];
  let maxCells = 0; // Track the maximum cell index used

  // Check each letter for letters that are less than 10 bits away and separate them into groups
  for (let i in data) {
    if (skipIndex.indexOf(i) === -1) {
      for (let j in data) {
        if (Math.abs(data[i]["ascii"] - data[j]["ascii"]) < 10) {
          if (!groups[i]) groups[i] = [];
          groups[i].push(data[j]["ascii"]);
          skipIndex.push(j);
        }
      }
    }
  }

  // Make a copy of groups without any empty indexes
  const condensedGroups = groups.filter(el => el);

  for (let i in data) {
    for (let j in condensedGroups) {
      if (condensedGroups[j].indexOf(data[i]['ascii']) !== -1) {
        data[i]['group'] = Number(j);
      }
    }
  }

  let output = '++++++++++';
  const initLoop = [];

  // Create an initial loop
  for (let i in condensedGroups) {
    let char;

    for (let v of data) {
      if (!char) {
        if (v['group'] == i) char = v['ascii'];
      }
    }

    let currentLine = ">";
    for (let j = 0; j < Math.floor(char / 10); j++) {
      currentLine += "+";
    }
    initLoop.push(currentLine);
  }
  output += "[" + initLoop.join('');
  for (let i in groups) {
    output += "<";
  }
  output += "-]";

  // This loop writes the actual characters
  let currentCell = -1;
  let currentValue;
  const savedCells = [];
  for (let i of data) {
    if (currentCell !== i['group']) {
      // Update maxCells based on the new group index
      maxCells = Math.max(maxCells, i['group'] + 1); // +1 because we are indexing from 0

      // Move to the correct cell
      while (currentCell !== i['group']) {
        if (currentCell < i['group']) {
          currentCell++;
          output += '>';
        } else {
          currentCell--;
          output += '<';
        }
      }
      currentValue = (savedCells[currentCell]) ? savedCells[currentCell] : Math.trunc(i['ascii'] / 10) * 10;
    }
    while (currentValue !== i['ascii']) {
      if (currentValue < i['ascii']) {
        output += '+';
        currentValue++;
      } else {
        output += '-';
        currentValue--;
      }
    }
    savedCells[currentCell] = currentValue;
    output += '.';
  }

  // Prepare the tape length definition based on maxCells
  const tapeLength = '%'.padEnd(maxCells + 2, '+') + '%'; // Length is maxCells

  return tapeLength + output; // Return the length and the formed string
}
