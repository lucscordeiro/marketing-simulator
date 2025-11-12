require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('🔍 Testando configuração do Gemini...');
    console.log('API Key presente:', !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
        console.log('❌ GEMINI_API_KEY não encontrada no .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Modelos mais recentes que podem funcionar
    const modelsToTest = [
        'gemini-1.5-flash-001',
        'gemini-1.5-pro-001', 
        'gemini-1.0-pro-001',
        'gemini-pro',
        'models/gemini-pro'
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`\n🔧 Testando: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent("Responda com 'OK'");
            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ SUCESSO com ${modelName}: ${text}`);
            console.log('📋 Modelo funcionando! Use este no seu código.');
            return modelName;
            
        } catch (error) {
            console.log(`❌ ${modelName}: ${error.message.split('\n')[0]}`);
        }
    }
    
    console.log('\n🔧 Tentando listar modelos disponíveis...');
    try {
        // Método alternativo para listar modelos
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + process.env.GEMINI_API_KEY);
        const data = await response.json();
        console.log('📋 Modelos disponíveis:', data.models?.map(m => m.name) || 'Nenhum');
    } catch (e) {
        console.log('❌ Não foi possível listar modelos');
    }
}

testGemini();