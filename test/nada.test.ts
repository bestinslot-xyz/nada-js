import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { encode, decode, decode_with_limit } from '../src/nada';

// roundtrip helper
function roundtrip(bytes: number[]) {
  const original = Uint8Array.from(bytes);
  const encoded = encode(original);
  const decoded = decode(encoded);
  assert.equal(decoded, original);
}

function roundtrip_with_limit(bytes: number[], limit: number) {
  const original = Uint8Array.from(bytes);
  const encoded = encode(original);
  const decoded = decode_with_limit(encoded, limit);
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

test('long zero run with FFs and other data, limit 10', () => {
  roundtrip_with_limit([0, 0, 0, 0, 1, 2, 3, 0xFF, 0xFF, 0], 10);
});

test('reserved sequence 0xff00', () => {
  // check error is thrown
  assert.throws(function () {
    decode(Uint8Array.from([0, 0, 0, 0, 1, 2, 3, 0xFF, 0]));
  }, /invalid nada sequence: 0xFF 0x00/);
});

test('last byte is ff', () => {
  // check error is thrown
  assert.throws(function () {
    decode(Uint8Array.from([0xFF]));
  }, /unexpected end of input/);
});

test('reached limit', () => {
  // check error is thrown
  assert.throws(function () {
    decode_with_limit(Uint8Array.from([0, 0xFF, 0xFF, 0]), 9);
  }, /output length exceeded limit: 9/);
});


test.run();