import { Client, Databases, Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // Leemos la contraseña que nos envía el usuario desde el formulario
  const { password: inputPassword } = await readBody(event);

  if (!inputPassword) {
    throw createError({ statusCode: 400, statusMessage: 'No se proporcionó contraseña' });
  }

  // Usamos la clave API secreta del servidor para conectarnos
  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project)
    .setKey(config.projectApiKey); // ✅ Acceso seguro

  const databases = new Databases(client);

  try {
    // Buscamos en la colección de contraseñas un documento que coincida
    const response = await databases.listDocuments(
      config.public.database,
      config.public.cActionPasswords,
      [Query.equal('password', inputPassword)]
    );

    // Si encontró al menos un documento, la contraseña es correcta.
    if (response.total > 0) {
      return { verified: true };
    } else {
      return { verified: false };
    }
  } catch (error) {
    console.error("Error al verificar la contraseña:", error);
    throw createError({ statusCode: 500, statusMessage: 'Error del servidor' });
  }
});
