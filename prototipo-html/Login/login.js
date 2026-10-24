// =====================================
// USUARIO CREADO
// =====================================

let usuarioCreado = "sebastian";
let contrasenaCreada = "1234";


// =====================================
// FORMULARIO
// =====================================

let formulario = document.getElementById("formularioLogin");

let mensaje = document.getElementById("mensaje");


// =====================================
// LOGIN
// =====================================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    let usuario = document.getElementById("usuario").value;
    let contrasena = document.getElementById("contrasena").value;


    // Verificar usuario y contraseña

    if (usuario == usuarioCreado && contrasena == contrasenaCreada) {

        mensaje.textContent = "Inicio de sesión correcto";
        mensaje.style.color = "#39c500";

    } else {

        mensaje.textContent = "Usuario o contraseña incorrectos";
        mensaje.style.color = "red";

    }

});