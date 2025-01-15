import { Client, Databases, ID, Query, Users } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body: ISignUpForm = await readBody(event);

  try {
    // Create instance of appwrite.
    const client = new Client()
      .setEndpoint(config.public.endpoint)
      .setProject(config.public.project)
      .setKey(config.public.projectApiKey);

    // Create databases object.
    const databases = new Databases(client);

    // Check if the sponsor code is valid.
    const sponsor = await databases.listDocuments(
      config.public.database,
      config.public.cUsersMetaData,
      [Query.equal("sponsor_code", parseInt(body.sponsor))]
    );

    // If no sponsor was found
    if (sponsor.total === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Código de sponsor inválido",
      });
    }

    // If sponsor is blocked
    const users = new Users(client);
    const user = await users.get(sponsor.documents[0].user_id);
    if (!user.status) {
      throw createError({
        statusCode: 412,
        statusMessage: "El sponsor está bloqueado por el sistema",
      });
    }

    // Create user with sponsor code
    const newUser = await users.create(
      ID.unique(),
      body.email,
      undefined,
      body.password,
      body.name
    );

    // Update user's label
    await users.updateLabels(newUser.$id, [body.role!]);

    // Update user's preferences object
    await users.updatePrefs(newUser.$id, {
      theme: "light",
    });

    // Save new user's meta data
    await databases.createDocument(
      config.public.database,
      config.public.cUsersMetaData,
      ID.unique(),
      {
        user_id: newUser.$id,
        sponsor_id: sponsor.documents[0].user_id,
        sponsor_code: null,
      }
    );

    // Save new user's calculator settings.
    // Deposit percentages
    const newUserDeposits = [
      databases.createDocument(
        config.public.database,
        config.public.cDeposits,
        ID.unique(),
        { user_id: newUser.$id, percentage: 10 }
      ),
      databases.createDocument(
        config.public.database,
        config.public.cDeposits,
        ID.unique(),
        { user_id: newUser.$id, percentage: 20 }
      ),
      databases.createDocument(
        config.public.database,
        config.public.cDeposits,
        ID.unique(),
        { user_id: newUser.$id, percentage: 30 }
      ),
    ];

    await Promise.all(newUserDeposits);

    // Quotes
    const newUserQuotes = [
      databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        { user_id: newUser.$id, quantity: 3, percentage: 39.03 }
      ),
      databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        { user_id: newUser.$id, quantity: 6, percentage: 21.88 }
      ),
      databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        { user_id: newUser.$id, quantity: 9, percentage: 16.26 }
      ),
      databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        { user_id: newUser.$id, quantity: 12, percentage: 13.53 }
      ),
      databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        { user_id: newUser.$id, quantity: 14, percentage: 12.4 }
      ),
      databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        { user_id: newUser.$id, quantity: 18, percentage: 10.9 }
      ),
    ];

    await Promise.all(newUserQuotes);

    return { result: "success" };
  } catch (error: any) {
    const codes = [404, 412];

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
