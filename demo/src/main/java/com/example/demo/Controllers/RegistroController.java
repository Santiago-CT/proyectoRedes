package com.example.demo.Controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entities.Lector;
import com.example.demo.entities.Registro;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.LectorRepository;
import com.example.demo.repositories.RegistroRepository;
import com.example.demo.repositories.UsuarioRepository;

class RegistroRequest {
    public Long usuarioId;
    public Long lectorId;
    public String tipoMovimiento;
}

class RfidRequest {
    public String rfidTag;
    public Long lectorId;
}

@RestController
@RequestMapping("/registros")
public class RegistroController {

    private final RegistroRepository registroRepo;
    private final UsuarioRepository usuarioRepo;
    private final LectorRepository lectorRepo;

    // Variable temporal para guardar el último tag no registrado
    private String ultimoTagDesconocido = null;

    public RegistroController(RegistroRepository registroRepo, UsuarioRepository usuarioRepo, LectorRepository lectorRepo) {
        this.registroRepo = registroRepo;
        this.usuarioRepo = usuarioRepo;
        this.lectorRepo = lectorRepo;
    }

    @GetMapping
    public List<Registro> getAllRegistros() {
        return registroRepo.findAll();
    }

    // --- NUEVO ENDPOINT: Obtener el último tag desconocido ---
    @GetMapping("/ultimo-desconocido")
    public ResponseEntity<Map<String, String>> getUltimoTagDesconocido() {
        if (ultimoTagDesconocido == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.singletonMap("message", "No se han detectado tags recientes"));
        }
        return ResponseEntity.ok(Collections.singletonMap("rfidTag", ultimoTagDesconocido));
    }

    @PostMapping
    public Registro createRegistro(@RequestBody RegistroRequest registroRequest) {
        Usuario usuario = usuarioRepo.findById(registroRequest.usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + registroRequest.usuarioId));
        
        if (!"Activo".equalsIgnoreCase(usuario.getEstado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario está inactivo");
        }

        Lector lector = lectorRepo.findById(registroRequest.lectorId)
            .orElseThrow(() -> new RuntimeException("Lector no encontrado con id: " + registroRequest.lectorId));

        return procesarMovimiento(usuario, lector);
    }

    @PostMapping("/rfid")
    public Registro createRegistroByRfid(@RequestBody RfidRequest rfidRequest) {
        // Buscamos el usuario por el tag
        Optional<Usuario> usuarioOpt = usuarioRepo.findByRfidTag(rfidRequest.rfidTag);

        // SI EL USUARIO NO EXISTE:
        if (!usuarioOpt.isPresent()) {
            // Guardamos este tag en la variable temporal para que el Frontend pueda capturarlo
            this.ultimoTagDesconocido = rfidRequest.rfidTag;
            System.out.println("Tag desconocido detectado y guardado temporalmente: " + rfidRequest.rfidTag);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tag no registrado. Guardado para captura.");
        }

        Usuario usuario = usuarioOpt.get();
        
        if (!"Activo".equalsIgnoreCase(usuario.getEstado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario inactivo");
        }
        
        Lector lector = lectorRepo.findById(rfidRequest.lectorId)
            .orElseThrow(() -> new RuntimeException("Lector no encontrado"));
        return procesarMovimiento(usuario, lector);
    }

    // Método auxiliar para evitar repetir lógica
    private Registro procesarMovimiento(Usuario usuario, Lector lector) {
        Optional<Registro> ultimoRegistro = registroRepo.findTopByUsuarioOrderByIdDesc(usuario);
        String tipoMovimiento = "entrada";
        
        if (ultimoRegistro.isPresent() && "entrada".equalsIgnoreCase(ultimoRegistro.get().getTipoMovimiento())) {
            tipoMovimiento = "salida";
        }

        Registro nuevoRegistro = new Registro();
        nuevoRegistro.setUsuario(usuario);
        nuevoRegistro.setLector(lector);
        nuevoRegistro.setTipoMovimiento(tipoMovimiento);
        nuevoRegistro.setFechaHora(LocalDateTime.now());

        return registroRepo.save(nuevoRegistro);
    }

    @GetMapping("/fecha/{fecha}")
    public List<Registro> getRegistrosByFecha(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return registroRepo.findByFecha(fecha);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Registro> getRegistrosByUsuario(@PathVariable Long usuarioId) {
        return registroRepo.findByUsuarioIdOrderByFechaHoraDesc(usuarioId);
    }
    
    @GetMapping("/lector/{lectorId}")
    public List<Registro> getRegistrosByLector(@PathVariable Long lectorId) {
        return registroRepo.findByLectorIdOrderByFechaHoraDesc(lectorId);
    }
}