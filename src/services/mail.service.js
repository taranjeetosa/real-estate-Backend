const SENDER_API_URL = "https://api.sender.net/v2/message/send";

function parseAddress(value) {
  const match = /^\s*(.*?)\s*<([^<>]+)>\s*$/.exec(value);
  if (!match) return { email: value.trim() };
  const name = match[1].trim();
  return { email: match[2].trim(), ...(name ? { name } : {}) };
}

export async function sendMail({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.SENDER_API_KEY;
  if (!apiKey) throw new Error("SENDER_API_KEY is not configured");
  if (!process.env.MAIL_FROM) throw new Error("MAIL_FROM is not configured");

  const response = await fetch(SENDER_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: parseAddress(process.env.MAIL_FROM),
      to: { email: to },
      subject: String(subject).replace(/[\r\n]/g, " "),
      html,
      text,
      ...(replyTo ? { headers: { "Reply-To": replyTo } } : {}),
    }),
  });

  const responseText = await response.text();
  let result;
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      if (response.ok) throw new Error("Sender returned an invalid JSON response");
    }
  }

  if (!response.ok) {
    const message =
      typeof result?.message === "string"
        ? result.message
        : typeof result?.error === "string"
          ? result.error
          : `Sender request failed with status ${response.status}`;
    throw new Error(message);
  }

  return { data: result?.data ?? result ?? {}, error: null };
}
