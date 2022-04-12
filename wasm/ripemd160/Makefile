_EXPORTS = ripemd160

EXPORTS = $(_EXPORTS:%=--export=%)

CLANG = ../wasi-sdk-14.0/bin/clang
WASM_LD = ../wasi-sdk-14.0/bin/wasm-ld

CFLAGS = -c -Os -flto --target=wasm32-unknown-wasi -Wall
LFLAGS = --lto-O3 --import-memory --no-entry -L../wasi-sdk-14.0/share/wasi-sysroot/lib/wasm32-wasi -lc

default: ripemd160.wasm.base64

ripemd160.wasm.base64: ripemd160.wasm
	node -e "process.stdout.write(require('fs').readFileSync('ripemd160.wasm').toString('base64'))" > ripemd160.wasm.base64

ripemd160.wasm: ripemd160.o
	$(WASM_LD) $(LFLAGS) --global-base=0 -z stack-size=1245184 $(EXPORTS) -o ripemd160.wasm ripemd160.o
	npx wasm-opt -Os ripemd160.wasm -o ripemd160.wasm

ripemd160.o: ripemd160.c
	$(CLANG) $(CFLAGS) ripemd160.c -o ripemd160.o

clean:
	rm -f ripemd160.o
	rm -f ripemd160.wasm
	rm -f ripemd160.wasm.base64
