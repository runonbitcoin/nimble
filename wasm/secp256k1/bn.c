#include "bn.h"
#include <stdlib.h>

void copy_digits(bn_digit_t* out, const bn_digit_t* in, int len) {
  for (int i = 0; i < len; i++) {
    out[i] = in[i];
  }
}

void copy_bn(bn_digit_t* out, const bn_digit_t* in) {
  bn_neg(out) = bn_neg(in);
  bn_len(out) = bn_len(in);
  for (int i = 0; i < bn_len(in); i++) {
    out[i] = in[i];
  }
}

void bn_unpad(bn_digit_t* a) {
    while (bn_num(a)[bn_len(a) - 1] == 0) {
        if (bn_len(a) > 1) {
            bn_len(a) -= 1;
        } else {
            bn_neg(a) = 0;
            return;
        }
    }
}

void bn_from_digit(bn_digit_t* a, bn_digit_t n) {
    bn_neg(a) = 0;
    bn_len(a) = 1;
    bn_num(a)[0] = n;
}

void bn_from_int(bn_digit_t* a, int64_t n) {
    max_t abs_n;

    if (n < 0) {
        bn_neg(a) = 1;
        abs_n = -n;
    } else {
        bn_neg(a) = 0;
        abs_n = n;
    }

    if (abs_n < BN_DIGIT_RANGE) {
        bn_len(a) = 1;
        bn_num(a)[0] = (bn_digit_t)(abs_n);
    } else if (abs_n < BN_DIGIT_RANGE * BN_DIGIT_RANGE) {
        bn_len(a) = 2;
        bn_num(a)[0] = (bn_digit_t)(abs_n % BN_DIGIT_RANGE);
        abs_n /= BN_DIGIT_RANGE;
        bn_num(a)[1] = (bn_digit_t)(abs_n);
    } else if (abs_n < BN_DIGIT_RANGE * BN_DIGIT_RANGE * BN_DIGIT_RANGE) {
        bn_len(a) = 3;
        bn_num(a)[0] = (bn_digit_t)(abs_n % BN_DIGIT_RANGE);
        abs_n /= BN_DIGIT_RANGE;
        bn_num(a)[1] = (bn_digit_t)(abs_n % BN_DIGIT_RANGE);
        abs_n /= BN_DIGIT_RANGE;
        bn_num(a)[2] = (bn_digit_t)(abs_n);
    } else if (abs_n < BN_DIGIT_RANGE * BN_DIGIT_RANGE * BN_DIGIT_RANGE * BN_DIGIT_RANGE) {
        bn_len(a) = 4;
        bn_num(a)[0] = (bn_digit_t)(abs_n % BN_DIGIT_RANGE);
        abs_n /= BN_DIGIT_RANGE;
        bn_num(a)[1] = (bn_digit_t)(abs_n % BN_DIGIT_RANGE);
        abs_n /= BN_DIGIT_RANGE;
        bn_num(a)[2] = (bn_digit_t)(abs_n % BN_DIGIT_RANGE);
        abs_n /= BN_DIGIT_RANGE;
        bn_num(a)[3] = (bn_digit_t)(abs_n);
    } else {
        bn_from_digit(a, 0);
    }
}

__int128_t bn_to_int(const bn_digit_t* a) {
    __int128_t sign = bn_neg(a) ? -1 : 1;
    if (bn_len(a) == 0) {
        return 0;
    } else if (bn_len(a) <= 64 / BN_DIGIT_BITS) {
        __int128_t mag = 0;
        for (int i = 0; i < bn_len(a); i++) {
            mag += ((__int128_t)bn_num(a)[i] << (i * BN_DIGIT_BITS));
        }
        return sign * mag;
    } else {
        return 0;
    }
}

int bn_cmp(const bn_digit_t* a, const bn_digit_t* b) {
    if (bn_len(a) > 0 || bn_num(a)[0] > 0 || bn_len(b) > 0 || bn_num(b)[0] > 0) {
        if (bn_neg(a) && !bn_neg(b)) {
            return -1;
        }
        if (!bn_neg(a) && bn_neg(b)) {
            return 1;
        }
    }
    if (bn_neg(a)) {
        return bn_cmp_digits(b, a);
    } else {
        return bn_cmp_digits(a, b);
    }
}

int bn_cmp_digits(const bn_digit_t* a, const bn_digit_t* b) {
    if (bn_len(a) > bn_len(b)) {
        return 1;
    }
    if (bn_len(a) < bn_len(b)) {
        return -1;
    }
    for (int i = bn_len(a) - 1; i >= 0; i--) {
        if (bn_num(a)[i] > bn_num(b)[i]) {
            return 1;
        }
        if (bn_num(a)[i] < bn_num(b)[i]) {
            return -1;
        }
    }
    return 0;
}

void bn_add(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b) {
    if(bn_neg(a) == bn_neg(b)) {
        bn_neg(out) = bn_neg(a);
        bn_add_digits(out, a, b);
    } else {
        bn_digit_t neg = bn_cmp_digits(a, b) > 0 ? bn_neg(a) : bn_neg(b);
        bn_sub_digits(out, a, b);
        bn_neg(out) = neg;
    }
}

void bn_add_digits(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b) {
    bn_digit_t a_len = bn_len(a);
    bn_digit_t b_len = bn_len(b);
    int max_len = max(a_len, b_len);
    assert(max_len + 1 + 2 <= BN_LEN);
    bn_len(out) = bn_len(a);
    max_t carry = 0;
    for (int i = 0; i < max_len || carry > 0; i++) {
        if (i == bn_len(out)) {
            bn_len(out)++;
        }
        max_t a_digit = i < a_len ? bn_num(a)[i] : 0;
        max_t b_digit = i < b_len ? bn_num(b)[i] : 0;
        max_t sum = a_digit + b_digit + carry;
        bn_num(out)[i] = sum & (BN_DIGIT_RANGE - 1);
        carry = (sum >> BN_DIGIT_BITS) ? 1 : 0;
    }
}

void bn_sub(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b) {
    bn_digit_t neg = bn_cmp(a, b) >= 0 ? 0 : 1;
    if (bn_neg(a) == bn_neg(b)) {
        bn_sub_digits(out, a, b);
    } else {
        bn_add_digits(out, a, b);
    }
    bn_neg(out) = neg;
}

void bn_sub_digits(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t* b) {
    assert(max(bn_len(a), bn_len(b) + 1 + 2) <= BN_LEN);
    if (bn_cmp_digits(a, b) > 0) {
        bn_sub_digits2(out, a, b);
    } else {
        bn_sub_digits2(out, b, a);
    }
}

void bn_sub_digits2(bn_digit_t* out, const bn_digit_t* greater, const bn_digit_t* lesser) {
    bn_digit_t greater_len = bn_len(greater);
    bn_digit_t lesser_len = bn_len(lesser);

    imax_t carry = 0;
    bn_len(out) = 1;
    for (int i = 0; i < greater_len; i++) {
        imax_t new_digit;
        if (i < lesser_len) {
            new_digit = (imax_t)bn_num(greater)[i] - (imax_t)bn_num(lesser)[i] + carry;
        } else {
            new_digit = (imax_t)bn_num(greater)[i] + carry;
        }

        if (new_digit < 0) {
            carry = -1;
            new_digit += BN_DIGIT_RANGE;
        } else {
            carry = 0;
        }

        assert(new_digit >= 0);

        bn_num(out)[i] = new_digit;
        if (new_digit != 0) {
            bn_len(out) = i + 1;
        }
    }

    assert(carry == 0);
}

void bn_double(bn_digit_t* out, const bn_digit_t* a) {
  bn_neg(out) = bn_neg(a);
  if (bn_num(a)[bn_len(a) - 1] >> (BN_DIGIT_BITS - 1)) {
      bn_num(out)[bn_len(a)] = bn_num(a)[bn_len(a) - 1] >> (BN_DIGIT_BITS - 1);
      bn_len(out) = bn_len(a) + 1;
  } else {
      bn_len(out) = bn_len(a);
  }
  for (int i = bn_len(a) - 1; i > 0; i--) {
    bn_num(out)[i] = (bn_num(a)[i] << 1) | (bn_num(a)[i - 1] >> (BN_DIGIT_BITS - 1));
  }
  bn_num(out)[0] = bn_num(a)[0] << 1;
}


void bn_half(bn_digit_t* out, const bn_digit_t* a) {
  bn_len(out) = bn_len(a);
  bn_neg(out) = bn_neg(a);
  for (int i = 0; i < bn_len(a) - 1; i++) {
      bn_num(out)[i] = (bn_num(a)[i] >> 1) | (bn_num(a)[i + 1] << (BN_DIGIT_BITS - 1));
  }
  int last = bn_len(a) - 1;
  bn_num(out)[last] = bn_num(a)[last] >> 1;
  bn_unpad(out);
}

void bn_mul_digit(bn_digit_t* out, const bn_digit_t* a, const bn_digit_t n) {
    if (n == 0) {
        bn_from_digit(out, 0);
        return;
    }
    if (n == 1) {
        if (out != a) {
            copy_bn(out, a);
        }
        return;
    }
    bn_neg(out) = bn_neg(a);
    max_t carry = 0;
    for (int i = 0; i < bn_len(a); i++) {
        max_t prod = (max_t)n * (max_t)bn_num(a)[i] + carry;
        bn_num(out)[i] = prod & (BN_DIGIT_RANGE - 1);
        carry = prod >> BN_DIGIT_BITS;
    }
    if (carry) {
        bn_num(out)[bn_len(a)] = carry & (BN_DIGIT_RANGE - 1);
        bn_len(out) = bn_len(a) + 1;
        carry = carry >> BN_DIGIT_BITS;
    } else {
        bn_len(out) = bn_len(a);
    }
    assert(!carry);
    bn_unpad(out);
}
