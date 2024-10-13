class BF2Interpreter {
  constructor(calculateTapeLength = false) {
    this.code = ""; // BF2 code
    this.input = ""; // Input to the Brainfuck code
    this.tape = new Uint8Array(10); // Memory tape, using Uint8Array for better performance
    this.pointer = 0; // Points to the current memory cell
    this.inputIndex = 0; // Input index
    this.instructionPointer = 0; // To traverse the BF2 code
    this.bracketMap = new Map(); // Precomputed loop positions
    this.defaultTapeLength = 10; // Default tape length if not provided
    this.lengthWarning = false; // To track if length was not defined
    this.calculateTapeLength = calculateTapeLength; // To calculate tape length from %...%
    
    this.stopped = false; // Flag to stop the interpreter
    this.maxOperations = 1000000000; // Limit to avoid infinite loops
    this.operationCount = 0; // Track number of operations
    this.maxOutputLength = 10000;
    this.lenCounter = 0;
    
    // Output buffer
    this.output = "";
    this.outputBuffer = new Uint8Array(this.maxOutputLength);
    this.outputIndex = 0;
    this.bufferTapeOutput = []; // Buffer to store tape output lines
    this.isTapeRecorded = false; // Marks whether the tape is to be recorded or not
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

    const tapeLength = miniInterpreter.tape[0];
    this.tape = new Uint8Array(tapeLength > 0 ? tapeLength : this.defaultTapeLength);
    this.lengthWarning = tapeLength <= 0;

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
        this.bracketMap.set(start, i); // Map the start and end of the loop
        this.bracketMap.set(i, start); // Map the end to the start
      }
    }
    if (stack.length > 0) {
      return `Mismatched '[' at position ${stack.pop()}`;
    }
  }

  // Efficient tape output to minimize redundant operations
  printTape(operation) {
    if (!this.calculateTapeLength) {
      const lineNumber = this.bufferTapeOutput.length + 1;
      const paddedLineNumber = lineNumber.toString().padStart(3, ' ');

      const spaceSeparatedTape = Array.from(this.tape)
        .map((value, index) => (index === this.pointer ? `\u0332${value}` : `${value}`)) // Underline the pointer value
        .join(', ');

      // Add "=> (output)" if the operation is '.'
      const outputSuffix = operation === '.' 
        ? `   => ${this.getReadableOutput(this.tape[this.pointer])}`
        : '';

      this.bufferTapeOutput.push(` ${paddedLineNumber}->   ${operation}   [${spaceSeparatedTape}]${outputSuffix}`);
    }
  }

  // Helper function to convert output into readable string with escape sequences
  getReadableOutput(charCode) {
    const char = String.fromCharCode(charCode);
    switch (char) {
      case '\n': return '\\n';
      case '\t': return '\\t';
      case '\r': return '\\r';
      case '\b': return '\\b';
      case '\f': return '\\f';
      default:
        return /[ -~]/.test(char) ? char : `\\x${charCode.toString(16).padStart(2, '0')}`;
    }
  }

  // Function to stop execution
  stopCode() {
    this.stopped = true;

    this.output += "\nExecution stopped by user.\n";

    this.output += String.fromCharCode.apply(null, this.outputBuffer.subarray(0, this.outputIndex));

    this.lenCounter > 0 && (this.output += `...(${this.lenCounter} more characters)`);
    this.operationCount > this.maxOperations && (this.output += `\n\nExecution stopped: Max operations limit reached (${this.maxOperations}).\n`);

    return { result: this.output, operationCount: this.operationCount, tape: this.bufferTapeOutput};
  }

  // Function to run the Brainfuck code asynchronously
  async run(incomingCode, recordTape) {
    this.isTapeRecorded = recordTape;
    recordTape && (this.maxOperations = 100000);
    this.bufferTapeOutput = []; // Reset buffer
    this.code = incomingCode.replace(/[\s\n]+/g, ''); // Remove whitespaces and newlines

    // Parse tape length before running the main code
    if (!this.calculateTapeLength) {
      this.parseTapeLength();
    } else {
      this.tape = new Uint8Array(this.defaultTapeLength); // Fall back to default if invalid
    }

    // If tape length is not defined, throw warning
    this.lengthWarning && (this.output += "Warning: Tape length not defined. Using default length of 10.\n\n");
    this.output += "--- Output: \n";

    const loopError = this.preprocessLoops(); // Precompute loop positions
    if (loopError) {
      this.output += loopError;
      return { result: this.output, operationCount: this.operationCount, tape: this.bufferTapeOutput};
    }

    while (this.instructionPointer < this.code.length && !this.stopped && this.operationCount <= this.maxOperations) {
      this.operationCount++;
      this.isTapeRecorded && this.printTape(this.instructionPointer === 0 ? ' ' : this.code[this.instructionPointer - 1]);

      const error = this.executeCommand(this.code.charCodeAt(this.instructionPointer));
      if (error) {
        this.output += error;
        break;
      }

      this.instructionPointer++;
    }

    // Convert output buffer to string
    this.isTapeRecorded && this.printTape(this.code[this.instructionPointer - 1]);
    this.output += String.fromCharCode.apply(null, this.outputBuffer.subarray(0, this.outputIndex));

    this.lenCounter > 0 && (this.output += `...(${this.lenCounter} more characters)`);
    this.operationCount > this.maxOperations && (this.output += `\n\nExecution stopped: Max operations limit reached (${this.maxOperations}).\n`);

    // Return the output and operation count
    return {
      result: this.output,
      operationCount: this.operationCount,
      tape: this.bufferTapeOutput
    };
  }


  // Function to execute the commands based on ASCII values
  executeCommand(commandCode) {
    switch (commandCode) {
      case 62: // >
      case 60: // <
      case 43: // +
      case 45: // -
        if (!this.isTapeRecorded) { 
          // Consecutive operations handling with loop unrolling

          let consecutiveCount = 1;
          while (this.code.charCodeAt(this.instructionPointer + consecutiveCount) === commandCode) { // Count consecutive operations
            consecutiveCount++;
            this.operationCount++;
          }
          switch (commandCode) { // Perform the operation
            case 62: // >
              this.pointer += consecutiveCount;
              if (this.pointer >= this.tape.length) return `Pointer moved out of bounds (right) at command ${this.instructionPointer}.\n`;
              break;
            case 60: // <
              this.pointer -= consecutiveCount;
              if (this.pointer < 0) return `Pointer moved out of bounds (left) at command ${this.instructionPointer}.\n`;
              break;
            case 43: // +
              this.tape[this.pointer] = (this.tape[this.pointer] + consecutiveCount) & 255;
              break;
            case 45: // -
              this.tape[this.pointer] = (this.tape[this.pointer] - consecutiveCount) & 255;
              break;
          }
          this.instructionPointer += consecutiveCount - 1;
        } else {
          // diabled loop unrolling for when tape is recorded
          switch (commandCode) {
            case 62: // >
              if (++this.pointer >= this.tape.length) return `Pointer moved out of bounds (right) at command ${this.instructionPointer}.\n`;
              break;
            case 60: // <
              if (--this.pointer < 0) return `Pointer moved out of bounds (left) at command ${this.instructionPointer}.\n`;
              break;
            case 43: // +
              this.tape[this.pointer] = (this.tape[this.pointer] + 1) & 255;
              break;
            case 45: // -
              this.tape[this.pointer] = (this.tape[this.pointer] - 1) & 255;
              break;
          }
        }
        break;
      case 46: // .
        if (this.outputIndex < this.maxOutputLength) {
          this.outputBuffer[this.outputIndex++] = this.tape[this.pointer];
        } else {
          this.lenCounter++;
        }
        break;
      case 44: // ,
        this.tape[this.pointer] = this.inputIndex < this.input.length ? this.input.charCodeAt(this.inputIndex++) : 0;
        break;
      case 91: // [
        if (this.tape[this.pointer] === 0) this.instructionPointer = this.bracketMap.get(this.instructionPointer);
        break;
      case 93: // ]
        if (this.tape[this.pointer] !== 0) this.instructionPointer = this.bracketMap.get(this.instructionPointer) - 1;
        break;
    }
  }
}