import 'dotenv/config';
import { geminiClient } from './src/ai/gemini.client';

async function testGeminiClient() {
    try {
        console.log('Testing Gemini AI Client...\n');

        // Test 1: Simple prompt
        console.log('Test 1: Simple prompt');
        const prompt = 'Say hello in exactly 5 words.';
        console.log('Prompt:', prompt);

        const response = await geminiClient.generateText(prompt);
        console.log('Response:', response);
        console.log('✓ Test 1 passed\n');

        // Test 2: Empty prompt (should throw error)
        console.log('Test 2: Empty prompt (should throw error)');
        try {
            await geminiClient.generateText('');
            console.log('✗ Test 2 failed - should have thrown error');
        } catch (error: any) {
            console.log('✓ Test 2 passed - correctly threw error:', error.message);
        }

        console.log('\n=== ALL TESTS PASSED ===');
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.originalError) {
            console.error('Original error:', error.originalError.message);
        }
        process.exit(1);
    }
}

testGeminiClient();
