// sensors.cpp - Sensor implementation for ESP32
#include "sensors.h"
#include <Arduino.h>

SensorReading readSensors() {
  SensorReading reading;
  
  // Simulate sensor readings (in production, read from actual sensors)
  reading.pm25 = random(10, 50);
  reading.pm10 = random(20, 80);
  reading.temperature = random(20, 35);
  reading.humidity = random(40, 80);
  reading.timestamp = millis();
  
  return reading;
}