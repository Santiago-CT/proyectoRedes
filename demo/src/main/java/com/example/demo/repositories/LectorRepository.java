package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Lector;

public interface LectorRepository extends JpaRepository<Lector, Long> {
}
