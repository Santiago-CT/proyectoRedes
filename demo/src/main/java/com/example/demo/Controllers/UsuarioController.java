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

import com.example.demo.entities.Usuario;
import com.example.demo.repositories.UsuarioRepository;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepo;

    public UsuarioController(UsuarioRepository usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepo.findAll();
    }

    @PostMapping
    public Usuario createUsuario(@RequestBody Usuario usuario) {
        // Asigna "Activo" por defecto si el estado no se especifica
        if (usuario.getEstado() == null || usuario.getEstado().isEmpty()) {
            usuario.setEstado("Activo");
        }
        return usuarioRepo.save(usuario);
    }

    @GetMapping("/{id}")
    public Usuario getUsuarioById(@PathVariable Long id) {
        return usuarioRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    // Nuevo endpoint para obtener solo los usuarios activos
    @GetMapping("/activos")
    public List<Usuario> getActiveUsuarios() {
        return usuarioRepo.findByEstado("Activo");
    }

    @PutMapping("/{id}")
    public Usuario updateUsuario(@PathVariable Long id, @RequestBody Usuario usuarioDetails) {
        Usuario usuario = usuarioRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        
        usuario.setNombre(usuarioDetails.getNombre());
        usuario.setDocumento(usuarioDetails.getDocumento());
        usuario.setRfidTag(usuarioDetails.getRfidTag());
        usuario.setEstado(usuarioDetails.getEstado());
        
        return usuarioRepo.save(usuario);
    }

    @DeleteMapping("/{id}")
    public void deleteUsuario(@PathVariable Long id) {
        // Elimina el usuario y sus registros en cascada
        usuarioRepo.deleteById(id);
    }
}