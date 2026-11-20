import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  {
    id: "on-user-signup",
    retries: 2,

    triggers: {
      event: "user/signup",
    },
  },

  async ({ event, step }) => {
    const { email } = event.data;

    console.log(
      "👤 User signup event received:",
      email
    );

    const user = await step.run(
      "get-user-email",
      async () => {
        const userObject =
          await User.findOne({ email });

        if (!userObject) {
          throw new NonRetriableError(
            "User no longer exists in our database"
          );
        }

        console.log(
          "✅ User found:",
          userObject.email
        );

        return userObject;
      }
    );

    await step.run(
      "send-welcome-email",
      async () => {
        const subject =
          "Welcome to the app";

        const message = `Hi,

Thanks for signing up. We're glad to have you onboard!`;

        console.log(
          "📧 Sending welcome email to:",
          user.email
        );

        await sendMail(
          user.email,
          subject,
          message
        );

        console.log(
          "✅ Welcome email sent successfully"
        );
      }
    );

    return {
      success: true,
    };
  }
);