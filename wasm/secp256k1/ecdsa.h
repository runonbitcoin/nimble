/**
 * ecdsa.h
 */

#include "bn.h"

void ecdsa_init(unsigned long memory_start);
int ecdsa_sign(bn_digit_t* bn_r, bn_digit_t* bn_s, const bn_digit_t* bn_hash32, const bn_digit_t* bn_k, const bn_digit_t* bn_private_key, const bn_digit_t* pt_public_key);
int ecdsa_verify(const bn_digit_t* bn_r, const bn_digit_t* bn_s, const bn_digit_t* bn_hash32, const bn_digit_t* pt_public_key);
int validate_pubkey(bn_digit_t* pt_pubkey);
