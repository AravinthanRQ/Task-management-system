import { addMessageJob } from "./message.producer";

export const enqueueWelcomeEmail = async (user: { email: string }) => {
  await addMessageJob("sendWelcomeEmail", {
    email: user.email,
  });
};
