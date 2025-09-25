package com.example.demo.Controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.Lector;
import com.example.demo.repositories.LectorRepository;

@RestController
@RequestMapping("/lectores")
public class LectorController {

    private final LectorRepository lectorRepo;

    public LectorController(LectorRepository lectorRepo) {
        this.lectorRepo = lectorRepo;
    }

    @GetMapping
    public List<Lector> getAllLectores() {
        return lectorRepo.findAll();
    }

    @PostMapping
    public Lector createLector(@RequestBody Lector lector) {
        return lectorRepo.save(lector);
    }

    @GetMapping("/{id}")
    public Lector getLectorById(@PathVariable Long id) {
        return lectorRepo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Lector updateLector(@PathVariable Long id, @RequestBody Lector lectorDetails) {
        Lector lector = lectorRepo.findById(id).orElseThrow();
        lector.setUbicacion(lectorDetails.getUbicacion());
        lector.setEstado(lectorDetails.getEstado()); // <-- AÑADE ESTA LÍNEA
        return lectorRepo.save(lector);
    }

    @DeleteMapping("/{id}")
    public void deleteLector(@PathVariable Long id) {
        lectorRepo.deleteById(id);
    }
}