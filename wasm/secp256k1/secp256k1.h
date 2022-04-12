#include "bn.h"

#define PT_LEN (BN_LEN * 2)
#define JAC_LEN (BN_LEN * 3)

typedef bn_digit_t pt_t[PT_LEN];
typedef bn_digit_t jac_t[JAC_LEN];

#define pt_x(a) ((bn_digit_t*)a)
#define pt_y(a) ((bn_digit_t*)(a) + BN_LEN)
#define jac_x(a) ((bn_digit_t*)a)
#define jac_y(a) ((bn_digit_t*)(a) + BN_LEN)
#define jac_z(a) ((bn_digit_t*)(a) + BN_LEN * 2)

void secp256k1_init(unsigned long memory_start);
void pt_add(bn_digit_t* pt_out, const bn_digit_t* pt_a, const bn_digit_t* pt_b);
void pt_mul(bn_digit_t* pt_out, const bn_digit_t* pt_a, const bn_digit_t* bn_n);
void g_mul(bn_digit_t* pt_out, const bn_digit_t* bn_n);
void decompress_y(bn_digit_t* bn_y, const bn_digit_t* bn_x, bn_digit_t prefix);
