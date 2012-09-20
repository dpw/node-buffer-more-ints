# buffer-more-ints: Add support for more integer widths to Buffer

Node's Buffer only supports reading and writing integers of a limited
range of widths.  This module extends Buffer with support for more
widths, so that integers from 1 to 8 bytes (64 bits) can be accessed.
The functions provided follow the same naming conventions and take the
same arguments as the standard ones on Buffer:

    $ node
    > require('buffer-more-ints')
    {}
    > new Buffer("0000deadbeef0000", "hex").readInt64BE(0).toString(16)
    'deadbeef0000'

buffer-more-ints also adds functions `readIntBE`, `writeIntBE`, and
their LE and UInt counterparts, which take an initial argument giving
the width of the integer in bytes:

    > var b = new Buffer(3);
    > b.writeIntLE(3, -123456, 0);
    > b.toString('hex')
    'c01dfe'
    > b.readIntLE(3, 0);
    -123456

The functions added by buffer-more-ints are all implemented in terms
of the core Buffer functions.  Part way through writing the code, I
discovered that node.js currently implements those in JavaScript, so
this doesn't lead to performance benefits.  But should node ever
switch to implementing its Buffer operations natively, this
implementation will get a speed up.

## Limitations

As JavaScript uses IEEE754 doubles for numbers, the contiguous range
of integers it can represent is [-2^53 - 1, 2^53 - 1].  So only
integer widths up to 6 bytes or 48 bits can be safely read and
written.  The buffer-more-ints functions will throw and exception if
you try to read or write an integer outside this range.  The
consequence of this is that you can't read or write 7 or 8 byte
integers with their higher bits set (or clear for negative numbers).

There's currently no way to avoid this behaviour.  I'm still making up
my mind about what the default behaviour should be, and how the
alternative behaviour should be selected (another flag argument?
separate functions?).

