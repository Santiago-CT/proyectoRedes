package com.example.demo.Controllers;

import java.util.List;
import org.springframework.web.bind.annotation.*;
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
        // Asigna "Activo" por defecto si el estado no se especifica
        if (lector.getEstado() == null || lector.getEstado().isEmpty()) {
            lector.setEstado("Activo");
        }
        return lectorRepo.save(lector);
    }

    @GetMapping("/{id}")
    public Lector getLectorById(@PathVariable Long id) {
        return lectorRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Lector no encontrado con id: " + id));
    }

    @GetMapping("/activos")
    public List<Lector> getActiveLectores() {
        return lectorRepo.findByEstado("Activo");
    }

    @GetMapping("/con-registros")
    public List<Lector> getLectoresConRegistros() {
        return lectorRepo.findLectoresWithRegistros();
    }

    @PutMapping("/{id}")
    public Lector updateLector(@PathVariable Long id, @RequestBody Lector lectorDetails) {
        Lector lector = lectorRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Lector no encontrado con id: " + id));

        lector.setUbicacion(lectorDetails.getUbicacion());
        lector.setEstado(lectorDetails.getEstado());
        
        return lectorRepo.save(lector);
    }

    @DeleteMapping("/{id}")
    public void deleteLector(@PathVariable Long id) {
        lectorRepo.deleteById(id);
    }
}