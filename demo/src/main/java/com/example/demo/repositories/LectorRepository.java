package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Lector;

public interface LectorRepository extends JpaRepository<Lector, Long> {
    // --- AÑADE ESTA LÍNEA ---
    List<Lector> findByEstado(String estado);
}
