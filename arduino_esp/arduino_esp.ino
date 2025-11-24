#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- CONFIGURACIÓN DE RED Y SERVIDOR ---
const char* WIFI_SSID = "Nemo";          
const char* WIFI_PASSWORD = "12345678";  

// IP de tu servidor (Backend). 
const char* SERVER_IP = "192.168.43.210"; 
const int SERVER_PORT = 8080;             
const long LECTOR_ID = 1;                 

// --- PINES HARDWARE (Actualizado a tu nueva conexión) ---
#define RST_PIN  22   // CAMBIO AQUÍ: Antes era 4, ahora es D22
#define SS_PIN   5    // SDA conectado a D5
#define LED_PIN  2    // LED integrado

MFRC522 rfid(SS_PIN, RST_PIN); 


void parpadearLed(int veces, int duracionMs) {
  for (int i = 0; i < veces; i++) {
    digitalWrite(LED_PIN, LOW);
    delay(duracionMs);
    digitalWrite(LED_PIN, HIGH);
    delay(duracionMs);
  }
  digitalWrite(LED_PIN, HIGH); 
}

void conectarWiFi() {
  Serial.println();
  Serial.print("Conectando a WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA); 
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); 
    intentos++;
    if(intentos > 40){ 
        Serial.println("\nFallo al conectar. Reiniciando...");
        ESP.restart();
    }
  }
  
  Serial.println("\n¡WiFi Conectado!");
  Serial.print("IP Asignada: ");
  Serial.println(WiFi.localIP());
  digitalWrite(LED_PIN, HIGH); 
}

void enviarTagRfid(String rfidTag) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("!! WiFi desconectado. Reconectando...");
    conectarWiFi();
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverUrl = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + "/registros/rfid";
    
    Serial.println("Enviando a: " + serverUrl);
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // ArduinoJson v7
    JsonDocument doc; 
    doc["rfidTag"] = rfidTag;
    doc["lectorId"] = LECTOR_ID;
    
    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode == 200) {
      String payload = http.getString();
      Serial.println(">> RESPUESTA: " + payload);
      Serial.println(">> ACCESO CORRECTO");
      parpadearLed(2, 100); 
      
    } else if (httpResponseCode == 404) {
       Serial.println(">> TAG DESCONOCIDO (Capturado en backend)");
       parpadearLed(3, 300); 
       
    } else {
      Serial.print(">> ERROR HTTP: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(">> MENSAJE: " + payload);
      
      digitalWrite(LED_PIN, LOW);
      delay(2000);
      digitalWrite(LED_PIN, HIGH);
    }
    
    http.end();
  } 
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // INICIAR SPI CON TUS PINES
  // SCK=18, MISO=19, MOSI=23, SS=5
  SPI.begin(18, 19, 23, 5); 
  
  rfid.PCD_Init();    

  Serial.println("\n--- PRUEBA DE HARDWARE RFID ---");
  rfid.PCD_DumpVersionToSerial(); // Verificar si ahora responde el lector
  Serial.println("-------------------------------");

  conectarWiFi();
  Serial.println("Sistema listo. Acerque una tarjeta...");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
  }

  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  String rfidTag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    rfidTag.concat(String(rfid.uid.uidByte[i] < 0x10 ? "0" : ""));
    rfidTag.concat(String(rfid.uid.uidByte[i], HEX));
  }
  rfidTag.toUpperCase();

  Serial.print("\nTAG LEÍDO: ");
  Serial.println(rfidTag);

  enviarTagRfid(rfidTag);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  delay(1500); 
}
