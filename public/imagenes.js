// Obtener el ID del objeto desde la URL
const objetoId = window.location.search.split("=")[1];
console.log(objetoId);

async function pintarAdicionales() {
  let objeto = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objetoId}`
  );
  objeto = await objeto.json();
  let imagenesAdicionales = objeto.additionalImages;

  let tacho = document.getElementById("imagenes");
  imagenesAdicionales.forEach((element) => {
    let imagen = document.createElement("img");

    imagen.src = element;
    tacho.appendChild(imagen);
  });
}

pintarAdicionales();
