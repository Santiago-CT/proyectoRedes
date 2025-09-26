package com.example.demo.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Un objeto simple para manejar la respuesta del token
class JwtResponse {
    private final String token;
    public JwtResponse(String token) { this.token = token; }
    public String getToken() { return token; }
}

@RestController
@RequestMapping("/auth")
public class AuthController {

    // Simulación de un único usuario administrador
    private final String ADMIN_USER = "admin";
    private final String ADMIN_PASS = "admin123";

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (ADMIN_USER.equals(username) && ADMIN_PASS.equals(password)) {
        // Aquí iría la lógica para generar un token JWT
            // Por ahora, devolvemos un token simple (esto se mejorará)
            // En un sistema real, usarías una librería para generar un token seguro
            String token = "fake-jwt-token-for-" + username; 
            return ResponseEntity.ok(new JwtResponse(token));
        } else {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }
    }
}