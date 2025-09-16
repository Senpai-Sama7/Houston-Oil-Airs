// MQTT to Kafka bridge for real-time data ingestion
const mqtt = require('mqtt');
const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');

// MQTT Configuration
const mqttClient = mqtt.connect('mqtt://localhost:1883');

// Kafka Configuration
const kafka = Kafka({
  clientId: 'houston-ej-ai-bridge',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

// CSV Legacy Support
const csvPath = path.join(__dirname, '../../../data');
if (!fs.existsSync(csvPath)) {
  fs.mkdirSync(csvPath, { recursive: true });
}

async function init() {
  await producer.connect();
  console.log('Kafka producer connected');
  
  mqttClient.on('connect', () => {
    console.log('MQTT connected');
    mqttClient.subscribe('sensors/+/+');
    mqttClient.subscribe('sensors/air_quality');
  });
  
  mqttClient.on('message', async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received from ${topic}:`, data);
      
      // Send to Kafka
      await producer.send({
        topic: 'air-quality-data',
        messages: [{
          key: data.device_id || 'unknown',
          value: JSON.stringify({
            ...data,
            ingestion_timestamp: Date.now(),
            source_topic: topic
          })
        }]
      });
      
      // Legacy CSV support
      await appendToCsv(data);
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
}

async function appendToCsv(data) {
  const csvFile = path.join(csvPath, 'air_quality_data.csv');
  const csvLine = `${data.timestamp || Date.now()},${data.pm25 || 0},${data.pm10 || 0},${data.temperature || 0},${data.humidity || 0},${data.device_id || 'unknown'},${data.health_events || 0}\n`;
  
  // Create header if file doesn't exist
  if (!fs.existsSync(csvFile)) {
    const header = 'timestamp,pm25,pm10,temperature,humidity,device_id,health_events\n';
    fs.writeFileSync(csvFile, header);
  }
  
  fs.appendFileSync(csvFile, csvLine);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await producer.disconnect();
  mqttClient.end();
  process.exit(0);
});

init().catch(console.error);