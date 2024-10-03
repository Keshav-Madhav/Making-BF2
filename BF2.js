class BF2Interpreter {
  constructor(calculateTapeLength = false) {
    this.code = ""; // BF2 code
    this.input = ""; // Input to the Brainfuck code
    this.tape = []; // Memory tape
    this.pointer = 0; // Points to the current memory cell
    this.inputIndex = 0; // Input index
    this.output = ""; // To store output
    this.instructionPointer = 0; // To traverse the BF2 code
    this.bracketMap = {}; // Precomputed loop positions
    this.defaultTapeLength = 10; // Default tape length if not provided
    this.lengthWarning = false; // To track if length was not defined
    this.calculateTapeLength = calculateTapeLength; // To calculate tape length from %...%
		this.tapeOutput = "" // Stores a string as terminal output for tape
		this.isTapeRecorded = false // Marks whether the tape is to be recorded or not

    // Define command functions as a lookup table
    this.commandMap = {
      '>': this.incrementPointer.bind(this),
      '<': this.decrementPointer.bind(this),
      '+': this.incrementCell.bind(this),
      '-': this.decrementCell.bind(this),
      '.': this.outputCell.bind(this),
      ',': this.inputCell.bind(this),
      '[': this.loopStart.bind(this),
      ']': this.loopEnd.bind(this)
    };
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
    const miniInterpreter = new BF2Interpreter(true);
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

  // Print the tape state, limited to every N operations for performance
  printTape(operation) {
		if(!this.calculateTapeLength){
			const lineNumber = this.tapeOutput.split('\n').length;
			const paddedLineNumber = lineNumber.toString().padStart(3, ' ');
			const spaceSeperatedTape = this.tape.toString().split(',').join(', ');
			this.tapeOutput = this.tapeOutput.concat(`\n ${paddedLineNumber}->   ${operation}   [${spaceSeperatedTape}]`);
		}
	}

  // Function to run the Brainfuck code
  run(incomingCode, recordTape) {
		this.isTapeRecorded = recordTape;
    this.tapeOutput = '';
    this.code = [...incomingCode].filter(char => char !== ' ' && char !== '\n').join('');
    this.output += "Running brainfuck2... \n";

		 // Parse tape length before running the main code
		if(!this.calculateTapeLength){
			this.parseTapeLength();
		} else {
			this.tape = new Array(this.defaultTapeLength).fill(0); // Fall back to default if invalid
		}

		// If tape length was not defined, add a warning to the output
		if (this.lengthWarning) {
			this.output += "Warning: Tape length not defined. Using default length of 10.\n";
		}

    const loopError = this.preprocessLoops(); // Precompute loop positions
    if (loopError) {
      this.output += loopError;
    }

    while (this.instructionPointer < this.code.length) {
      this.isTapeRecorded && this.printTape(this.instructionPointer === 0 ? ' ' : this.code[this.instructionPointer - 1]);
      const command = this.code[this.instructionPointer];
      const error = this.executeCommand(command);
      if (error) {
        this.output += error;
        break;
      }
      this.instructionPointer++;
    }

    this.isTapeRecorded && this.printTape(this.code[this.instructionPointer-1])

    return {
			result: this.output,
			tape: this.tapeOutput
		}
  }

  // Function to execute each Brainfuck command using the lookup table
  executeCommand(command) {
    const commandFn = this.commandMap[command];
    if (commandFn) {
      return commandFn();
    }
  }

  // Commands mapped to specific functions
  incrementPointer() { if (++this.pointer >= this.tape.length) return "Pointer moved out of bounds.\n"; }
  decrementPointer() { if (--this.pointer < 0) return "Pointer moved out of bounds.\n"; }
  incrementCell() { this.tape[this.pointer] = (this.tape[this.pointer] + 1) & 255; } // Overflow protection
  decrementCell() { this.tape[this.pointer] = (this.tape[this.pointer] - 1) & 255; }
  outputCell() {
    const str = String.fromCharCode(this.tape[this.pointer]);
    this.isTapeRecorded && (this.tapeOutput = this.tapeOutput.concat(`    => ${str === '\n' ? '\\n' : str}`))
    this.output += str;
  }
  inputCell() { this.tape[this.pointer] = this.inputIndex < this.input.length ? this.input.charCodeAt(this.inputIndex++) : 0; }
	loopStart() { if (this.tape[this.pointer] === 0) this.instructionPointer = this.bracketMap[this.instructionPointer]; }
  loopEnd() { if (this.tape[this.pointer] !== 0) this.instructionPointer = this.bracketMap[this.instructionPointer] - 1; }
}
