# Dispenser

Dispenser is designed to be used by other Discord servers, so I don't recommend
self-hosting, unless you really have a need to.

# FAQ

## How to use

The Node and Bun versions don't function yet, so use Deno. Dispenser will be
remain Deno-oriented. It's better to make a systemd service for it, rather using
a shell script, but since there are no guides on how to do that now, try running
`start.sh`.

## How to test

The test cases haven't been written yet, but they will be in `test/` and be
written for Deno and Bun.
