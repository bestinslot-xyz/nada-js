export function encode(input: Uint8Array): Uint8Array {
    const output: number[] = [];
    let zeroRun = 0;

    for (let i = 0; i <= input.length; i++) {
        const byte = input[i];

        if (byte === 0x00) {
            zeroRun++;
            if (zeroRun === 255) {
                output.push(0xFF, 255); // encode max run
                zeroRun = 0;
            }
        } else {
            if (zeroRun > 0) {
                if (zeroRun == 1) {
                    output.push(0x00);
                } else if (zeroRun == 2) {
                    output.push(0x00, 0x00);
                } else {
                    output.push(0xFF, zeroRun);
                }
                zeroRun = 0;
            }

            if (byte === 0xFF) {
                const next = input[i + 1];
                if (next === 0xFF) {
                    output.push(0xFF, 0x02);
                    i++; // skip the second 0xFF
                } else {
                    output.push(0xFF, 0x01);
                }
            } else if (byte !== undefined) {
                output.push(byte);
            }
        }
    }

    if (zeroRun > 0) {
        if (zeroRun == 1) {
            output.push(0x00);
        } else if (zeroRun == 2) {
            output.push(0x00, 0x00);
        } else {
            output.push(0xFF, zeroRun);
        }
        zeroRun = 0;
    }

    return Uint8Array.from(output);
}

export function decode(input: Uint8Array): Uint8Array {
    return decode_with_limit(input, Number.MAX_SAFE_INTEGER);
}

export function decode_with_limit(input: Uint8Array, limit: number): Uint8Array {
    const output: number[] = [];

    for (let i = 0; i < input.length; i++) {
        const byte = input[i];

        if (byte === 0xFF) {
            const next = input[++i];
            if (next === 0x00) {
                throw new Error('invalid nada sequence: 0xFF 0x00');
            }

            if (next === undefined) {
                throw new Error('unexpected end of input');
            }

            if (next === 0x01) {
                output.push(0xFF);
            } else if (next === 0x02) {
                output.push(0xFF, 0xFF);
            } else if (next >= 0x03 && next <= 0xFF) {
                for (let j = 0; j < next; j++) {
                    output.push(0x00);
                }
            } else {
                throw new Error(`invalid nada byte: 0x${next.toString(16)}`);
            }
        } else {
            output.push(byte);
        }

        if (output.length > limit) {
            throw new Error(`output length exceeded limit: ${limit}`);
        }
    }

    return Uint8Array.from(output);
}
