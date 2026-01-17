import { geminiClient } from '../ai/gemini.client';
import { AIServiceError } from '../ai/ai.errors';
import { participantRepository } from '../repositories/participant.repository';
import { summaryService } from './summary.service';
import { balanceService } from './balance.service';
import { assertGroupOwnership } from './helpers/ownership';
import { ValidationError } from '../utils/errors';

interface GeminiExpenseDraft {
    amount: number;
    description: string;
    date: string; // YYYY-MM-DD
    splitMode: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
    payerName: string;
    participantNames: string[];
    confidence: number;
}

interface ExpenseDraft {
    amount: number;
    description: string;
    date: string;
    splitMode: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
    payer: {
        id: string;
        name: string;
    };
    participants: Array<{
        id: string;
        name: string;
    }>;
}

export class MintSenseService {
    private readonly CONFIDENCE_THRESHOLD = 0.7;

    /**
     * Build strict JSON-only prompt for Gemini
     */
    private buildPrompt(text: string): string {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        return `You are a financial assistant that converts natural language into structured expense data.

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no explanations, no markdown, no extra text
- Do not wrap the JSON in code blocks or any other formatting
- The response must be parseable by JSON.parse()

INPUT TEXT: "${text}"

OUTPUT SCHEMA (return ONLY this JSON structure):
{
  "amount": <number in cents, e.g., 1200 for $12.00>,
  "description": "<brief description of expense>",
  "date": "<YYYY-MM-DD format, use ${today} if not specified>",
  "splitMode": "<EQUAL | CUSTOM | PERCENTAGE based on text>",
  "payerName": "<name of person who paid>",
  "participantNames": ["<array of all people involved including payer>"],
  "confidence": <number between 0 and 1 indicating confidence in extraction>
}

RULES:
1. Extract amount and convert to cents (e.g., "12 dollars" → 1200)
2. Use today's date (${today}) if date is not mentioned
3. Infer splitMode: "equally" → EQUAL, "I paid X, they paid Y" → CUSTOM, "40% 60%" → PERCENTAGE
4. Include payer in participantNames array
5. Set confidence based on clarity of input (0.0 to 1.0)
6. Return ONLY the JSON object, nothing else`;
    }

    /**
     * Parse and validate Gemini response
     */
    private parseGeminiResponse(response: string): GeminiExpenseDraft {
        try {
            // Remove any markdown code blocks if present
            let cleanedResponse = response.trim();
            if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(cleanedResponse);

            // Validate required fields
            if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
                throw new ValidationError('Invalid or missing amount in AI response');
            }

            if (!parsed.description || typeof parsed.description !== 'string') {
                throw new ValidationError('Invalid or missing description in AI response');
            }

            if (!parsed.date || typeof parsed.date !== 'string') {
                throw new ValidationError('Invalid or missing date in AI response');
            }

            if (!['EQUAL', 'CUSTOM', 'PERCENTAGE'].includes(parsed.splitMode)) {
                throw new ValidationError('Invalid or missing splitMode in AI response');
            }

            if (!parsed.payerName || typeof parsed.payerName !== 'string') {
                throw new ValidationError('Invalid or missing payerName in AI response');
            }

            if (!Array.isArray(parsed.participantNames) || parsed.participantNames.length === 0) {
                throw new ValidationError('Invalid or missing participantNames in AI response');
            }

            if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
                throw new ValidationError('Invalid confidence value in AI response');
            }

            return parsed as GeminiExpenseDraft;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError(
                `Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Match participant names to actual participants in the group
     */
    private async matchParticipants(
        names: string[],
        groupId: string
    ): Promise<Array<{ id: string; name: string }>> {
        const groupParticipants = await participantRepository.findByGroupId(groupId);

        const matched: Array<{ id: string; name: string }> = [];
        const unmatched: string[] = [];

        for (const name of names) {
            const participant = groupParticipants.find(
                (p) => p.name.toLowerCase() === name.toLowerCase()
            );

            if (participant) {
                matched.push({ id: participant.id, name: participant.name });
            } else {
                unmatched.push(name);
            }
        }

        if (unmatched.length > 0) {
            throw new ValidationError(
                `The following participant names were not found in this group: ${unmatched.join(', ')}. ` +
                `Available participants: ${groupParticipants.map((p) => p.name).join(', ')}`
            );
        }

        return matched;
    }

    /**
     * Generate expense draft from natural language text
     */
    async generateExpenseDraft(userId: string, groupId: string, text: string) {
        // Validate ownership
        await assertGroupOwnership(userId, groupId);

        // Validate input
        if (!text || text.trim().length === 0) {
            throw new ValidationError('Text input cannot be empty');
        }

        if (text.length > 500) {
            throw new ValidationError('Text input must not exceed 500 characters');
        }

        // Build prompt and call Gemini
        const prompt = this.buildPrompt(text);

        let geminiResponse: string;
        try {
            geminiResponse = await geminiClient.generateText(prompt);
        } catch (error) {
            if (error instanceof AIServiceError) {
                throw new ValidationError(
                    'AI service is currently unavailable. Please try again later or create the expense manually.'
                );
            }
            throw error;
        }

        // Parse AI response
        const aiDraft = this.parseGeminiResponse(geminiResponse);

        // Match participants
        const participants = await this.matchParticipants(aiDraft.participantNames, groupId);

        // Match payer
        const payer = participants.find(
            (p) => p.name.toLowerCase() === aiDraft.payerName.toLowerCase()
        );

        if (!payer) {
            throw new ValidationError(
                `Payer "${aiDraft.payerName}" was not found in the matched participants`
            );
        }

        // Build draft response
        const draft: ExpenseDraft = {
            amount: aiDraft.amount,
            description: aiDraft.description,
            date: aiDraft.date,
            splitMode: aiDraft.splitMode,
            payer,
            participants,
        };

        // Generate warning if confidence is low
        let warning: string | null = null;
        if (aiDraft.confidence < this.CONFIDENCE_THRESHOLD) {
            warning = `AI confidence is low (${(aiDraft.confidence * 100).toFixed(0)}%). Please review the draft carefully before creating the expense.`;
        }

        return {
            draft,
            confidence: aiDraft.confidence,
            warning,
        };
    }

    /**
     * Generate AI-powered group summary
     * Uses structured data from backend services only
     */
    async generateGroupSummary(userId: string, groupId: string) {
        // Validate ownership
        await assertGroupOwnership(userId, groupId);

        // Fetch structured data from backend services
        const summary = await summaryService.getGroupSummary(userId, groupId);
        const balances = await balanceService.getGroupBalances(userId, groupId);

        // Build structured data for prompt
        const structuredData = {
            totalSpent: summary.totalSpent,
            balances: balances.balances.map((b) => ({
                name: b.name,
                net: b.netBalance,
            })),
            settlements: balances.settlements.map((s) => ({
                from: s.fromName,
                to: s.toName,
                amount: s.amount,
            })),
        };

        // Build prompt
        const prompt = `Group expense data:
${JSON.stringify(structuredData, null, 2)}

Write a short, friendly summary of this group's expenses in at most two sentences. Use plain text only (no markdown, no emojis). Express amounts in rupees (₹). Do not invent any numbers or names - use only the data provided above.`;

        // Call Gemini with fallback
        let summaryText: string;
        try {
            summaryText = await geminiClient.generateText(prompt);

            // Clean up any markdown or formatting
            summaryText = summaryText.replace(/```/g, '').replace(/\*\*/g, '').trim();

            // Limit to 2 sentences if AI generated more
            const sentences = summaryText.match(/[^.!?]+[.!?]+/g) || [summaryText];
            if (sentences.length > 2) {
                summaryText = sentences.slice(0, 2).join(' ');
            }
        } catch (error) {
            // Deterministic fallback if AI fails
            const totalInRupees = Math.floor(summary.totalSpent / 100);
            summaryText = `The group spent ₹${totalInRupees.toLocaleString('en-IN')} in total. Please check balances for settlement details.`;
        }

        return {
            summary: summaryText,
        };
    }
}

export const mintSenseService = new MintSenseService();
