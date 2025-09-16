// EJ-AI Enhanced ESP32 Firmware with encryption and health monitoring
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <mbedtls/sha256.h>
#include "config.h"
#include "crypto.h"
#include "health.h"

// Include legacy sensors
extern "C" {
  #include "../../../../firmware/sensors.h"
}

WiFiClient espClient;
PubSubClient client(espClient);
CryptoManager crypto;
HealthMonitor health;

struct EncryptedSensorReading {
  float pm25;
  float pm10;
  float temperature;
  float humidity;
  uint32_t timestamp;
  uint8_t health_events;
  char signature[65];
  char device_id[32];
};

void setup() {
  Serial.begin(115200);
  
  // Initialize crypto and health monitoring
  crypto.init();
  health.init();
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected - EJ-AI Enhanced");
  
  // Connect to MQTT
  client.setServer(MQTT_SERVER, MQTT_PORT);
  while (!client.connected()) {
    if (client.connect("HoustonEJAI")) {
      Serial.println("MQTT connected - Encrypted mode");
    } else {
      delay(5000);
    }
  }
}

EncryptedSensorReading readEncryptedSensors() {
  // Get legacy sensor reading
  SensorReading legacy = readSensors();
  
  EncryptedSensorReading encrypted;
  encrypted.pm25 = legacy.pm25;
  encrypted.pm10 = legacy.pm10;
  encrypted.temperature = legacy.temperature;
  encrypted.humidity = legacy.humidity;
  encrypted.timestamp = millis();
  encrypted.health_events = health.getEventCount();
  strcpy(encrypted.device_id, "houston_ej_ai_001");
  
  // Sign the data
  crypto.signData((uint8_t*)&encrypted, sizeof(encrypted) - 65, encrypted.signature);
  
  return encrypted;
}

void publishEncryptedReading(EncryptedSensorReading reading) {
  StaticJsonDocument<400> doc;
  doc["pm25"] = reading.pm25;
  doc["pm10"] = reading.pm10;
  doc["temperature"] = reading.temperature;
  doc["humidity"] = reading.humidity;
  doc["timestamp"] = reading.timestamp;
  doc["health_events"] = reading.health_events;
  doc["device_id"] = reading.device_id;
  doc["signature"] = reading.signature;
  doc["encrypted"] = true;
  doc["version"] = "2.0-ej-ai";
  
  char buffer[512];
  serializeJson(doc, buffer);
  
  client.publish("sensors/ej_ai/encrypted", buffer);
  Serial.println("Published encrypted: " + String(buffer));
}

void loop() {
  if (!client.connected()) {
    while (!client.connected()) {
      if (client.connect("HoustonEJAI")) {
        Serial.println("MQTT reconnected");
      } else {
        delay(5000);
      }
    }
  }
  
  client.loop();
  health.update();
  
  // Read and publish encrypted data every 30 seconds
  EncryptedSensorReading reading = readEncryptedSensors();
  publishEncryptedReading(reading);
  
  delay(30000);
}