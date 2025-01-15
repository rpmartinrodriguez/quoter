import { Query } from "appwrite";
import { Client, Databases, Users } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const sponsor_id = getRouterParam(event, "sponsor_id");
  const config = useRuntimeConfig();
  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project)
    .setKey(config.public.projectApiKey);

  try {
    // Get sponsored ids
    const databases = new Databases(client);
    const resSponsored = await databases.listDocuments(
      config.public.database,
      config.public.cUsersMetaData,
      [Query.select(["user_id"]), Query.equal("sponsor_id", sponsor_id!)]
    );

    const sponsoredIds = resSponsored.documents.map((sp) => sp.user_id);

    if (sponsoredIds.length > 0) {
      const users = new Users(client);
      const sponsored = await users.list([Query.equal("$id", sponsoredIds)]);
      return {
        result: "success",
        sponsored: sponsored.users,
      };
    }

    return {
      result: "success",
      sponsored: [],
    };
  } catch (error) {
    console.log("Failed on server while getting sponsored list", error);
  }
});
