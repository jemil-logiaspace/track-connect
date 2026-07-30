import { publicClient } from "./client";

export async function submitContact(form: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<void> {
  await publicClient.post("/contact", form);
}
