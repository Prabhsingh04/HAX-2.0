import "server-only";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

/**
 * Transactional email via Amazon SES (v2). Sends from MAIL_FROM
 * (noreply@intelligaia.com — a verified SES identity) in SES_REGION.
 * Needs SES_ACCESS_KEY + SES_SECRET_KEY + MAIL_FROM in the environment.
 */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SES_ACCESS_KEY &&
      process.env.SES_SECRET_KEY &&
      process.env.MAIL_FROM,
  );
}

let client: SESv2Client | null = null;
function getClient(): SESv2Client {
  if (!client) {
    client = new SESv2Client({
      region: process.env.SES_REGION ?? "ap-south-1",
      credentials: {
        accessKeyId: process.env.SES_ACCESS_KEY!,
        secretAccessKey: process.env.SES_SECRET_KEY!,
      },
    });
  }
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error(
      "Email not configured (SES_ACCESS_KEY / SES_SECRET_KEY / MAIL_FROM)",
    );
  }
  await getClient().send(
    new SendEmailCommand({
      FromEmailAddress: process.env.MAIL_FROM!,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Html: { Data: html, Charset: "UTF-8" } },
        },
      },
    }),
  );
}
