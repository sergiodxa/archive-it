import fetch from "../lib/fetch";
import { stringify } from "querystring";

const BASE_URL = "https://slack.com/api";
const SLACK_TOKEN = process.env.SLACK_TOKEN;

if (!SLACK_TOKEN) {
  throw new ReferenceError("SLACK_TOKEN is required.");
}

export interface IMessage {
  type: string;
  ts: string;
  user: string;
  text: string;
}

export async function getHistory(
  channel: string,
  since?: number,
  { limit = 100 } = {}
): Promise<IMessage[]> {
  const query = stringify(
    Object.assign(
      {
        token: SLACK_TOKEN,
        channel,
        inclusive: true,
        latest: Date.now(),
        count: limit
      },
      since ? { oldest: since } : {}
    )
  );

  const response = await fetch(`${BASE_URL}/channels.history?${query}`, {
    method: "GET"
  });

  if (!response.ok) {
    console.error(await response.text());
    throw new Error("Failed request");
  }

  const data = await response.json();

  if (!data.ok) {
    console.error(data);
    throw new Error("Failed request");
  }

  return data.messages;
}
