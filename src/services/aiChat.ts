export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  source?: string;
  quickPrompts?: string[];
}

export interface StudentAIContext {
  id: string;
  name: string;
  collegeName: string;
  branch: string;
  academicYear: string;
  teachingSkills: string[];
  learningSkills: string[];
  xpPoints: number;
}

export async function sendAIChatMessage(
  message: string,
  history: ChatMessage[],
  studentContext?: StudentAIContext | null
): Promise<{ reply: string; source?: string; quickPrompts?: string[] }> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        studentContext,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply,
      source: data.source || 'gemini-3.8-flash',
      quickPrompts: data.quickPrompts,
    };
  } catch (err: any) {
    console.error('sendAIChatMessage error:', err);
    throw err;
  }
}
