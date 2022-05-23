#include "bn.h"

void bn_mul(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b);

int bn_div_digit(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t n);
int bn_div_rem(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b, bn_digit_t* rem);
void bn_inv_mod_barrett(bn_digit_t* bn_out, const bn_digit_t* bn_a, const bn_digit_t* bn_n, const bn_digit_t* bn_n_barret_factor);

void bn_precompute_barrett_factor(bn_digit_t* bn_out, const bn_digit_t* bn_n);
void bn_mod_barrett(bn_digit_t* bn_out, const bn_digit_t* bn_x, const bn_digit_t* bn_n, const bn_digit_t* bn_factor);

void bn_pow_mod_barrett(bn_digit_t* bn_out, const bn_digit_t* bn_x, const bn_digit_t* bn_y, const bn_digit_t* bn_n, const bn_digit_t* bn_n_barret_factor);

void bn_sq(bn_digit_t* out, const bn_digit_t* x);