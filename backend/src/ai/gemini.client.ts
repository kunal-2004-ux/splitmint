import { AIServiceError } from './ai.errors';

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
}

export class GeminiClient {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1';
    private readonly model = 'gemini-1.5-flash'; // Using flash model
    private readonly timeout = 8000; // 8 seconds

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }
        this.apiKey = apiKey;
    }

    /**
     * Generate text from a prompt using Gemini API
     * Pure transport layer - no business logic
     */
    async generateText(prompt: string): Promise<string> {
        if (!prompt || prompt.trim().length === 0) {
            throw new AIServiceError('Prompt cannot be empty');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new AIServiceError(
                    `Gemini API request failed with status ${response.status}`,
                    new Error(errorText)
                );
            }

            const data: GeminiResponse = await response.json();

            // Extract text from response
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text || text.trim().length === 0) {
                throw new AIServiceError('Gemini API returned empty or malformed response');
            }

            return text.trim();
        } catch (error) {
            clearTimeout(timeoutId);

            // Handle timeout
            if (error instanceof Error && error.name === 'AbortError') {
                throw new AIServiceError('Gemini API request timed out after 8 seconds');
            }

            // Re-throw AIServiceError as-is
            if (error instanceof AIServiceError) {
                throw error;
            }

            // Wrap unknown errors
            throw new AIServiceError(
                'Failed to generate text from Gemini API',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }
}

export const geminiClient = new GeminiClient();
