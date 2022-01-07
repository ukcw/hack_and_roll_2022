import * as Realm from "realm-web";
import * as utils from "./utils";

// The Worker's environment bindings. See `wrangler.toml` file.
interface Bindings {
  // MongoDB Realm Application ID
  REALM_APPID: string;
  REALM_API_KEY: string;
}

// Define type alias; available via `realm-web`
type Document = globalThis.Realm.Services.MongoDB.Document;

// Declare the interface for a "todos" document
interface Todo extends Document {
  owner: string;
  name: string;
  status: string;
  telegramID: string;
  date: string;
}

let App: Realm.App;
const ObjectId = Realm.BSON.ObjectID;

// Define the Worker logic
const worker: ExportedHandler<Bindings> = {
  async fetch(req, env) {
    const url = new URL(req.url);
    App = App || new Realm.App(env.REALM_APPID);

    const method = req.method;
    const path = url.pathname.replace(/[/]$/, "");
    const params = url.searchParams;
    const dateStr = params.get("dateStr") || "";
    const telegramID = params.get("telegramID") || "";

    if (path !== "/api/attendance") {
      return utils.toError(
        `Unknown "${path}" URL; try "/api/attendance" instead.`,
        404
      );
    }

    const token = env.REALM_API_KEY;
    //const token = req.headers.get('authorization');
    if (!token)
      return utils.toError(
        'Missing "authorization" header; try to add the header "authorization: REALM_API_KEY".',
        401
      );

    try {
      const credentials = Realm.Credentials.apiKey(token);
      // Attempt to authenticate
      var user = await App.logIn(credentials);
      var client = user.mongoClient("mongodb-atlas");
    } catch (err) {
      return utils.toError("Error with authentication.", 500);
    }

    // Grab a reference to the "cloudflare.todos" collection
    const collection = client
      .db("attendancetracker")
      .collection<Todo>("test_collection");

    try {
      if (method === "GET") {
        if (dateStr) {
          return utils.reply(
            await collection.findOne({
              date: { $eq: `${dateStr}`, telegramID: { $eq: `${telegramID}` } },
            })
          );
        }

        // GET /api/todos
        return utils.reply(await collection.find());
      }

      // POST /api/todos
      if (method === "POST") {
        const { entry } = await req.json();
        const checkExisting = await collection.findOne({
          date: { $eq: `${dateStr}` },
          telegramID: { $eq: `${telegramID}` },
        });

        if (checkExisting) {
          return utils.reply(
            "You have already submitted your status for the day"
          );
        }

        return utils.reply(
          await collection.insertOne({
            owner: user.id,
            name: entry.name,
            status: entry.status,
            telegramID: telegramID,
            date: dateStr,
          })
        );
      }
      if (method === "OPTIONS") {
        return utils.reply("OK");
      }
      /*
            // PATCH /api/todos?id=XXX&done=true
            if (method === 'PATCH') {
                return utils.reply(
                    await collection.updateOne({
                        _id: new ObjectId(todoID)
                    }, {
                        $set: {
                            done: url.searchParams.get('done') === 'true'
                        }
                    })
                );
            }

            // DELETE /api/todos?id=XXX
            if (method === 'DELETE') {
                return utils.reply(
                    await collection.deleteOne({
                        _id: new ObjectId(todoID)
                    })
                );
            }*/

      // unknown method
      return utils.toError("Method not allowed.", 405);
    } catch (err) {
      const msg = (err as Error).message || "Error with query.";
      return utils.toError(msg, 500);
    }
  },
};

// Export for discoverability
export default worker;
