// crypto.cpp - Dual-key encryption for community data governance
#include "crypto.h"
#include <mbedtls/sha256.h>

void CryptoManager::init() {
  // Initialize crypto keys (in production, load from secure storage)
  strcpy(community_key, "community_key_placeholder");
  strcpy(device_key, "device_key_placeholder");
  Serial.println("Crypto initialized - dual-key mode");
}

void CryptoManager::signData(uint8_t* data, size_t len, char* signature) {
  mbedtls_sha256_context ctx;
  uint8_t hash[32];
  
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0);
  mbedtls_sha256_update(&ctx, data, len);
  mbedtls_sha256_update(&ctx, (uint8_t*)community_key, strlen(community_key));
  mbedtls_sha256_update(&ctx, (uint8_t*)device_key, strlen(device_key));
  mbedtls_sha256_finish(&ctx, hash);
  mbedtls_sha256_free(&ctx);
  
  // Convert hash to hex string
  for (int i = 0; i < 32; i++) {
    sprintf(&signature[i*2], "%02x", hash[i]);
  }
  signature[64] = '\0';
}

bool CryptoManager::verifySignature(uint8_t* data, size_t len, const char* signature) {
  char computed_sig[65];
  signData(data, len, computed_sig);
  return strcmp(computed_sig, signature) == 0;
}