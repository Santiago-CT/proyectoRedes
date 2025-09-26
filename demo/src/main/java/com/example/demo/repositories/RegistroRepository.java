package com.example.demo.repositories;

import java.time.LocalDate; 
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; 

import com.example.demo.entities.Registro;
import com.example.demo.entities.Usuario;

public interface RegistroRepository extends JpaRepository<Registro, Long> {
    Optional<Registro> findTopByUsuarioOrderByIdDesc(Usuario usuario);
    List<Registro> findByUsuarioIdOrderByFechaHoraDesc(Long usuarioId);
    
    
    @Query("SELECT r FROM Registro r WHERE CAST(r.fechaHora AS date) = :fecha")
    List<Registro> findByFecha(@Param("fecha") LocalDate fecha);
    List<Registro> findByLectorIdOrderByFechaHoraDesc(Long lectorId);
}