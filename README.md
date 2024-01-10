# super-sources [![test](https://github.com/WiseLibs/super-sources/actions/workflows/test.yml/badge.svg)](https://github.com/WiseLibs/super-sources/actions/workflows/test.yml)

This package contains classes for representing pieces of source code, and allows you to print beautiful errors/warnings that display the referenced pieces of source code. Unicode is supported, including the [Supplementary Multilingual Plane](https://en.wikipedia.org/wiki/Plane_(Unicode)#Supplementary_Multilingual_Plane). Windows line terminators (`\r\n`) are also supported.

## Installation

```
npm install super-sources
```

> Requires Node.js v14.x.x or later.

## Usage

```js
const { File, SourceError } = require('super-sources');

const file = new File('example.txt', 'this is a simple file.\nhello worl!\n');
const source = file.at(29, 4); // offset 29, length 4

const error = SourceError.build()
	.error('Misspelling detected')
	.source(source, 'here')
	.note('expected: "world"')
	.note(`received: "${source.string()}"`)
	.done();

assert(error instanceof Error);
assert(error instanceof SourceError);

console.log(error.print({ colors: false }));
```

Result:

```
Error: Misspelling detected
 --> example.txt
  |
2 |   hello worl!
  |         ^^^^
  * expected: "world"
  * received: "worl"
```

# API

## new File(*filename*, *content*)

An object that represents a source file.

```js
const fs = require('fs');

const filename = 'example.txt';
const content = fs.readFileSync(filename, 'utf8');

const file = new File(filename, content);
```

### file.at(*offset*, [*length*]) -> *Source*

Creates a [`Source`](#new-sourcefile-start-end) object, which represents a slice of the source file. If `length` is not provided, it defaults to `1`.

```js
const source = file.at(0);
```

### file.lineNumberAt(*offset*) -> *number*

Returns the line number at the given offset. The first line is `1`.

```js
const lineNumber = file.lineNumberAt(0);

assert(lineNumber === 1);
```

### File properties

- `file.filename`: The filename that was passed to the `File` constructor.
- `file.content`: The content string that was passed to the `File` constructor.

## new Source(*file*, *start*, *end*)

An object that represents a slice of the given [`File`](#new-filefilename-content), from offsets `start` (inclusive) to `end` (exclusive). The length of the slice (`end - start`) must be at least `1`.

```js
const fs = require('fs');

const filename = 'example.txt';
const content = fs.readFileSync(filename, 'utf8');

const file = new File(filename, content);
const source = new Source(file, 0, 1);
```

### source.to(*otherSource*) -> *Source*

Creates a [`Source`](#new-sourcefile-start-end) object that spans the range from this source to another source. A negative or zero-length range will result in a [`RangeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError). Also, both sources must be from the same file.

```js
const source1 = new Source(file, 0, 5);
const source2 = new Source(file, 3, 8);
const result = source1.to(source2);

assert(result.start === 0);
assert(result.end === 8);
```

### source.string() -> *string*

Returns the original source string represented by this object.

```js
const file = new File('example.txt', 'abcdefg');
const source = new Source(2, 4);

assert(source.string() === 'cd');
```

### source.error(*message*, [*helperText*]) -> *ErrorBuilder*

Shorthand for `SourceError.build().error(message).source(source, helperText)`. See the [`ErrorBuilder`](#class-errorbuilder) class for more details.

```js
source.error('Invalid expression').throw();
```

### source.warning(*message*, [*helperText*]) -> *ErrorBuilder*

Shorthand for `SourceError.build().warning(message).source(source, helperText)`. See the [`ErrorBuilder`](#class-errorbuilder) class for more details.

```js
console.warn(source.warning('Invalid expression').done().print());
```

### Source properties

- `source.file`: The [`File`](#new-filefilename-content) that this source came from.
- `source.start`: The offset where this source slice starts (inclusive).
- `source.end`: The offset where this source slice ends (exclusive).

## class SourceError

A subclass of [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error) that can reference [`Source`](#new-sourcefile-start-end) objects, and is capable of printing beautiful error messages containing the source code.

Instead of constructing them manually, you can use the static `SourceError.build()` method to conveniently create a new [`ErrorBuilder`](#class-errorbuilder).

```js
const error = SourceError.build()
	.error('Misspelling detected')
	.source(source, 'here')
	.note('expected: "world"')
	.note(`received: "${source.string()}"`)
	.done();
```

### error.print([*options*]) -> *string*

Returns a string containing a beautifully formatted error message, containing any source code that this error references.

The following options are supported:

- `colors` (boolean)
	* Whether or not the output should be colored (by [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code)). Default: `true`.
- `filenames` (boolean)
	* Whether or not the output should contain the names of the referenced source files. Default: `true`.
- `lineNumbers` (boolean)
	* Whether or not the output should contain the line numbers of the referenced source code. Default: `true`.
- `positions` (boolean)
	* Whether or not the output should highlight the exact positions of the referenced source code. Default: `true`.
- `maxLines` (number)
	* The maximum number of source lines to display (per source snippet) before lines are omitted to save space. Default: `7`.

## class ErrorBuilder

A convenient builder class for making customized [`SourceError`](#class-sourceerror)s.

### builder.error(*message*) -> *this*

Adds an error message to the builder. Any number of error messages can be added.

### builder.warning(*message*) -> *this*

Adds a warning message to the builder. Any number of warning messages can be added.

### builder.source(*source*, [*helperText*]) -> *this*

Adds a [`Source`](#new-sourcefile-start-end) object to the builder. Any number of sources can be added. The added source will be associated with the most recent `.error()` or `.warning()` that was added.

### builder.note(*message*) -> *this*

Adds a note to the builder. Any number of notes can be added. The note will be associated with the most recent `.source()` that was added.

### builder.done() -> *SourceError*

Returns a [`SourceError`](#class-sourceerror) containing all errors, warnings, sources, and notes that were added to this builder.

### builder.throw() -> *throw SourceError*

This is the same as `builder.done()`, but the resulting [`SourceError`](#class-sourceerror) will be immediately thrown.

## License

[MIT](https://github.com/WiseLibs/super-sources/blob/master/LICENSE)
