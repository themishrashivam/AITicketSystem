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

    console.log(
      "🚀 Ticket workflow started:",
      ticketId
    );

    try {
      // --------------------------------------------------
      // 1. FETCH TICKET
      // --------------------------------------------------

      const ticket = await step.run(
        "fetch-ticket",
        async () => {
          console.log(
            "🔍 Fetching ticket:",
            ticketId
          );

          const ticketObject =
            await Ticket.findById(ticketId);

          if (!ticketObject) {
            throw new NonRetriableError(
              `Ticket not found: ${ticketId}`
            );
          }

          return ticketObject.toObject();
        }
      );

      console.log(
        "✅ Ticket fetched:",
        ticket.title
      );

      // --------------------------------------------------
      // 2. UPDATE TICKET STATUS
      // --------------------------------------------------

      await step.run(
        "update-ticket-status",
        async () => {
          await Ticket.findByIdAndUpdate(
            ticketId,
            {
              status: "TODO",
            }
          );

          console.log(
            "📌 Ticket status: TODO"
          );
        }
      );

      // --------------------------------------------------
      // 3. AI TICKET ANALYSIS
      // --------------------------------------------------

      const aiResponse = await step.run(
        "ai-processing",
        async () => {
          console.log(
            "🤖 Starting AI analysis..."
          );

          const startTime = Date.now();

          const response =
            await analyzeTicket(ticket);

          console.log(
            `🤖 AI analysis completed in ${
              Date.now() - startTime
            }ms`
          );

          if (!response) {
            throw new Error(
              "AI analysis failed"
            );
          }

          console.log(
            "🤖 AI Response:",
            response
          );

          return response;
        }
      );

      // --------------------------------------------------
      // 4. SAVE AI RESULTS
      // --------------------------------------------------

      const relatedSkills = await step.run(
        "save-ai-results",
        async () => {
          const skills =
            Array.isArray(
              aiResponse.relatedSkills
            )
              ? aiResponse.relatedSkills
                  .filter(
                    (skill) =>
                      typeof skill ===
                        "string" &&
                      skill.trim().length > 0
                  )
                  .map((skill) =>
                    skill.trim()
                  )
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
                aiResponse.helpfulNotes ||
                "",

              status: "IN_PROGRESS",

              relatedSkills: skills,

              summary:
                aiResponse.summary || "",
            },
            {
              new: true,
            }
          );

          console.log(
            "✅ AI results saved"
          );

          console.log(
            "Priority:",
            priority
          );

          console.log(
            "Related skills:",
            skills
          );

          return skills;
        }
      );

      // --------------------------------------------------
      // 5. FIND AND ASSIGN MODERATOR
      // --------------------------------------------------

      const moderator = await step.run(
        "assign-moderator",
        async () => {
          console.log(
            "👨‍💻 Finding moderator..."
          );

          let user = null;

          // Find moderator based on AI skills
          if (
            relatedSkills.length > 0
          ) {
            const skillRegex =
              relatedSkills
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

          // If moderator is not found,
          // find an admin
          if (!user) {
            console.log(
              "⚠️ No matching moderator found. Looking for admin..."
            );

            user = await User.findOne({
              role: "admin",
            });
          }

          // Save assigned user
          await Ticket.findByIdAndUpdate(
            ticketId,
            {
              assignedTo:
                user?._id || null,
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

      // --------------------------------------------------
      // 6. SEND EMAIL NOTIFICATION
      // --------------------------------------------------

      await step.run(
        "send-email-notification",
        async () => {
          if (!moderator) {
            console.log(
              "📧 No moderator available. Email skipped."
            );

            return;
          }

          const finalTicket =
            await Ticket.findById(
              ticketId
            );

          if (!finalTicket) {
            console.log(
              "⚠️ Ticket no longer exists. Email skipped."
            );

            return;
          }

          const subject =
            "New Ticket Assigned";

          const message = `A new ticket has been assigned to you.

Title: ${finalTicket.title}

Priority: ${
            finalTicket.priority ||
            "medium"
          }

Status: ${
            finalTicket.status ||
            "IN_PROGRESS"
          }

Please check the ticket management system for more details.`;

          console.log(
            "📧 Sending assignment email..."
          );

          console.log(
            "📧 Recipient:",
            moderator.email
          );

          try {
            const mailInfo =
              await sendMail(
                moderator.email,
                subject,
                message
              );

            console.log(
              "✅ Assignment email sent successfully"
            );

            console.log(
              "📧 Message ID:",
              mailInfo?.messageId
            );
          } catch (mailError) {
            /*
             * Email failure should not stop
             * ticket processing.
             */
            console.error(
              "❌ Email sending failed:",
              mailError.message
            );

            console.error(
              "❌ Complete mail error:",
              mailError
            );
          }
        }
      );

      // --------------------------------------------------
      // 7. WORKFLOW COMPLETED
      // --------------------------------------------------

      console.log(
        "🎉 Ticket processing completed:",
        ticketId
      );

      return {
        success: true,

        ticketId,

        aiProcessed: true,

        assignedTo:
          moderator?.email || null,
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