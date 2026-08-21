import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// DeepSeek API configuration
const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, grade, studentName } = await req.json();

    // Ustad ke liye ekdum mast aur tailored prompt
    const prompt = `You are a respectful, encouraging, and knowledgeable Islamic Ustad (teacher). 
    Review the following student assignment.
    
    Student Name: ${studentName || 'Student'}
    Assigned Grade: ${grade}
    Student Submission: "${content || 'No written text provided by the student.'}"
    
    Task: Write a short, encouraging feedback message (2 to 3 sentences maximum) for the student. 
    - Start with a polite Islamic greeting or praise like "MashaAllah" or "JazakAllah".
    - Base the tone on the grade (e.g., highly praising for A+, encouraging to improve for C or Needs Revision).
    - Keep it strictly professional, supportive, and in English. Do not use markdown formatting.`;

    // Streaming the response from DeepSeek
    const result = await streamText({
      model: deepseek('deepseek-chat'),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Feedback Error:", error);
    return new Response("Error generating feedback", { status: 500 });
  }
}