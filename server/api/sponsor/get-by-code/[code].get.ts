import { Query } from "appwrite";
import { Client, Databases, Users } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const config = useRuntimeConfig();
  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project)
    .setKey(config.public.projectApiKey);

  try {
    // Get sponsor id by metadata collection
    const databases = new Databases(client);
    const sponsorMD = await databases.listDocuments(
      config.public.database,
      config.public.cUsersMetaData,
      [Query.equal("my_sponsor_code", code!)]
    );

    const users = new Users(client);
    const sponsor = await users.get(sponsorMD.documents[0].user_id);
    return {
      result: "success",
      name: sponsor.name,
    };
  } catch (error) {}
});
