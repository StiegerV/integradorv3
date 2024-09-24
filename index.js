import express, { text } from 'express';
import fetch from 'node-fetch';

// lib traduccion 
import translate from 'node-google-translate-skidz';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const filename = fileURLToPath(import.meta.url);
const dirname = dirname(filename);
const app = express();
//const port = 3000;

const port = process.env.PORT || 3000;

// Middleware para servir archivos estáticos

// app.use(express.static('public'));

app.use(express.static(dirname + '/public/'));
/* middleware que parsea el body de la url. necesario para leer los datos enviados por el form*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para manejar JSON
// -------------------------------------------------

// Ruta para servir el archivo HTML principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/Buscar", async (req, res) => {
  let url = req.body.url;
  let ids = await traerIds(url);
  //trae unicamente 150 por vercek
  if (ids.length > 500) {
    ids = ids.slice(0, Math.min(ids.length, 500));
  }

  //fetch a cada id
  let objetos = await objetosPromise(ids);

  await traduccion(objetos);
  console.log(objetos);

  res.json(objetos);
});

async function traduccion(objetos) {
  for (const element of objetos) {
    const promises = [];

    if (element.title) {
      let texto = element.title;
      promises.push(
        translate({
          text: texto,
          source: "en",
          target: "es",
        }).then((result) => {
          element.title = result.translation;
        })
      );
    }

    if (element.dynasty) {
      let texto = element.dynasty;
      promises.push(
        translate({
          text: texto,
          source: "en",
          target: "es",
        }).then((result) => {
          element.dynasty = result.translation;
        })
      );
    }

    if (element.culture) {
      let texto = element.culture;
      promises.push(
        translate({
          text: texto,
          source: "en",
          target: "es",
        }).then((result) => {
          element.culture = result.translation;
        })
      );
    }

    // todas las promesas de forma asincronica
    await Promise.all(promises);
  }
}

//esto de map es para poder devolver algo en el caso de que una promesa falle y hacerlo mas rapido con promise.all en ver de fetch
async function objetosPromise(ids) {
  try {
    let promesas = ids.map(async (ids) => {
      try {
        let respuesta = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ids}`
        );
        if (!respuesta.ok) {
          return null;
        }

        let object = await respuesta.json();
        return object;
      } catch (error) {
        return null;
      }
    });
    let resultados = await Promise.all(promesas);

    let objetos = resultados.filter((resultado) => resultado !== null);
    return objetos;
  } catch (error) {
    return {
      primaryImage:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ImwlsSyjnRCC7UjcosGPRgHaJ4%26pid%3DApi&f=1&ipt=5431903f64a2077a9fc47065ea33a62609b2d6e1e9a93d7b7f28dc70faa33056&ipo=images ",
      title: "No se encontraron obras",
      culture: " ",
      dynasty: "  ",
    };
  }
}

//trae conjuntos de id a partir del filtrado
async function traerIds(url) {
  let idObj = [];

  try {
    let respuesta = await fetch(url);

    // Check if the response is OK
    if (respuesta.ok) {
      let datos = await respuesta.json();

      // Ensure that objectIDs exist and are an array
      if (Array.isArray(datos.objectIDs)) {
        idObj = datos.objectIDs;
      } else {
        console.warn("No se encontradon objectIDs en la respuesta.");
      }
    } else {
      console.error(`Fetch error: ${respuesta.status} ${respuesta.statusText}`);
    }
  } catch (error) {
    console.error("Error en el fetch :", error);
  }

  return idObj;
}
