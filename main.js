const codeArea = document.getElementById('code-area');
const terminal = document.getElementById('terminal');
const tapeTerminal = document.getElementById('tape_terminal');

const runBF2Button = document.getElementById('RunBF2');
const runFIButton = document.getElementById('RunFI');
const stopButton = document.getElementById('Stop');
const clearButton = document.getElementById('Clear');
const downloadButton = document.getElementById('Download');
const uploadButton = document.getElementById('Upload');
const isTapeTerminal = document.getElementById('tape_out_checkbox');

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
  const showTape = isTapeTerminal.checked;
  if (!code) {
    terminal.textContent = "Error: Code cannot be empty.";
    return;
  }

  const startTime = window.performance.now();
  const output = new BF2Interpreter().run(code, showTape);
  const endTime = window.performance.now();

  const executionTimeNs = ((endTime - startTime) * 1000); // Convert to nanoseconds
  terminal.textContent += 
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> \n\n' +
    output.result + 
    `\n\nExecution Time: ${executionTimeNs} μs(micro-second) \n\n`;
  tapeTerminal.textContent = output.tape;
};

const runFuckIt = () => {
  const code = codeArea.value;
  if (!code) {
    terminal.textContent = "Error: Code cannot be empty.";
    return;
  }

  const startTime = window.performance.now();
  const output = fuckit(code);
  const endTime = window.performance.now();

  const executionTimeNs = ((endTime - startTime) * 1000); // Convert to nanoseconds
  terminal.textContent += 
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> \n\n' +
    'Running Fuck It... \n' +
    output + 
    `\n\nExecution Time: ${executionTimeNs} μs(micro-second) \n\n`;
};

runBF2Button.addEventListener('click', runBrainfuck2);
runFIButton.addEventListener('click', runFuckIt);
clearButton.addEventListener('click', ()=>{
  tapeTerminal.textContent = '';
  terminal.textContent = ''
})
