import { createAgent, gemini } from "@inngest/agent-kit";

const supportAgent = createAgent({
  model: gemini({
    model: "gemini-3.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
  }),
  name: "AI Ticket Triage",
  system: `You are an AI support ticket analyzer.

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
- Do not return any text outside JSON`,
});

const analyzeTicket = async (ticket) => {
  try {
    const startTime = Date.now();

    console.log("🤖 Sending ticket to Gemini...");

    const response = await supportAgent.run(`
Title: ${ticket.title}

Description: ${ticket.description}

Analyze this support ticket and return ONLY the required JSON.
`);

    console.log(
      `🤖 Gemini response received in ${Date.now() - startTime}ms`
    );

    const raw = response.output?.[0]?.context;

    if (!raw) {
      console.error("❌ AI returned empty response");
      return null;
    }

    console.log("🤖 Raw AI response:", raw);

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
      priority: ["low", "medium", "high"].includes(priority)
        ? priority
        : "medium",
      helpfulNotes: parsed.helpfulNotes || "",
      relatedSkills: Array.isArray(parsed.relatedSkills)
        ? parsed.relatedSkills.filter(
            (skill) =>
              typeof skill === "string" &&
              skill.trim().length > 0
          )
        : [],
    };
  } catch (error) {
    console.error("❌ AI analysis failed:", error.message);
    return null;
  }
};

export default analyzeTicket;