const codeArea = document.getElementById('code-area');
const terminal = document.getElementById('terminal');

const runButton = document.getElementById('Run');
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

const runCode = () => {
  const code = codeArea.value;
  if (!code) {
    terminal.textContent = "Error: Code cannot be empty.";
    return;
  }
  const output = new BF2Interpreter().run(code);
  terminal.textContent = output;
};

runButton.addEventListener('click', runCode);