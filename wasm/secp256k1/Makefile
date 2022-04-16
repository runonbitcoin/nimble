_BN_EXPORTS = bn_unpad bn_cmp bn_cmp_digits bn_from_digit copy_digits copy_bn bn_sub bn_sub_digits bn_sub_digits2 bn_add bn_double bn_half bn_mul_digit
_BN2_EXPORTS = bn_mul bn_sq bn_div_digit bn_div_rem bn_inv_mod_barrett bn_precompute_barrett_factor bn_mod_barrett bn_pow_mod_barrett
_SECP256K1_EXPORTS = secp256k1_init pt_add pt_mul g_mul decompress_y
_ECDSA_EXPORTS = ecdsa_init ecdsa_sign ecdsa_verify validate_point

BN_EXPORTS = $(_BN_EXPORTS:%=--export=%)
BN2_EXPORTS = $(_BN2_EXPORTS:%=--export=%)
SECP256K1_EXPORTS = $(_SECP256K1_EXPORTS:%=--export=%)
ECDSA_EXPORTS = $(_ECDSA_EXPORTS:%=--export=%)

CLANG = ../wasi-sdk-14.0/bin/clang
WASM_LD = ../wasi-sdk-14.0/bin/wasm-ld

CFLAGS = -c -O3 -flto --target=wasm32-unknown-wasi -Wall -fno-builtin
LFLAGS = --lto-O3 --import-memory --no-entry --allow-undefined

default: bn.wasm.base64 bn2.wasm.base64 secp256k1.wasm.base64 ecdsa.wasm.base64

bn.wasm.base64: bn.wasm
	node -e "process.stdout.write(require('fs').readFileSync('bn.wasm').toString('base64'))" > bn.wasm.base64

bn2.wasm.base64: bn2.wasm
	node -e "process.stdout.write(require('fs').readFileSync('bn2.wasm').toString('base64'))" > bn2.wasm.base64

secp256k1.wasm.base64: secp256k1.wasm
	node -e "process.stdout.write(require('fs').readFileSync('secp256k1.wasm').toString('base64'))" > secp256k1.wasm.base64
	
ecdsa.wasm.base64: ecdsa.wasm
	node -e "process.stdout.write(require('fs').readFileSync('ecdsa.wasm').toString('base64'))" > ecdsa.wasm.base64

bn.wasm: bn.o
	$(WASM_LD) $(LFLAGS) --global-base=0 -z stack-size=1245184 $(BN_EXPORTS) -o bn.wasm bn.o
	npx wasm-opt -O4 bn.wasm -o bn.wasm

bn2.wasm: bn2.o
	$(WASM_LD) $(LFLAGS) --global-base=1310720 -z stack-size=1245184 $(BN2_EXPORTS) -o bn2.wasm bn2.o
	npx wasm-opt -O4 bn2.wasm -o bn2.wasm

secp256k1.wasm: secp256k1.o
	$(WASM_LD) $(LFLAGS) --global-base=2621440 -z stack-size=1245184 $(SECP256K1_EXPORTS) -o secp256k1.wasm secp256k1.o
	npx wasm-opt -O4 secp256k1.wasm -o secp256k1.wasm

ecdsa.wasm: ecdsa.o
	$(WASM_LD) $(LFLAGS) --global-base=3932160 -z stack-size=1245184 $(ECDSA_EXPORTS) -o ecdsa.wasm ecdsa.o
	npx wasm-opt -O4 ecdsa.wasm -o ecdsa.wasm

bn.o: bn.c bn.h
	$(CLANG) $(CFLAGS) bn.c -o bn.o
	
bn2.o: bn2.c bn2.h bn.h
	$(CLANG) $(CFLAGS) bn2.c -o bn2.o

secp256k1.o: secp256k1.c secp256k1.h bn.h
	$(CLANG) $(CFLAGS) secp256k1.c -o secp256k1.o

ecdsa.o: ecdsa.c ecdsa.h bn.h secp256k1.h
	$(CLANG) $(CFLAGS) ecdsa.c -o ecdsa.o

test: test-bn test-secp256k1

test-bn: bn-test
	./bn-test

test-secp256k1: secp256k1-test
	./secp256k1-test

bn-test: bn-test.c bn.c bn.h bn2.c bn2.h
	gcc -O4 -o bn-test bn-test.c bn.c bn2.c -lm

secp256k1-test: secp256k1-test.c secp256k1.c secp256k1.h ecdsa.c ecdsa.h bn.c bn.h bn2.c bn2.h
	gcc -O4 -o secp256k1-test secp256k1-test.c secp256k1.c ecdsa.c bn.c bn2.c -lm

clean:
	rm -f bn.wasm
	rm -f bn.wasm.base64
	rm -f bn2.wasm
	rm -f bn2.wasm.base64
	rm -f secp256k1.wasm
	rm -f secp256k1.wasm.base64
	rm -f ecdsa.wasm
	rm -f ecdsa.wasm.base64
	rm -f *.o
	rm -f ./bn-test
	rm -f ./secp256k1-test
