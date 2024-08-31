const submit = document.querySelector('#submit');
const nameUser = document.querySelector('#nombre');
const passwordUser = document.querySelector('#password');
const formulario = document.querySelector('#formulario');
const bienvenida = document.querySelector('#bienvenida');
const imgBienvenida = document.querySelector('#img-bienvenida');
const sisBanco = document.querySelector('#sisBanco');
// Buttons selectors
const btnSaldo = document.querySelector('#btnSaldo');
const btnRetiro = document.querySelector('#btnRetirar');
const btnDeposito = document.querySelector('#btnDepositar');
const btnCantidad = document.querySelector('#button-addon1');
const btnSalir = document.querySelector('#salir');

const grupoAccion = document.querySelector('#grupoAccion');
const mostSaldo = document.querySelector('.card-body .card-title span');
const tipoOperacion = document.querySelector('.tipo-operacion');
const inpCantidad = document.querySelector('#inpCantidad');

const listarMovimientos = document.querySelector('#listado-movimientos');

let cantidad = 0;
let saldoEnLinea = 0;
let count = 0;
let operaciones = [];



document.addEventListener('DOMContentLoaded', () => {


    submit.addEventListener('click', (e) => {
        e.preventDefault();
        //obtenemos base de daos de localStorage
        const cuentasObj = JSON.parse(localStorage.getItem('cuentas'));
        console.log(cuentasObj);
        

        //Filtra si el usuario se encuentra en la base de datos retornando el objeto

        const busqueda = cuentasObj.find((cuenta) => cuenta.nombre.toLowerCase() == nameUser.value.toLowerCase());
        // Permite ingresar si el usuario existe
        if (busqueda) {
            //destucturamos el objeto obtenido
            const { nombre, password, saldo } = busqueda;

            localStorage.setItem('usuarioActivo', JSON.stringify(busqueda));
            // identificamos que la contraseña sea correcta
            identificarUsuario(nombre, password, saldo);
        } else {
            Swal.fire({
                icon: "error",
                title: "El usuario no existe",
                text: "Inténtalo Nuevamente"
            });
        }
    });

});

function identificarUsuario(nombre, password, saldo) {
    if (nombre.trim().toLowerCase() === nameUser.value.trim().toLowerCase() && password === Number(passwordUser.value)) {
        //Alerta de acceso correcto
        Swal.fire({
            icon: "success",
            title: "Acceso correcto",
            text: "Usuario y contraseña correcta",
            showConfirmButton: false,
            timer: 1500
        });
        formulario.reset();
        //Bienvenida al usuario activo en el nav
        bienvenida.removeAttribute('style');
        bienvenida.querySelector('span').innerText = nombre

        // Ocultamos el formulario de inicio de seción
        formulario.parentElement.style.display = 'none';
        // mostrar el boton de salida en el nav
        btnSalir.style.display = 'inline-block';
        // Ocultamos la imagen de bienvenida del body
        imgBienvenida.setAttribute('style', 'display: none !important');
        sisBanco.removeAttribute('style');

        mostrarMovimiento();
        mostrarBtnAcciones();
        if (count === 0) {
            saldoEnLinea = saldo;
        }
        //desabilitamos los campos de inicio de sesión
        submit.setAttribute('disabled', 'disabled');
        nameUser.setAttribute('disabled', 'disabled');
        passwordUser.setAttribute('disabled', 'disabled');
        // habilitamos el boton de salir por si se requiere
        btnSalir.removeAttribute('disabled');

        btnSaldo.addEventListener('click', (e) => {
            e.preventDefault();
            consultarSaldo(saldoEnLinea);
        });
        btnRetiro.addEventListener('click', (e) => {
            e.preventDefault();
            tipoOperacion.textContent = 'Retirar';
            habilitarCampos();
            btnCantidad.removeAttribute('deposito');
            btnCantidad.setAttribute('retiro', 'retiro');
        })
        btnDeposito.addEventListener('click', (e) => {
            e.preventDefault();
            tipoOperacion.textContent = 'Depositar';
            habilitarCampos();
            btnCantidad.removeAttribute('retiro');
            btnCantidad.setAttribute('deposito', 'deposito');
        })
    } else {
        Swal.fire({
            icon: "error",
            title: "Password incorrecto",
            text: "Contraseña incorrecta",
        });
    }
}
function mostrarBtnAcciones() {
    btnSaldo.removeAttribute('disabled');
    btnDeposito.removeAttribute('disabled');
    btnRetiro.removeAttribute('disabled');
}
function consultarSaldo(saldoEnLinea) {

    imprimirSaldo(saldoEnLinea);
}
function habilitarCampos() {
    btnCantidad.removeAttribute('disabled');
    inpCantidad.removeAttribute('disabled');
};
// determinamos que operación necesitamos hacer y la ejecutamos al darle click al boton de aceptar en candidad
btnCantidad.addEventListener('click', () => {
    cantidad = Number(inpCantidad.value);
    //comprueba el tipo de operación seleccionada
    if (btnCantidad.hasAttribute('retiro')) {
        if (cantidad <= 0) {
            imprimirAlerta('La cantidad no puede ser 0 o menor', 'error');
            return;
        }
        if (saldoEnLinea >= 10 && saldoEnLinea > cantidad) {
            if ((saldoEnLinea - cantidad) >= 10) {
                saldoEnLinea -= cantidad;
                imprimirSaldo(saldoEnLinea);
                imprimirAlerta('Retiro exitoso', 'exito');
                const movimiento = { cantidad, saldoEnLinea, tipo: "retiro" };
                nuevoMovimiento(movimiento);
                mostrarMovimiento();
                inpCantidad.value = '';
                btnDeposito.removeAttribute('disabled');
                count++;
                if (saldoEnLinea === 10) {
                    imprimirAlerta('Saldo minimo alcanzado', 'error');
                    btnRetiro.setAttribute('disabled', 'disabled');
                }
                return;
            } else {
                imprimirAlerta('Saldo minimo en la cuenta es de $10', 'error');
            }
        } else {
            imprimirAlerta('La cantidad no puede ser mayor o igual al saldo', 'error');
        }
    } else if (btnCantidad.hasAttribute('deposito')) {
        if (cantidad <= 0) {
            imprimirAlerta('La cantidad no puede ser 0 o menor', 'error');
            return;
        }

        if ((cantidad + saldoEnLinea) <= 990) {
            saldoEnLinea += cantidad;
            imprimirSaldo(saldoEnLinea);
            imprimirAlerta('Depósito exitoso', 'exito');
            const movimiento = { cantidad, saldoEnLinea, tipo: "deposito" };
            nuevoMovimiento(movimiento);
            mostrarMovimiento();
            inpCantidad.value = '';
            btnRetiro.removeAttribute('disabled');
            count++;
            if (saldoEnLinea === 990) {
                imprimirAlerta('Saldo maximo alcanzado', 'error');
                btnDeposito.setAttribute('disabled', 'disabled');
            }
            return;
        } else if (saldoEnLinea === 990) {

            imprimirAlerta('Saldo máximo de tu cuenta alcanzado', 'error');
        } else {
            imprimirAlerta('Tu deposito no se puede procesar, intenta con una cantidad menor', 'error');
        }
    }
});
btnSalir.addEventListener('click', salir);


function imprimirSaldo(saldoEnLinea) {
    mostSaldo.textContent = saldoEnLinea;
}
function imprimirAlerta(mensaje, tipo) {
    const divMensaje = document.querySelector('.mensajes');
    if (tipo === 'error') {
        divMensaje.classList.remove('alert-success');
        divMensaje.classList.add('alert-danger');
    } else if (tipo === 'exito') {
        divMensaje.classList.remove('alert-danger');
        divMensaje.classList.add('alert-success');
    }
    divMensaje.textContent = mensaje;
    setTimeout(() => {
        divMensaje.classList.remove('alert-danger', 'alert-success');
        divMensaje.textContent = '';
    }, 3000);
}
function nuevoMovimiento(movimiento) {
    operaciones = [...operaciones, movimiento];
    console.log(operaciones);
}
function mostrarMovimiento() {
    //limpiamos el HTML para imprimir un nuevo movimiento
    limpiarHTML();
    //itera cada movimiento y crea un elemento para mostrar
    operaciones.forEach((movimiento) => {
        const { cantidad, saldoEnLinea, tipo } = movimiento;
        //construimos el ul para colocar agrupado el movimiento realizado
        const ulLista = document.createElement('ul');
        const liCantidad = document.createElement('li');
        const liTipo = document.createElement('li');
        const liSaldo = document.createElement('li');

        ulLista.className = 'list-group list-group-horizontal w-100 d-flex justify-content-center';
        liCantidad.classList.add('list-group-item');
        liTipo.classList.add('list-group-item');
        liSaldo.classList.add('list-group-item');
        // Asigna los estilos segun el tipo de movimineto
        if (tipo === 'deposito') {
            liCantidad.classList.add('fw-bold', 'text-success');
            liTipo.classList.add('text-bg-success');
            liSaldo.classList.add('text-bg-success');
        } else {
            liCantidad.classList.add('fw-bold', 'text-warning');
            liTipo.classList.add('text-bg-warning');
            liSaldo.classList.add('text-bg-warning');
        }


        liCantidad.innerHTML = `$${cantidad}`;
        let tipoMayus = String(tipo).toUpperCase();

        liTipo.innerText = tipoMayus;
        liSaldo.innerHTML = `Saldo en cuenta $${saldoEnLinea}`;
        listarMovimientos.appendChild(ulLista);
        ulLista.append(liCantidad, liTipo, liSaldo);
    })
}
function limpiarHTML() {
    while (listarMovimientos.firstChild) {
        listarMovimientos.removeChild(listarMovimientos.firstChild);
    }
}
function salir() {
    limpiarHTML();
    btnSaldo.setAttribute('disabled', 'disabled');
    btnDeposito.setAttribute('disabled', 'disabled');
    btnRetiro.setAttribute('disabled', 'disabled');

    btnCantidad.setAttribute('disabled', 'disabled');
    inpCantidad.setAttribute('disabled', 'disabled');

    submit.removeAttribute('disabled');
    nameUser.removeAttribute('disabled');
    passwordUser.removeAttribute('disabled');
    mostSaldo.textContent = '000.00';

    formulario.parentElement.removeAttribute('style');
    // mostrar el boton de salida
    btnSalir.style.display = 'none';
    bienvenida.style.display = 'none';
    // Mostramos la imagen de bienvenida
    imgBienvenida.removeAttribute('style');
    sisBanco.setAttribute('style', 'display:none!important');
}
console.log(JSON.parse( localStorage.getItem('usuarioActivo')));