import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 👇 Groq Free API setup (Naam purana, Engine naya!)
const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1', 
  apiKey: process.env.DEEPSEEK_API_KEY, 
});

export async function POST(req: Request) {
  try {
    const { content, grade, studentName } = await req.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "API key missing in environment variables" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prompt = `You are a respectful, encouraging, and knowledgeable Islamic Ustad (teacher). 
    Review the following student assignment.
    
    Student Name: ${studentName || 'Student'}
    Assigned Grade: ${grade}
    Student Submission: "${content || 'No written text provided by the student.'}"
    
    Task: Write a short, encouraging feedback message (2 to 3 sentences maximum) for the student. 
    - Start with a polite Islamic greeting or praise like "MashaAllah" or "JazakAllah".
    - Base the tone on the grade (e.g., highly praising for A+, encouraging to improve for C or Needs Revision).
    - Keep it strictly professional, supportive, and in English. Do not use markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: "llama3-8b-8192", // Groq fast model
      messages: [{ role: "user", content: prompt }],
      stream: false, 
    });

    const feedbackText = completion.choices[0]?.message?.content || "MashaAllah, good effort!";

    return new Response(feedbackText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("AI API Error Detail:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate feedback" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}