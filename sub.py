import paho.mqtt.client as mqtt
import json

# ==========================
# MQTT Broker Settings
# ==========================

BROKER = "103.20.215.109"   # Your broker IP
PORT = 1883
TOPIC = "aqi/#"            # Listen to all AQI topics

# ==========================
# When Connected
# ==========================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker")
        client.subscribe(TOPIC)
        print(f"📡 Subscribed to: {TOPIC}")
    else:
        print("❌ Connection failed with code", rc)

# ==========================
# When Message Received
# ==========================
def on_message(client, userdata, msg):
    print("\n==============================")
    print("📌 Topic:", msg.topic)

    try:
        payload = msg.payload.decode()
        print("📦 Raw Payload:", payload)

        # Try parsing JSON
        data = json.loads(payload)
        print("🔍 Parsed JSON:", data)

    except Exception as e:
        print("⚠ Error parsing message:", e)

    print("==============================")

# ==========================
# MQTT Client Setup
# ==========================
client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)

client.loop_forever()
