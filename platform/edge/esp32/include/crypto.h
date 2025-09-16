// crypto.h - Dual-key encryption header
#ifndef CRYPTO_H
#define CRYPTO_H

#include <Arduino.h>

class CryptoManager {
private:
  char community_key[64];
  char device_key[64];
  
public:
  void init();
  void signData(uint8_t* data, size_t len, char* signature);
  bool verifySignature(uint8_t* data, size_t len, const char* signature);
};

#endif