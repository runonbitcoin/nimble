_EXPORTS = sha256

EXPORTS = $(_EXPORTS:%=--export=%)

CLANG = ../wasi-sdk-14.0/bin/clang
WASM_LD = ../wasi-sdk-14.0/bin/wasm-ld

CFLAGS = -c -Oz -flto --target=wasm32-unknown-wasi -Wall
LFLAGS = --lto-O3 --import-memory --no-entry -L../wasi-sdk-14.0/share/wasi-sysroot/lib/wasm32-wasi -lc

default: sha256.wasm.base64

sha256.wasm.base64: sha256.wasm
	node -e "process.stdout.write(require('fs').readFileSync('sha256.wasm').toString('base64'))" > sha256.wasm.base64

sha256.wasm: sha256.o
	$(WASM_LD) $(LFLAGS) --global-base=2621440 -z stack-size=1245184 $(EXPORTS) -o sha256.wasm sha256.o
	npx wasm-opt -Oz sha256.wasm -o sha256.wasm

sha256.o: sha256.c
	$(CLANG) $(CFLAGS) sha256.c -o sha256.o

clean:
	rm -f sha256.o
	rm -f sha256.wasm
	rm -f sha256.wasm.base64
