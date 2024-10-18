# BF2 Interpreter

BF2 is an extension of the Brainfuck programming language that uses the conventional brainfuck commands but enhances it by adding additional commands as well as being compiled into javascript. It retains the core Brainfuck functionality while adding flexibility for memory management and other features.
[Live Link](https://keshav-madhav.github.io/Making-BF2/)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
  - [Tape Terminal](#tape-terminal)
  - [Static Input Array](#static-input-array)
  - [WhiteSpace and comment support](#white-space-and-comment-support)
  - [Tape Length Definition](#tape-length-definition)
  - [Brainfuck Command Support](#brainfuck-command-support)
- [Usage](#usage)
- [Example Codes](#example-codes)
- [Error Handling](#error-handling)
- [Optimizations](#optimizations)
- [Contributing](#contributing)

## Introduction

Brainfuck is an esoteric programming language created in 1993 by Urban Müller. It operates on a simple model consisting of an array of memory cells (or "tape") and a pointer that can move left or right across the cells. The language has only eight commands, making it minimalistic yet Turing complete. While Brainfuck is known for its challenging syntax and difficulty in writing complex programs, it serves as an interesting exercise in low-level programming concepts.

BF2 is a remake of the original Brainfuck concept, implemented in JavaScript with enhancements for better usability and flexibility. This interpreter aims to maintain the core simplicity and challenge of Brainfuck while introducing features that improve memory management and expand the language's capabilities. With BF2, users can explore the intriguing world of Brainfuck programming in a more accessible and modern environment.


## Features

### Tape Terminal

Tape terminal is an array of strings that will be returned after the brainfuck code is interpreted. This useful for debugging the code as it provides insight into the current pointer, memory updation and allocation. The run function takes a boolean to determine whether the tape will be returned as it is a performance intensive action. If tape terminal is true, certain optimization techniques such as loop unrolling are stopped. Default is false meaning tape will not be recorded and performance will be optimal.
The strings in tape array is formatted in a terminal style to provide feedback to the user showing exactly what changes are happening in the tape. This includes showing operation by operation where the pointer is, what if the calue of cells, and what is the output at that operation. Each operation's tape is a new string the array and is best displayed by joining with ```'\n'```.

### Static Input Array

Brainfuck2 supports a static array defined at the end of the code which is used to pass the inputs to the code. This array is parsed before the code is run to get the inputs and then appropirately assign them to the input symbol during runtime. Each input takes on the value from the array one by one, meaning the first input will take the first number of the array and second will take the second number. If there are more numbers than the elements in array, they array wraps around, so an array with single element can be the input for all commas of the code.
This array is defined by encompassing space seperated number between ```(``` and ```)```. For Eg: ```(3 4 20)```.

#### Syntax

```bf
++,++ (30)
```
- Cell0 will have the value of 1+1+30+1+1 = 34

```bf
,>,>, (30 22)
```
- Cell0 = 30, Cell1 = 22, Cell2 = 30

### White-Space and comment Support

Due to the compiler being built in javascript, an easy to implement easy of life feature has been inplemented which removes whitespaces and new/next lines. This allows to make easier to read brainfuck code which can be written out spread over multiple lines and indentation.
Comments are supported aswell as any character other than the reserved characters are removed/ignored.

### Tape Length Definition

In BF2, tape length can be specified using the `%` symbol. The Brainfuck code between the first two `%` symbols is executed to determine the tape length.

#### Syntax

```bf
%Brainfuck-code-for-tape-length%
```

- Example: `%+++++%` will set the tape length to 5.
- If no tape length is provided, the tape defaults to length 10, and a warning is thrown.

### Brainfuck Command Support

BF2 standard Brainfuck commands and new commands:

| Command | Description                                                                              |
|---------|------------------------------------------------------------------------------------------|
| `>`     | Move the pointer to the right.                                                           |
| `<`     | Move the pointer to the left.                                                            |
| `+`     | Increment the memory cell at the pointer.                                                |
| `-`     | Decrement the memory cell at the pointer.                                                |
| `.`     | Output the ASCII value at the memory cell.                                               |
| `,`     | Input a character and store its ASCII value in the memory cell.                          |
| `[`     | Jump past the matching `]` if the cell at the pointer is 0.                              |
| `]`     | Jump back to the matching `[` if the cell at the pointer is not 0.                       |
| `%`     | Defines starting and ending of a segment of the code                                     |
| `()`    | Used to wrap numbers in a [static array](#static-input-array) to predefine inputs        |

## Example Codes

#### 1. Print "Hello, World!"

This Brainfuck code prints "Hello, World!" to the output.

```bf
%+++++++% ++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
```

#### 2. Sum of two numbers (max sum can be 9)"

This code takes two numbers as inputs and returns the sum of them upto max of 9.

```bf
,      
> , 

[< + > -] ++++ ++++ [< +++ +++ > -] < .

(4 5)
```

#### 3. Define Tape Length

- This code defines the tape length to 10 using the % symbol.
```bf
%++++++++++% >+.
```

- This code uses the input to make the tape length defination easier
```bf
%,(20)% ++
```

#### 4. Print Numbers Between 1 and 10

This code prints the numbers from 1 to 10, each followed by a newline.

```bf
+++++++++++++++++++++++++++++++++++++++++++++++++>
++++++++++>
+++++++++[<<.+>.>-]
+++++++++[<<->>-]
<<.-.>.
```

#### 5. Infinite loop (for performance testing)

This code prints the period character ```.``` infinitely until the code automatically terminates or the user stops the code execution.

```bf
+++++++++++++++++++++++++++++++++++++++++++++[+.-]
```


## Error Handling

The BF2 interpreter includes error handling for the following cases:

1. **Mismatched Brackets**: If `[` and `]` are mismatched, an error will be thrown.
2. **Pointer Out of Bounds**: If the pointer moves beyond the tape length, an error will occur.
3. **Missing/Invalid Tape Length**: If no tape length is defined or if the definition is invalid, the tape defaults to length 10, and a warning is displayed.
4. **Max Operations Reached(1,000,000,000)**: If the code runs for more than a billion operations, the code is terminated with max operations error. A basic infinite loop(```+[+.-]```) takes 12seconds to reach a billion operations.

## Optimizations

The BF2 Interpreter has undergone several significant optimizations to improve performance and efficiency:

1. **Command Mapping for Performance**:
   - Reintroduced the `switch` statement for command execution to allow for greater flexibility and readability.
   - This change improves clarity in the interpreter while maintaining good performance, as JavaScript engines optimize `switch` statements effectively for small, predictable cases.

2. **Loop Unrolling Optimization**:
   - The interpreter now optimizes consecutive commands like `+`, `-`, `>`, and `<`. Instead of executing them one by one, the interpreter counts consecutive occurrences and applies the command multiple times in a single step. This reduces the number of iterations, significantly improving performance for repetitive operations.

3. **Precompiled Bracket Optimization**:
   - Implemented a `preprocessLoops` method to build a `bracketMap` that stores matching loop positions.
   - This allows for O(1) time complexity when jumping between matching brackets, significantly speeding up execution for nested loops.

4. **Optimized Tape Length Calculation**:
   - Tape length is calculated only once before execution using the parseTapeLength method, reducing the overhead during runtime. If the length is defined by the code (via %...% syntax), the interpreter evaluates it before the main code is run, ensuring proper memory allocation from the start.

5. **Output and TapeOutput Buffer Optimization**:
   - Changed both `output` and `tapeOutput` from string-based to buffer-based, reducing the overhead of repeated string concatenations.
   - This massively improved performance, with a **466500% speed increase** for operations requiring large amounts of output or tape state recording.

6. **Output Length Limitation**:
   - Implemented a `maxOutputLength` limit to crop the result and prevent out-of-memory errors in browser environments.
   - This optimization ensures that extremely large outputs don't crash the interpreter or the browser, improving reliability for long-running or output-heavy programs.

Some other minor optimizations, such as `maxOperations` to prevent infinite loops, bitwise AND operation (`& 255`) to handle cell value overflow, and the `run` method being asynchronous, are also implemented. 
These optimizations result in a significantly more efficient, flexible, and robust BF2 interpreter. 
In the most basic test of running an infinite loop of `+[+.-]`, the latest instance of the code can run:
- 10,000,000 operations in less than ~80ms (without tape output) //old record was 10,000,000 in ~130ms
-    100,000 operations in less than ~850ms (with tape output) //old record was 100,000 in ~424106ms

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push your branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

Secret Message
```bf
%+++++++%++++++++++[>++++++++>++++++++++>+++>++++++++++++>++++>++++++<<<<<<-]>++++.>++++.-------.+++++++++++++.---.>++.>+.<<++++.>>----.<.<---------.+++++++++.>>---.<.<------------.+++++.---.--.++++++++.--.+++++.-------.>.<++++++++.>>+++.-.<.<--.>>+++++.<.<-----------.>>-------.<<-.++++++++.+++++.--------.>>+++.<<---.++++++++.>.<--.+++++.>>-.<<---------.>>--.--.++.<<.>>++.<<.>>--.>++++++.<<.<<--.>.----.+++++++++++..>>+++++++.<.<-----------.>>---------..++.<<++++.--.++++++.--------.>>++.<<++++.>.<++++.>>.<.>>>.---------.
```
