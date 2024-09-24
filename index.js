import express from "express";
import path from "path";
import translate from "node-google-translate-skidz";
import favicon from "serve-favicon";
import { fileURLToPath } from "url";
import { dirname } from "path";
//import cors from "cors"
const app=express()
const port = process.env.PORT || 8000;
// Obtener __filename y __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



//app.use(cors());

// setea el favicon icono del documento
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.use(express.static(__dirname + '/public/'));

/* middleware que parsea el body de la url. necesario para leer los datos enviados por el form*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para manejar JSON

app.listen(port);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "museo.html"));
});

app.post("/Buscar", async (req, res) => {
  let url = req.body.url;
  let ids = await traerIds(url);
  //trae unicamente 150 por vercek
  if (ids.length > 500) {
    ids = ids.slice(0, Math.min(ids.length, 150));
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
