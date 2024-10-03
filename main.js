const codeArea = document.getElementById('code-area');
const terminal = document.getElementById('terminal');

const runBF2Button = document.getElementById('RunBF2');
const runFIButton = document.getElementById('RunFI');
const stopButton = document.getElementById('Stop');
const downloadButton = document.getElementById('Download');
const uploadButton = document.getElementById('Upload');

codeArea.addEventListener('keydown', (e) => {
  const { selectionStart, selectionEnd, value } = codeArea;
  
  switch (e.key) {
    case '[':
      e.preventDefault();
      insertAtCursor('[-]', selectionStart, selectionEnd);
      break;
    case '%':
      e.preventDefault();
      insertAtCursor('%%', selectionStart, selectionEnd);
      break;
    case 'Tab':
      e.preventDefault();
      insertAtCursor('  ', selectionStart, selectionEnd);
      break;
  }
});

const insertAtCursor = (text, start, end) => {
  const before = codeArea.value.substring(0, start);
  const after = codeArea.value.substring(end);
  codeArea.value = before + text + after;
  
  // Move cursor after the inserted text
  const newPosition = start + text.length;
  codeArea.setSelectionRange(newPosition, newPosition);
  codeArea.focus();
}

const runBrainfuck2 = () => {
  const code = codeArea.value;
  if (!code) {
    terminal.textContent = "Error: Code cannot be empty.";
    return;
  }

  const startTime = window.performance.now();
  const output = new BF2Interpreter().run(code);
  const endTime = window.performance.now();

  const executionTimeNs = ((endTime - startTime) * 1000); // Convert to nanoseconds
  terminal.textContent = output + `\n\nExecution Time: ${executionTimeNs} μs(micro-second)`;
};

const runFuckIt = () => {
  terminal.textContent = 'Running Fuck It... \n';
  const code = codeArea.value;
  if (!code) {
    terminal.textContent = "Error: Code cannot be empty.";
    return;
  }

  const startTime = window.performance.now();
  const output = fuckit(code);
  const endTime = window.performance.now();

  const executionTimeNs = ((endTime - startTime) * 1000); // Convert to nanoseconds
  terminal.textContent += output + `\n\nExecution Time: ${executionTimeNs} μs(micro-second)`;
};

runBF2Button.addEventListener('click', runBrainfuck2);
runFIButton.addEventListener('click', runFuckIt);
