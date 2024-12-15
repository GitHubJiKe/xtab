import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GoogleGenerativeAI, type ChatSession } from "@google/generative-ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export function getAIContext(
  chatList: Array<{ content: string; type: string }>
) {
  const context = model.startChat({
    history: chatList.map((chat) => ({
      role: chat.type === "answer" ? "model" : "user",
      parts: [{ text: chat.content }],
    })),
  });
  return context;
}

export async function askAI(question: string, context: ChatSession) {
  const prompt = question;
  const result = await context.sendMessage(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
