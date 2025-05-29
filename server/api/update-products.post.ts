import { existsSync, mkdirSync, readdir, unlink } from "fs";
import { writeFile } from "fs/promises";
import readXlsxFile from "read-excel-file/node";
import path from "path";
import { Client, Databases, ID, Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Create Client Appwrote instance
  const client = new Client();
  client
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project)
    .setKey(config.public.projectApiKey);

  const databases = new Databases(client);

  // Get the file from request
  const filesBody = await readMultipartFormData(event);

  // Return an error if any file is comming
  if (!filesBody) {
    throw createError({
      statusCode: 404,
      statusMessage: "File not found",
    });
  }

  // Define directory to store the file temporarily.
  const isDev = process.env.NODE_ENV !== 'production';
const fileBody = filesBody[0];

if (isDev) {
  const dir = "./uploads";
  if (!existsSync(dir)) mkdirSync(dir);
  await writeFile(`${dir}/${fileBody.filename}`, fileBody.data);
} else {
  console.log("ℹ️ Producción: se procesó archivo en memoria sin escribir en disco.");
}

  // Read the xlsx file
  try {
    const rows: any = await readXlsxFile(fileBody.data);
    const products: Product[] = [];

    for (let i = 1; i < rows.length && i <= 10; i++) {
  const product: Product = {
    detail: rows[i][0],
    composition: rows[i][1],
    price: rows[i][2],
  };
  products.push(product);
}

    // Delete all records from DB.
    // 1- First query all the products in database.
    const productsInDb = await databases.listDocuments(
      config.public.database,
      config.public.cProducts,
      [Query.limit(500)]
    );
    // 2- Delete all products
    for (const product of productsInDb.documents) {
      await databases.deleteDocument(
        config.public.database,
        config.public.cProducts,
        product.$id
      );
    }
    /* const deletePromises = productsInDb.documents.map((pidb) => {
      return databases.deleteDocument(
        config.public.database,
        config.public.cProducts,
        pidb.$id
      );
    });

    await Promise.all(deletePromises); */
    // 3- insert new products
    /* const createPromises = products.map((p) => {
      return databases.createDocument(
        config.public.database,
        config.public.cProducts,
        ID.unique(),
        p
      );
    });
    await Promise.all(createPromises); */
    for (const product of products) {
      // 2- Create new product in DB
      await databases.createDocument(
        config.public.database,
        config.public.cProducts,
        ID.unique(),
        product
      );
    }

    // Delete files in uploads directory
    if (isDev) {
  readdir('./uploads', (err, files) => {
    if (err) {
      console.log("⚠️ Error al leer carpeta uploads:", err);
      return;
    }

    for (const file of files) {
      unlink(path.join('./uploads', file), (err) => {
        if (err) {
          console.log("⚠️ Error al borrar archivo:", err);
        }
      });
    }
  });
} else {
  console.log("ℹ️ Producción: no se eliminan archivos de disco.");
}

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error in loop",
    });
  }
});
