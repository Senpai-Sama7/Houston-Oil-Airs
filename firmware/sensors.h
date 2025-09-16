// sensors.h - Sensor definitions
#ifndef SENSORS_H
#define SENSORS_H

struct SensorReading {
  float pm25;
  float pm10;
  float temperature;
  float humidity;
  unsigned long timestamp;
};

SensorReading readSensors();

#endif