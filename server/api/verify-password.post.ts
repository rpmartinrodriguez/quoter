import { Client, Databases, Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  console.log('[ESPÍA 🕵️‍♂️] Se ha recibido una petición de verificación.');

  const body = await readBody(event);
  const inputPassword = body.password;

  // ESPÍA #1: ¿Qué contraseña está llegando desde el formulario?
  console.log(`[ESPÍA 🕵️‍♂️] Contraseña recibida del formulario: "${inputPassword}"`);

  if (!inputPassword) {
    console.log('[ESPÍA 🕵️‍♂️] Error: No se recibió ninguna contraseña en el cuerpo de la petición.');
    throw createError({ statusCode: 400, statusMessage: 'No se proporcionó contraseña' });
  }

  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project)
    .setKey(config.projectApiKey);

  const databases = new Databases(client);

  const dbId = config.public.database;
  const collectionId = config.public.cActionPasswords;

  // ESPÍA #2: ¿Estamos usando los IDs correctos?
  console.log(`[ESPÍA 🕵️‍♂️] Buscando en DB: "${dbId}", Colección: "${collectionId}"`);

  try {
    const response = await databases.listDocuments(
      dbId,
      collectionId,
      [Query.equal('password', inputPassword)]
    );

    // ESPÍA #3: ¿Qué encontró Appwrite?
    console.log(`[ESPÍA 🕵️‍♂️] Appwrite encontró ${response.total} documentos que coinciden con la contraseña.`);

    if (response.total > 0) {
      console.log('[ESPÍA 🕵️‍♂️] VERIFICACIÓN EXITOSA. Devolviendo { verified: true }');
      return { verified: true };
    } else {
      console.log('[ESPÍA 🕵️‍♂️] VERIFICACIÓN FALLIDA. Devolviendo { verified: false }');
      return { verified: false };
    }
  } catch (error: any) {
    // ESPÍA #4: Si Appwrite da un error directo (ej: no existe la colección)
    console.error('[ESPÍA 🕵️‍♂️] ¡ERROR DIRECTO DE APPWRITE!', error);
    throw createError({ statusCode: 500, statusMessage: `Error de Appwrite: ${error.message}` });
  }
});
