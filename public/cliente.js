console.log("cliente conectado");

async function departamentos() {
  let respuesta = await fetch(
    "https://collectionapi.metmuseum.org/public/collection/v1/departments"
  );
  let datos = await respuesta.json();

  return datos;
}

async function cargarDepartamentos() {
  let deptos = await departamentos();

  let departamento = deptos.departments;
  const select = document.getElementById("departamentos");
  for (const element of departamento) {
    const option = document.createElement("option");
    option.value = element.departmentId;
    option.text = element.displayName;
    select.appendChild(option);
  }
}

async function cargarLocacion() {
  let locacion = [
    "",
    "Mexico",
    "Guatemala",
    "United States",
    "England",
    "Spain",
    "Netherlands",
    "France",
    "Canada",
    "China",
    "Italy",
    "Germany",
    "Japan",
    "Czech Republic",
    "Ireland",
    "Venezuela",
    "Belgium",
    "Bermuda",
    "India",
    "NEW ZEALAND ROTORUA WHAKAREWAREWA",
    `Lisez et propagez nos Annales: "L'Immacul‚e"`,
    "Bernard Turner",
    "Harold Copping",
    "United Kingdom",
    "Scotland",
    "Holland",
    "Denmark",
    "Wales",
  ];

  let datalist = document.getElementById("locaciones");
  locacion.forEach((element) => {
    let opcion = document.createElement("option");
    opcion.value = element;
    datalist.appendChild(opcion);
  });
}

var objetos;

function buscar() {
  showLoader()
  let dpt = document.getElementById("departamentos").value;
  let palabra = document.getElementById("palabra").value;
  let localizacion = document.getElementById("localizacion").value;

  // Crear la URL usando la función filtro
  let url = filtro(dpt, palabra, localizacion);
  console.log("URL:", url);

  fetch("/Buscar", {
    method: "POST", // método HTTP
    headers: {
      "Content-Type": "application/json", // tipo de contenido
    },
    body: JSON.stringify({ url }), // Enviar solo la URL como objeto JSON
    //esprea el json desde el server
  })
    .then((respuesta) => 
      respuesta.json()
  )
    .then((datos) => {
      document.getElementById("contenedorGeneral").innerHTML = "";
      //global contiene todos los objetos ya paginados
      objetos = paginado(datos);
      pagina = 0;
      document.getElementById("pagina").innerHTML = `pagina:${pagina + 1} de ${
        objetos.length - 1
      }`;
      for (const element of objetos[0]) {
        hacerCard(element);
      }
      hideLoader()
    });
}

function filtro(dpt, palabra, localizacion) {
  let url;

  if (dpt != 99 && palabra != "" && localizacion != "") {
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${localizacion}&q=${palabra}&DepartmentId=${dpt}`;
    return url;
  } else if (dpt != 99 && localizacion != "") {
    console.log("segundo if");
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${localizacion}&q=*&DepartmentId=${dpt}`;
    return url;
  } else if (dpt != 99 && palabra != "") {
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${palabra}&DepartmentId=${dpt}`;
    return url;
  } else if (localizacion != "" && palabra != "") {
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${localizacion}&q=${palabra}`;
    return url;
  } else if (dpt != 99) {
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=*&DepartmentId=${dpt}`;
    return url;
  } else if (localizacion != "") {
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${localizacion}&q=*`;
    return url;
  } else if (palabra != "") {
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${palabra}`;
    return url;
  } else {
    url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=*`;
    return url;
  }
}

function hacerCard(obra) {
  let carta = document.createElement("div");
  let img = document.createElement("img");
  let titulo = document.createElement("h3");
  let cultura = document.createElement("h4");
  let dinastia = document.createElement("h4");
  let id=obra.objectID

  if (obra.primaryImage !== "") {
    img.src = obra.primaryImageSmall;
  } else {
    img.src = "/no hay imagen.png";
  }
  carta.appendChild(img);

  if (obra.title !== "") {
    titulo.innerHTML = obra.title;
  } else if (obra.title == "") {
    titulo.innerHTML = "no hay titulo";
  }

  carta.appendChild(titulo);
  if (obra.culture !== "") {
    cultura.innerHTML = "cultura:" + obra.culture;
  } else {
    cultura.innerHTML = "cultura:no hay,lmao";
  }
  carta.appendChild(cultura);

  if (obra.dynasty !== "") {
    dinastia.innerHTML = "dinastia:" + obra.dynasty;
  } else {
    dinastia.innerHTML = "dinastia:no hay,lmao";
  }
  carta.appendChild(dinastia);

  if (obra.additionalImages == "") {
    
  }else{
    console.log('id del objeto:'+obra.objectID)
    let link = document.createElement("a");
    let boton = document.createElement("button");
    boton.innerHTML = "mas imagenes";
    link.href = `imgExtra.html?objeto=${obra.objectID}`;
    link.appendChild(boton);
    carta.appendChild(link);
  }

  if (obra.objectDate !== "") {
    carta.title = "creacion:" + obra.objectDate;
  } else {
    carta.title = "creacion:le faltan datos a la api basura esta";
  }

  carta.classList.add("carta");
  document.getElementById("contenedorGeneral").appendChild(carta);
}

var pagina = 0;

function paginado(ids) {
  let a = 20;
  const segmentos = [];

  for (let i = 0; i < ids.length; i += a) {
    segmentos.push(ids.slice(i, i + a));
  }
  return segmentos;
}

function atras() {
  pagina--;
  if (pagina < 0) {
    pagina = 0;
  }
  document.getElementById("contenedorGeneral").innerHTML = "";
  document.getElementById("pagina").innerHTML = `pagina:${pagina+1} de ${
    objetos.length - 1
  }`;
  for (const element of objetos[pagina]) {
    hacerCard(element);
  }

  console.log(pagina);
}

function adelante() {
  pagina++;
  if (pagina > objetos.length - 1) {
    pagina = objetos.length - 1;
  }
  document.getElementById("contenedorGeneral").innerHTML = "";
  document.getElementById("pagina").innerHTML = `pagina:${pagina+1} de ${
    objetos.length - 1
  }`;
  for (const element of objetos[pagina]) {
    hacerCard(element);
  }
}

const loader = document.getElementById("carga");
function showLoader() {
  loader.classList.add("show-carga");
}
function hideLoader() {
  loader.classList.remove("show-carga");
}
cargarLocacion();
cargarDepartamentos();
