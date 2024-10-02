const codeArea = document.getElementById('code-area');
const terminal = document.getElementById('terminal');

const runButton = document.getElementById('Run');
const stopButton = document.getElementById('Stop');
const downloadButton = document.getElementById('Download');
const uploadButton = document.getElementById('Upload');


const runCode = () => {
  const code = codeArea.value;
  if(!code) {
    terminal.textContent = "Error: Code cannot be empty.";
    return
  }
  const output = new BF2Interpreter().run(code);
  terminal.textContent = output;
}


runButton.addEventListener('click', runCode);