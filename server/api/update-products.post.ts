import { existsSync, mkdirSync, readdir, unlink } from "fs";
import { writeFile } from "fs/promises";
import readXlsxFile from "read-excel-file/node";
import path from "path";
import { Client, Databases, ID, Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Cliente Appwrite
  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project)
    .setKey(config.public.projectApiKey);

  const databases = new Databases(client);

  // Obtener archivo del formulario
  const filesBody = await readMultipartFormData(event);
  if (!filesBody || filesBody.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "❌ No se recibió ningún archivo.",
    });
  }

  const fileBody = filesBody[0];
  const isDev = process.env.NODE_ENV !== "production";

  // Solo guardar el archivo si estamos en desarrollo
  if (isDev) {
    const dir = "./uploads";
    if (!existsSync(dir)) mkdirSync(dir);
    await writeFile(`${dir}/${fileBody.filename}`, fileBody.data);
  } else {
    console.log("ℹ️ Producción: procesando archivo en memoria.");
  }

  try {
    const rows: any[][] = await readXlsxFile(fileBody.data);

    // Validación mínima
    if (!rows || rows.length <= 1) {
      throw createError({
        statusCode: 422,
        statusMessage: "❌ El archivo no contiene productos válidos.",
      });
    }

    const products: Product[] = [];

    for (let i = 1; i < rows.length; i++) {
      const [detail, composition, price] = rows[i];

      if (!detail || !composition || isNaN(price)) continue;

      products.push({
        detail: detail.toString(),
        composition: composition.toString(),
        price: Number(price),
      });
    }

    // Limpiar base de datos
    const existing = await databases.listDocuments(
      config.public.database,
      config.public.cProducts,
      [Query.limit(500)]
    );

    const deletePromises = existing.documents.map((doc) =>
      databases.deleteDocument(
        config.public.database,
        config.public.cProducts,
        doc.$id
      )
    );
    await Promise.all(deletePromises);

    // Insertar nuevos productos en paralelo (solución al error 504)
    const insertPromises = products.map((product) =>
      databases.createDocument(
        config.public.database,
        config.public.cProducts,
        ID.unique(),
        product
      )
    );
    await Promise.all(insertPromises);

    // Limpieza de archivos locales (solo en dev)
    if (isDev) {
      readdir("./uploads", (err, files) => {
        if (err) return console.error("🛑 Error al leer /uploads:", err);
        for (const f of files) {
          unlink(path.join("./uploads", f), (err) => {
            if (err) console.error("🛑 Error al borrar archivo:", err);
          });
        }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("🛑 Error al procesar Excel:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || "Error interno",
    });
  }
});
