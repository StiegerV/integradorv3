let express = require("express");
app = express();
const path = require("path");
const translate = require("node-google-translate-skidz");
const favicon = require("serve-favicon");

console.clear();
// setea el favicon icono del documento
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.use(express.static(path.join(__dirname, "public")));

/* middleware que parsea el body de la url. necesario para leer los datos enviados por el form*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para manejar JSON

app.listen(8000);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "museo.html"));
});

app.post("/", async (req, res) => {
  let url = req.body.url;
  let ids = await traerIds(url);
  //trae unicamente 500
 ids=ids.slice(0, Math.min(ids.length, 500));
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
  if (ids.length > 0) {
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
  } else {
    console.log("no se encontro ningun elemento");
  }
}

//trae conjuntos de id a partir del filtrado
async function traerIds(url) {
  let idObj = ["lil shit"];
  let respuesta = await fetch(url);
  //checkeamos que no se halla reventado la api o nos tire un 404
  if (respuesta.ok) {
    let datos = await respuesta.json();
    idObj = datos.objectIDs;
  }

  return idObj;
}
