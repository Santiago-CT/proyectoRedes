package com.example.demo;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.example.demo.entities.Lector;
import com.example.demo.entities.Registro;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.LectorRepository;
import com.example.demo.repositories.RegistroRepository;
import com.example.demo.repositories.UsuarioRepository;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    public CommandLineRunner demo(
            UsuarioRepository usuarioRepo,
            LectorRepository lectorRepo,
            RegistroRepository registroRepo) {
        return (args) -> {
            
            Usuario usuario = new Usuario();
            usuario.setNombre("Juan Pérez");
            usuario.setDocumento("123456789");
            usuarioRepo.save(usuario);

            // Crear lector
            Lector lector = new Lector();
            lector.setUbicacion("Puerta Principal");
            lectorRepo.save(lector);

            
            Registro registro = new Registro();
            registro.setUsuario(usuario);
            registro.setLector(lector);
            registro.setTipoMovimiento("entrada");
            registro.setFechaHora(LocalDateTime.now());
            registroRepo.save(registro);

            System.out.println("✅ Datos guardados correctamente en PostgreSQL 🚀");
        };
    }
}
