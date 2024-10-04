const codeArea = document.getElementById('code-area');
const terminal = document.getElementById('terminal');
const tapeTerminal = document.getElementById('tape_terminal');

const runBF2Button = document.getElementById('RunBF2');
const runFIButton = document.getElementById('RunFI');
const stopButton = document.getElementById('Stop');
const clearButton = document.getElementById('Clear');
const downloadButton = document.getElementById('Download');
const uploadInput = document.getElementById('Upload');
const isTapeTerminal = document.getElementById('tape_out_checkbox');

let runningInterpreter = null; // Store a reference to the running interpreter

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
    scrollTerminalToBottom(terminal);
    return;
  }

  runBF2Button.innerText = 'Running..';
  runBF2Button.disabled = true;
  stopButton.disabled = false;
  terminal.textContent += '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> \n\nRunning brainfuck2... \n\n';

  const worker = new Worker('./bf2Worker.js'); // Create a new worker

  worker.postMessage({
    code,
    showTape,
  });

  worker.onmessage = (e) => {
    if (e.data.error) {
      terminal.textContent = `Error during execution: ${e.data.error}`;
    } else {
      terminal.textContent += e.data.result +
        `\n\nExecution Time: ${e.data.executionTime} ms \n\n`;
      tapeTerminal.textContent = e.data.tape;
    }

    runBF2Button.innerText = 'Run BrainFuck2';
    runBF2Button.disabled = false;
    stopButton.disabled = true;

    scrollTerminalToBottom(terminal);
    scrollTerminalToBottom(tapeTerminal);
  };

  worker.onerror = (e) => {
    terminal.textContent = `Error in worker: ${e.message}`;
    runBF2Button.innerText = 'Run BrainFuck2';
    runBF2Button.disabled = false;
    stopButton.disabled = true;
  };

  stopButton.addEventListener('click', () => {
    worker.terminate(); // Stop the worker if the stop button is clicked
    terminal.textContent += "\nExecution stopped by user.\n\n\n";
    runBF2Button.innerText = 'Run BrainFuck2';
    runBF2Button.disabled = false;
    stopButton.disabled = true;
    scrollTerminalToBottom(terminal);
  });
};

const runFuckIt = () => {
  const code = codeArea.value;
  if (!code) {
    terminal.textContent = "Error: Code cannot be empty.\n";
    scrollTerminalToBottom(terminal)
    return;
  }

  const startTime = window.performance.now();
  const output = fuckit(code);
  const endTime = window.performance.now();

  const executionTimeNs = ((endTime - startTime)); // Convert to nanoseconds
  terminal.textContent += 
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> \n\n' +
    'Running Fuck It... \n' +
    '--- Output: \n' + output + 
    `\n\nExecution Time: ${executionTimeNs}ms \n\n`;
  scrollTerminalToBottom(terminal)
};

function downloadBF2Code() {
  const code = codeArea.value;
  if (!code) {
    terminal.textContent = 'Error: Code cannot be empty.\n'
    scrollTerminalToBottom(terminal)
    return;
  }

  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Set the file name with custom extension
  a.download = 'my_bf2_code.bf2';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function uploadBF2orBrainfuckFile(event) {
  const file = event.target.files[0];
  if (!file) {
    terminal.textContent += "Error: No file selected.\n";
    return;
  }

  const fileName = file.name.toLowerCase();
  const validExtensions = ['.bf2', '.bf', '.b'];
  if (!validExtensions.some(ext => fileName.endsWith(ext))) {
    terminal.textContent += "Error: Please upload a .bf2, .bf, or .b file.\n";
    event.target.value = ''; // Clear the file input
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function(e) {
    const contents = e.target.result;
    
    // Clear existing code from the code area
    codeArea.value = '';
    
    // Add the new content to the code area
    codeArea.value = contents;
    
    terminal.textContent += `File "${fileName}" uploaded successfully. Content added to code area.\n`;
  };

  reader.onerror = function(e) {
    terminal.textContent += `Error reading file: ${e.target.error.name}\n`;
  };

  reader.readAsText(file);
}

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', function() {
  const uploadInput = document.getElementById('Upload');
  if (uploadInput) {
    uploadInput.addEventListener('change', uploadBF2orBrainfuckFile);
    console.log('Event listener added to upload input');
  } else {
    console.error('Upload input element not found');
  }
});

function scrollTerminalToBottom(scrollTerminal){
  scrollTerminal.scrollTop = scrollTerminal.scrollHeight;
}

runBF2Button.addEventListener('click', runBrainfuck2);
runFIButton.addEventListener('click', runFuckIt);
clearButton.addEventListener('click', ()=>{
  tapeTerminal.textContent = '';
  terminal.textContent = ''
})
downloadButton.addEventListener('click', downloadBF2Code);