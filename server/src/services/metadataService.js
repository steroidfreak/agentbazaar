import OpenAI from "openai";

const {
  OPENAI_API_KEY,
  METADATA_MODEL = "gpt-5-nano",
  METADATA_TEMPERATURE = "0.1"
} = process.env;

const MAX_CONTENT_PREVIEW = 8000;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function buildPrompt(markdown) {
  const trimmed = markdown.length > MAX_CONTENT_PREVIEW ? `${markdown.slice(0, MAX_CONTENT_PREVIEW)}\n...` : markdown;
  return [
    "Read the markdown agent file and produce concise metadata in strict JSON.",
    "Respond with an object containing keys: title, description, tags.",
    "title: <=120 chars; description: <=400 chars summarizing the file;",
    "tags: 3-8 short lowercase keywords fitted to the content.",
    "Return only JSON with double-quoted keys. Do not include commentary.",
    "Markdown content to analyse:",
    "```markdown",
    trimmed,
    "```"
  ].join("\n");
}

function extractJsonPayload(text) {
  if (!text) return null;
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = codeBlockMatch ? codeBlockMatch[1] : text.trim();
  const balancedMatch = candidate.match(/\{[\s\S]*\}/);
  const jsonString = balancedMatch ? balancedMatch[0] : candidate;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

function normalizeTagArray(raw) {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw
      .map((tag) => (tag == null ? "" : String(tag).trim().toLowerCase()))
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[\,\r\n]/)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }
  return undefined;
}

export async function generateMetadataFromAgent(content) {
  if (!openai) {
    return null;
  }

  const prompt = buildPrompt(content ?? "");
  const temperature = Number.parseFloat(METADATA_TEMPERATURE);

  const response = await openai.responses.create({
    model: METADATA_MODEL,
    temperature: Number.isNaN(temperature) ? 0.1 : temperature,
    max_output_tokens: 400,
    input: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are a concise metadata generator that only outputs valid JSON."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ]
  });

  const output = response.output_text;
  const metadata = extractJsonPayload(output);

  if (!metadata) {
    return null;
  }

  const title = typeof metadata.title === "string" ? metadata.title.trim() : undefined;
  const description = typeof metadata.description === "string" ? metadata.description.trim() : undefined;
  const tags = normalizeTagArray(metadata.tags);

  return {
    title: title || undefined,
    description: description || undefined,
    tags: tags && tags.length ? tags : undefined
  };
}
