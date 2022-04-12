#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <time.h>
#include "bn.h"
#include "bn2.h"

#define expect(x) if (!(x)) { exit(1); }

int main() {
    srand(time(0));

    bn_t a, b, c, d;

    printf("bn_add: 0 + 0\n");
    bn_from_int(a, 0);
    bn_from_int(b, 0);
    bn_add(d, a, b);
    expect(bn_to_int(d) == 0);

    printf("bn_add: 0 + 123456789\n");
    bn_from_int(a, 0);
    bn_from_int(b, 123456789);
    bn_add(d, a, b);
    expect(bn_to_int(d) == 123456789);

    printf("bn_add: 1 + 1\n");
    bn_from_int(a, 1);
    bn_from_int(b, 1);
    bn_add(d, a, b);
    expect(bn_to_int(d) == 2);

    printf("bn_add: 1 + -1\n");
    bn_from_int(a, 1);
    bn_from_int(b, -1);
    bn_add(d, a, b);
    expect(bn_to_int(d) == 0);

    printf("bn_add: 1 + 65535\n");
    bn_from_int(a, 1);
    bn_from_int(b, 65535);
    bn_add(d, a, b);
    expect(bn_to_int(d) == 65536);

    printf("bn_add: 1 + -100\n");
    bn_from_int(a, 1);
    bn_from_int(b, -100);
    bn_add(d, a, b);
    expect(bn_to_int(d) == -99);

    printf("bn_add: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r1 = rand() - RAND_MAX / 2;
        int64_t r2 = rand() - RAND_MAX / 2;
        bn_from_int(a, r1);
        bn_from_int(b, r2);
        bn_add(d, a, b);
        expect(bn_to_int(d) == r1 + r2);
        expect(bn_len(d) == max((int)floor(log(abs(r1 + r2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_sub: 0 - 0\n");
    bn_from_int(a, 0);
    bn_from_int(b, 0);
    bn_sub(d, a, b);
    expect(bn_to_int(d) == 0);

    printf("bn_sub: 1 - 1\n");
    bn_from_int(a, 1);
    bn_from_int(b, 1);
    bn_sub(d, a, b);
    expect(bn_to_int(d) == 0);

    printf("bn_sub: 256 - 1\n");
    bn_from_int(a, 256);
    bn_from_int(b, 1);
    bn_sub(d, a, b);
    expect(bn_to_int(d) == 255);
    expect(bn_len(d) == 1);

    printf("bn_sub: 0 - 1\n");
    bn_from_int(a, 0);
    bn_from_int(b, 1);
    bn_sub(d, a, b);
    expect(bn_to_int(d) == -1);

    printf("bn_sub: 256 - 512\n");
    bn_from_int(a, 256);
    bn_from_int(b, 512);
    bn_sub(d, a, b);
    expect(bn_to_int(d) == -256);

    printf("bn_sub: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r1 = rand() - RAND_MAX / 2;
        int64_t r2 = rand() - RAND_MAX / 2;
        bn_from_int(a, r1);
        bn_from_int(b, r2);
        bn_sub(d, a, b);
        expect(bn_to_int(d) == r1 - r2);
        expect(bn_len(d) == max((int)floor(log(abs(r1 - r2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_double: 0\n");
    bn_from_int(a, 0);
    bn_double(d, a);
    expect(bn_to_int(d) == 0);

    printf("bn_double: 1\n");
    bn_from_int(a, 1);
    bn_double(d, a);
    expect(bn_to_int(d) == 2);

    printf("bn_double: 128\n");
    bn_from_int(a, 128);
    bn_double(d, a);
    expect(bn_to_int(d) == 256);

    printf("bn_double: -128\n");
    bn_from_int(a, -128);
    bn_double(d, a);
    expect(bn_to_int(d) == -256);

    printf("bn_double: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r = rand() - RAND_MAX / 2;
        bn_from_int(a, r);
        bn_double(d, a);
        expect(bn_to_int(d) == r * 2);
        expect(bn_len(d) == max((int)floor(log(abs(r * 2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_half: 0\n");
    bn_from_int(a, 0);
    bn_half(d, a);
    expect(bn_to_int(d) == 0);

    printf("bn_half: 1\n");
    bn_from_int(a, 1);
    bn_half(d, a);
    expect(bn_to_int(d) == 0);

    printf("bn_half: 2\n");
    bn_from_int(a, 2);
    bn_half(d, a);
    expect(bn_to_int(d) == 1);

    printf("bn_half: 256\n");
    bn_from_int(a, 256);
    bn_half(d, a);
    expect(bn_to_int(d) == 128);
    expect(bn_len(d) == 1);

    printf("bn_half: -256\n");
    bn_from_int(a, -256);
    bn_half(d, a);
    expect(bn_to_int(d) == -128);
    expect(bn_len(d) == 1);

    printf("bn_half: -1\n");
    bn_from_int(a, -1);
    bn_half(d, a);
    expect(bn_to_int(d) == -0);
    expect(bn_len(d) == 1);
    expect(bn_neg(d) == 0);

    printf("bn_half: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r = rand() - RAND_MAX / 2;
        bn_from_int(a, r);
        bn_half(d, a);
        expect(bn_to_int(d) == r / 2);
        expect(bn_len(d) == max((int)floor(log(abs(r / 2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_mul_digit: 0 * 0\n");
    bn_from_int(a, 0);
    bn_mul_digit(d, a, 0);
    expect(bn_to_int(d) == 0);

    printf("bn_mul_digit: -1 * 0\n");
    bn_from_int(a, -1);
    bn_mul_digit(d, a, 0);
    expect(bn_to_int(d) == 0);
    expect(bn_len(d) == 1);
    expect(bn_neg(d) == 0);

    printf("bn_mul_digit: 256 * 100\n");
    bn_from_int(a, 256);
    bn_mul_digit(d, a, 100);
    expect(bn_to_int(d) == 25600);

    printf("bn_mul_digit: -100 * 255\n");
    bn_from_int(a, -100);
    bn_mul_digit(d, a, 255);
    expect(bn_to_int(d) == -25500);

    printf("bn_mul_digit: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r1 = rand() - RAND_MAX / 2;
        int64_t r2 = rand() % 256;
        bn_from_int(a, r1);
        bn_mul_digit(d, a, r2);
        expect(bn_to_int(d) == r1 * r2);
        expect(bn_len(d) == max((int)floor(log(abs(r1)) / log(BN_DIGIT_RANGE) + log(abs(r2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_mul: 0 * 0\n");
    bn_from_int(a, 0);
    bn_from_int(b, 0);
    bn_mul(d, a, b);
    expect(bn_to_int(d) == 0);

    printf("bn_mul: 1 * 1\n");
    bn_from_int(a, 1);
    bn_from_int(b, 1);
    bn_mul(d, a, b);
    expect(bn_to_int(d) == 1);

    printf("bn_mul: 0 * 256\n");
    bn_from_int(a, 0);
    bn_from_int(b, 256);
    bn_mul(d, a, b);
    expect(bn_to_int(d) == 0);

    printf("bn_mul: 65536 * 0\n");
    bn_from_int(a, 65536);
    bn_from_int(b, 0);
    bn_mul(d, a, b);
    expect(bn_to_int(d) == 0);

    printf("bn_mul: 100 * 230\n");
    bn_from_int(a, 100);
    bn_from_int(b, 230);
    bn_mul(d, a, b);
    expect(bn_to_int(d) == 23000);

    printf("bn_mul: -1 * -1\n");
    bn_from_int(a, -1);
    bn_from_int(b, -1);
    bn_mul(d, a, b);
    expect(bn_to_int(d) == 1);

    printf("bn_mul: -2 * 2\n");
    bn_from_int(a, -2);
    bn_from_int(b, 2);
    bn_mul(d, a, b);
    expect(bn_to_int(d) == -4);

    printf("bn_mul: max\n");
    bn_len(a) = bn_len(b) = 1;
    bn_neg(a) = bn_neg(b) = 0;
    bn_num(a)[0] = bn_num(b)[0] = BN_DIGIT_RANGE - 1;
    bn_mul(d, a, b);
    expect(bn_to_int(d) == (BN_DIGIT_RANGE - 1) * (BN_DIGIT_RANGE - 1));
    expect(bn_len(d) == 2);

    printf("bn_mul: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r1 = rand() - RAND_MAX / 2;
        int64_t r2 = rand() - RAND_MAX / 2;
        bn_from_int(a, r1);
        bn_from_int(b, r2);
        bn_mul(d, a, b);
        expect(bn_to_int(d) == r1 * r2);
        expect(bn_len(d) == max((int)floor(log(abs(r1)) / log(BN_DIGIT_RANGE) + log(abs(r2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_sq: max\n");
    bn_len(a) = 1;
    bn_neg(a) = 0;
    bn_num(a)[0] = BN_DIGIT_RANGE - 1;
    bn_sq(d, a);
    expect(bn_to_int(d) == (BN_DIGIT_RANGE - 1) * (BN_DIGIT_RANGE - 1));
    expect(bn_len(d) == 2);
    
    printf("bn_sq: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r = rand() - RAND_MAX / 2;
        for (int j = 0; j < 8; j++) bn_num(a)[j] = 0;
        bn_from_int(a, r);
        bn_len(a) = 8;
        bn_sq(d, a);
        expect(bn_to_int(d) == r * r);
        expect(bn_len(d) == max((int)floor(log(abs(r)) / log(BN_DIGIT_RANGE) + log(abs(r)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_div_digit: 1 / 1\n");
    bn_from_int(a, 1);
    bn_div_digit(d, a, 1);
    expect(bn_to_int(d) == 1);

    printf("bn_div_digit: 1 / 2\n");
    bn_from_int(a, 1);
    bn_div_digit(d, a, 2);
    expect(bn_to_int(d) == 0);

    printf("bn_div_digit: 2 / 1\n");
    bn_from_int(a, 2);
    bn_div_digit(d, a, 1);
    expect(bn_to_int(d) == 2);

    printf("bn_div_digit: 256 / 2\n");
    bn_from_int(a, 256);
    bn_div_digit(d, a, 2);
    expect(bn_to_int(d) == 128);
    expect(bn_len(d) == 1);

    printf("bn_div_digit: 256 / 255\n");
    bn_from_int(a, 256);
    bn_div_digit(d, a, 255);
    expect(bn_to_int(d) == 1);
    expect(bn_len(d) == 1);

    printf("bn_div_digit: -1 / 1\n");
    bn_from_int(a, -1);
    bn_div_digit(d, a, 1);
    expect(bn_to_int(d) == -1);

    printf("bn_div_digit: -1 / 2\n");
    bn_from_int(a, -1);
    bn_div_digit(d, a, 2);
    expect(bn_to_int(d) == 0);
    expect(bn_len(d) == 1);
    expect(bn_neg(d) == 0);

    printf("bn_div_digit: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r1 = rand() - RAND_MAX / 2;
        int64_t r2 = rand() % 256;
        if (r2 == 0) continue;
        bn_from_int(a, r1);
        bn_div_digit(d, a, r2);
        expect(bn_to_int(d) == r1 / r2);
        expect(bn_len(d) == max((int)floor(log(abs(r1 / r2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_div_rem: 1 / 1\n");
    bn_from_int(a, 1);
    bn_from_int(b, 1);
    bn_div_rem(d, a, b, c);
    expect(bn_to_int(d) == 1);
    expect(bn_to_int(c) == 0);
    expect(bn_len(d) == 1);

    printf("bn_div_rem: 1 / 2\n");
    bn_from_int(a, 1);
    bn_from_int(b, 2);
    bn_div_rem(d, a, b, c);
    expect(bn_to_int(d) == 0);
    expect(bn_to_int(c) == 1);
    expect(bn_len(d) == 1);

    printf("bn_div_rem: 0 / 100\n");
    bn_from_int(a, 0);
    bn_from_int(b, 100);
    bn_div_rem(d, a, b, c);
    expect(bn_to_int(d) == 0);
    expect(bn_to_int(c) == 0);
    expect(bn_len(d) == 1);

    printf("bn_div_rem: 100 / 4\n");
    bn_from_int(a, 100);
    bn_from_int(b, 4);
    bn_div_rem(d, a, b, c);
    expect(bn_to_int(d) == 25);
    expect(bn_to_int(c) == 0);
    expect(bn_len(d) == (int)floor(log(25) / log(BN_DIGIT_RANGE) + 1));

    printf("bn_div_rem: 1000000 / 400\n");
    bn_from_int(a, 1000000);
    bn_from_int(b, 400);
    bn_div_rem(d, a, b, c);
    expect(bn_to_int(d) == 2500);
    expect(bn_to_int(c) == 0);
    expect(bn_len(d) == (int)floor(log(2500) / log(BN_DIGIT_RANGE) + 1));

    printf("bn_div_rem: very small remainder\n");
    bn_from_int(a, 457995240);
    bn_from_int(b, 16356982);
    bn_div_rem(d, a, b, c);
    expect(bn_to_int(d) == 457995240 / 16356982);
    expect(bn_to_int(c) == 457995240 % 16356982);
    expect(bn_len(d) == max((int)floor(log(abs(457995240 / 16356982)) / log(BN_DIGIT_RANGE) + 1), 1));

    printf("bn_div_rem: almost 2^9\n");
    bn_from_int(a, 454382373);
    bn_from_int(b, 1774869);
    bn_div_rem(d, a, b, c);
    expect(bn_to_int(d) == 454382373 / 1774869);
    expect(bn_to_int(c) == 454382373 % 1774869);
    expect(bn_len(d) == max((int)floor(log(abs(454382373 / 1774869)) / log(BN_DIGIT_RANGE) + 1), 1));

    printf("bn_div_rem: monte carlo 10k\n");
    for (int i = 0; i < 10000; i++) {
        int64_t r1 = rand() - RAND_MAX / 2;
        int64_t r2 = rand() - RAND_MAX / 2;
        if (r2 == 0) continue;
        bn_from_int(a, r1);
        bn_from_int(b, r2);
        bn_div_rem(d, a, b, c);
        expect(bn_to_int(d) == r1 / r2);
        expect(bn_to_int(c) == r1 % r2);
        expect(bn_len(d) == max((int)floor(log(abs(r1 / r2)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("bn_div_rem: big numbers\n");
    bn_t bn_1, bn_2, bn_n, bn_n_half;
    bn_from_digit(bn_1, 1);
    bn_from_digit(bn_2, 2);
    const int len = BN_LEN - 3;
    bn_num(bn_n)[len - 1] = BN_DIGIT_RANGE - 1;
    bn_num(bn_n)[0] = 1;
    bn_len(bn_n) = len;
    bn_neg(bn_n) = 0;
    bn_div_rem(d, bn_n, bn_2, c);
    bn_half(bn_n_half, bn_n);
    expect(bn_cmp(bn_n_half, d) == 0);
    expect(bn_cmp(c, bn_1) == 0);
    expect(bn_len(bn_n_half) == len);

    printf("bn_pow_mod_barrett\n");
    bn_t n, n_barret_factor;
    bn_len(n) = 8;
    bn_neg(n) = 0;
    for (int i = 0; i < 8; i++) bn_num(n)[i] = 0xff;
    bn_precompute_barrett_factor(n_barret_factor, n);
    for (int i = 0; i < 1000; i++) {
        int64_t r1 = rand() % 30;
        int64_t r2 = rand() % 5;
        int64_t expected = (int64_t)(pow(r1, r2) + 0.5);
        bn_from_int(a, r1);
        bn_from_int(b, r2);
        bn_pow_mod_barrett(d, a, b, n, n_barret_factor);
        expect(bn_to_int(d) == expected);
        expect(bn_len(d) == max((int)floor(log(abs(expected)) / log(BN_DIGIT_RANGE) + 1), 1));
    }

    printf("[SUCCESS] All tests passed\n");

    return 0;
}