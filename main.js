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
  const output = new BF2Interpreter().run(code);
  terminal.textContent = output;
};

const runFuckIt = () => {
  terminal.textContent = 'Running Fuck It... \n'
  const code = codeArea.value;
  if (!code) {
    terminal.textContent = "Error: Code cannot be empty.";
    return;
  }

  const output = fuckit(code)
  terminal.textContent += output
}

runBF2Button.addEventListener('click', runBrainfuck2);
runFIButton.addEventListener('click', runFuckIt)