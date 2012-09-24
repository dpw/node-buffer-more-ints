'use strict';

var assert = require("assert");

// JavaScript is numerically challenged
var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

// The maximum contiguous integer that can be held in a IEEE754 double
var MAX_INT = 0x1fffffffffffff;

Buffer.isContiguousInt = function (val) {
    return val <= MAX_INT && val >= -MAX_INT;
};

Buffer.assertContiguousInt = function (val) {
    assert(Buffer.isContiguousInt(val), "number cannot be represented as a contiguous integer");
};

// Check that a value is an integer within the given range
function check_int(val, min, max) {
    assert.ok(typeof(val) == 'number' && val >= min && val <= max && Math.floor(val) === val, "not a number in the required range");
}

Buffer.prototype.readUInt24BE = function (offset, noAssert) {
    return this.readUInt8(offset, noAssert) << 16 | this.readUInt16BE(offset + 1, noAssert);
};

Buffer.prototype.writeUInt24BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffff);
        assert.ok(offset + 3 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeUInt8(val >>> 16, offset, noAssert);
    this.writeUInt16BE(val & 0xffff, offset + 1, noAssert);
};

Buffer.prototype.readUInt40BE = function (offset, noAssert) {
    return (this.readUInt8(offset, noAssert) || 0) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 1, noAssert);
};

Buffer.prototype.writeUInt40BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffff);
        assert.ok(offset + 5 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeUInt8(Math.floor(val * SHIFT_RIGHT_32), offset, noAssert);
    this.writeInt32BE(val & -1, offset + 1, noAssert);
};

Buffer.prototype.readUInt48BE = function (offset, noAssert) {
    return this.readUInt16BE(offset, noAssert) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 2, noAssert);
};

Buffer.prototype.writeUInt48BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffffff);
        assert.ok(offset + 6 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeUInt16BE(Math.floor(val * SHIFT_RIGHT_32), offset, noAssert);
    this.writeInt32BE(val & -1, offset + 2, noAssert);
};

Buffer.prototype.readUInt56BE = function (offset, noAssert) {
    return ((this.readUInt8(offset, noAssert) || 0) << 16 | this.readUInt16BE(offset + 1, noAssert)) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 3, noAssert);
};

Buffer.prototype.writeUInt56BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffffffff);
        assert.ok(offset + 7 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x100000000000000) {
        var hi = Math.floor(val * SHIFT_RIGHT_32);
        this.writeUInt8(hi >>> 16, offset, noAssert);
        this.writeUInt16BE(hi & 0xffff, offset + 1, noAssert);
        this.writeInt32BE(val & -1, offset + 3, noAssert);
    } else {
        // Special case because 2^56-1 gets rounded up to 2^56
        this[offset] = 0xff;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0xff;
    }
};

Buffer.prototype.readUInt64BE = function (offset, noAssert) {
    return this.readUInt32BE(offset, noAssert) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 4, noAssert);
};

Buffer.prototype.writeUInt64BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffffffffff);
        assert.ok(offset + 8 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x10000000000000000) {
        this.writeUInt32BE(Math.floor(val * SHIFT_RIGHT_32), offset, noAssert);
        this.writeInt32BE(val & -1, offset + 4, noAssert);
    } else {
        // Special case because 2^64-1 gets rounded up to 2^64
        this[offset] = 0xff;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0xff;
        this[offset+7] = 0xff;
    }
};


Buffer.prototype.readUInt24LE = function (offset, noAssert) {
    return this.readUInt8(offset + 2, noAssert) << 16 | this.readUInt16LE(offset, noAssert);
};

Buffer.prototype.writeUInt24LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffff);
        assert.ok(offset + 3 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeUInt16LE(val & 0xffff, offset, noAssert);
    this.writeUInt8(val >>> 16, offset + 2, noAssert);
};

Buffer.prototype.readUInt40LE = function (offset, noAssert) {
    return (this.readUInt8(offset + 4, noAssert) || 0) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeUInt40LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffff);
        assert.ok(offset + 5 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeInt32LE(val & -1, offset, noAssert);
    this.writeUInt8(Math.floor(val * SHIFT_RIGHT_32), offset + 4, noAssert);
};

Buffer.prototype.readUInt48LE = function (offset, noAssert) {
    return this.readUInt16LE(offset + 4, noAssert) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeUInt48LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffffff);
        assert.ok(offset + 6 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeInt32LE(val & -1, offset, noAssert);
    this.writeUInt16LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4, noAssert);
};

Buffer.prototype.readUInt56LE = function (offset, noAssert) {
    return ((this.readUInt8(offset + 6, noAssert) || 0) << 16 | this.readUInt16LE(offset + 4, noAssert)) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeUInt56LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffffffff);
        assert.ok(offset + 7 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x100000000000000) {
        this.writeInt32LE(val & -1, offset, noAssert);
        var hi = Math.floor(val * SHIFT_RIGHT_32);
        this.writeUInt16LE(hi & 0xffff, offset + 4, noAssert);
        this.writeUInt8(hi >>> 16, offset + 6, noAssert);
    } else {
        // Special case because 2^56-1 gets rounded up to 2^56
        this[offset] = 0xff;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0xff;
    }
};

Buffer.prototype.readUInt64LE = function (offset, noAssert) {
    return this.readUInt32LE(offset + 4, noAssert) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeUInt64LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, 0, 0xffffffffffffffff);
        assert.ok(offset + 8 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x10000000000000000) {
        this.writeInt32LE(val & -1, offset, noAssert);
        this.writeUInt32LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4, noAssert);
    } else {
        // Special case because 2^64-1 gets rounded up to 2^64
        this[offset] = 0xff;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0xff;
        this[offset+7] = 0xff;
    }
};


Buffer.prototype.readInt24BE = function (offset, noAssert) {
    return (this.readInt8(offset, noAssert) << 16) + this.readUInt16BE(offset + 1, noAssert);
};

Buffer.prototype.writeInt24BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x800000, 0x7fffff);
        assert.ok(offset + 3 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeInt8(val >> 16, offset, noAssert);
    this.writeUInt16BE(val & 0xffff, offset + 1, noAssert);
};

Buffer.prototype.readInt40BE = function (offset, noAssert) {
    return (this.readInt8(offset, noAssert) || 0) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 1, noAssert);
};

Buffer.prototype.writeInt40BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x8000000000, 0x7fffffffff);
        assert.ok(offset + 5 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeInt8(Math.floor(val * SHIFT_RIGHT_32), offset, noAssert);
    this.writeInt32BE(val & -1, offset + 1, noAssert);
};

Buffer.prototype.readInt48BE = function (offset, noAssert) {
    return this.readInt16BE(offset, noAssert) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 2, noAssert);
};

Buffer.prototype.writeInt48BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x800000000000, 0x7fffffffffff);
        assert.ok(offset + 6 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeInt16BE(Math.floor(val * SHIFT_RIGHT_32), offset, noAssert);
    this.writeInt32BE(val & -1, offset + 2, noAssert);
};

Buffer.prototype.readInt56BE = function (offset, noAssert) {
    return (((this.readInt8(offset, noAssert) || 0) << 16) + this.readUInt16BE(offset + 1, noAssert)) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 3, noAssert);
};

Buffer.prototype.writeInt56BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x800000000000000, 0x7fffffffffffff);
        assert.ok(offset + 7 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x80000000000000) {
        var hi = Math.floor(val * SHIFT_RIGHT_32);
        this.writeInt8(hi >> 16, offset, noAssert);
        this.writeUInt16BE(hi & 0xffff, offset + 1, noAssert);
        this.writeInt32BE(val & -1, offset + 3, noAssert);
    } else {
        // Special case because 2^55-1 gets rounded up to 2^55
        this[offset] = 0x7f;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0xff;
    }
};

Buffer.prototype.readInt64BE = function (offset, noAssert) {
    return this.readInt32BE(offset, noAssert) * SHIFT_LEFT_32 + this.readUInt32BE(offset + 4, noAssert);
};

Buffer.prototype.writeInt64BE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x800000000000000000, 0x7fffffffffffffff);
        assert.ok(offset + 8 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x8000000000000000) {
        this.writeInt32BE(Math.floor(val * SHIFT_RIGHT_32), offset, noAssert);
        this.writeInt32BE(val & -1, offset + 4, noAssert);
    } else {
        // Special case because 2^63-1 gets rounded up to 2^63
        this[offset] = 0x7f;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0xff;
        this[offset+7] = 0xff;
    }
};


Buffer.prototype.readInt24LE = function (offset, noAssert) {
    return (this.readInt8(offset + 2, noAssert) << 16) + this.readUInt16LE(offset, noAssert);
};

Buffer.prototype.writeInt24LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x800000, 0x7fffff);
        assert.ok(offset + 3 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeUInt16LE(val & 0xffff, offset, noAssert);
    this.writeInt8(val >> 16, offset + 2, noAssert);
};

Buffer.prototype.readInt40LE = function (offset, noAssert) {
    return (this.readInt8(offset + 4, noAssert) || 0) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeInt40LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x8000000000, 0x7fffffffff);
        assert.ok(offset + 5 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeInt32LE(val & -1, offset, noAssert);
    this.writeInt8(Math.floor(val * SHIFT_RIGHT_32), offset + 4, noAssert);
};

Buffer.prototype.readInt48LE = function (offset, noAssert) {
    return this.readInt16LE(offset + 4, noAssert) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeInt48LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x800000000000, 0x7fffffffffff);
        assert.ok(offset + 6 <= this.length, "attempt to write beyond end of buffer");
    }

    this.writeInt32LE(val & -1, offset, noAssert);
    this.writeInt16LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4, noAssert);
};

Buffer.prototype.readInt56LE = function (offset, noAssert) {
    return (((this.readInt8(offset + 6, noAssert) || 0) << 16) + this.readUInt16LE(offset + 4, noAssert)) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeInt56LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x80000000000000, 0x7fffffffffffff);
        assert.ok(offset + 7 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x80000000000000) {
        this.writeInt32LE(val & -1, offset, noAssert);
        var hi = Math.floor(val * SHIFT_RIGHT_32);
        this.writeUInt16LE(hi & 0xffff, offset + 4, noAssert);
        this.writeInt8(hi >> 16, offset + 6, noAssert);
    } else {
        // Special case because 2^55-1 gets rounded up to 2^55
        this[offset] = 0xff;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0x7f;
    }
};

Buffer.prototype.readInt64LE = function (offset, noAssert) {
    return this.readInt32LE(offset + 4, noAssert) * SHIFT_LEFT_32 + this.readUInt32LE(offset, noAssert);
};

Buffer.prototype.writeInt64LE = function (val, offset, noAssert) {
    if (!noAssert) {
        check_int(val, -0x8000000000000000, 0x7fffffffffffffff);
        assert.ok(offset + 8 <= this.length, "attempt to write beyond end of buffer");
    }

    if (val < 0x8000000000000000) {
        this.writeInt32LE(val & -1, offset, noAssert);
        this.writeInt32LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4, noAssert);
    } else {
        // Special case because 2^55-1 gets rounded up to 2^55
        this[offset] = 0xff;
        this[offset+1] = 0xff;
        this[offset+2] = 0xff;
        this[offset+3] = 0xff;
        this[offset+4] = 0xff;
        this[offset+5] = 0xff;
        this[offset+6] = 0xff;
        this[offset+7] = 0x7f;
    }
};

// Buffer.prototype.read{UInt,Int}8 returns undefined if the offset is
// outside of the buffer, unlike for other widths.  These functions
// make it consistent with the others.
var consistent_readX8 = {
    readUInt8: function (offset, noAssert) {
        return this.readUInt8(offset, noAssert) || 0;
    },
    readInt8: function (offset, noAssert) {
        return this.readInt8(offset, noAssert) || 0;
    }
};

function make_accessor(read, prefix, suffix) {
    var accessors = [false,
                    (read ? consistent_readX8 : Buffer.prototype)[prefix + 8]];

    for (var i = 16; i <= 64; i += 8) {
        accessors.push(Buffer.prototype[prefix + i + suffix]);
    }

    if (read) {
        Buffer.prototype[prefix + suffix] = function (len, offset, noAssert) {
            var reader = accessors[len];
            if (reader) {
                return reader.call(this, offset, noAssert);
            } else {
                throw new Error("Cannot read integer of length " + len);
            }
        };
    } else {
        Buffer.prototype[prefix + suffix] = function (len, val, offset, noAssert) {
            var writer = accessors[len];
            if (writer) {
                return writer.call(this, val, offset, noAssert);
            } else {
                throw new Error("Cannot write integer of length " + len);
            }
        }
    }
}

['UInt', 'Int'].forEach(function (t) {
    ['BE', 'LE'].forEach(function (e) {
        make_accessor(true, "read" + t, e);
        make_accessor(false, "write" + t, e);
    });
});
