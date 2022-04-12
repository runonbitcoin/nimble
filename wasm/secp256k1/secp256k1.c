#include <stdint.h>
#include "bn.h"
#include "bn2.h"
#include "secp256k1.h"

#define copy_pt(out, in) { copy_bn(pt_x(out), pt_x(in)); copy_bn(pt_y(out), pt_y(in)); }
#define copy_jac(out, in) { copy_bn(jac_x(out), jac_x(in)); copy_bn(jac_y(out), jac_y(in)); copy_bn(jac_z(out), jac_z(in)); }

#define assign4(n, n0, n1, n2, n3) { \
  bn_digit_t* m = n;\
  bn_len(m) = 4; \
  bn_neg(m) = 0; \
  bn_num(m)[0] = n3; \
  bn_num(m)[1] = n2; \
  bn_num(m)[2] = n1; \
  bn_num(m)[3] = n0; \
}

#define assign8(n, n0, n1, n2, n3, n4, n5, n6, n7) { \
  bn_digit_t* m = n;\
  bn_len(m) = 8; \
  bn_neg(m) = 0; \
  bn_num(m)[0] = n7; \
  bn_num(m)[1] = n6; \
  bn_num(m)[2] = n5; \
  bn_num(m)[3] = n4; \
  bn_num(m)[4] = n3; \
  bn_num(m)[5] = n2; \
  bn_num(m)[6] = n1; \
  bn_num(m)[7] = n0; \
}

#define assign16(n, n0, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, n13, n14, n15) { \
  bn_digit_t* m = n;\
  bn_len(m) = 16; \
  bn_neg(m) = 0; \
  bn_num(m)[0] = n15; \
  bn_num(m)[1] = n14; \
  bn_num(m)[2] = n13; \
  bn_num(m)[3] = n12; \
  bn_num(m)[4] = n11; \
  bn_num(m)[5] = n10; \
  bn_num(m)[6] = n9; \
  bn_num(m)[7] = n8; \
  bn_num(m)[8] = n7; \
  bn_num(m)[9] = n6; \
  bn_num(m)[10] = n5; \
  bn_num(m)[11] = n4; \
  bn_num(m)[12] = n3; \
  bn_num(m)[13] = n2; \
  bn_num(m)[14] = n1; \
  bn_num(m)[15] = n0; \
}


#define assign32(n, n0, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, n13, n14, n15, n16, n17, n18, n19, n20, n21, n22, n23, n24, n25, n26, n27, n28, n29, n30, n31) { \
  bn_digit_t* m = n;\
  bn_len(m) = 32; \
  bn_neg(m) = 0; \
  bn_num(m)[0] = n31; \
  bn_num(m)[1] = n30; \
  bn_num(m)[2] = n29; \
  bn_num(m)[3] = n28; \
  bn_num(m)[4] = n27; \
  bn_num(m)[5] = n26; \
  bn_num(m)[6] = n25; \
  bn_num(m)[7] = n24; \
  bn_num(m)[8] = n23; \
  bn_num(m)[9] = n22; \
  bn_num(m)[10] = n21; \
  bn_num(m)[11] = n20; \
  bn_num(m)[12] = n19; \
  bn_num(m)[13] = n18; \
  bn_num(m)[14] = n17; \
  bn_num(m)[15] = n16; \
  bn_num(m)[16] = n15; \
  bn_num(m)[17] = n14; \
  bn_num(m)[18] = n13; \
  bn_num(m)[19] = n12; \
  bn_num(m)[20] = n11; \
  bn_num(m)[21] = n10; \
  bn_num(m)[22] = n9; \
  bn_num(m)[23] = n8; \
  bn_num(m)[24] = n7; \
  bn_num(m)[25] = n6; \
  bn_num(m)[26] = n5; \
  bn_num(m)[27] = n4; \
  bn_num(m)[28] = n3; \
  bn_num(m)[29] = n2; \
  bn_num(m)[30] = n1; \
  bn_num(m)[31] = n0; \
}

bn_digit_t* g_bn_P = 0;
bn_digit_t* g_bn_N = 0;
bn_digit_t* g_bn_0 = 0;
bn_digit_t* g_bn_1 = 0;
bn_digit_t* g_bn_2 = 0;
bn_digit_t* g_pt_G = 0;
bn_digit_t* g_bn_P_barret_factor = 0;
bn_digit_t* g_bn_N_barret_factor = 0;
bn_digit_t* g_jac_G_doubles = 0;

void jac_zero(bn_digit_t* jac_out) {
  bn_from_digit(jac_x(jac_out), 0);
  bn_from_digit(jac_y(jac_out), 0);
  bn_from_digit(jac_z(jac_out), 1);
}

void bn_pos_mod_P(bn_digit_t* bn_a) {
  // Whenever we do a bn_div_rem to do a mod P, the modulus calculation uses the Python modulo operation,
  // whereas other code may expect the C modulo operation. The difference is whether the result may be
  // negative. To go from Python -> C modulo, call this right after. We do this to ensure correct results.
  if (bn_is_neg(bn_a)) {
    bn_add(bn_a, bn_a, g_bn_P);
  }
}

void bn_sq_mod_P(bn_digit_t* bn_out, const bn_digit_t* bn_a) {
  bn_t tmp;
  bn_sq(tmp, bn_a);
  bn_mod_barrett(bn_out, tmp, g_bn_P, g_bn_P_barret_factor);
}

void bn_mul_mod_P(bn_digit_t* bn_out, const bn_digit_t* bn_a, const bn_digit_t* bn_b) {
  bn_t tmp;
  bn_mul(tmp, bn_a, bn_b);

  bn_mod_barrett(bn_out, tmp, g_bn_P, g_bn_P_barret_factor);

  // bn_t tmp2;
  // bn_div_rem(tmp2, tmp, g_bn_P, bn_out);
  // bn_pos_mod_P(bn_out);

  // The check below may be faster.
  // if (bn_neg(tmp) || bn_cmp(tmp, g_bn_N) >= 0) {
    // bn_div_rem(tmp2, tmp, g_bn_P, bn_out);
    // bn_pos_mod_P(bn_out);
  // } else {
    // copy_bn(bn_out, tmp);
  // }
}

void bn_sub_mod_P(bn_digit_t* bn_out, const bn_digit_t* bn_a, const bn_digit_t* bn_b) {
  bn_t tmp;
  bn_sub(tmp, bn_a, bn_b);

  bn_mod_barrett(bn_out, tmp, g_bn_P, g_bn_P_barret_factor);

  // bn_t tmp2;
  // bn_div_rem(tmp2, tmp, g_bn_P, bn_out);
  // bn_pos_mod_P(bn_out);

  // The check below may be faster.
  // if (bn_neg(tmp) || bn_cmp(tmp, g_bn_N) >= 0) {
    // bn_div_rem(tmp2, tmp, g_bn_P, bn_out);
    // bn_pos_mod_P(bn_out);
  // } else {
    // copy_bn(bn_out, tmp);
  // }
}

void jac_double(bn_digit_t* jac_out, const bn_digit_t* jac_a) {
  const bn_digit_t* x = jac_x(jac_a);
  const bn_digit_t* y = jac_y(jac_a);
  const bn_digit_t* z = jac_z(jac_a);

  if (bn_is_zero(y)) {
    bn_from_digit(jac_x(jac_out), 0);
    bn_from_digit(jac_y(jac_out), 0);
    bn_from_digit(jac_z(jac_out), 0);
    return;
  }

  bn_t tmp, tmp2;
  
  bn_t ysq;
  bn_mul_mod_P(ysq, y, y);

  bn_t bn_3, bn_4;
  bn_from_digit(bn_3, 3);
  bn_from_digit(bn_4, 4);

  bn_t s;
  bn_mul(tmp, bn_4, x);
  bn_mul_mod_P(s, tmp, ysq);

  bn_t m, x2;
  // Commented out because A = 0
  // const bn_digit_t* a = g_bn_0;
  // bn_digit_t z2, z4;
  bn_sq(x2, x);
  // bn_sq(z2, z);
  // bn_sq(z4, z2);
  bn_mul_mod_P(m, bn_3, x2);
  // bn_t tmp3;
  // bn_mul(tmp, bn_3, x2);
  // bn_mul(tmp2, a, z4);
  // bn_add(tmp3, tmp, tmp2);
  // bn_div_rem(tmp, tmp3, g_bn_P, m);

  bn_digit_t* nx = jac_x(jac_out);
  bn_digit_t* ny = jac_y(jac_out);
  bn_digit_t* nz = jac_z(jac_out);

  bn_t m2;
  bn_sq(m2, m);
  bn_double(tmp, s);
  bn_sub_mod_P(nx, m2, tmp);

  bn_t ysq2, bn_8;
  bn_sub(tmp, s, nx);
  bn_mul(tmp2, m, tmp);
  bn_sq(ysq2, ysq);
  bn_from_digit(bn_8, 8);
  bn_mul(tmp, bn_8, ysq2);
  bn_sub_mod_P(ny, tmp2, tmp);

  bn_double(tmp, y);
  bn_mul_mod_P(nz, tmp, z);
}

void jac_add(bn_digit_t* jac_out, const bn_digit_t* jac_a, const bn_digit_t* jac_b) {
  const bn_digit_t* ax = jac_x(jac_a);
  const bn_digit_t* ay = jac_y(jac_a);
  const bn_digit_t* az = jac_z(jac_a);

  const bn_digit_t* bx = jac_x(jac_b);
  const bn_digit_t* by = jac_y(jac_b);
  const bn_digit_t* bz = jac_z(jac_b);

  if (bn_is_zero(ay)) {
    copy_jac(jac_out, jac_b);
    return;
  }

  if (bn_is_zero(by)) {
    copy_jac(jac_out, jac_a);
    return;
  }

  bn_t az2, az3, bz2, bz3;
  // The _mod_P versions are faster in practice
  // bn_sq(az2, az);
  // bn_mul(az3, az2, az);
  // bn_sq(bz2, bz);
  // bn_mul(bz3, bz2, bz);
  bn_sq_mod_P(az2, az);
  bn_mul_mod_P(az3, az2, az);
  bn_sq_mod_P(bz2, bz);
  bn_mul_mod_P(bz3, bz2, bz);

  bn_t tmp, tmp2;

  bn_t u1, u2, s1, s2;
  bn_mul_mod_P(u1, ax, bz2);
  bn_mul_mod_P(u2, bx, az2);
  bn_mul_mod_P(s1, ay, bz3);
  bn_mul_mod_P(s2, by, az3);

  if (bn_cmp(u1, u2) == 0) {
    if (bn_cmp(s1, s2) != 0) {
      jac_zero(jac_out);
      return;
    } else {
      jac_double(jac_out, jac_a);
      return;
    }
  }

  bn_t h, r, h2, h3, u1h2;
  bn_sub(h, u2, u1);
  bn_sub(r, s2, s1);
  bn_sq_mod_P(h2, h);
  bn_mul_mod_P(h3, h, h2);
  bn_mul_mod_P(u1h2, u1, h2);

  bn_digit_t* nx = jac_x(jac_out);
  bn_digit_t* ny = jac_y(jac_out);
  bn_digit_t* nz = jac_z(jac_out);

  bn_t r2;
  bn_sq(r2, r);
  bn_sub(tmp, r2, h3);
  bn_double(tmp2, u1h2);
  bn_sub_mod_P(nx, tmp, tmp2);

  bn_sub(tmp, u1h2, nx);
  // bn_mul(tmp2, r, tmp);
  // bn_mul(tmp, s1, h3);
  bn_mul_mod_P(tmp2, r, tmp);
  bn_mul_mod_P(tmp, s1, h3);
  bn_sub_mod_P(ny, tmp2, tmp);

  // bn_mul(tmp, az, bz);
  bn_mul_mod_P(tmp, az, bz);
  bn_mul_mod_P(nz, h, tmp);
}

// Recursive
void jac_mul(bn_digit_t* jac_out, const bn_digit_t* jac_a, const bn_digit_t* bn_n) {
  if (bn_is_zero(pt_y(jac_a)) || bn_is_zero(bn_n)) {
    jac_zero(jac_out);
    return;
  }

  if (bn_cmp(bn_n, g_bn_1) == 0) {
    copy_jac(jac_out, jac_a);
    return;
  }

  if (bn_is_neg(bn_n) || bn_cmp(bn_n, g_bn_N) >= 0) {
    bn_t n_mod_N;
    bn_mod_barrett(n_mod_N, bn_n, g_bn_N, g_bn_N_barret_factor);
    jac_mul(jac_out, jac_a, n_mod_N);
    return;
  }

  bn_t n_div_2;
  bn_digit_t n_mod_2 = bn_n[0] & 0x01;
  bn_half(n_div_2, bn_n);

  jac_t a_mul_n_div_2;
  jac_mul(a_mul_n_div_2, jac_a, n_div_2);

  if (n_mod_2 == 0) {
    jac_double(jac_out, a_mul_n_div_2);
  } else {
    jac_t jac_tmp;
    jac_double(jac_tmp, a_mul_n_div_2);
    jac_add(jac_out, jac_tmp, jac_a);
  }
}

void jac_mul_G(bn_digit_t* jac_out, const bn_digit_t* bn_n) {
  if (bn_is_zero(bn_n)) {
    jac_zero(jac_out);
    return;
  }

  if (bn_is_neg(bn_n) || bn_cmp(bn_n, g_bn_N) >= 0) {
    bn_t n_mod_N;
    bn_mod_barrett(n_mod_N, bn_n, g_bn_N, g_bn_N_barret_factor);
    jac_mul_G(jac_out, n_mod_N);
    return;
  }

  jac_zero(jac_out);

  bn_digit_t* jac_G_curr = g_jac_G_doubles;
  for (int i = 0; i < bn_len(bn_n); i++) {
    for (int j = 0; j < BN_DIGIT_BITS; j++) {
      bn_digit_t bit = (bn_num(bn_n)[i] >> j) & 1;
      if (bit) {
        jac_add(jac_out, jac_out, jac_G_curr);
      }
      jac_G_curr += JAC_LEN;
    }
  }
}

// Non-recursive
// https://www.cs.yale.edu/homes/aspnes/pinewiki/RussianPeasantsAlgorithm.html
/*
void jac_mul(bn_digit_t* jac_out, const bn_digit_t* jac_a, const bn_digit_t* bn_n) {
  if (bn_cmp(pt_y(jac_a), g_bn_0) == 0 || bn_cmp(bn_n, g_bn_0) == 0) {
    jac_zero(jac_out);
    return;
  }

  if (bn_cmp(bn_n, g_bn_0) < 0 || bn_cmp(bn_n, g_bn_N) >= 0) {
    bn_t n_div_N, n_mod_N;
    bn_div_rem(n_div_N, bn_n, g_bn_N, n_mod_N);
    jac_mul(jac_out, jac_a, n_mod_N);
    return;
  }

  jac_t jac_accum, jac_a_curr, jac_tmp;
  bn_t bn_n_curr, bn_tmp;
  jac_zero(jac_accum);
  copy_jac(jac_a_curr, jac_a);
  copy_bn(bn_n_curr, bn_n);

  while (bn_cmp(bn_n_curr, g_bn_1) != 0) {
    bn_digit_t n_mod_2 = bn_n_curr[0] & 0x01;

    if (n_mod_2 != 0) {
      jac_add(jac_accum, jac_accum, jac_a_curr);
    }

    jac_double(jac_tmp, jac_a_curr);
    copy_jac(jac_a_curr, jac_tmp);

    bn_half(bn_n_curr, bn_n_curr);
  }

  jac_add(jac_out, jac_accum, jac_a_curr);
}
*/

void jac_from_pt(bn_digit_t* jac_out, const bn_digit_t* pt_a) {
  copy_pt(jac_out, pt_a);
  bn_from_digit(jac_z(jac_out), 1);
}

void pt_from_jac(bn_digit_t* pt_out, const bn_digit_t* jac_a) {
  bn_t z, z2, z3;
  bn_inv_mod_barrett(z, jac_z(jac_a), g_bn_P, g_bn_P_barret_factor);
  bn_sq_mod_P(z2, z);
  bn_mul_mod_P(z3, z2, z);
  bn_mul_mod_P(pt_x(pt_out), jac_x(jac_a), z2);
  bn_mul_mod_P(pt_y(pt_out), jac_y(jac_a), z3);
  bn_pos_mod_P(pt_x(pt_out));
  bn_pos_mod_P(pt_y(pt_out));
}

void secp256k1_init(unsigned long memory_start) {
  g_bn_P = (bn_digit_t*)(memory_start);
  g_bn_N = g_bn_P + BN_LEN;
  g_bn_0 = g_bn_N + BN_LEN;
  g_bn_1 = g_bn_0 + BN_LEN;
  g_bn_2 = g_bn_1 + BN_LEN;
  g_pt_G = g_bn_2 + BN_LEN;
  g_bn_P_barret_factor = g_pt_G + PT_LEN;
  g_bn_N_barret_factor = g_bn_P_barret_factor + BN_LEN;
  g_jac_G_doubles = g_bn_P_barret_factor + BN_LEN;

  bn_from_digit(g_bn_0, 0);
  bn_from_digit(g_bn_1, 1);
  bn_from_digit(g_bn_2, 2);

  // P = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFC2F
  // N = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C D0364141
  // GX = 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798
  // GY = 483ADA77 26A3C465 5DA4FBFC 0E1108A8 FD17B448 A6855419 9C47D08F FB10D4B8

  #if DIGIT_SIZE == 64
  bn_digit_t S = 0xFFFFFFFFFFFFFFFF;
  assign4(g_bn_P, S, S, S, 0xFFFFFFFEFFFFFC2F);
  assign4(g_bn_N, S, 0xFFFFFFFFFFFFFFFE, 0xBAAEDCE6AF48A03B, 0xBFD25E8CD0364141)
  assign4(pt_x(g_pt_G), 0x79BE667EF9DCBBAC, 0x55A06295CE870B07, 0x029BFCDB2DCE28D9, 0x59F2815B16F81798);
  assign4(pt_y(g_pt_G), 0x483ADA7726A3C465, 0x5DA4FBFC0E1108A8, 0xFD17B448A6855419, 0x9C47D08FFB10D4B8);
  #endif

  #if DIGIT_SIZE == 32
  bn_digit_t S = 0xFFFFFFFF;
  bn_digit_t T = 0xFFFFFFFE;
  assign8(g_bn_P, S, S, S, S, S, S, T, 0xFFFFFC2F);
  assign8(g_bn_N, S, S, S, T, 0xBAAEDCE6, 0xAF48A03B, 0xBFD25E8C, 0xD0364141);
  assign8(pt_x(g_pt_G), 0x79BE667E, 0xF9DCBBAC, 0x55A06295, 0xCE870B07, 0x029BFCDB, 0x2DCE28D9, 0x59F2815B, 0x16F81798);
  assign8(pt_y(g_pt_G), 0x483ADA77, 0x26A3C465, 0x5DA4FBFC, 0x0E1108A8, 0xFD17B448, 0xA6855419, 0x9C47D08F, 0xFB10D4B8);
  #endif

  #if DIGIT_SIZE == 16
  bn_digit_t S = 0xFFFF;
  bn_digit_t T = 0xFFFE;
  assign16(g_bn_P, S, S, S, S, S, S, S, S, S, S, S, S, S, T, S, 0xFC2F);
  assign16(g_bn_N, S, S, S, S, S, S, S, T, 0xBAAE, 0xDCE6, 0xAF48, 0xA03B, 0xBFD2, 0x5E8C, 0xD036, 0x4141);
  assign16(pt_x(g_pt_G), 0x79BE, 0x667E, 0xF9DC, 0xBBAC, 0x55A0, 0x6295, 0xCE87, 0x0B07, 0x029B, 0xFCDB, 0x2DCE, 0x28D9, 0x59F2, 0x815B, 0x16F8, 0x1798);
  assign16(pt_y(g_pt_G), 0x483A, 0xDA77, 0x26A3, 0xC465, 0x5DA4, 0xFBFC, 0x0E11, 0x08A8, 0xFD17, 0xB448, 0xA685, 0x5419, 0x9C47, 0xD08F, 0xFB10, 0xD4B8);
  #endif

  #if DIGIT_SIZE == 8
  bn_digit_t S = 0xFF;
  bn_digit_t T = 0xFE;
  assign32(g_bn_P, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, T, S, S, 0xFC, 0x2F);
  assign32(g_bn_N, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, T, 0xBA, 0xAE, 0xDC, 0xE6, 0xAF, 0x48, 0xA0, 0x3B, 0xBF, 0xD2, 0x5E, 0x8C, 0xD0, 0x36, 0x41, 0x41);
  assign32(pt_x(g_pt_G), 0x79, 0xBE, 0x66, 0x7E, 0xF9, 0xDC, 0xBB, 0xAC, 0x55, 0xA0, 0x62, 0x95, 0xCE, 0x87, 0x0B, 0x07, 0x02, 0x9B, 0xFC, 0xDB, 0x2D, 0xCE, 0x28, 0xD9, 0x59, 0xF2, 0x81, 0x5B, 0x16, 0xF8, 0x17, 0x98);
  assign32(pt_y(g_pt_G), 0x48, 0x3A, 0xDA, 0x77, 0x26, 0xA3, 0xC4, 0x65, 0x5D, 0xA4, 0xFB, 0xFC, 0x0E, 0x11, 0x08, 0xA8, 0xFD, 0x17, 0xB4, 0x48, 0xA6, 0x85, 0x54, 0x19, 0x9C, 0x47, 0xD0, 0x8F, 0xFB, 0x10, 0xD4, 0xB8);
  #endif

  bn_precompute_barrett_factor(g_bn_P_barret_factor, g_bn_P);
  bn_precompute_barrett_factor(g_bn_N_barret_factor, g_bn_N);

  jac_from_pt(g_jac_G_doubles, g_pt_G);
  bn_digit_t* curr = g_jac_G_doubles + JAC_LEN;
  bn_digit_t* prev = g_jac_G_doubles;
  for (int i = 1; i < 256; i++) {
    jac_mul(curr, prev, g_bn_2);
    prev = curr;
    curr += JAC_LEN;
  }
}

void pt_add(bn_digit_t* pt_out, const bn_digit_t* pt_a, const bn_digit_t* pt_b) {
  jac_t jac_a;
  jac_t jac_b;
  jac_t jac_out;
  jac_from_pt(jac_a, pt_a);
  jac_from_pt(jac_b, pt_b);
  jac_add(jac_out, jac_a, jac_b);
  pt_from_jac(pt_out, jac_out);
}

void pt_mul(bn_digit_t* pt_out, const bn_digit_t* pt_a, const bn_digit_t* bn_n) {
  jac_t jac_a, jac_out;
  jac_from_pt(jac_a, pt_a);
  jac_mul(jac_out, jac_a, bn_n);
  pt_from_jac(pt_out, jac_out);
}

void g_mul(bn_digit_t* pt_out, const bn_digit_t* bn_n) {
  jac_t jac_out;
  jac_mul_G(jac_out, bn_n);
  pt_from_jac(pt_out, jac_out);
}

void bn_pow_mod_P(bn_digit_t* bn_out, const bn_digit_t* bn_x, const bn_digit_t* bn_y) {
  bn_pow_mod_barrett(bn_out, bn_x, bn_y, g_bn_P, g_bn_P_barret_factor);
}

void decompress_y(bn_digit_t* bn_y, const bn_digit_t* bn_x, bn_digit_t prefix) {
  // https://bitcoin.stackexchange.com/questions/86234/how-to-uncompress-a-public-key

  bn_t x2, x3, tmp;
  bn_mul(x2, bn_x, bn_x);
  bn_mul_mod_P(x3, x2, bn_x);

  bn_t ysq, bn_7, tmp2;
  bn_from_digit(bn_7, 7);
  bn_add(tmp, x3, bn_7);
  bn_mod_barrett(ysq, tmp, g_bn_P, g_bn_P_barret_factor);

  bn_t y_tmp, bn_p_plus_1, bn_4, tmp3;
  bn_add(bn_p_plus_1, g_bn_P, g_bn_1);
  bn_from_digit(bn_4, 4);
  bn_div_rem(tmp2, bn_p_plus_1, bn_4, tmp3);
  bn_pow_mod_P(y_tmp, ysq, tmp2);

  bn_digit_t y_mod_2 = y_tmp[0] & 0x01;
  bn_digit_t prefix_mod_2 = prefix & 0x01;
  if (y_mod_2 != prefix_mod_2) {
    bn_sub(bn_y, g_bn_P, y_tmp);
  } else {
    copy_bn(bn_y, y_tmp);
  }
}
