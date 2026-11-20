const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

// Free OpenRouter model
const MODEL = "nex-agi/nex-n2.5-mini:free";

const analyzeTicket = async (ticket) => {
  try {
    const startTime = Date.now();

    if (!process.env.OPENROUTER_API_KEY) {
      console.error(
        "❌ OPENROUTER_API_KEY is not configured"
      );

      return null;
    }

    console.log(
      `🤖 Sending ticket to OpenRouter using ${MODEL}...`
    );

    const response = await fetch(
      OPENROUTER_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type": "application/json",

          "HTTP-Referer":
            process.env.APP_URL ||
            "http://localhost:5000",

          "X-Title":
            "AI Ticket System",
        },

        body: JSON.stringify({
          model: MODEL,

          messages: [
            {
              role: "system",

              content: `
You are an AI support ticket analyzer.

Analyze the ticket and return ONLY valid JSON.

Required format:
{
  "summary": "short summary",
  "priority": "low",
  "helpfulNotes": "short helpful technical note",
  "relatedSkills": ["skill"]
}

Rules:
- priority must be exactly low, medium, or high
- relatedSkills must be an array of strings
- Keep the summary short
- Keep helpfulNotes short
- Do not return markdown
- Do not return code fences
- Do not return any text outside JSON
              `,
            },

            {
              role: "user",

              content: `
Title: ${ticket.title}

Description: ${ticket.description}

Analyze this support ticket and return ONLY the required JSON.
              `,
            },
          ],

          response_format: {
            type: "json_schema",

            json_schema: {
              name: "ticket_analysis",

              strict: true,

              schema: {
                type: "object",

                properties: {
                  summary: {
                    type: "string",
                  },

                  priority: {
                    type: "string",

                    enum: [
                      "low",
                      "medium",
                      "high",
                    ],
                  },

                  helpfulNotes: {
                    type: "string",
                  },

                  relatedSkills: {
                    type: "array",

                    items: {
                      type: "string",
                    },
                  },
                },

                required: [
                  "summary",
                  "priority",
                  "helpfulNotes",
                  "relatedSkills",
                ],

                additionalProperties: false,
              },
            },
          },

          temperature: 0.2,

          max_tokens: 1000,
        }),
      }
    );

    const data = await response.json();

    console.log(
      `🤖 OpenRouter response received in ${
        Date.now() - startTime
      }ms`
    );

    if (!response.ok) {
      console.error(
        "❌ OpenRouter API error:",
        JSON.stringify(data, null, 2)
      );

      return null;
    }

    console.log(
      "🤖 OpenRouter model used:",
      data?.model
    );

    const raw =
      data?.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      console.error(
        "❌ AI returned empty response"
      );

      return null;
    }

    console.log(
      "🤖 Raw AI response:",
      raw
    );

    const jsonString = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(jsonString);

    const priority = String(
      parsed.priority || "medium"
    ).toLowerCase();

    return {
      summary: parsed.summary || "",

      priority: [
        "low",
        "medium",
        "high",
      ].includes(priority)
        ? priority
        : "medium",

      helpfulNotes:
        parsed.helpfulNotes || "",

      relatedSkills:
        Array.isArray(parsed.relatedSkills)
          ? parsed.relatedSkills.filter(
              (skill) =>
                typeof skill === "string" &&
                skill.trim().length > 0
            )
          : [],
    };

  } catch (error) {
    console.error(
      "❌ AI analysis failed:",
      error.message
    );

    return null;
  }
};

export default analyzeTicket;