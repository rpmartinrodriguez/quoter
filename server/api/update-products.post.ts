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
  const dir = "./uploads";
  // Check if directory exists.
  if (!existsSync(dir)) mkdirSync(dir);

  // Prepare the file upload into directory
  const fileBody = filesBody[0];
  const filePath = `./uploads/${fileBody.filename}`;
  await writeFile(filePath, fileBody.data);

  // Read the xlsx file
  try {
    const rows: any = await readXlsxFile(fileBody.data);
    const products: IProduct[] = [];

    for (let i = 0; i < rows.length; i++) {
      if (i !== 0) {
        const product: IProduct = {
          detail: rows[i][0],
          composition: rows[i][1],
          price: rows[i][2],
        };
        products.push(product);
      }
    }

    // Delete all records from DB.
    // 1- First query all the products in database.
    const productsInDb = await databases.listDocuments(
      config.public.database,
      config.public.cProducts,
      [Query.limit(500)]
    );
    // 2- Delete all products
    const deletePromises = productsInDb.documents.map((pidb) => {
      return databases.deleteDocument(
        config.public.database,
        config.public.cProducts,
        pidb.$id
      );
    });
    await Promise.all(deletePromises);
    // 3- insert new products
    const createPromises = products.map((p) => {
      return databases.createDocument(
        config.public.database,
        config.public.cProducts,
        ID.unique(),
        p
      );
    });
    await Promise.all(createPromises);

    // Delete files in uploads directory
    readdir(dir, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        unlink(path.join(dir, file), (err) => {
          if (err) throw err;
        });
      }
    });

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
