'use strict';

// JavaScript is numerically challenged
var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);

// The maximum contiguous integer that can be held in a IEEE754 double
var MAX_INT = 9007199254740991;

// Buffer.prototype.readUInt8 returns undefined if the offset is
// outside of the buffer, unlike the other widths.  This provides
// consistency.
function consistent_readUInt8 (offset, noAssert) {
    return this.readUInt8(offset, noAssert) || 0;
}

Buffer.prototype.readUInt24BE = function (offset, noAssert) {
    return this.readUInt8(offset, noAssert) << 16 | this.readUInt16BE(offset + 1, noAssert);
};

Buffer.prototype.readUInt40BE = function (offset, noAssert) {
    return (this.readUInt8(offset, noAssert) || 0) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 1, noAssert);
};

Buffer.prototype.readUInt48BE = function (offset, noAssert) {
    return this.readUInt16BE(offset, noAssert) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 2, noAssert);
};

Buffer.prototype.readUInt56BE = function (offset, noAssert) {
    var res = ((this.readUInt8(offset, noAssert) || 0) << 16 | this.readUInt16BE(offset + 1, noAssert)) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 3, noAssert);
    if (res <= MAX_INT) {
        return res;
    } else {
        throw new Error("attempt to read integer too large to be safely held in a JS number: " + res);
    }
};

Buffer.prototype.readUInt64BE = function (offset, noAssert) {
    var res = this.readUInt32BE(offset, noAssert) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 4, noAssert);
    if (res <= MAX_INT) {
        return res;
    } else {
        throw new Error("attempt to read integer too large to be safely held in a JS number: " + res);
    }
};

var UIntBE_readers = [
    false,
    consistent_readUInt8,
    Buffer.prototype.readUInt16BE,
    Buffer.prototype.readUInt24BE,
    Buffer.prototype.readUInt32BE,
    Buffer.prototype.readUInt40BE,
    Buffer.prototype.readUInt48BE,
    Buffer.prototype.readUInt56BE,
    Buffer.prototype.readUInt64BE
];

Buffer.prototype.readUIntBE = function (len, offset, noAssert) {
    var reader = UIntBE_readers[len];
    if (reader) {
        return reader.call(this, offset, noAssert);
    } else {
        throw new Error("Cannot read integer of length " + len);
    }
};


Buffer.prototype.readUInt24LE = function (offset, noAssert) {
    return this.readUInt8(offset + 2, noAssert) << 16 | this.readUInt16LE(offset, noAssert);
};

Buffer.prototype.readUInt40LE = function (offset, noAssert) {
    return (this.readUInt8(offset + 4, noAssert) || 0) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.readUInt48LE = function (offset, noAssert) {
    return this.readUInt16LE(offset + 4, noAssert) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.readUInt56LE = function (offset, noAssert) {
    var res = ((this.readUInt8(offset + 6, noAssert) || 0) << 16 | this.readUInt16LE(offset + 4, noAssert)) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
    if (res <= MAX_INT) {
        return res;
    } else {
        throw new Error("attempt to read integer too large to be safely held in a JS number: " + res);
    }
};

Buffer.prototype.readUInt64LE = function (offset, noAssert) {
    var res = this.readUInt32LE(offset + 4, noAssert) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
    if (res <= MAX_INT) {
        return res;
    } else {
        throw new Error("attempt to read integer too large to be safely held in a JS number: " + res);
    }
};

var UIntLE_readers = [
    false,
    consistent_readUInt8,
    Buffer.prototype.readUInt16LE,
    Buffer.prototype.readUInt24LE,
    Buffer.prototype.readUInt32LE,
    Buffer.prototype.readUInt40LE,
    Buffer.prototype.readUInt48LE,
    Buffer.prototype.readUInt56LE,
    Buffer.prototype.readUInt64LE
];

Buffer.prototype.readUIntLE = function (len, offset, noAssert) {
    var reader = UIntLE_readers[len];
    if (reader) {
        return reader.call(this, offset, noAssert);
    } else {
        throw new Error("Cannot read integer of length " + len);
    }
};
