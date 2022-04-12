/**
 * Signed big integer library
 *
 * BN = digits bytes (le) + neg byte + len byte
 */

#include <stdint.h>
#include <stdlib.h>

#define ENABLE_ASSERTS 0
#define DIGIT_SIZE 32 // 64 requires linker flag -lclang_rt.builtins-wasm32 and increases size > 10K

#if DIGIT_SIZE == 8
    #define BN_LEN 256
    #define bn_digit_t uint8_t
    #define max_t uint64_t
    #define imax_t int64_t
    #define BN_DIGIT_BITS 8
    #define BN_DIGIT_RANGE ((max_t)(256))
#endif

#if DIGIT_SIZE == 16
    #define BN_LEN 128
    #define bn_digit_t uint16_t
    #define max_t uint64_t
    #define imax_t int64_t
    #define BN_DIGIT_BITS 16
    #define BN_DIGIT_RANGE ((max_t)(65536))
#endif

#if DIGIT_SIZE == 32
    #define BN_LEN 64
    #define bn_digit_t uint32_t
    #define max_t uint64_t
    #define imax_t int64_t
    #define BN_DIGIT_BITS 32
    #define BN_DIGIT_RANGE ((max_t)(4294967296))
#endif

#if DIGIT_SIZE == 64
    #define BN_LEN 32
    #define bn_digit_t uint64_t
    #define max_t __uint128_t
    #define imax_t __int128_t
    #define BN_DIGIT_BITS 64
    #define BN_DIGIT_RANGE ((max_t)(4294967296) * (max_t)(4294967296))
#endif

#define bn_neg(x) (((bn_digit_t*)(x))[BN_LEN - 1])
#define bn_len(x) (((bn_digit_t*)(x))[BN_LEN - 2])
#define bn_num(x) (((bn_digit_t*)(x)))

#define bn_is_zero(a) (bn_len(a) == 1 && bn_num(a)[0] == 0)
#define bn_is_neg(a) (bn_neg(a) && !bn_is_zero(a))

typedef bn_digit_t bn_t[BN_LEN];

#define max(x, y) ((x) > (y) ? (x) : (y))

#if ENABLE_ASSERTS
    #define assert(x) { if (!(x)) { exit(1); } }
#else
    #define assert(x) 
#endif

void copy_digits(bn_digit_t* out, const bn_digit_t* in, int len);
void copy_bn(bn_digit_t* out, const bn_digit_t* in);

void bn_unpad(bn_digit_t* a);
void bn_from_digit(bn_digit_t* a, bn_digit_t n);
void bn_from_int(bn_digit_t* a, int64_t n);
__int128_t bn_to_int(const bn_digit_t* a);
int bn_cmp(const bn_digit_t* a, const bn_digit_t* b);
int bn_cmp_digits(const bn_digit_t* a, const bn_digit_t* b);
void bn_add(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b);
void bn_add_digits(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b);
void bn_sub(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b);
void bn_sub_digits(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b);
void bn_sub_digits2(bn_digit_t* out, const bn_digit_t* greater, const bn_digit_t* lesser);
void bn_double(bn_digit_t* out, const bn_digit_t* a);
void bn_half(bn_digit_t* out, const bn_digit_t* a);
void bn_mul_digit(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t n);
