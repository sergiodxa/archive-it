import * as http from "http";
import * as slack from "./services/slack";
import * as url from "url";

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "localhost";

async function requestListener(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  if (req.url === "/favicon.ico") res.end();
  const { query } = url.parse(req.url, true);
  const title: string = Array.isArray(query.title)
    ? query.title[0]
    : query.title;
  const channel: string = Array.isArray(query.channel)
    ? query.channel[0]
    : query.channel;
  const since: number = parseInt(
    Array.isArray(query.since) ? query.since[0] : query.since,
    10
  );

  if (!title) {
    return res.end("Missing title for the archive.");
  }

  if (!channel) {
    return res.end("Missing Slack channel ID.");
  }

  try {
    const messages = await slack.getHistory(channel, since);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ title, messages }, null, 2));
  } catch (error) {
    res.write(error.message);
    return res.end();
  }
}

function listeningListener(error: Error) {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log("Server running in %s:%d", HOST, PORT);
}

const server = http.createServer(requestListener);
server.listen(PORT, HOST, listeningListener);
