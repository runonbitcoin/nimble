#include "ecdsa.h"
#include "bn2.h"
#include "secp256k1.h"

bn_digit_t* g_ecdsa_bn_P = 0;
bn_digit_t* g_ecdsa_bn_N = 0;
bn_digit_t* g_ecdsa_bn_0 = 0;
bn_digit_t* g_ecdsa_bn_1 = 0;
bn_digit_t* g_ecdsa_bn_2 = 0;
bn_digit_t* g_ecdsa_pt_G = 0;
bn_digit_t* g_ecdsa_bn_P_barrett_factor = 0;
bn_digit_t* g_ecdsa_bn_N_barrett_factor = 0;

void ecdsa_init(unsigned long memory_start) {
  g_ecdsa_bn_P = (bn_digit_t*)(memory_start);
  g_ecdsa_bn_N = g_ecdsa_bn_P + BN_LEN;
  g_ecdsa_bn_0 = g_ecdsa_bn_N + BN_LEN;
  g_ecdsa_bn_1 = g_ecdsa_bn_0 + BN_LEN;
  g_ecdsa_bn_2 = g_ecdsa_bn_1 + BN_LEN;
  g_ecdsa_pt_G = g_ecdsa_bn_2 + BN_LEN;
  g_ecdsa_bn_P_barrett_factor = g_ecdsa_pt_G + PT_LEN;
  g_ecdsa_bn_N_barrett_factor = g_ecdsa_bn_P_barrett_factor + BN_LEN;
}

int ecdsa_sign(bn_digit_t* bn_r, bn_digit_t* bn_s, const bn_digit_t* bn_hash32, const bn_digit_t* bn_k, const bn_digit_t* bn_private_key, const bn_digit_t* pt_public_key) {
  // https://github.com/ethereum/py_ecc/blob/master/py_ecc/secp256k1/secp256k1.py

  // r, y = multiply(G, k)
  pt_t kG;
  g_mul(kG, bn_k);
  copy_bn(bn_r, kG);

  if (bn_is_zero(bn_r)) {
    return 1;
  }

  // s = inv(k, N) * (z + r * bytes_to_int(priv)) % N
  bn_t a, b, kinv;
  bn_mul(a, bn_r, bn_private_key);
  bn_add(b, bn_hash32, a);
  bn_inv_mod_barrett(kinv, bn_k, g_ecdsa_bn_N, g_ecdsa_bn_N_barrett_factor);
  bn_mul(a, kinv, b);
  bn_mod_barrett(bn_s, a, g_ecdsa_bn_N, g_ecdsa_bn_N_barrett_factor);
  if (bn_neg(bn_s)) {
    bn_add(bn_s, bn_s, g_ecdsa_bn_N);
  }

  // s = s if s * 2 < N else N - s
  bn_double(a, bn_s);
  if (bn_cmp(a, g_ecdsa_bn_N) > 0) {
    bn_sub(bn_s, g_ecdsa_bn_N, bn_s);
  }

  if (bn_is_zero(bn_s)) {
    return 1;
  }

  return 0;
}

int ecdsa_verify(const bn_digit_t* bn_r, const bn_digit_t* bn_s, const bn_digit_t* bn_hash32, const bn_digit_t* pt_public_key) {
  // https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
  // https://cryptobook.nakov.com/digital-signatures/ecdsa-sign-verify-messages

  if (bn_cmp(bn_r, g_ecdsa_bn_1) < 0) return 1;
  if (bn_cmp(bn_s, g_ecdsa_bn_1) < 0) return 1;
  if (bn_cmp(bn_r, g_ecdsa_bn_N) >= 0) return 1;
  if (bn_cmp(bn_s, g_ecdsa_bn_N) >= 0) return 1;

  // Calculate the modular inverse of the signature proof: s1 = inv(s)
  bn_t sinv;
  bn_inv_mod_barrett(sinv, bn_s, g_ecdsa_bn_N, g_ecdsa_bn_N_barrett_factor);

  // Recover the random point used during the signing: R = (h * s1) * G + (r * s1) * pubKey
  bn_t l, r, t1;
  pt_t l2, r2, R;

  bn_mul(t1, bn_hash32, sinv);
  bn_mod_barrett(l, t1, g_ecdsa_bn_N, g_ecdsa_bn_N_barrett_factor);
  if (bn_is_neg(l)) {
    bn_add(l, l, g_ecdsa_bn_N);
  }
  g_mul(l2, l);

  bn_mul(t1, bn_r, sinv);
  bn_mod_barrett(r, t1, g_ecdsa_bn_N, g_ecdsa_bn_N_barrett_factor);
  if (bn_is_neg(l)) {
    bn_add(r, r, g_ecdsa_bn_N);
  }
  pt_mul(r2, pt_public_key, r);

  pt_add(R, l2, r2);

  // Calculate the signature validation result by comparing whether R.x == r
  return bn_cmp(R, bn_r);
}

int validate_point(bn_digit_t* pt_pubkey) { 
  // https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
  // https://research.nccgroup.com/2021/11/18/an-illustrated-guide-to-elliptic-curve-cryptography-validation/

  bn_digit_t* x = pt_x(pt_pubkey);
  bn_digit_t* y = pt_y(pt_pubkey);

  if (bn_neg(x)) return ERR_POINT_OUTSIDE_RANGE;
  if (bn_neg(y)) return ERR_POINT_OUTSIDE_RANGE;
  if (bn_cmp(x, g_ecdsa_bn_P) >= 0) return ERR_POINT_OUTSIDE_RANGE;
  if (bn_cmp(y, g_ecdsa_bn_P) >= 0) return ERR_POINT_OUTSIDE_RANGE;
  if (bn_is_zero(x) && bn_is_zero(y)) return ERR_POINT_OUTSIDE_RANGE;

  bn_t x2, x3, bn_7, right, tmp;
  bn_sq(x2, x);
  bn_mul(x3, x2, x);
  bn_from_digit(bn_7, 7);
  bn_add(tmp, x3, bn_7);
  bn_mod_barrett(right, tmp, g_ecdsa_bn_P, g_ecdsa_bn_P_barrett_factor);
  if (bn_neg(right)) {
    bn_add(right, right, g_ecdsa_bn_P);
  }

  bn_t left;
  bn_sq(tmp, y);
  bn_mod_barrett(left, tmp, g_ecdsa_bn_P, g_ecdsa_bn_P_barrett_factor);

  if (bn_cmp(left, right) != 0) return ERR_POINT_NOT_ON_CURVE;

  // secp256k1 does not require checking if the point is in a valid subgroup
  // pt_t identity;
  // pt_mul(identity, pt_pubkey, g_bn_N);
  // if (bn_cmp(pt_x(identity), g_bn_0) != 0) return 3;
  // if (bn_cmp(pt_y(identity), g_bn_0) != 0) return 3;

  return 0;
}