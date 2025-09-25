package com.example.demo.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Usuario; // Importa Optional

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Este método permitirá buscar un usuario por su tag RFID
    Optional<Usuario> findByRfidTag(String rfidTag);
}