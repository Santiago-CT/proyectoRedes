package com.example.demo.Controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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


// DTO para la simulación manual desde el frontend
class RegistroRequest {
    public Long usuarioId;
    public Long lectorId;
    public String tipoMovimiento;
}

// DTO para la petición que enviará el ESP32
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

    public RegistroController(RegistroRepository registroRepo, UsuarioRepository usuarioRepo, LectorRepository lectorRepo) {
        this.registroRepo = registroRepo;
        this.usuarioRepo = usuarioRepo;
        this.lectorRepo = lectorRepo;
    }

    @GetMapping
    public List<Registro> getAllRegistros() {
        return registroRepo.findAll();
    }

    // Endpoint para la simulación desde el frontend (CON LA NUEVA LÓGICA)
    @PostMapping
    public Registro createRegistro(@RequestBody RegistroRequest registroRequest) {
        Usuario usuario = usuarioRepo.findById(registroRequest.usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + registroRequest.usuarioId));
        
        Lector lector = lectorRepo.findById(registroRequest.lectorId)
            .orElseThrow(() -> new RuntimeException("Lector no encontrado con id: " + registroRequest.lectorId));

        // --- INICIO DE LA NUEVA VALIDACIÓN ---
        Optional<Registro> ultimoRegistro = registroRepo.findTopByUsuarioOrderByIdDesc(usuario);
        String movimientoDeseado = registroRequest.tipoMovimiento;

        if (movimientoDeseado.equalsIgnoreCase("salida")) {
            // Regla: No se puede registrar una salida si no hay registro previo o si el último fue una salida.
            if (!ultimoRegistro.isPresent() || ultimoRegistro.get().getTipoMovimiento().equalsIgnoreCase("salida")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede registrar salida: el usuario no tiene una entrada registrada.");
            }
        } else if (movimientoDeseado.equalsIgnoreCase("entrada")) {
            // Regla: No se puede registrar una entrada si el último registro fue una entrada.
            if (ultimoRegistro.isPresent() && ultimoRegistro.get().getTipoMovimiento().equalsIgnoreCase("entrada")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede registrar entrada: el usuario ya se encuentra adentro.");
            }
        }
        // --- FIN DE LA NUEVA VALIDACIÓN ---

        Registro registro = new Registro();
        registro.setUsuario(usuario);
        registro.setLector(lector);
        registro.setTipoMovimiento(movimientoDeseado);
        registro.setFechaHora(LocalDateTime.now());

        return registroRepo.save(registro);
    }

    // NUEVO ENDPOINT PARA EL LECTOR RFID (ESP32)
    @PostMapping("/rfid")
    public Registro createRegistroByRfid(@RequestBody RfidRequest rfidRequest) {
        Usuario usuario = usuarioRepo.findByRfidTag(rfidRequest.rfidTag)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con RFID Tag: " + rfidRequest.rfidTag));
        
        Lector lector = lectorRepo.findById(rfidRequest.lectorId)
            .orElseThrow(() -> new RuntimeException("Lector no encontrado con id: " + rfidRequest.lectorId));
        if (!"Activo".equalsIgnoreCase(usuario.getEstado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario está inactivo y no puede realizar registros.");
        }
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

}