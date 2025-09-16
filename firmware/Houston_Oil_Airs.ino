// Houston Oil Airs - ESP32 Air Quality Sensor
// Original sensor firmware for PM2.5, PM10, temperature, humidity

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Sensor pins
#define PM25_PIN A0
#define PM10_PIN A1
#define TEMP_PIN A2
#define HUMID_PIN A3

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT settings
const char* mqtt_server = "localhost";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

struct SensorReading {
  float pm25;
  float pm10;
  float temperature;
  float humidity;
  unsigned long timestamp;
};

void setup() {
  Serial.begin(115200);
  
  // Initialize sensor pins
  pinMode(PM25_PIN, INPUT);
  pinMode(PM10_PIN, INPUT);
  pinMode(TEMP_PIN, INPUT);
  pinMode(HUMID_PIN, INPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
  
  // Connect to MQTT
  client.setServer(mqtt_server, mqtt_port);
  while (!client.connected()) {
    if (client.connect("HoustonOilAirs")) {
      Serial.println("MQTT connected");
    } else {
      delay(5000);
    }
  }
}

SensorReading readSensors() {
  SensorReading reading;
  
  // Read analog values and convert to meaningful units
  reading.pm25 = analogRead(PM25_PIN) * 0.1; // Convert to µg/m³
  reading.pm10 = analogRead(PM10_PIN) * 0.1;
  reading.temperature = (analogRead(TEMP_PIN) * 0.1) - 40; // Convert to °C
  reading.humidity = analogRead(HUMID_PIN) * 0.1; // Convert to %
  reading.timestamp = millis();
  
  return reading;
}

void publishReading(SensorReading reading) {
  StaticJsonDocument<200> doc;
  doc["pm25"] = reading.pm25;
  doc["pm10"] = reading.pm10;
  doc["temperature"] = reading.temperature;
  doc["humidity"] = reading.humidity;
  doc["timestamp"] = reading.timestamp;
  doc["device_id"] = "houston_sensor_001";
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  client.publish("sensors/air_quality", buffer);
  Serial.println("Published: " + String(buffer));
}

void loop() {
  if (!client.connected()) {
    // Reconnect MQTT if needed
    while (!client.connected()) {
      if (client.connect("HoustonOilAirs")) {
        Serial.println("MQTT reconnected");
      } else {
        delay(5000);
      }
    }
  }
  
  client.loop();
  
  // Read sensors and publish every 30 seconds
  SensorReading reading = readSensors();
  publishReading(reading);
  
  delay(30000);
}