// health.cpp - Health event monitoring (inhaler clicks, etc.)
#include "health.h"

#define HEALTH_BUTTON_PIN 2
#define DEBOUNCE_DELAY 50

// Static variables for ISR
static volatile uint8_t event_count = 0;
static volatile unsigned long last_event_time = 0;

void HealthMonitor::init() {
  pinMode(HEALTH_BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(HEALTH_BUTTON_PIN), healthEventISR, FALLING);
  event_count = 0;
  last_event_time = 0;
  last_reset = millis();
  Serial.println("Health monitoring initialized");
}

void IRAM_ATTR HealthMonitor::healthEventISR() {
  unsigned long now = millis();
  if (now - last_event_time > DEBOUNCE_DELAY) {
    event_count++;
    last_event_time = now;
  }
}

void HealthMonitor::update() {
  // Reset event count every hour
  if (millis() - last_reset > 3600000) {
    event_count = 0;
    last_reset = millis();
  }
}

uint8_t HealthMonitor::getEventCount() {
  return event_count;
}

void HealthMonitor::resetEventCount() {
  event_count = 0;
}