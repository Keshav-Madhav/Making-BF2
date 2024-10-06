class BF2Interpreter {
  constructor(calculateTapeLength = false) {
    this.code = ""; // BF2 code
    this.input = ""; // Input to the Brainfuck code
    this.tape = new Uint8Array(10); // Memory tape, using Uint8Array for better performance
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

    this.stopped = false; // Flag to stop the interpreter
    this.maxOperations = 1000000000; // Limit to avoid infinite loops
    this.operationCount = 0; // Track number of operations
    this.maxOutputLength = 10000;
    this.lenCounter = 0;

    // Direct array mapping for performance
    this.commands = [
      this.incrementPointer.bind(this), // '>'
      this.decrementPointer.bind(this), // '<'
      this.incrementCell.bind(this),    // '+'
      this.decrementCell.bind(this),    // '-'
      this.outputCell.bind(this),       // '.'
      this.inputCell.bind(this),        // ','
      this.loopStart.bind(this),        // '['
      this.loopEnd.bind(this)           // ']'
    ];
    this.commandIndices = {
      '>': 0, '<': 1, '+': 2, '-': 3, '.': 4, ',': 5, '[': 6, ']': 7
    };
  }

  // Function to extract and calculate tape length from %...%
  parseTapeLength() {
    const firstPercent = this.code.indexOf('%');
    const secondPercent = this.code.indexOf('%', firstPercent + 1);

    // If no %...% is found or only one %, use default length and set warning
    if (firstPercent === -1 || secondPercent === -1) {
      this.tape = new Uint8Array(this.defaultTapeLength);
      this.lengthWarning = true;
      return;
    }

    // Extract the code between the first and second %
    const lengthCode = this.code.slice(firstPercent + 1, secondPercent);
    if (!lengthCode.trim()) {
      this.tape = new Uint8Array(this.defaultTapeLength);
      this.lengthWarning = true;
      return;
    }

    // Run a "mini" interpreter to calculate the tape length
    const miniInterpreter = new BF2Interpreter(true);
    miniInterpreter.run(lengthCode);

    const tapeLength = miniInterpreter.tape[0]; // First tape cell defines length
    if (tapeLength > 0) {
      this.tape = new Uint8Array(tapeLength); // Create tape of the specified length
    } else {
      this.tape = new Uint8Array(this.defaultTapeLength); // Fall back to default if invalid
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

  // Efficient tape output to minimize redundant operations
  printTape(operation) {
    if (!this.calculateTapeLength) {
      const lineNumber = this.tapeOutput.split('\n').length;
      const paddedLineNumber = lineNumber.toString().padStart(3, ' ');
      const spaceSeparatedTape = Array.from(this.tape)
        .map((value, index) => (index === this.pointer ? `\u0332${value}` : `${value}`)) // Green highlight
        .join(', ');
      this.tapeOutput += `\n ${paddedLineNumber}->   ${operation}   [${spaceSeparatedTape}]`;
    }
  }

  // Function to stop execution
  stopCode() {
    this.stopped = true;
  }

  // Function to run the Brainfuck code asynchronously
  async run(incomingCode, recordTape) {
    this.isTapeRecorded = recordTape;
    recordTape && (this.maxOperations = 100000);
    this.tapeOutput = '';
    this.code = incomingCode.replace(/[\s\n]+/g, ''); // Remove whitespaces and newlines

    // Parse tape length before running the main code
    if(!this.calculateTapeLength){
      this.parseTapeLength();
    } else {
      this.tape = new Uint8Array(this.defaultTapeLength); // Fall back to default if invalid
    }

    // If tape length was not defined, add a warning to the output
    if (this.lengthWarning) {
      this.output += "Warning: Tape length not defined. Using default length of 10.\n\n";
    }

    this.output += "--- Output: \n";

    const loopError = this.preprocessLoops(); // Precompute loop positions
    if (loopError) {
      this.output += loopError;
      return { result: this.output, operationCount: this.operationCount, tape: this.tapeOutput };
    }

    while (this.instructionPointer < this.code.length) {
      if (this.stopped) {
        this.output += "\nExecution stopped by user.\n";
        break;
      }

      this.operationCount++;
      if (this.operationCount > this.maxOperations) {
        break;
      }

      if (this.isTapeRecorded) {
        this.printTape(this.instructionPointer === 0 ? ' ' : this.code[this.instructionPointer - 1]);
      }

      const command = this.code[this.instructionPointer];
      const error = this.executeCommand(command);
      if (error) {
        this.output += error;
        break;
      }

      this.instructionPointer++;
    }

    if (this.isTapeRecorded) {
      this.printTape(this.code[this.instructionPointer - 1]);
    }

    this.lenCounter > 0 && (this.output += `...(${this.lenCounter} more characters)`);
    this.operationCount > this.maxOperations && (this.output += `\n\nExecution stopped: Max operations limit reached (${this.maxOperations}).\n`);

    return {
      result: this.output,
      operationCount: this.operationCount,
      tape: this.tapeOutput
    };
  }

  // Function to execute each Brainfuck command with loop unrolling optimization
  executeCommand(command) {
    const commandIndex = this.commandIndices[command];
    if (commandIndex !== undefined) {
      // Loop unrolling optimization: apply consecutive commands in one go if tape is not recorded
      if (!this.isTapeRecorded && (command === '+' || command === '-' || command === '>' || command === '<')) {
        let consecutiveCount = 1;
        
        // Count how many consecutive times the same command occurs
        while (this.code[this.instructionPointer + consecutiveCount] === command) {
          consecutiveCount++;
          this.operationCount++;
        }
  
        // Apply the command multiple times in one step
        if (command === '+') {
          this.tape[this.pointer] = (this.tape[this.pointer] + consecutiveCount) & 255;
        } else if (command === '-') {
          this.tape[this.pointer] = (this.tape[this.pointer] - consecutiveCount) & 255;
        } else if (command === '>') {
          this.pointer += consecutiveCount;
          if (this.pointer >= this.tape.length) {
            return `Pointer moved out of bounds (right) at command ${this.instructionPointer}.\n`;
          }
        } else if (command === '<') {
          this.pointer -= consecutiveCount;
          if (this.pointer < 0) {
            return `Pointer moved out of bounds (left) at command ${this.instructionPointer}.\n`;
          }
        }
  
        // Skip over the consecutive commands
        this.instructionPointer += consecutiveCount - 1;
      } else {
        // Execute the command normally
        return this.commands[commandIndex]();
      }
    }
  }  

  // Commands mapped to specific functions
  incrementPointer() { if (++this.pointer >= this.tape.length) return `Pointer moved out of bounds (right) at command ${this.instructionPointer}.\n`; }
  decrementPointer() { if (--this.pointer < 0) return `Pointer moved out of bounds (left) at command ${this.instructionPointer}.\n`; }
  incrementCell() { this.tape[this.pointer] = (this.tape[this.pointer] + 1) & 255; } // Overflow protection
  decrementCell() { this.tape[this.pointer] = (this.tape[this.pointer] - 1) & 255; }
  outputCell() {
    const char = String.fromCharCode(this.tape[this.pointer]);
    this.isTapeRecorded && (this.tapeOutput += `    => ${char === '\n' ? '\\n' : char}`);
    const len = this.output.length;
    len > this.maxOutputLength ? this.lenCounter += 1 : this.output += char;
  }
  inputCell() { this.tape[this.pointer] = this.inputIndex < this.input.length ? this.input.charCodeAt(this.inputIndex++) : 0; }
  loopStart() { if (this.tape[this.pointer] === 0) this.instructionPointer = this.bracketMap[this.instructionPointer]; }
  loopEnd() { if (this.tape[this.pointer] !== 0) this.instructionPointer = this.bracketMap[this.instructionPointer] - 1; }
}