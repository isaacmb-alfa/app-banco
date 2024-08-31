var cuentas = [
    {
        nombre: 'Mali',
        password: 12345,
        saldo: 200
    },
    {
        nombre: 'Gera',
        password: 12345,
        saldo: 290
    },
    {
        nombre: 'Maui',
        password: 12345,
        saldo: 67
    }
];

function setCuentasLocalStorage (){
    const cuentasString = JSON.stringify(cuentas);
    localStorage.setItem('cuentas', cuentasString);
}

setCuentasLocalStorage();