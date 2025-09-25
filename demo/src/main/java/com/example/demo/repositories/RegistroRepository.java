package com.example.demo.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Registro; // Importa Usuario
import com.example.demo.entities.Usuario; // Importa Optional

public interface RegistroRepository extends JpaRepository<Registro, Long> {
    // Este método buscará el último registro de un usuario específico
    Optional<Registro> findTopByUsuarioOrderByIdDesc(Usuario usuario);
}