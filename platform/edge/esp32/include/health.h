// health.h - Health monitoring header
#ifndef HEALTH_H
#define HEALTH_H

#include <Arduino.h>

class HealthMonitor {
private:
  unsigned long last_reset;
  
public:
  void init();
  void update();
  uint8_t getEventCount();
  void resetEventCount();
  static void IRAM_ATTR healthEventISR();
};

#endif