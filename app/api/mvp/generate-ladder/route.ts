import { NextResponse } from "next/server";
import OpenAI from "openai";

type LadderInput = {
  industry: string;
  companySize: string;
  revenueRange: string;
  functionName: string;
  role: string;
  jobLevels: string;
  individualTrackJobLevels: string;
  managerialTrackJobLevels: string;
  startingJobLevel: string;
  highestJobLevel: string;
  dualPath: "Yes" | "No";
};

const SYSTEM_PROMPT = `You are an HR benchmarking assistant.
Generate a practical, benchmarked career ladder for HR Business Partners.
Return only valid JSON with this shape:
{
  "summary": "string",
  "benchmarkedCompanies": ["string"],
  "benchmarkAssumptions": ["string"],
  "levels": [
    {
      "path": "Individual" | "Managerial",
      "level": "string",
      "title": "string",
      "scope": "string",
      "responsibilities": ["string"],
      "skills": ["string"],
      "typicalExperience": "string",
      "competencyProgression": [
        {
          "competency": "string",
          "proficiency": "string"
        }
      ],
      "nextLevelReadiness": ["string"],
      "learningPathways": ["string"]
    }
  ]
}
Rules:
- Include at least 4 levels.
- Keep language concise and business-ready.
- Use realistic benchmarking assumptions based on provided inputs.
- Keep all generated levels inside one role family only: the requested Role input.
- Do not mix in unrelated roles or job families (e.g., Product Manager, Account Executive, Software Engineer) unless they exactly match the requested Role.
- Titles must be progressive variations of the requested Role across seniority levels.
- Respect the requested ladder boundaries from starting job level to highest job level/head of role.
- If dualPath is "Yes", include both Individual and Managerial path levels and use the provided track-specific level lists.
- If dualPath is "No", include only Individual path levels.
- Skill and competency proficiency must progressively increase from lowest to highest level within each path.
- For each level, include competencies that indicate readiness for the next level.
- For each level, include practical learning pathways to progress to the next level.
- Do not include markdown fences.`;

function buildUserPrompt(input: LadderInput) {
  return `Generate a benchmarked career ladder using these inputs:
- Industry: ${input.industry}
- Company size: ${input.companySize}
- Revenue range: ${input.revenueRange}
- Function: ${input.functionName}
- Role: ${input.role}
- Job levels (single track): ${input.jobLevels}
- Individual track job levels: ${input.individualTrackJobLevels}
- Managerial track job levels: ${input.managerialTrackJobLevels}
- Starting level: ${input.startingJobLevel}
- Highest level / head of role: ${input.highestJobLevel}
- Dual path (Individual + Managerial): ${input.dualPath}

Include summary, benchmarked companies list, benchmark assumptions, and level-by-level ladder details with progressively increasing proficiency, next-level readiness competencies, and learning pathways.`;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Partial<LadderInput>;
    const required: Array<keyof LadderInput> = [
      "industry",
      "companySize",
      "revenueRange",
      "functionName",
      "role",
      "startingJobLevel",
      "highestJobLevel",
      "dualPath"
    ];

    for (const key of required) {
      if (!body[key] || typeof body[key] !== "string" || !body[key]?.trim()) {
        return NextResponse.json({ error: `Invalid or missing field: ${key}` }, { status: 400 });
      }
    }

    const dualPath = body.dualPath!.trim() === "Yes" ? "Yes" : "No";
    if (dualPath === "Yes") {
      if (!body.individualTrackJobLevels?.trim()) {
        return NextResponse.json({ error: "Invalid or missing field: individualTrackJobLevels" }, { status: 400 });
      }
      if (!body.managerialTrackJobLevels?.trim()) {
        return NextResponse.json({ error: "Invalid or missing field: managerialTrackJobLevels" }, { status: 400 });
      }
    } else if (!body.jobLevels?.trim()) {
      return NextResponse.json({ error: "Invalid or missing field: jobLevels" }, { status: 400 });
    }

    const input: LadderInput = {
      industry: body.industry!.trim(),
      companySize: body.companySize!.trim(),
      revenueRange: body.revenueRange!.trim(),
      functionName: body.functionName!.trim(),
      role: body.role!.trim(),
      jobLevels: body.jobLevels?.trim() || "",
      individualTrackJobLevels: body.individualTrackJobLevels?.trim() || "",
      managerialTrackJobLevels: body.managerialTrackJobLevels?.trim() || "",
      startingJobLevel: body.startingJobLevel!.trim(),
      highestJobLevel: body.highestJobLevel!.trim(),
      dualPath
    };

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No content returned from OpenAI." }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "OpenAI returned invalid JSON." }, { status: 502 });
    }

    return NextResponse.json({
      input,
      ladder: parsed
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate career ladder.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
