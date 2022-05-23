#include "bn2.h"

#define BARRET_SHIFT (256 * 2 / BN_DIGIT_BITS)

int bn_div_digit(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t n) {
    if (n == 0) {
        return 1;
    }
    max_t r = 0;
    bn_len(out) = bn_len(a);
    bn_neg(out) = bn_neg(a);
    for (int i = bn_len(a) - 1; i >= 0; i--) {
        max_t total = (r << BN_DIGIT_BITS) + bn_num(a)[i];
        bn_num(out)[i] = total / n;
        r = total % n;
    }
    bn_unpad(out);
    return 0;
}

int bn_div_rem(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b, bn_digit_t* rem) {
    int n = bn_len(b);
    int m = bn_len(a) - n;

    bn_digit_t b_hob = bn_num(b)[n - 1];
    if (b_hob == 0 || n == 0) {
        return 1;
    }

    int cmp = bn_cmp_digits(a, b);

    if (cmp < 0) {
        if (rem) {
            copy_bn(rem, a);
        }
        bn_from_digit(out, 0);
        return 0;
    }

    if (cmp == 0) {
        bn_digit_t neg = bn_neg(a) ^ bn_neg(b);
        bn_from_digit(out, 1);
        bn_neg(out) = neg;
        if (rem) {
            bn_from_digit(rem, 0);
        }
        return 0;
    }

    // Based on Algorithm D in 4.3.1 of The Art of Computer Programming Vol 2 by Knuth

    // D1 - Normalize
    bn_t numer, denom;
    bn_digit_t d = (bn_digit_t)((max_t)BN_DIGIT_RANGE / ((max_t)(b_hob) + 1));
    bn_mul_digit(numer, a, d);
    bn_mul_digit(denom, b, d);
    if (bn_len(numer) == bn_len(a)) {
        bn_num(numer)[bn_len(numer)] = 0;
        bn_len(numer) += 1;
    }
    bn_neg(numer) = 0;
    bn_neg(denom) = 0;

    // D2 - Initialize j
    int j = m;

    bn_len(out) = m + 1;

    bn_t remainder;

    do {
        // D3 - Calculate q_hat
        max_t top = ((max_t)bn_num(numer)[j + n] << BN_DIGIT_BITS) + (max_t)bn_num(numer)[j + n - 1];
        max_t bot = (max_t)bn_num(denom)[n - 1];
        max_t q_hat = top / bot;
        max_t r_hat = top % bot;
        do {
            max_t x = q_hat * (max_t)bn_num(denom)[n - 2];
            max_t y = (r_hat << BN_DIGIT_BITS) + (max_t)bn_num(numer)[j + n - 2];
            if (q_hat >> BN_DIGIT_BITS || x > y) {
                q_hat -= 1;
                r_hat += bot;
            } else {
                break;
            }
        } while (r_hat >> BN_DIGIT_BITS == 0);

        // D4 - Multiply and subtract
        bn_t tmp, tmp2;
        bn_len(tmp) = n + 1;
        bn_neg(tmp) = 0;
        copy_digits(bn_num(tmp), bn_num(numer) + j, bn_len(tmp));
        bn_mul_digit(tmp2, denom, q_hat);
        bn_sub(remainder, tmp, tmp2);

        // D5 - Test remainder
        max_t q_j = q_hat;
        if (bn_neg(remainder)) {
            // D6 - Add back
            q_j -= 1;
            bn_add(remainder, remainder, denom);
        }
        bn_num(out)[j] = q_j;

        copy_digits(bn_num(numer) + j, bn_num(remainder), bn_len(remainder));
        bn_num(numer)[j + bn_len(remainder)] = 0;
        bn_len(numer) = j + bn_len(remainder);

        // D7 - Loop on j
        j--;
    } while(j >= 0);

    // Correct remainder
    if (rem) {
        bn_div_digit(rem, remainder, d);
        bn_neg(rem) = bn_neg(a);
        bn_unpad(rem);
    }

    // Correct sign and length
    bn_neg(out) = bn_neg(a) ^ bn_neg(b);
    bn_unpad(out);

    return 0;
}

void bn_inv_mod_barrett(bn_digit_t* bn_out, const bn_digit_t* bn_a, const bn_digit_t* bn_n, const bn_digit_t* bn_n_barret_factor) {
  bn_t bn_1;
  bn_from_digit(bn_1, 1);

  if (bn_is_zero(bn_a)) {
    bn_from_digit(bn_out, 0);
    return;
  }

  bn_t lm, hm;
  bn_from_digit(lm, 1);
  bn_from_digit(hm, 0);

  bn_t low, high, tmp;
  bn_div_rem(tmp, bn_a, bn_n, low);
  copy_bn(high, bn_n);

  while (bn_cmp(low, bn_1) > 0) {
    bn_t r, nm, new;

    bn_div_rem(r, high, low, tmp);

    bn_mul(tmp, lm, r);
    bn_sub(nm, hm, tmp);

    bn_mul(tmp, low, r);
    bn_sub(new, high, tmp);

    copy_bn(hm, lm);
    copy_bn(lm, nm);
    copy_bn(high, low);
    copy_bn(low, new);
  }

  bn_div_rem(tmp, lm, bn_n, bn_out);
}

void bn_precompute_barrett_factor(bn_digit_t* bn_out, const bn_digit_t* bn_n) {
  bn_t bn_barret_4k;
  bn_len(bn_barret_4k) = BARRET_SHIFT + 1;
  bn_neg(bn_barret_4k) = 0;
  for (int i = 0; i < BARRET_SHIFT; i++) {
    bn_num(bn_barret_4k)[i] = 0;
  }
  bn_num(bn_barret_4k)[BARRET_SHIFT] = 1;

  bn_div_rem(bn_out, bn_barret_4k, bn_n, 0);
}

void bn_mod_barrett(bn_digit_t* bn_out, const bn_digit_t* bn_x, const bn_digit_t* bn_n, const bn_digit_t* bn_factor) {
  if (bn_len(bn_x) > BARRET_SHIFT) {
    bn_t tmp;
    bn_div_rem(tmp, bn_x, bn_n, bn_out);
    if (bn_neg(bn_out)) {
      bn_add(bn_out, bn_out, bn_n);
    }
    return;
  }

  if (bn_cmp_digits(bn_x, bn_n) < 0) {
    int zero = bn_len(bn_x) == 1 && bn_num(bn_x)[0] == 0;
    if (bn_neg(bn_x) && !zero) {
      bn_sub_digits2(bn_out, bn_n, bn_x);
      bn_neg(bn_out) = 0;
    } else {
      copy_bn(bn_out, bn_x);
    }
    return;
  }

  if (bn_neg(bn_x)) {
    bn_t a, b;
    bn_mul(a, bn_x, bn_factor);
    bn_neg(a) = 0;
    for (int i = 0; i < BARRET_SHIFT; i++) {
      a[i] = a[i + BARRET_SHIFT];
    }
    bn_len(a) -= BARRET_SHIFT;
    bn_mul(b, a, bn_n);
    bn_add(bn_out, bn_x, b);
    bn_neg(bn_out) = 0;
    if (bn_cmp(bn_out, bn_n) >= 0) {
      bn_sub_digits2(bn_out, bn_out, bn_n);
    }
    bn_sub(bn_out, bn_n, bn_out);
  } else {
    bn_t a, b;
    bn_mul(a, bn_x, bn_factor);
    for (int i = 0; i < BARRET_SHIFT; i++) {
      a[i] = a[i + BARRET_SHIFT];
    }
    bn_len(a) -= BARRET_SHIFT;
    bn_mul(b, a, bn_n);
    bn_sub(bn_out, bn_x, b);
    if (bn_cmp(bn_out, bn_n) >= 0) {
      bn_sub_digits2(bn_out, bn_out, bn_n);
    }
  }
}

void bn_pow_mod_barrett(bn_digit_t* bn_out, const bn_digit_t* bn_x, const bn_digit_t* bn_y, const bn_digit_t* bn_n, const bn_digit_t* bn_n_barret_factor) {
  // https://en.wikipedia.org/wiki/Exponentiation_by_squaring

  if (bn_neg(bn_y) < 0) {
    bn_t inv_x;
    bn_inv_mod_barrett(inv_x, bn_x, bn_n, bn_n_barret_factor);

    bn_t neg_y;
    copy_bn(neg_y, bn_y);
    bn_neg(neg_y) = 0;

    bn_pow_mod_barrett(bn_out, inv_x, neg_y, bn_n, bn_n_barret_factor);
    return;
  }

  if (bn_len(bn_y) == 1 && bn_num(bn_y)[0] == 0) {
    bn_from_digit(bn_out, 1);
    return;
  }

  bn_digit_t y_mod_2 = bn_y[0] & 0x01;
  bn_t y_div_2;
  bn_half(y_div_2, bn_y);

  bn_t x2, tmp, tmp2;
  bn_mul(tmp, bn_x, bn_x);
  bn_div_rem(tmp2, tmp, bn_n, x2);

  if (y_mod_2 == 0) {
    bn_pow_mod_barrett(bn_out, x2, y_div_2, bn_n, bn_n_barret_factor);
    return;
  }

  bn_pow_mod_barrett(tmp, x2, y_div_2, bn_n, bn_n_barret_factor);
  bn_mul(tmp2, tmp, bn_x);
  bn_mod_barrett(bn_out, tmp2, bn_n, bn_n_barret_factor);
}

void bn_mul(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b) {
    bn_len(out) = bn_len(a) + bn_len(b);

    for (int i = 0; i < bn_len(out); i++) {
        bn_num(out)[i] = 0;
    }

    int i = 0;
    while (i < bn_len(b)) {
        max_t carry = 0;
        int j = 0;
        int k = i;

        while (j < bn_len(a)) {
            max_t value = (max_t)bn_num(b)[i] * (max_t)bn_num(a)[j] + carry + (max_t)bn_num(out)[k];

            bn_num(out)[k] = value & (BN_DIGIT_RANGE - 1);

            carry = value >> BN_DIGIT_BITS;

            j++;
            k++;
        }

        while (carry) {
            max_t value = carry + (max_t)bn_num(out)[k];

            bn_num(out)[k] = value & (BN_DIGIT_RANGE - 1);

            carry = value >> BN_DIGIT_BITS;

            k++;
        }

        i++;
    }

    bn_unpad(out);

    bn_neg(out) = bn_neg(a) != bn_neg(b);
}

void bn_sq(bn_digit_t* out, const bn_digit_t* x) {

#if DIGIT_SIZE >= 32

  return bn_mul(out, x, x);

#else

  bn_digit_t x_len = bn_len(x);

  if (x_len != 8) {
    bn_mul(out, x, x);
    return;
  }

  bn_len(out) = x_len << 1;

  max_t x0 = bn_num(x)[0];
  max_t x1 = bn_num(x)[1];
  max_t x2 = bn_num(x)[2];
  max_t x3 = bn_num(x)[3];
  max_t x4 = bn_num(x)[4];
  max_t x5 = bn_num(x)[5];
  max_t x6 = bn_num(x)[6];
  max_t x7 = bn_num(x)[7];

  max_t x00 = x0 * x0;
  max_t x01 = x0 * x1;
  max_t x02 = x0 * x2;
  max_t x03 = x0 * x3;
  max_t x04 = x0 * x4;
  max_t x05 = x0 * x5;
  max_t x06 = x0 * x6;
  max_t x07 = x0 * x7;
  max_t x11 = x1 * x1;
  max_t x12 = x1 * x2;
  max_t x13 = x1 * x3;
  max_t x14 = x1 * x4;
  max_t x15 = x1 * x5;
  max_t x16 = x1 * x6;
  max_t x17 = x1 * x7;
  max_t x22 = x2 * x2;
  max_t x23 = x2 * x3;
  max_t x24 = x2 * x4;
  max_t x25 = x2 * x5;
  max_t x26 = x2 * x6;
  max_t x27 = x2 * x7;
  max_t x33 = x3 * x3;
  max_t x34 = x3 * x4;
  max_t x35 = x3 * x5;
  max_t x36 = x3 * x6;
  max_t x37 = x3 * x7;
  max_t x44 = x4 * x4;
  max_t x45 = x4 * x5;
  max_t x46 = x4 * x6;
  max_t x47 = x4 * x7;
  max_t x55 = x5 * x5;
  max_t x56 = x5 * x6;
  max_t x57 = x5 * x7;
  max_t x66 = x6 * x6;
  max_t x67 = x6 * x7;
  max_t x77 = x7 * x7;

  max_t t0 = x00;
  max_t c0 = t0 >> BN_DIGIT_BITS;
  max_t t1 = (x01 << 1) + c0;
  max_t c1 = t1 >> BN_DIGIT_BITS;
  max_t t2 = (x02 << 1) + x11 + c1;
  max_t c2 = t2 >> BN_DIGIT_BITS;
  max_t t3 = (x03 << 1) + (x12 << 1) + c2;
  max_t c3 = t3 >> BN_DIGIT_BITS;
  max_t t4 = (x04 << 1) + (x13 << 1) + x22 + c3;
  max_t c4 = t4 >> BN_DIGIT_BITS;
  max_t t5 = (x05 << 1) + (x14 << 1) + (x23 << 1) + c4;
  max_t c5 = t5 >> BN_DIGIT_BITS;
  max_t t6 = (x06 << 1) + (x15 << 1) + (x24 << 1) + x33 + c5;
  max_t c6 = t6 >> BN_DIGIT_BITS;
  max_t t7 = (x07 << 1) + (x16 << 1) + (x25 << 1) + (x34 << 1) + c6;
  max_t c7 = t7 >> BN_DIGIT_BITS;
  max_t t8 = (x17 << 1) + (x26 << 1) + (x35 << 1) + x44 + c7;
  max_t c8 = t8 >> BN_DIGIT_BITS;
  max_t t9 = (x27 << 1) + (x36 << 1) + (x45 << 1) + c8;
  max_t c9 = t9 >> BN_DIGIT_BITS;
  max_t t10 = (x37 << 1) + (x46 << 1) + x55 + c9;
  max_t c10 = t10 >> BN_DIGIT_BITS;
  max_t t11 = (x47 << 1) + (x56 << 1) + c10;
  max_t c11 = t11 >> BN_DIGIT_BITS;
  max_t t12 = (x57 << 1) + x66 + c11;
  max_t c12 = t12 >> BN_DIGIT_BITS;
  max_t t13 = (x67 << 1) + c12;
  max_t c13 = t13 >> BN_DIGIT_BITS;
  max_t t14 = x77 + c13;
  max_t c14 = t14 >> BN_DIGIT_BITS;
  max_t t15 = c14;

  bn_num(out)[0] = (bn_digit_t)(t0 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[1] = (bn_digit_t)(t1 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[2] = (bn_digit_t)(t2 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[3] = (bn_digit_t)(t3 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[4] = (bn_digit_t)(t4 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[5] = (bn_digit_t)(t5 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[6] = (bn_digit_t)(t6 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[7] = (bn_digit_t)(t7 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[8] = (bn_digit_t)(t8 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[9] = (bn_digit_t)(t9 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[10] = (bn_digit_t)(t10 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[11] = (bn_digit_t)(t11 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[12] = (bn_digit_t)(t12 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[13] = (bn_digit_t)(t13 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[14] = (bn_digit_t)(t14 & (BN_DIGIT_RANGE - 1));
  bn_num(out)[15] = (bn_digit_t)(t15);

  bn_neg(out) = 0;

  bn_unpad(out);

#endif
}