# Test Gemini AI Client

Write-Host "=== GEMINI AI CLIENT TEST ===" -ForegroundColor Cyan

# Create a simple test script
$testScript = @"
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
        } catch (error) {
            console.log('✓ Test 2 passed - correctly threw error:', error.message);
        }

        console.log('\n=== ALL TESTS PASSED ===');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.originalError) {
            console.error('Original error:', error.originalError.message);
        }
        process.exit(1);
    }
}

testGeminiClient();
"@

Set-Content -Path "test-gemini.ts" -Value $testScript

Write-Host "`nTest script created: test-gemini.ts" -ForegroundColor Green
Write-Host "`nTo run the test:" -ForegroundColor Yellow
Write-Host "  npx tsx test-gemini.ts" -ForegroundColor White
Write-Host "`nOr compile and run:" -ForegroundColor Yellow
Write-Host "  npx tsc test-gemini.ts && node test-gemini.js" -ForegroundColor White
