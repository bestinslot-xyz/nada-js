# nada

Compression-focused encoding for zero-heavy Solidity calldata and bytecode.

`nada` provides an efficient way to encode and decode byte arrays where runs of `0x00` are replaced with a compact marker (`0xFF`) followed by the length of the run. This is particularly useful for reducing the size of calldata and bytecode in environments like Ethereum.

## How it Works

- `0xFF 0x00` is a reserved sequence
- `0xFF 0x01` encodes a single `0xFF`
- `0xFF 0x02` encodes a double `0xFF`
- `0xFF N` (3 ≤ N ≤ 255) encodes `N` zero bytes
- All other bytes are passed through unchanged

This encoding helps reduce the size of sequences with a high proportion of zero bytes, which are common in Solidity calldata and bytecode.

### Example

| Input                          | Encoded                          |
|--------------------------------|----------------------------------|
| `[0x00, 0x00, 0x02, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0xFF]`    | `[0x00, 0x00, 0x02, 0xFF, 0x02, 0xFF, 0x04, 0xFF, 0x01]` |


## Installation

To add `nada` to your project, use

```bash
> npm add @bestinslot/nada
```

### Usage
Here is a simple example of how to use the encode and decode functions:

```javascript
import {encode, decode} from "@bestinslot/nada";

let array = new Uint8Array([1, 0, 0, 0, 255, 0, 0]);

let encoded = encode(array);
let decoded = decode(encoded);
```

`decode` returns an error if the input ends unexpectedly, such as when a `0xFF` marker is found without a following run length byte, indicating incomplete or malformed encoded data. It also returns an error if the reserved sequence `0xFF00` is encountered.

### License

Apache License, Version 2.0
