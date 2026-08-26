import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  {
    id: "on-ticket-created",
    retries: 0,
    triggers: {
      event: "ticket/created",
    },
  },

  async ({ event, step }) => {
    const { ticketId } = event.data;

    console.log("🚀 Ticket workflow started:", ticketId);

    try {
      const ticket = await step.run(
        "fetch-ticket",
        async () => {
          console.log("🔍 Fetching ticket:", ticketId);

          const ticketObject = await Ticket.findById(ticketId);

          if (!ticketObject) {
            throw new NonRetriableError(
              `Ticket not found: ${ticketId}`
            );
          }

          return ticketObject.toObject();
        }
      );

      console.log("✅ Ticket fetched:", ticket.title);

      await step.run(
        "update-ticket-status",
        async () => {
          await Ticket.findByIdAndUpdate(ticketId, {
            status: "TODO",
          });

          console.log("📌 Ticket status: TODO");
        }
      );

      const aiResponse = await step.run(
        "ai-processing",
        async () => {
          console.log("🤖 Starting AI analysis...");

          const startTime = Date.now();

          const response = await analyzeTicket(ticket);

          console.log(
            `🤖 AI analysis completed in ${
              Date.now() - startTime
            }ms`
          );

          if (!response) {
            throw new Error("AI analysis failed");
          }

          console.log("🤖 AI Response:", response);

          return response;
        }
      );

      const relatedSkills = await step.run(
        "save-ai-results",
        async () => {
          const skills = Array.isArray(
            aiResponse.relatedSkills
          )
            ? aiResponse.relatedSkills
                .filter(
                  (skill) =>
                    typeof skill === "string" &&
                    skill.trim().length > 0
                )
                .map((skill) => skill.trim())
            : [];

          const priority = [
            "low",
            "medium",
            "high",
          ].includes(
            String(
              aiResponse.priority || ""
            ).toLowerCase()
          )
            ? String(
                aiResponse.priority
              ).toLowerCase()
            : "medium";

          await Ticket.findByIdAndUpdate(
            ticketId,
            {
              priority,
              helpfulNotes:
                aiResponse.helpfulNotes || "",
              status: "IN_PROGRESS",
              relatedSkills: skills,
              summary: aiResponse.summary || "",
            },
            {
              new: true,
            }
          );

          console.log("✅ AI results saved");
          console.log("Priority:", priority);
          console.log("Related skills:", skills);

          return skills;
        }
      );

      const moderator = await step.run(
        "assign-moderator",
        async () => {
          console.log("👨‍💻 Finding moderator...");

          let user = null;

          if (relatedSkills.length > 0) {
            const skillRegex = relatedSkills
              .map((skill) =>
                skill.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )
              )
              .join("|");

            user = await User.findOne({
              role: "moderator",
              skills: {
                $elemMatch: {
                  $regex: skillRegex,
                  $options: "i",
                },
              },
            });
          }

          if (!user) {
            console.log(
              "⚠️ No matching moderator found. Looking for admin..."
            );

            user = await User.findOne({
              role: "admin",
            });
          }

          await Ticket.findByIdAndUpdate(
            ticketId,
            {
              assignedTo: user?._id || null,
            }
          );

          if (user) {
            console.log(
              "✅ Ticket assigned to:",
              user.email
            );
          } else {
            console.log(
              "⚠️ No moderator/admin available"
            );
          }

          return user
            ? {
                _id: user._id.toString(),
                email: user.email,
              }
            : null;
        }
      );

      await step.run(
        "send-email-notification",
        async () => {
          if (!moderator) {
            console.log(
              "📧 No moderator available. Email skipped."
            );
            return;
          }

          try {
            const finalTicket =
              await Ticket.findById(ticketId);

            if (!finalTicket) {
              return;
            }

            await sendMail(
              moderator.email,
              "New Ticket Assigned",
              `A new ticket has been assigned to you.

Title: ${finalTicket.title}

Priority: ${
                finalTicket.priority || "medium"
              }

Status: ${
                finalTicket.status || "IN_PROGRESS"
              }

Please check the ticket management system for more details.`
            );

            console.log(
              "📧 Assignment email sent to:",
              moderator.email
            );
          } catch (mailError) {
            console.error(
              "⚠️ Email sending failed:",
              mailError.message
            );
          }
        }
      );

      console.log(
        "🎉 Ticket processing completed:",
        ticketId
      );

      return {
        success: true,
        ticketId,
        aiProcessed: true,
        assignedTo: moderator?.email || null,
      };
    } catch (error) {
      console.error(
        "❌ Ticket workflow failed:",
        error.message
      );

      throw error;
    }
  }
);