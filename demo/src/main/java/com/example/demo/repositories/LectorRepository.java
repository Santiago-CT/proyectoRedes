package com.example.demo.repositories;

import com.example.demo.entities.Lector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface LectorRepository extends JpaRepository<Lector, Long> {
    
    // Busca lectores por su estado (ej: "Activo")
    List<Lector> findByEstado(String estado);

    // Busca solo los lectores que tienen al menos un registro asociado
    @Query("SELECT DISTINCT r.lector FROM Registro r WHERE r.lector IS NOT NULL")
    List<Lector> findLectoresWithRegistros();
}