#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- CONFIGURACIÓN DE RED Y SERVIDOR ---
// ⚠️ REEMPLAZA CON TUS DATOS REALES
const char* WIFI_SSID = "Nemo";
const char* WIFI_PASSWORD = "12345678"; 

// IP de tu PC donde corre el servidor (Backend Java)
// Según tu comando 'ip addr show', tu IP es 192.168.43.210
const char* SERVER_IP = "192.168.43.210"; 
const int SERVER_PORT = 8080;
const long LECTOR_ID = 1; // ID de este lector en la base de datos

// --- PINES HARDWARE (ESP32 DEVKIT V1) ---
#define RST_PIN  4   // Pin de Reset para el RC522
#define SS_PIN   5   // Pin SDA(SS) para el RC522
#define LED_PIN  2   // LED integrado del ESP32 (generalmente GPIO 2)

MFRC522 rfid(SS_PIN, RST_PIN);

// --- FUNCIONES AUXILIARES ---

// Parpadea el LED n veces con una duración específica
void parpadearLed(int veces, int duracionMs) {
  for (int i = 0; i < veces; i++) {
    digitalWrite(LED_PIN, LOW); // Apagar
    delay(duracionMs);
    digitalWrite(LED_PIN, HIGH); // Encender
    delay(duracionMs);
  }
  // Dejar encendido al final (estado normal: conectado y listo)
  digitalWrite(LED_PIN, HIGH); 
}

void conectarWiFi() {
  Serial.println();
  Serial.print("Conectando a WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    // Parpadeo breve mientras conecta
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); 
    intentos++;
    if(intentos > 20){ // Si tarda mucho, imprime salto de linea
        Serial.println("\nReintentando...");
        intentos = 0;
    }
  }
  
  Serial.println("\n¡WiFi Conectado!");
  Serial.print("IP Asignada al ESP32: ");
  Serial.println(WiFi.localIP());
  
  // Encender LED fijo para indicar conexión exitosa
  digitalWrite(LED_PIN, HIGH); 
}

void enviarTagRfid(String rfidTag) {
  // Verificar conexión antes de enviar
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("!! Error: WiFi desconectado. Reintentando...");
    conectarWiFi();
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    // Construir URL: http://192.168.43.210:8080/registros/rfid
    String serverUrl = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + "/registros/rfid";
    
    Serial.println("Enviando datos a: " + serverUrl);
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Crear JSON (usando ArduinoJson v6 o v7)
    // Si usas v6, usa StaticJsonDocument. Si usas v7, usa JsonDocument.
    // Este código es compatible con v6 (muy común) y v7.
    StaticJsonDocument<200> doc;
    doc["rfidTag"] = rfidTag;
    doc["lectorId"] = LECTOR_ID;
    
    String requestBody;
    serializeJson(doc, requestBody);

    // Enviar POST
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode == 200) {
      String payload = http.getString();
      Serial.println(">> RESPUESTA SERVIDOR: " + payload);
      Serial.println(">> ACCESO CORRECTO / REGISTRO OK");
      
      // Feedback visual: 2 parpadeos rápidos (ÉXITO)
      parpadearLed(2, 100); 
      
    } else if (httpResponseCode == 404) {
       // Esto pasa cuando el Backend guarda el tag desconocido (tu nueva lógica)
       Serial.println(">> TAG DESCONOCIDO (Guardado para captura en web)");
       // Feedback visual: 3 parpadeos medios (ATENCIÓN)
       parpadearLed(3, 300);
    } else {
      Serial.print(">> ERROR EN PETICIÓN: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(">> MENSAJE: " + payload);
      
      // Feedback visual error: Apagar LED por 2 segundos (ERROR)
      digitalWrite(LED_PIN, LOW);
      delay(2000);
      digitalWrite(LED_PIN, HIGH);
    }
    
    http.end();
  } 
}

void setup() {
  Serial.begin(115200); // Iniciar comunicación serie
  pinMode(LED_PIN, OUTPUT);
  
  SPI.begin();        // Iniciar bus SPI
  rfid.PCD_Init();    // Iniciar MFRC522

  Serial.println("\n--- SISTEMA DE CONTROL DE ACCESO (ESP32 + RFID) ---");
  
  conectarWiFi();

  Serial.println("Sistema listo. Acerque una tarjeta al lector...");
}

void loop() {
  // 1. Revisar si hay tarjeta nueva presente
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // 2. Revisar si podemos leer la tarjeta
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // 3. Convertir UID a String Hexadecimal
  String rfidTag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    // Agrega un 0 a la izquierda si el número es menor a 16
    rfidTag.concat(String(rfid.uid.uidByte[i] < 0x10 ? "0" : ""));
    rfidTag.concat(String(rfid.uid.uidByte[i], HEX));
  }
  rfidTag.toUpperCase(); // Convertir a mayúsculas

  Serial.println("\n[TARJETA DETECTADA]");
  Serial.println("UID: " + rfidTag);

  // 4. Enviar al Backend
  enviarTagRfid(rfidTag);

  // 5. Detener la lectura actual
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  delay(1000); // Pequeña espera para no leer mil veces la misma tarjeta
}
