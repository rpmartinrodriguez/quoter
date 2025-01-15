import { Client, Databases, Users, Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, "id");
  try {
    const client = new Client()
      .setEndpoint(config.public.endpoint)
      .setProject(config.public.project)
      .setKey(config.public.projectApiKey);

    const databases = new Databases(client);

    // Get user metada
    const md = await databases.listDocuments(
      config.public.database,
      config.public.cUsersMetaData,
      [Query.equal("user_id", id!)]
    );

    if (md.total === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No se encontró la meta data de este usuario",
      });
    }

    // Get sponsor data
    const users = new Users(client);
    const resSponsor = await users.get(md.documents[0].sponsor_id);
    const sponsor: ISponsor = {
      $id: resSponsor.$id,
      name: resSponsor.name,
      code: "",
    };
    // Get sponsor code
    const resSponsorMd = await databases.listDocuments(
      config.public.database,
      config.public.cUsersMetaData,
      [Query.equal("user_id", resSponsor.$id)]
    );
    if (resSponsorMd.total > 0) {
      sponsor.code = resSponsorMd.documents[0].sponsor_code;
    }

    return {
      result: "success",
      id: md.documents[0].$id,
      sponsor,
      my_code: md.documents[0].sponsor_code,
    };
  } catch (error: any) {
    const codes = [404];

    if (!codes.includes(error.statusCode)) {
      console.log(error);
      return {
        result: "fail",
        code: 501,
        message: "Comunicarse con equipo de IT",
      };
    }
    return {
      result: "fail",
      code: error.statusCode,
      message: error.message,
    };
  }
});
