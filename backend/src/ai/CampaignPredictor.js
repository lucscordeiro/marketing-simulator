const GeminiService = require('./GeminiService');

class CampaignPredictor {
  constructor() {
    this.gemini = GeminiService;
  }

  async predictNewCampaign(campaignData, historicalData) {
    try {
      console.log('🎯 Gerando previsão para nova campanha:', campaignData);

      // 🔧 CORREÇÃO: Garantir que campaignData seja um objeto válido
      const safeCampaignData = this.ensureCampaignData(campaignData);
      
      const prediction = await this.gemini.predictCampaignPerformance(
        safeCampaignData,
        historicalData || []
      );

      if (prediction.success) {
        const parsedPrediction = this.parsePredictionResponse(prediction.content);
        console.log('✅ Previsão processada:', parsedPrediction.predictions);
        return parsedPrediction;
      } else {
        console.log('🔄 Usando previsão estatística');
        return this.generateStatisticalPrediction(safeCampaignData, historicalData);
      }
    } catch (error) {
      console.error('Campaign prediction error:', error);
      return this.generateStatisticalPrediction(this.ensureCampaignData(campaignData), historicalData);
    }
  }

  // 🔧 NOVO MÉTODO: Garantir dados válidos da campanha
  ensureCampaignData(campaignData) {
    if (!campaignData || typeof campaignData !== 'object') {
      console.warn('⚠️ campaignData inválido, usando valores padrão');
      return {
        budget: 1000,
        impressions: 10000,
        channel: 'google_ads',
        audience: 'general'
      };
    }

    return {
      budget: Number(campaignData.budget) || 1000,
      impressions: Number(campaignData.impressions) || 10000,
      channel: campaignData.channel || 'google_ads',
      audience: campaignData.audience || 'general',
      // Incluir outros campos que possam vir do frontend
      ...campaignData
    };
  }

  parsePredictionResponse(content) {
    try {
      console.log('📝 Processando resposta de previsão...');
      
      // Se já for um objeto, retornar diretamente
      if (typeof content === 'object' && content !== null) {
        console.log('✅ Resposta já é objeto JSON');
        return this.ensurePredictionStructure(content);
      }

      // Tentar extrair JSON da string
      let jsonContent = content;
      
      // Remover markdown code blocks se existirem
      const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/) || 
                       content.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        jsonContent = jsonMatch[1] || jsonMatch[0];
        console.log('🔧 JSON extraído de markdown');
      }

      // Parse do JSON
      const parsed = JSON.parse(jsonContent);
      console.log('✅ JSON parseado com sucesso');
      
      return this.ensurePredictionStructure(parsed);
      
    } catch (error) {
      console.error('❌ Erro no parsing da previsão:', error);
      console.log('📋 Conteúdo recebido (primeiros 500 chars):', content?.substring(0, 500));
      
      // Fallback: extrair métricas do texto
      return this.extractPredictionFromText(content);
    }
  }

  ensurePredictionStructure(prediction) {
    console.log('🏗️ Garantindo estrutura da previsão...');
    
    // Garantir que predictions tenha todas as métricas necessárias
    const predictions = prediction.predictions || prediction;
    
    const ensuredPredictions = {
      ctr: this.ensureMetric(predictions.ctr, predictions.ctr_esperado, 0.035),
      conversion_rate: this.ensureMetric(predictions.conversion_rate, predictions.taxa_conversao, 0.025),
      roi: this.ensureMetric(predictions.roi, predictions.roi_estimado, 180),
      cpa: this.ensureMetric(predictions.cpa, predictions.custo_por_aquisicao, 40),
      estimated_revenue: this.ensureMetric(predictions.estimated_revenue, predictions.receita_estimada, 2800)
    };

    // Garantir que recommendations seja um array
    let recommendations = [];
    if (Array.isArray(prediction.recommendations)) {
      recommendations = prediction.recommendations;
    } else if (prediction.recommendations && typeof prediction.recommendations === 'string') {
      recommendations = prediction.recommendations.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[\d.\s-]*/, '').trim())
        .filter(line => line.length > 10);
    }

    // Se ainda estiver vazio, criar recomendações padrão
    if (recommendations.length === 0) {
      recommendations = [
        "Implementar rastreamento de conversões para coletar dados detalhados",
        "Realizar testes A/B em criativos e mensagens",
        "Monitorar performance diariamente nas primeiras semanas",
        "Segmentar público-alvo para aumentar relevância dos anúncios"
      ];
    }

    // Garantir confidence factors
    const confidence_factors = prediction.confidence_factors || {
      data_quality: 'medium',
      similarity: 'medium',
      market_conditions: 'stable'
    };

    const ensured = {
      predictions: ensuredPredictions,
      confidence_factors: confidence_factors,
      recommendations: recommendations,
      source: prediction.source || 'gemini_ai',
      confidence: prediction.confidence || 'medium',
      note: prediction.note || 'Previsão baseada em dados fornecidos e padrões de mercado'
    };

    console.log('✅ Estrutura final garantida:', {
      ctr: ensured.predictions.ctr,
      conversion_rate: ensured.predictions.conversion_rate,
      roi: ensured.predictions.roi,
      recommendationsCount: ensured.recommendations.length
    });

    return ensured;
  }

  ensureMetric(primary, secondary, defaultValue) {
    if (primary !== undefined && primary !== null) {
      return typeof primary === 'number' ? primary : parseFloat(primary) || defaultValue;
    }
    if (secondary !== undefined && secondary !== null) {
      return typeof secondary === 'number' ? secondary : parseFloat(secondary) || defaultValue;
    }
    return defaultValue;
  }

  extractPredictionFromText(text) {
    console.log('🔄 Extraindo previsão de texto livre');
    
    const metrics = {};
    
    // Extrair CTR (formato: X.XX% ou XX%)
    const ctrMatch = text.match(/(\d+\.?\d*)%?.{0,30}(CTR|click.*rate)/i);
    if (ctrMatch) {
      metrics.ctr = parseFloat(ctrMatch[1]) / 100;
    } else {
      metrics.ctr = 0.035; // Fallback
    }
    
    // Extrair Taxa de Conversão
    const conversionMatch = text.match(/(\d+\.?\d*)%?.{0,30}(convers[aã]o|conversion)/i);
    if (conversionMatch) {
      metrics.conversion_rate = parseFloat(conversionMatch[1]) / 100;
    } else {
      metrics.conversion_rate = 0.025; // Fallback
    }
    
    // Extrair ROI
    const roiMatch = text.match(/(\d+\.?\d*)%?.{0,20}(ROI|retorno)/i);
    if (roiMatch) {
      metrics.roi = parseFloat(roiMatch[1]);
    } else {
      metrics.roi = 180; // Fallback
    }
    
    // Extrair CPA
    const cpaMatch = text.match(/(\d+\.?\d*)?.{0,30}(CPA|custo.*aquisi[cç][aã]o)/i);
    if (cpaMatch) {
      metrics.cpa = parseFloat(cpaMatch[1]);
    } else {
      metrics.cpa = 40; // Fallback
    }
    
    // Calcular receita estimada
    metrics.estimated_revenue = 1000 * (metrics.roi / 100) + 1000;

    // Extrair recomendações do texto
    const recommendations = [];
    const lines = text.split('\n');
    let inRecommendations = false;
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('recomenda') || lowerLine.includes('sugest') || lowerLine.includes('próximo')) {
        inRecommendations = true;
      } else if (inRecommendations && line.trim().length > 20 && !line.match(/^[#*-]/)) {
        recommendations.push(line.trim());
      }
    });

    return {
      predictions: metrics,
      confidence_factors: {
        data_quality: 'medium',
        similarity: 'medium',
        market_conditions: 'stable'
      },
      recommendations: recommendations.length > 0 ? recommendations : [
        "Implementar rastreamento abrangente de conversões",
        "Realizar testes A/B em diferentes elementos da campanha",
        "Monitorar métricas diariamente para ajustes rápidos"
      ],
      source: 'text_analysis',
      confidence: 'medium',
      note: 'Previsão extraída de análise de texto'
    };
  }

  generateStatisticalPrediction(campaignData, historicalData) {
    console.log('📊 Gerando previsão estatística...');
    
    // 🔧 CORREÇÃO: Usar campaignData seguro
    const safeCampaignData = this.ensureCampaignData(campaignData);
    
    if (!historicalData || historicalData.length === 0) {
      return this.generateBaselinePrediction(safeCampaignData);
    }

    // Calcular médias dos dados históricos
    const validData = historicalData.filter(item => item.results && typeof item.results === 'object');
    
    if (validData.length === 0) {
      return this.generateBaselinePrediction(safeCampaignData);
    }

    const avgCTR = validData.reduce((sum, item) => sum + (item.results.ctr || 0), 0) / validData.length;
    const avgConversion = validData.reduce((sum, item) => sum + (item.results.conversion_rate || 0), 0) / validData.length;
    const avgROI = validData.reduce((sum, item) => sum + (item.results.roi || 0), 0) / validData.length;

    // Ajustar baseado nos dados da nova campanha
    const budget = safeCampaignData.budget;
    const impressions = safeCampaignData.impressions;
    
    const budgetFactor = budget / 1000;
    const adjustedCTR = avgCTR * (0.9 + (budgetFactor * 0.2));
    const adjustedROI = avgROI * (0.8 + (budgetFactor * 0.4));

    const estimatedClicks = impressions * adjustedCTR;
    const estimatedConversions = estimatedClicks * avgConversion;
    const estimatedCPA = estimatedConversions > 0 ? budget / estimatedConversions : budget;

    return {
      predictions: {
        ctr: Math.max(0.01, Math.min(0.15, adjustedCTR)),
        conversion_rate: Math.max(0.005, Math.min(0.1, avgConversion)),
        roi: Math.max(50, Math.min(500, adjustedROI)),
        cpa: Math.max(10, Math.min(200, estimatedCPA)),
        estimated_revenue: budget * (adjustedROI / 100) + budget
      },
      confidence_factors: {
        data_quality: validData.length > 10 ? 'high' : 'medium',
        similarity: 'medium',
        market_conditions: 'stable'
      },
      recommendations: [
        "Monitorar performance nas primeiras 48 horas",
        "Ajustar bids baseado no CTR real observado",
        "Testar diferentes audiences e criativos"
      ],
      source: 'statistical_model',
      confidence: validData.length > 5 ? 'medium' : 'low',
      note: `Previsão baseada em ${validData.length} campanhas históricas`
    };
  }

  generateBaselinePrediction(campaignData) {
    console.log('📈 Usando baseline do setor...');
    
    // 🔧 CORREÇÃO: Usar campaignData seguro
    const safeCampaignData = this.ensureCampaignData(campaignData);
    const budget = safeCampaignData.budget;
    const impressions = safeCampaignData.impressions;
    
    // Médias do setor para Google Ads
    const industryAverages = {
      ctr: 0.035,
      conversion_rate: 0.025,
      roi: 180,
      cpa: 40
    };

    const estimatedClicks = impressions * industryAverages.ctr;
    const estimatedConversions = estimatedClicks * industryAverages.conversion_rate;

    return {
      predictions: {
        ctr: industryAverages.ctr,
        conversion_rate: industryAverages.conversion_rate,
        roi: industryAverages.roi,
        cpa: industryAverages.cpa,
        estimated_revenue: budget * (industryAverages.roi / 100) + budget
      },
      confidence_factors: {
        data_quality: 'low',
        similarity: 'unknown', 
        market_conditions: 'average'
      },
      recommendations: [
        "Implementar rastreamento completo de conversões",
        "Começar com orçamento conservador e escalar gradualmente",
        "Testar múltiplas estratégias de segmentação",
        "Monitorar métricas diariamente para otimizações rápidas",
        "Coletar dados específicos para melhorar futuras previsões"
      ],
      source: 'industry_baseline',
      confidence: 'low',
      note: 'Previsão baseada em médias do setor para Google Ads. Colete dados específicos para melhorar a precisão.'
    };
  }

  async predictOptimalBudget(allocationData, constraints) {
    try {
      const prompt = `
      OTIMIZAÇÃO DE ORÇAMENTO - ALOCAÇÃO INTELIGENTE

      DADOS DE ALOCAÇÃO ATUAL:
      ${JSON.stringify(allocationData, null, 2)}

      RESTRIÇÕES:
      ${JSON.stringify(constraints, null, 2)}

      SUGIRA UMA ALOCAÇÃO OTIMIZADA CONSIDERANDO:

      1. ROI histórico por canal
      2. Capacidade de escala de cada canal  
      3. Sazonalidade e tendências
      4. Objetivos de negócio

      Forneça distribuição percentual recomendada e ROI esperado.
      `;

      const result = await this.gemini.generateContent(prompt);
      
      if (result.success) {
        return this.parseBudgetRecommendation(result.content);
      } else {
        return this.generateBalancedBudget(allocationData, constraints);
      }
    } catch (error) {
      console.error('Budget optimization error:', error);
      return this.generateBalancedBudget(allocationData, constraints);
    }
  }

  parseBudgetRecommendation(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return {
          allocation: parsed.allocation || parsed,
          expected_roi_improvement: parsed.expected_roi_improvement || "15-25%",
          rationale: parsed.rationale || "Otimização baseada em análise de performance",
          source: 'gemini_ai'
        };
      }

      // Extrair porcentagens do texto
      const percentages = {};
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const match = line.match(/(search|social|display|video|google|facebook|instagram).*?(\d+)%/i);
        if (match) {
          percentages[match[1].toLowerCase()] = parseInt(match[2]);
        }
      });

      return {
        allocation: Object.keys(percentages).length > 0 ? percentages : { search: 40, social: 30, display: 20, video: 10 },
        expected_roi_improvement: "15-25%",
        rationale: "Otimização baseada em análise de IA",
        source: 'text_analysis'
      };
    } catch (error) {
      console.error('Error parsing budget recommendation:', error);
      return this.generateBalancedBudget({}, {});
    }
  }

  generateBalancedBudget(allocationData, constraints) {
    const channels = Object.keys(allocationData).length > 0 ? Object.keys(allocationData) : ['search', 'social', 'display', 'video'];
    const equalShare = 100 / channels.length;
    
    const allocation = {};
    channels.forEach(channel => {
      allocation[channel] = equalShare;
    });

    return {
      allocation,
      expected_roi_improvement: "10-20%",
      rationale: "Distribuição balanceada para teste inicial",
      source: 'balanced_model'
    };
  }
}

module.exports = new CampaignPredictor();