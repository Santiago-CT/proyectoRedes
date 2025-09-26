package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Este método busca un usuario por su etiqueta RFID
    Optional<Usuario> findByRfidTag(String rfidTag);

    // Este método busca todos los usuarios que tengan un estado específico (ej: "Activo")
    List<Usuario> findByEstado(String estado);
}