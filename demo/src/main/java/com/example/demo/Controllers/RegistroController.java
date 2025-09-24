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
    public Registro createRegistro(@RequestParam Long usuarioId,
                                   @RequestParam Long lectorId,
                                   @RequestParam String tipoMovimiento) {
        Usuario usuario = usuarioRepo.findById(usuarioId).orElseThrow();
        Lector lector = lectorRepo.findById(lectorId).orElseThrow();

        Registro registro = new Registro();
        registro.setUsuario(usuario);
        registro.setLector(lector);
        registro.setTipoMovimiento(tipoMovimiento);
        registro.setFechaHora(LocalDateTime.now());

        return registroRepo.save(registro);
    }
}
