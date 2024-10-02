const tapeTerminal = document.getElementById('tape_output');

class BF2Interpreter {
  constructor() {
		this.code = ""; // BF2 code
		this.input = ""; // Input to the Brain
		this.tape = []; // Memory tape, will be initialized after processing tape length
		this.pointer = 0; // Points to the current memory cell
		this.inputIndex = 0; // Input index
		this.output = ""; // To store output
		this.instructionPointer = 0; // To traverse the BF2 code
		this.bracketMap = {}; // Precomputed loop positions
		this.loopStack = []; // For error handling brackets
		this.defaultTapeLength = 10; // Default tape length if not provided
		this.lengthWarning = false; // To track if length was not defined
  }

  // Function to extract and calculate tape length from %...%
  parseTapeLength() {
    const firstPercent = this.code.indexOf('%');
    const secondPercent = this.code.indexOf('%', firstPercent + 1);

    // If no %...% is found or only one %, use default length and set warning
    if (firstPercent === -1 || secondPercent === -1) {
			this.tape = new Array(this.defaultTapeLength).fill(0);
			this.lengthWarning = true;
			return;
    }

    // Extract the code between the first and second %
    const lengthCode = this.code.slice(firstPercent + 1, secondPercent);
    if (!lengthCode.trim()) {
			this.tape = new Array(this.defaultTapeLength).fill(0);
			this.lengthWarning = true;
			return;
    }

    // Run a "mini" interpreter to calculate the tape length
    const miniInterpreter = new BF2Interpreter();
    miniInterpreter.run(lengthCode);

    const tapeLength = miniInterpreter.tape[0]; // First tape cell defines length
    if (tapeLength > 0) {
			this.tape = new Array(tapeLength).fill(0); // Create tape of the specified length
    } else {
			this.tape = new Array(this.defaultTapeLength).fill(0); // Fall back to default if invalid
			this.lengthWarning = true;
    }

    // Remove the tape length definition part (only between the first two %) from the main code
    this.code = this.code.slice(0, firstPercent) + this.code.slice(secondPercent + 1);
  }


  // Function to precompute the loop matching for faster execution
  preprocessLoops() {
		const stack = [];
		for (let i = 0; i < this.code.length; i++) {
			const command = this.code[i];
			if (command === '[') {
				stack.push(i);
			} else if (command === ']') {
				if (stack.length === 0) {
					return `Mismatched ']' at position ${i}`;
				}
				const start = stack.pop();
				this.bracketMap[start] = i; // Map [ to ]
				this.bracketMap[i] = start; // Map ] to [
			}
		}
		if (stack.length > 0) {
			return `Mismatched '[' at position ${stack.pop()}`;
		}
  }

	printTape(text, operation) {
    console.log(this.tape);
    if (text.includes('%')) {
        const lineNumber = tapeTerminal.textContent.split('\n').length;
        const paddedLineNumber = lineNumber.toString().padStart(3, ' ');
				const spaceSeperatedTape = this.tape.toString().split(',').join(', ');
        tapeTerminal.textContent += `${paddedLineNumber}->   ${operation}   [${spaceSeperatedTape}]\n`;
    }
	}

  // Function to run the Brainfuck code
  run(incomingCode) {
		this.code = incomingCode.replace(' ', '').replace('\n', '')
		this.output += "Running brainfuck2... \n";
		this.parseTapeLength(); // Parse tape length before running the main code

		// If tape length was not defined, add a warning to the output
		if (this.lengthWarning) {
			this.output += "Warning: Tape length not defined. Using default length of 10.\n";
		}

		const loopError = this.preprocessLoops(); // Precompute loop positions
		if(loopError){
			this.output += loopError
		}

		while (this.instructionPointer < this.code.length) {
			this.printTape(incomingCode, this.instructionPointer === 0 ? ' ' : this.code[this.instructionPointer-1])
			const command = this.code[this.instructionPointer];
			const error = this.executeCommand(command);
			if(error){
				this.output += error;
				break;
			}
			this.instructionPointer++;
		}

		this.printTape(incomingCode, this.code[this.instructionPointer-1])

		return this.output;
  }

  // Function to execute each Brainfuck command
  executeCommand(command) {
		switch (command) {
			case '>':
				this.pointer++;
				if (this.pointer >= this.tape.length) {
					return"Pointer moved out of bounds (right).\n"
				}
				break;
			case '<':
				this.pointer--;
				if (this.pointer < 0) {
					return "Pointer moved out of bounds (left).\n"
				}
				break;
			case '+':
				this.tape[this.pointer]++;
				break;
			case '-':
				this.tape[this.pointer]--;
				break;
			case '.':
				console.log(this.tape[this.pointer])
				this.output += String.fromCharCode(this.tape[this.pointer]);
				break;
			case ',':
				if (this.inputIndex < this.input.length) {
					this.tape[this.pointer] = this.input.charCodeAt(this.inputIndex++);
				} else {
					this.tape[this.pointer] = 0;
				}
				break;
			case '[':
				if (this.tape[this.pointer] === 0) {
					this.instructionPointer = this.bracketMap[this.instructionPointer];
				}
				break;
			case ']':
				if (this.tape[this.pointer] !== 0) {
					this.instructionPointer = this.bracketMap[this.instructionPointer] - 1;
				}
				break;
			default:
				break;
		}
  }
}

