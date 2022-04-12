_EXPORTS = sha1

EXPORTS = $(_EXPORTS:%=--export=%)

CLANG = ../wasi-sdk-14.0/bin/clang
WASM_LD = ../wasi-sdk-14.0/bin/wasm-ld

CFLAGS = -c -Oz -flto --target=wasm32-unknown-wasi -Wall
LFLAGS = --lto-O3 --import-memory --no-entry -L../wasi-sdk-14.0/share/wasi-sysroot/lib/wasm32-wasi -lc

default: sha1.wasm.base64

sha1.wasm.base64: sha1.wasm
	node -e "process.stdout.write(require('fs').readFileSync('sha1.wasm').toString('base64'))" > sha1.wasm.base64

sha1.wasm: sha1.o
	$(WASM_LD) $(LFLAGS) --global-base=1310720 -z stack-size=1245184 $(EXPORTS) -o sha1.wasm sha1.o
	npx wasm-opt -Oz sha1.wasm -o sha1.wasm

sha1.o: sha1.c
	$(CLANG) $(CFLAGS) sha1.c -o sha1.o

clean:
	rm -f sha1.o
	rm -f sha1.wasm
	rm -f sha1.wasm.base64
