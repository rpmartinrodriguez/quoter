import { Client, Databases, Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  
  // Ahora esperamos recibir tanto la contraseña como el tipo de acción
  const { password, type } = body;

  if (!password || !type) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Falta la contraseña o el tipo de acción en la petición.' 
    });
  }

  // Usamos la clave secreta del servidor para tener acceso de administrador
  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project)
    .setKey(config.projectApiKey);

  const databases = new Databases(client);
  
  const dbId = config.public.database;
  const collectionId = config.public.cActionPasswords;

  try {
    // La consulta ahora busca un documento que cumpla AMBAS condiciones
    const response = await databases.listDocuments(
      dbId,
      collectionId,
      [
        Query.equal('type', type),             // 1. Que sea del tipo correcto (ej: 'uploads')
        Query.equal('password', password),     // 2. Y que tenga la contraseña correcta
        Query.limit(1)                         // Solo necesitamos saber si existe al menos uno
      ]
    );

    // Si la respuesta tiene al menos un documento, la contraseña es correcta para esa acción.
    return { verified: response.documents.length > 0 };

  } catch (error: any) {
    console.error("Error en la API de verificación de contraseña:", error);
    // Lanzamos un error para que el frontend sepa que algo salió mal en el servidor
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error al comunicarse con la base de datos.',
    });
  }
});
