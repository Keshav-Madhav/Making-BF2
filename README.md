# BF2 Interpreter

BF2 is an extension of the Brainfuck programming language that uses the conventional brainfuck commands but enhances it by adding additional commands as well as being compiled into javascript. It retains the core Brainfuck functionality while adding flexibility for memory management and other features.
[Live Link](keshav-madhav.github.io/Making-BF2/)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
  - [Tape Length Definition](#tape-length-definition)
  - [Brainfuck Command Support](#brainfuck-command-support)
- [Usage](#usage)
- [Example Codes](#example-codes)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Introduction

Brainfuck is an esoteric programming language created in 1993 by Urban Müller. It operates on a simple model consisting of an array of memory cells (or "tape") and a pointer that can move left or right across the cells. The language has only eight commands, making it minimalistic yet Turing complete. While Brainfuck is known for its challenging syntax and difficulty in writing complex programs, it serves as an interesting exercise in low-level programming concepts.

BF2 is a remake of the original Brainfuck concept, implemented in JavaScript with enhancements for better usability and flexibility. This interpreter aims to maintain the core simplicity and challenge of Brainfuck while introducing features that improve memory management and expand the language's capabilities. With BF2, users can explore the intriguing world of Brainfuck programming in a more accessible and modern environment.


## Features

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

| Command | Description                                                      |
|---------|------------------------------------------------------------------|
| `>`     | Move the pointer to the right.                                   |
| `<`     | Move the pointer to the left.                                    |
| `+`     | Increment the memory cell at the pointer.                        |
| `-`     | Decrement the memory cell at the pointer.                        |
| `.`     | Output the ASCII value at the memory cell.                       |
| `,`     | Input a character and store its ASCII value in the memory cell.  |
| `[`     | Jump past the matching `]` if the cell at the pointer is 0.      |
| `]`     | Jump back to the matching `[` if the cell at the pointer is not 0.|
| `%`     | Defines starting and ending of a segment of the code             |

## Example Codes

#### 1. Print "Hello, World!"

This Brainfuck code prints "Hello, World!" to the output.

```bf
%+++++++% ++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
```

#### 2. Sum of two numbers (max sum can be 9)"

This code takes a single character input and prints "Hello, {input}".

```bf
++       c0 = 2
> +++++  c1 = 5

[< + > -] ++++ ++++ [< +++ +++ > -] < .
```

#### 3. Define Tape Length of 10

This code defines the tape length to 10 using the % symbol.

```bf
%++++++++++% >+.
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


## Error Handling

The BF2 interpreter includes error handling for the following cases:

1. **Mismatched Brackets**: If `[` and `]` are mismatched, an error will be thrown.
2. **Pointer Out of Bounds**: If the pointer moves beyond the tape length, an error will occur.
3. **Missing/Invalid Tape Length**: If no tape length is defined or if the definition is invalid, the tape defaults to length 1, and a warning is displayed.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push your branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.
