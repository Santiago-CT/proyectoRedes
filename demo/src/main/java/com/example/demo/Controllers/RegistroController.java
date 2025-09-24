package com.example.demo.Controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;
import com.example.demo.entities.Registro;
import com.example.demo.entities.Usuario;
import com.example.demo.entities.Lector;
import com.example.demo.repositories.RegistroRepository;
import com.example.demo.repositories.UsuarioRepository;
import com.example.demo.repositories.LectorRepository;

// DTO para recibir los datos del frontend
class RegistroRequest {
    public Long usuarioId;
    public Long lectorId;
    public String tipoMovimiento;
}

@RestController
@RequestMapping("/registros")
public class RegistroController {

    private final RegistroRepository registroRepo;
    private final UsuarioRepository usuarioRepo;
    private final LectorRepository lectorRepo;

    public RegistroController(RegistroRepository registroRepo, UsuarioRepository usuarioRepo, LectorRepository lectorRepo) {
        this.registroRepo = registroRepo;
        this.usuarioRepo = usuarioRepo;
        this.lectorRepo = lectorRepo;
    }

    @GetMapping
    public List<Registro> getAllRegistros() {
        return registroRepo.findAll();
    }

    @PostMapping
    public Registro createRegistro(@RequestBody RegistroRequest registroRequest) {
        // Busca el usuario y el lector en la base de datos
        Usuario usuario = usuarioRepo.findById(registroRequest.usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + registroRequest.usuarioId));
        Lector lector = lectorRepo.findById(registroRequest.lectorId)
            .orElseThrow(() -> new RuntimeException("Lector no encontrado con id: " + registroRequest.lectorId));

        // Crea el nuevo registro
        Registro registro = new Registro();
        registro.setUsuario(usuario);
        registro.setLector(lector);
        registro.setTipoMovimiento(registroRequest.tipoMovimiento);
        registro.setFechaHora(LocalDateTime.now());

        // Guarda y devuelve el nuevo registro
        return registroRepo.save(registro);
    }
}