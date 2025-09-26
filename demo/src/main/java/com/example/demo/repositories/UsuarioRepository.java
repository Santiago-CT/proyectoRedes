package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findTopByUsuarioOrderByIdDesc(Usuario usuario);
    Optional<Usuario> findByRfidTag(String rfidTag);

    // --- AÑADE ESTA LÍNEA ---
    List<Usuario> findByEstado(String estado);
}