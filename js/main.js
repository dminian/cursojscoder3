// ******************************************************
// DECLARACIÓN DE VARIABLES Y OBTENER JSON DE MARCAS/MODELOS
// ******************************************************

const tasaprima = 0.005;

let arrayMarcasModelos = []

fetch("./data/marcasmodelos.json")
.then(response => {
  if(!response.ok) 
  {
    throw new Error("Error al cargar el JSON");
  }
  return response.json();
})
.then(
  data => 
    { 
      arrayMarcasModelos = data.marcas 
      cargarPagina();
    } )
.catch(error => { console.log(error) });

let listaMarcas = [];

let butAgregarMarca = document.createElement("button");


// ******************************************************
// FUNCIONES GENERALES
// ******************************************************

function Confirmar(texto, texto2, func)
{
  return Swal.fire({
    title: texto,
    text: texto2,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Confirmar"
  })
  .then(result => result.isConfirmed)
  .catch((e) => { return false; });  
}

function formatDecimales(valor, cantDecimales) {
  if (valor == null || isNaN(valor)) return "";

  const numero = Number(valor).toFixed(cantDecimales);
  const [entero, decimal] = numero.split(".");

  const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return cantDecimales > 0
    ? `${enteroFormateado},${decimal}`
    : enteroFormateado;
}


// ******************************************************
// FUNCIONES ESPECIFICAS
// ******************************************************

// COTIZA UN SEGURO SEGÚN EL VALOR DEL VEHICULO Y LA TASA DE LA PRIMA.
CotizarSeguro = function (valor) { return formatDecimales(valor * tasaprima, 2)};


// LÓGICA DE PANTALLA.
function verModelos(itemMarca)
{

  let divAdminModelos = document.getElementById("divAdminModelos");

  tituloModelo.innerText = "";
  divAdminModelos.innerText = "";

  if (itemMarca)
  {

    tituloModelo.innerText = "Modelos de " + itemMarca.nombre + ":";

    let table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    
    let th1 = document.createElement("th")
    th1.innerText = "ID";
    table.appendChild(th1);  

    let th2 = document.createElement("th");  
    th2.innerText = "Nombre";
    table.appendChild(th2);

    let th3 = document.createElement("th");  
    th3.innerText = "Valor Vehículo";
    table.appendChild(th3);
    
    let th4 = document.createElement("th");  
    th4.innerText = "Acciones";
    table.appendChild(th4);

    if (itemMarca.modelos.length>0)
    {
      itemMarca.modelos.forEach(itemModelo => {
        let tr = document.createElement("tr");
        let td1 = document.createElement("td"); td1.innerText = itemModelo.id; tr.appendChild(td1);
        let td2 = document.createElement("td"); td2.innerText = itemModelo.nombre; tr.appendChild(td2);
        let td3 = document.createElement("td"); td3.setAttribute("align","right"); td3.innerText = "$ " + formatDecimales(itemModelo.valorVehiculo); tr.appendChild(td3);
        let td4 = document.createElement("td"); tr.appendChild(td4);

        let butEditar = document.createElement("button");
        butEditar.innerText = "Editar";
        butEditar.addEventListener("click", () => EditarModelo(table, tr, itemModelo, itemMarca));
        td4.appendChild(butEditar);

        let butEliminar = document.createElement("button");
        butEliminar.innerText = "Eliminar";
        butEliminar.addEventListener("click", () => { EliminarModelo(itemMarca, itemModelo.id) } )
        td4.appendChild(butEliminar);

        tr.appendChild(td4);
        table.appendChild(tr);
      }
      )
    }
    else
    {
      let tr = document.createElement("tr");
      let td1 = document.createElement("td"); td1.setAttribute("colspan","4"); td1.innerText = "Actualmente no hay modelos cargados para la marca " + itemMarca.nombre + "." ; tr.appendChild(td1);
      tr.appendChild(td1);
      table.appendChild(tr);    
    }
    
    divAdminModelos.appendChild(table);

    let butAgregarModelo = document.createElement("button");
    butAgregarModelo.innerText = "Agregar";
    butAgregarModelo.addEventListener("click", (e) => { NuevoModelo(table, itemMarca, e.target); } );
    
    divAdminModelos.appendChild(butAgregarModelo);
    
    butAgregarModelo.disabled=false;  
  }

}

function DeshabilitarBotones(table)
{
  let filas = table.querySelectorAll("tr");
  filas.forEach(fila => 
    {      
      const botones = fila.querySelectorAll("button");
      botones.forEach(btn => { btn.disabled = (btn.innerText!="Grabar" && btn.innerText!="Cancelar"); } )
    }
  )
  butAgregarMarca.disabled=true;
  
}

// CRUD DE MARCA.
function AgregarMarca(input1, input2, input3)
{
  
  Confirmar("¿Confirma agregar la marca?","")
  .then(confirmado => {
    if(confirmado) {    

      let item = {
        id: input1.value,
        nombre: input2.options[input2.selectedIndex].text,
        urlimagen: input3.value,
        modelos: []
      }

      arrayMarcasModelos.push(item)
      fillTablaMarcas();
    }})
}

function ModificarMarca(itemMarca, input1, input2)
{
  Confirmar("¿Confirma modificar los datos de la marca?","Al modificar perderá los datos anteriores de la marca!")
  .then(confirmado => {
    if(confirmado) {
      itemMarca.nombre = input1.value;
      itemMarca.urlimagen = input2.value;
      fillTablaMarcas();
    }})
}

function EliminarMarca(itemMarca)
{
  Confirmar("¿Confirma eliminar la marca?","Al eliminar perderá los datos de la marca!")
  .then(confirmado => {
    if(confirmado) {    
      arrayMarcasModelos = arrayMarcasModelos.filter((itemMarcaModelo) => { return itemMarcaModelo.id != itemMarca.id });  
      fillTablaMarcas();
    }
  })
}

function EditarMarca(table, tr, itemMarca)
{
  verModelos(undefined);

  DeshabilitarBotones(table)

  let nombre = tr.children[1];
  nombre.innerText="";
  const input1 = document.createElement("input");
  input1.setAttribute("style","background-color:green");
  input1.value = itemMarca.nombre;
  nombre.appendChild(input1)

  let URL = tr.children[2];
  URL.innerText="";
  const input2 = document.createElement("input");
  input2.setAttribute("style","background-color:green");
  input2.value = itemMarca.urlimagen;
  URL.appendChild(input2)

  let acciones = tr.children[3];
  acciones.innerText="";
  const butGrabar = document.createElement("button");
  butGrabar.innerText="Grabar";  
  butGrabar.addEventListener("click", () => ModificarMarca(itemMarca, input1, input2))
  acciones.appendChild(butGrabar);

  const butCancelar = document.createElement("button");
  butCancelar.innerText="Cancelar";
  butCancelar.addEventListener("click", fillTablaMarcas)
  acciones.appendChild(butCancelar);
}

function NuevaMarca(table)
{

  tituloModelo.innerText = "";
  divAdminModelos.innerText = "";

  let tr = document.createElement("tr");
  let td1 = document.createElement("td"); 
  let td2 = document.createElement("td"); 
  let td3 = document.createElement("td"); 
  let td4 = document.createElement("td"); 

  const txtId = document.createElement("input");
  txtId.setAttribute("style","background-color:green");
  td1.appendChild(txtId)
  tr.appendChild(td1);

  const cmbNombre = document.createElement("select");
  cmbNombre.setAttribute("style","background-color:green");
  cmbNombre.addEventListener("change", (e) => { txtId.value = e.target.value; } )
  td2.appendChild(cmbNombre);

  const option = document.createElement("option");
  option.value = 0;
  option.textContent = "-- Seleccione --";
  cmbNombre.appendChild(option);

  listaMarcas.forEach(x => {
    const option = document.createElement("option");
    option.value = x.id;
    option.textContent = x.descripcion;
  
    cmbNombre.appendChild(option);
  });

  tr.appendChild(td2);

  const txtURL = document.createElement("input");
  txtURL.setAttribute("style","background-color:green");
  td3.appendChild(txtURL)
  tr.appendChild(td3);

  const butGrabar = document.createElement("button");
  butGrabar.innerText="Grabar";
  butGrabar.addEventListener("click", () => { AgregarMarca(txtId, cmbNombre, txtURL) })
  td4.appendChild(butGrabar);

  const butCancelar = document.createElement("button");
  butCancelar.innerText="Cancelar";
  butCancelar.addEventListener("click", fillTablaMarcas)
  td4.appendChild(butCancelar);

  tr.appendChild(td4);

  table.appendChild(tr);

  DeshabilitarBotones(table);
}


// CRUD DE MODELO.

function EditarModelo(table, tr, itemModelo, itemMarca)
{
  DeshabilitarBotones(table)

  let nombre = tr.children[1];
  nombre.innerText="";
  const input1 = document.createElement("input");
  input1.setAttribute("style","background-color:green");
  input1.value = itemModelo.nombre;
  nombre.appendChild(input1)

  let URL = tr.children[2];
  URL.innerText="";
  const input2 = document.createElement("input");
  input2.setAttribute("style","background-color:green");
  input2.value = itemModelo.valorVehiculo;
  URL.appendChild(input2)

  let acciones = tr.children[3];
  acciones.innerText="";
  const butGrabar = document.createElement("button");
  butGrabar.innerText="Grabar";  
  butGrabar.addEventListener("click", () => ModificarModelo(itemMarca, itemModelo, input1, input2))
  acciones.appendChild(butGrabar);

  const butCancelar = document.createElement("button");
  butCancelar.innerText="Cancelar";
  butCancelar.addEventListener("click", verModelos)
  acciones.appendChild(butCancelar);
}


function NuevoModelo(table, itemMarca, butAgregarModelo)
{   
  let tr = document.createElement("tr");
  let td1 = document.createElement("td"); 
  let td2 = document.createElement("td"); 
  let td3 = document.createElement("td"); 
  let td4 = document.createElement("td"); 

  const txtId = document.createElement("input");
  txtId.setAttribute("style","background-color:green");
  td1.appendChild(txtId)
  tr.appendChild(td1);

  const txtNombre = document.createElement("input");
  txtNombre.setAttribute("style","background-color:green");
  td2.appendChild(txtNombre)
  tr.appendChild(td2);

  const txtValorVehiculo = document.createElement("input");
  txtValorVehiculo.setAttribute("style","background-color:green");
  td3.appendChild(txtValorVehiculo)
  tr.appendChild(td3);

  const butGrabar = document.createElement("button");
  butGrabar.innerText="Grabar";
  butGrabar.addEventListener("click", () => { AgregarModelo(itemMarca, txtId, txtNombre, txtValorVehiculo) });
  td4.appendChild(butGrabar);

  const butCancelar = document.createElement("button");
  butCancelar.innerText="Cancelar";
  butCancelar.addEventListener("click", () => verModelos(itemMarca));
  td4.appendChild(butCancelar);

  tr.appendChild(td4);

  table.appendChild(tr);

  DeshabilitarBotones(table);

  butAgregarModelo.disabled = true;

}

function AgregarModelo(itemMarca, input1, input2, input3)
{
  Confirmar("¿Confirma agregar el modelo?","")
  .then(confirmado => {
    if(confirmado) {    
  
    let nuevoModelo = {
      id: input1.value,
      nombre: input2.value,
      valorVehiculo: Number(input3.value),
    }
    itemMarca.modelos.push(nuevoModelo);

    verModelos(itemMarca);
  }})
  butAgregarMarca.disabled = false;
}

function ModificarModelo(itemMarca, itemModelo, input1, input2)
{
  Confirmar("¿Confirma modificar los datos del modelo?","Al modificar perderá los datos anteriores del modelo!")
  .then(confirmado => {
    if(confirmado) {    
      itemModelo.nombre = input1.value;
      itemModelo.valorVehiculo = Number(input2.value);
      verModelos(itemMarca);
    }})
  butAgregarMarca.disabled = false;
}

function EliminarModelo(itemMarca, idModelo)
{
  Confirmar("¿Confirma eliminar el modelo?","Al eliminar perderá los datos del modelo!")
  .then(confirmado => {
    if(confirmado) {    
      itemMarca.modelos = itemMarca.modelos.filter((itemModelo) => { return itemModelo.id != idModelo });  
      verModelos(itemMarca);
    }
  });
  butAgregarMarca.disabled = false;
}

// CARGA LA ADMINISTRADOR DE MARCAS DE AUTOS.
function fillTablaMarcas()
{
  let divAdminMarcas = document.getElementById("divAdminMarcas");
  divAdminMarcas.innerText = "";

  table = document.createElement("table");
  table.border = "1";
  table.style.borderCollapse = "collapse";
  
  let th1 = document.createElement("th")
  th1.innerText = "ID";
  table.appendChild(th1);  

  let th2 = document.createElement("th");  
  th2.innerText = "Nombre";
  table.appendChild(th2);

  let th3 = document.createElement("th");  
  th3.innerText = "URL Logo";
  table.appendChild(th3);

  let th4 = document.createElement("th");  
  th4.innerText = "Acciones";
  table.appendChild(th4);

  arrayMarcasModelos.forEach(itemMarca => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td"); td1.innerText = itemMarca.id; tr.appendChild(td1);
    let td2 = document.createElement("td"); td2.innerText = itemMarca.nombre; tr.appendChild(td2);
    let td3 = document.createElement("td"); td3.innerText = itemMarca.urlimagen; tr.appendChild(td3);
    let td4 = document.createElement("td"); 

    let butVer = document.createElement("button");
    butVer.innerText = "Administrar Modelos";
    butVer.addEventListener("click", () => { verModelos(itemMarca); } );
    butVer.value = itemMarca.id;
    td4.appendChild(butVer);
    tr.appendChild(td4);

    let butEditar = document.createElement("button");
    butEditar.innerText = "Editar";
    butEditar.addEventListener("click", () => EditarMarca(table, tr, itemMarca));
    td4.appendChild(butEditar);
    
    let butEliminar = document.createElement("button");
    butEliminar.innerText = "Eliminar";
    butEliminar.addEventListener("click", () => EliminarMarca(itemMarca));
    td4.appendChild(butEliminar);

    tr.appendChild(td4);

    table.appendChild(tr);    
  })
 
  divAdminMarcas.appendChild(table);
  
  butAgregarMarca.disabled=false;
  
  fillMarcas();

}

// LOGICA DEL COTIZADOR.
function fillMarcas()
{
  let marcas = document.getElementById("marcas");

  marcas.innerHTML="";

  arrayMarcasModelos.forEach(
      (itemMarca, index) => 
      {
  
          let nuevoItemMarca = document.createElement("button");
          nuevoItemMarca.id = itemMarca.id;
          nuevoItemMarca.innerText = itemMarca.nombre;
          nuevoItemMarca.addEventListener("click", mostrarModelos);
  
          marcas.appendChild(nuevoItemMarca);
  
      }
  )  
}

// CARGA ADMINISTRADOR DE MODELOS DE AUTOS.
function mostrarModelos(e)
{
    resultado.innerText = "";

    let marcaSeleccionada = arrayMarcasModelos.find(itemMarca => itemMarca.id == e.target.id);

    const img = document.getElementById("logo")
    img.src = "media/" + marcaSeleccionada.urlimagen
    img.onerror = () => {
      img.src = "media/sin-imagen.jpg";
    };

    while (modelos.firstChild) {
        modelos.removeChild(modelos.firstChild);
    }

    if (marcaSeleccionada.modelos.length === 0)
      resultado.innerText = "No hay modelos cotizables para la marca seleccionada!"


    marcaSeleccionada.modelos.forEach(
        (itemModelo) => 
        {
            let nuevoItemModelo = document.createElement("button");
            nuevoItemModelo.id = itemModelo.id;
            nuevoItemModelo.innerText = itemModelo.nombre;
            nuevoItemModelo.valorVehiculo = itemModelo.valorVehiculo;
            nuevoItemModelo.addEventListener("click", (e) =>
            {            
                let resultado = document.getElementById("resultado");

                prima = CotizarSeguro(e.target.valorVehiculo)

                resultado.innerHTML = 
                    marcaSeleccionada.nombre +
                    " " +
                    e.target.innerText + 
                    "<br>" + 
                    "VALOR DEL VEHÍCULO:  $" + formatDecimales(e.target.valorVehiculo) + 
                    "<br>" + 
                    " TOTAL A PAGAR POR SEGURO RC: $" +
                    " ES DE: $<strong>" + prima + "</strong> + IVA. (tasa de prima " + formatDecimales(tasaprima,5) + " )";
                
            })    

            modelos.appendChild(nuevoItemModelo);
        }
    )
}

function cargarPagina()
{

  // CARGA INICIAL DE API EN MEMORIA.

  butAgregarMarca.innerText = "Cargar nueva marca desde API";
  butAgregarMarca.addEventListener("click", () => { NuevaMarca(table); } );

  divAgregarMarca.appendChild(butAgregarMarca);

  butAgregarMarca.disabled=false;

  fillTablaMarcas();


  fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json")
    .then(res => res.json())
    .then(data => {
      listaMarcas = data.Results.map( x => ({       
        id: x.MakeId,
        descripcion: x.MakeName
      }));    
    })
    .catch(error => { console.log(error) });
}