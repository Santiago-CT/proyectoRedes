////////////////////////////////////////////////////////
// Carcasa ESP32 + LCD + RFID - Versión Corregida Final
// Mejoras: Agujeros RFID ajustados (59x38 mm, L/R distintos)
//         Agujeros ESP32 corregidos (top/bottom, left/right distintos)
// Autor: ChatGPT + Santiago
//////////////////////////////////////////////////////////

// === CONFIGURACIÓN GENERAL ===
$fn = 64; // Resolución global para círculos

// Modo de visualización
SHOW_BASE = true;       // Mostrar base
SHOW_LID = true;        // Mostrar tapa
SHOW_ASSEMBLED = false; // Vista ensamblada
PRINT_LAYOUT = true;    // Layout para impresión

// === DIMENSIONES PRINCIPALES ===
outer_x = 105;         // Ancho externo
outer_y = 75;          // Fondo externo
outer_z = 38;          // Altura externa
wall_thickness = 2.5;  // Grosor de paredes
lid_thickness = 2.5;   // Grosor tapa

// Tolerancias
tolerance = 0.15;
screw_clearance = 0.2;

// Espacio interior
inner_x = outer_x - 2*wall_thickness;
inner_y = outer_y - 2*wall_thickness;
inner_z = outer_z - wall_thickness;

// === PARÁMETROS ESP32 (EXPANSION BOARD MEDIDAS) ===
// Valores tomados de la imagen: top/bottom y left/right distintos
esp32_board_w = 68.6;    // ancho total PCB
esp32_board_h = 53.4;    // alto total PCB

esp32_spacing_x_top    = 52.52; // distancia entre huecos (arriba)
esp32_spacing_x_bottom = 50.81; // distancia entre huecos (abajo)
esp32_spacing_y_left   = 48.39; // distancia vertical (lado izquierdo)
esp32_spacing_y_right  = 47.96; // distancia vertical (lado derecho)

esp32_hole_d = 3.4;       // diámetro agujeros (taladro)
esp32_hole_clearance = 0.2;

esp32_offset_x = 0;       // offset general (si quieres mover la placa en X)
esp32_offset_y = -8;      // offset general (si quieres mover la placa en Y)
esp32_clearance_z = 12;

// === PARÁMETROS LCD 16x2 ===
lcd_board_w = 80;
lcd_board_h = 36;
lcd_display_w = 64.5;
lcd_display_h = 16;
lcd_bezel_margin = 2;
lcd_offset_y = 18;
lcd_pcb_thickness = 1.6;

// === PARÁMETROS RFID RC522 ===
rfid_board_w = 59;         // Ancho real
rfid_board_h = 38;         // Alto real
rfid_spacing_x_left  = 37; // Horizontal izq. (según último ajuste tuyo)
rfid_spacing_x_right = 37; // Horizontal der.
rfid_spacing_y_left  = 35; // Vertical izq.
rfid_spacing_y_right = 25; // Vertical der.
rfid_offset_y = -18;       // Posición en la tapa
rfid_frame_depth = 1.5;
rfid_antenna_clearance = 3;

// === CONECTORES Y PUERTOS ===
microusb_w = 12;
microusb_h = 8;
microusb_depth = 15;
microusb_pos_x = outer_x/2 - 18;
microusb_pos_y = -outer_y/2;

power_jack_r = 5.5;
power_jack_pos_x = -outer_x/2 + 18;
power_jack_pos_y = outer_y/2;

reset_button_r = 3;
reset_pos_x = esp32_offset_x + 20;
reset_pos_y = esp32_offset_y;

// === MONTAJE ===
standoff_r = 2.8;
standoff_h = 8;
screw_head_r = 3.5;
screw_head_h = 2.5;

lip_height = 4;
lip_thickness = 1.5;

//////////////////////////////////////////////////////////
// === MÓDULOS AUXILIARES ===
//////////////////////////////////////////////////////////

module standoff(x, y, has_screw_head = false) {
    translate([x, y, wall_thickness]) {
        difference() {
            cylinder(h=standoff_h, r=standoff_r + 1, $fn=32);
            translate([0, 0, -0.1])
                cylinder(h=standoff_h + 0.2, r=1.5 + screw_clearance, $fn=16);
            if (has_screw_head) {
                translate([0, 0, standoff_h - screw_head_h])
                    cylinder(h=screw_head_h + 0.1, r=screw_head_r, $fn=16);
            }
        }
    }
}

module ventilation_slots(side = "right") {
    slot_count = 8;
    slot_width = 1.5;
    slot_height = 20;
    slot_spacing = 4;
    
    start_y = -slot_count * slot_spacing / 2;
    
    for (i = [0:slot_count-1]) {
        translate([0, start_y + i * slot_spacing, outer_z/2 - slot_height/2])
            cube([wall_thickness + 1, slot_width, slot_height], center=false);
    }
}

module assembly_lip() {
    translate([-inner_x/2 + tolerance, -inner_y/2 + tolerance, inner_z - lip_height]) {
        difference() {
            cube([inner_x - 2*tolerance, inner_y - 2*tolerance, lip_height]);
            translate([lip_thickness, lip_thickness, -0.1])
                cube([inner_x - 2*tolerance - 2*lip_thickness, 
                      inner_y - 2*tolerance - 2*lip_thickness, 
                      lip_height + 0.2]);
        }
    }
}

module assembly_groove() {
    translate([-inner_x/2, -inner_y/2, -0.1]) {
        difference() {
            cube([inner_x, inner_y, lip_height + 0.1]);
            translate([lip_thickness - tolerance, lip_thickness - tolerance, -0.1])
                cube([inner_x - 2*(lip_thickness - tolerance), 
                      inner_y - 2*(lip_thickness - tolerance), 
                      lip_height + 0.3]);
        }
    }
}

module orientation_mark() {
    translate([-outer_x/2 + 3, outer_y/2 - 3, outer_z + 0.1]) {
        linear_extrude(0.5) {
            text("↑ FRONT", size=3, font="Arial:style=Bold");
        }
    }
}

//////////////////////////////////////////////////////////
// === FUNCIONES PARA AGUJEROS ESP32, RFID y LCD ===
//////////////////////////////////////////////////////////

// --- Agujeros ESP32 (top/bottom y left/right distintos)
// i: -1 = izquierda, 1 = derecha
// j: -1 = abajo,  1 = arriba
function esp32_hole_x(i, j) = ( j > 0 
                                ? (i < 0 ? -esp32_spacing_x_top/2 : esp32_spacing_x_top/2)
                                : (i < 0 ? -esp32_spacing_x_bottom/2 : esp32_spacing_x_bottom/2) );
function esp32_hole_y(i, j) = ( i < 0 ? j * esp32_spacing_y_left/2 : j * esp32_spacing_y_right/2 );

// --- Agujeros RC522 (ya tenías lógica L/R vs vertical)
function rfid_hole_x(i) = (i < 0 ? -rfid_spacing_x_left/2 : rfid_spacing_x_right/2);
function rfid_hole_y(i, j) = ( j * (i < 0 ? rfid_spacing_y_left/2 : rfid_spacing_y_right/2) );

// --- Agujeros LCD (si quieres mantener único patrón simple)
lcd_hole_d = 3;
lcd_spacing_x = 64; // si no tienes medidas específicas, ajusta si hace falta
lcd_spacing_y = 28;

//////////////////////////////////////////////////////////
// === BASE ===
//////////////////////////////////////////////////////////

module base() {
    difference() {
        union() {
            translate([-outer_x/2, -outer_y/2, 0])
                cube([outer_x, outer_y, outer_z]);
            assembly_lip();
        }
        
        // Cavidad interior
        translate([-inner_x/2, -inner_y/2, wall_thickness])
            cube([inner_x, inner_y, inner_z]);
        
        // USB y jack de poder
        translate([microusb_pos_x - microusb_w/2, microusb_pos_y - 0.1, 
                     outer_z/2 - microusb_h/2])
            cube([microusb_w, wall_thickness + 0.2, microusb_h]);
        
        translate([power_jack_pos_x, power_jack_pos_y + wall_thickness/2, outer_z/2])
            rotate([90, 0, 0])
                cylinder(h=wall_thickness + 1, r=power_jack_r);
        
        translate([reset_pos_x, reset_pos_y, outer_z])
            cylinder(h=lid_thickness + 1, r=reset_button_r);
        
        // Ventilación
        translate([outer_x/2 - 0.1, 0, 0]) ventilation_slots("right");
        translate([-outer_x/2 - 0.1, 0, 0]) ventilation_slots("left");
        
        // === Agujeros ESP32 (base) ===
        for (i=[-1,1]) for (j=[-1,1]) {
            hx = esp32_hole_x(i,j) + esp32_offset_x;
            hy = esp32_hole_y(i,j) + esp32_offset_y;
            translate([hx, hy, -0.1])
                cylinder(h=outer_z + 2, r=esp32_hole_d/2 + esp32_hole_clearance);
        }
        
        // === Agujeros RFID (base) ===
        for (i=[-1,1]) for (j=[-1,1]) {
            rx = rfid_hole_x(i);
            ry = rfid_hole_y(i,j) + rfid_offset_y;
            translate([rx, ry, -0.1])
                cylinder(h=wall_thickness + 0.2, r=1.5 + screw_clearance);
        }
        
        // (Opcional) agujeros para LCD si necesitas
        translate([0, lcd_offset_y, -0.1])
            for (ix=[-1,1]) for (iy=[-1,1]) {
                translate([ix * lcd_spacing_x/2, iy * lcd_spacing_y/2, 0])
                    cylinder(h=wall_thickness + 0.2, r=lcd_hole_d/2 + screw_clearance);
            }
    }
    
    // === Standoffs ESP32 (posiciones actualizadas con top/bottom y left/right) ===
    for (i=[-1,1]) for (j=[-1,1]) {
        sx = esp32_hole_x(i,j) + esp32_offset_x;
        sy = esp32_hole_y(i,j) + esp32_offset_y;
        standoff(sx, sy, false);
    }
    
    // Pequeños guías / soportes adicionales si quieres
    translate([esp32_offset_x - esp32_board_x/2 - 1, esp32_offset_y - esp32_board_h/2, wall_thickness])
        cube([1, esp32_board_h, 3]);
    translate([esp32_offset_x + esp32_board_x/2, esp32_offset_y - esp32_board_h/2, wall_thickness])
        cube([1, esp32_board_h, 3]);
}

//////////////////////////////////////////////////////////
// === TAPA ===
//////////////////////////////////////////////////////////

module lid() {
    translate([0, 0, outer_z]) {
        difference() {
            union() {
                translate([-outer_x/2, -outer_y/2, 0])
                    cube([outer_x, outer_y, lid_thickness]);
                translate([-rfid_board_w/2 - 2, rfid_offset_y - rfid_board_h/2 - 2, 
                             lid_thickness])
                    cube([rfid_board_w + 4, rfid_board_h + 4, rfid_frame_depth]);
            }
            
            assembly_groove();
            
            // Ventana LCD
            translate([-lcd_display_w/2 - lcd_bezel_margin, 
                         lcd_offset_y - lcd_display_h/2 - lcd_bezel_margin, -0.1])
                cube([lcd_display_w + 2*lcd_bezel_margin, 
                      lcd_display_h + 2*lcd_bezel_margin, lid_thickness + 0.2]);
            
            // Receso PCB LCD
            translate([-lcd_board_w/2, lcd_offset_y - lcd_board_h/2, 
                         lid_thickness - lcd_pcb_thickness])
                cube([lcd_board_w, lcd_board_h, lcd_pcb_thickness + 0.1]);
            
            // Ventana antena RFID (espacio libre)
            translate([-rfid_board_w/2 + 8, rfid_offset_y - rfid_board_h/2 + 8, -0.1])
                cube([rfid_board_w - 16, rfid_board_h - 16, lid_thickness + 0.2]);
            
            // === Agujeros RFID (tapa) ===
            for (i=[-1,1]) for (j=[-1,1]) {
                rx = rfid_hole_x(i);
                ry = rfid_hole_y(i,j) + rfid_offset_y;
                translate([rx, ry, -0.1])
                    cylinder(h=lid_thickness + rfid_frame_depth + 0.2, r=1.5 + screw_clearance);
                translate([rx, ry, lid_thickness + rfid_frame_depth - screw_head_h])
                    cylinder(h=screw_head_h + 0.1, r=screw_head_r);
            }
            
            // (Opcional) agujeros LCD en tapa si necesitas
            translate([0, lcd_offset_y, -0.1])
                for (ix=[-1,1]) for (iy=[-1,1]) {
                    translate([ix * lcd_spacing_x/2, iy * lcd_spacing_y/2, 0])
                        cylinder(h=lid_thickness + 0.2, r=lcd_hole_d/2 + screw_clearance);
                }
        }
        
        // === Soportes internos RFID (tapa) ===
        for (i=[-1,1]) for (j=[-1,1]) {
            rx = rfid_hole_x(i);
            ry = rfid_hole_y(i,j) + rfid_offset_y;
            translate([rx, ry, -rfid_antenna_clearance]) {
                difference() {
                    cylinder(h=rfid_antenna_clearance, r=standoff_r + 0.5);
                    translate([0, 0, -0.1])
                        cylinder(h=rfid_antenna_clearance + 0.2, r=1.5 + screw_clearance);
                }
            }
        }
        
        orientation_mark();
    }
}

//////////////////////////////////////////////////////////
// === VISTAS ===
//////////////////////////////////////////////////////////

if (SHOW_ASSEMBLED) {
    base();
    if (SHOW_LID) %lid();
} else if (PRINT_LAYOUT) {
    if (SHOW_BASE) {
        translate([-outer_x/2 - 10, 0, 0]) base();
    }
    if (SHOW_LID) {
        translate([outer_x/2 + 10, 0, 0])
            rotate([0, 180, 0])
                translate([0, 0, -outer_z - lid_thickness]) lid();
    }
} else {
    if (SHOW_BASE) translate([-outer_x - 10, 0, 0]) base();
    if (SHOW_LID)  translate([outer_x + 10, 0, 0]) lid();
}

//////////////////////////////////////////////////////////
// === INFO IMPRESIÓN ===
//////////////////////////////////////////////////////////
echo("=== INFORMACIÓN DE IMPRESIÓN ===");
echo(str("Dimensiones externas: ", outer_x, "x", outer_y, "x", outer_z, " mm"));
echo(str("Grosor de paredes: ", wall_thickness, " mm"));
echo(str("Altura de capa recomendada: 0.2 mm"));
echo(str("Relleno recomendado: 20%"));
echo(str("Soportes: NO necesarios"));
echo("Imprimir tapa boca abajo para mejor acabado");
