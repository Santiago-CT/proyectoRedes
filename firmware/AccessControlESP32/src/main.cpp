#include <Arduino.h>
#include "time.h" 
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// --- CONFIGURACIÓN DE RED ---
const char* WIFI_SSID = "TU_NOMBRE_DE_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASENA_DE_WIFI";
const char* SERVER_IP = "192.168.128.10";
const int SERVER_PORT = 8080;
const long LECTOR_ID = 1;

// --- CONFIGURACIÓN DE HORA (NTP) ---
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = -5 * 3600; // Offset para Colombia (UTC-5)
const int   daylightOffset_sec = 0;

// --- PINES PARA EL LECTOR RFID (RC522) ---
#define RST_PIN  22
#define SS_PIN   21

// --- PANTALLA LCD (I2C) ---
LiquidCrystal_I2C lcd(0x27, 16, 2); 
MFRC522 rfid(SS_PIN, RST_PIN);

// Variables para el control del tiempo en el LCD
unsigned long lastTimeUpdate = 0;
const long timeUpdateInterval = 1000; // 1 segundo

// --- FUNCIÓN PARA MOSTRAR LA HORA ---
void mostrarHoraLocal() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    lcd.setCursor(0, 0);
    lcd.print("Error de tiempo");
    return;
  }
  
  char timeString[9];
  strftime(timeString, sizeof(timeString), "%H:%M:%S", &timeinfo);
  
  lcd.setCursor(0, 0);
  lcd.print(timeString);
  lcd.setCursor(0, 1);
  lcd.print("Acerque tarjeta "); // Se añade un espacio al final para limpiar
}

// --- FUNCIÓN PARA CONECTAR A WIFI ---
void conectarWiFi() {
  lcd.clear();
  lcd.print("Conectando a");
  lcd.setCursor(0, 1);
  lcd.print(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int dotCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    lcd.print(".");
    dotCount++;
    if (dotCount > 15) { // Para que no se salga de la pantalla
      lcd.setCursor(0, 1);
      lcd.print(WIFI_SSID);
      lcd.print("                "); // Limpia la línea
      lcd.setCursor(strlen(WIFI_SSID), 1);
      dotCount = 0;
    }
  }
  
  lcd.clear();
  lcd.print("Conectado!");
  lcd.setCursor(0, 1);
  lcd.print("IP: ");
  lcd.print(WiFi.localIP());
  delay(2000);
}

// --- FUNCIÓN PARA ENVIAR EL TAG AL BACKEND ---
void enviarTagRfid(String rfidTag) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverUrl = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + "/registros/rfid";
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<128> doc;
    doc["rfidTag"] = rfidTag;
    doc["lectorId"] = LECTOR_ID;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    lcd.clear();
    if (httpResponseCode == 200) { // 200 = OK
      String payload = http.getString();
      
      // Deserializar la respuesta para obtener el nombre del usuario y el movimiento
      StaticJsonDocument<256> responseDoc;
      deserializeJson(responseDoc, payload);
      
      const char* nombre = responseDoc["usuario"]["nombre"];
      const char* movimiento = responseDoc["tipoMovimiento"];

      lcd.print("Acceso Correcto");
      lcd.setCursor(0, 1);
      lcd.print(nombre);
      
    } else if (httpResponseCode > 0) {
      lcd.print("Acceso Denegado");
      lcd.setCursor(0, 1);
      lcd.print("Error: ");
      lcd.print(httpResponseCode);
    } else {
      lcd.print("Error de conexion");
    }
    
    http.end();
  } else {
    lcd.clear();
    lcd.print("WiFi Desconectado");
  }
  delay(3000);
}


void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  lcd.init();
  lcd.backlight();
  
  lcd.setCursor(0, 0);
  lcd.print("Control de Acceso");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");
  delay(2000);
  
  conectarWiFi();

  // Sincronizar hora con servidor NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  lcd.clear();
  lcd.print("Reloj Sincronizado");
  delay(2000);

  Serial.println("Sistema listo. Acerque una tarjeta RFID...");
}

void loop() {
  // --- LÓGICA DE LECTURA RFID ---
  // Revisa si hay una tarjeta y la lee
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String rfidTag = "";
    
    for (byte i = 0; i < rfid.uid.size; i++) {
      rfidTag.concat(String(rfid.uid.uidByte[i] < 0x10 ? "0" : ""));
      rfidTag.concat(String(rfid.uid.uidByte[i], HEX));
    }
    
    rfidTag.toUpperCase();
    
    lcd.clear();
    lcd.print("Tag leido:");
    lcd.setCursor(0, 1);
    lcd.print(rfidTag);
    Serial.println("Tag leido: " + rfidTag);
    delay(1000);
    
    enviarTagRfid(rfidTag);

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    lastTimeUpdate = 0; // Forzar actualización de la hora inmediatamente
  }

  // --- LÓGICA DEL RELOJ ---
  // Actualiza la hora en el LCD cada segundo sin bloquear el código
  if (millis() - lastTimeUpdate > timeUpdateInterval) {
    lastTimeUpdate = millis();
    mostrarHoraLocal();
  }
}