import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { encode, decode } from '../src/nada';

// roundtrip helper
function roundtrip(bytes: number[]) {
  const original = Uint8Array.from(bytes);
  const encoded = encode(original);
  const decoded = decode(encoded);
  assert.equal(decoded, original);
}

test('empty input', () => {
  roundtrip([]);
});

test('no zeros or FFs', () => {
  roundtrip([1, 2, 3, 4, 5]);
});

test('single 0x00', () => {
  roundtrip([0]);
});

test('long zero run', () => {
  roundtrip(Array(100).fill(0));
});

test('single 0xFF', () => {
  roundtrip([0xFF]);
});

test('double 0xFF', () => {
  roundtrip([0xFF, 0xFF]);
});

test('mixed sequence', () => {
  roundtrip([1, 0, 0, 0, 2, 0xFF, 0xFF, 0xFF, 3, 0]);
});

test('long zero run with FFs', () => {
  roundtrip([0, 0, 0, 0, 0xFF, 0xFF, 0xFF, 0]);
});

test('long zero run with FFs and other data', () => {
  roundtrip([0, 0, 0, 0, 1, 2, 3, 0xFF, 0xFF, 0]);
});

test.run();