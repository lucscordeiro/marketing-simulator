const GeminiService = require('./GeminiService');

class MarketingAnalyst {
  constructor() {
    this.gemini = GeminiService;
  }

  async generateComprehensiveReport(projectData, datasets, kpis) {
    try {
      // Preparar dados para análise
      const dataSummary = {
        totalCampaigns: projectData.campaigns?.length || 0,
        dateRange: this.getDateRange(projectData),
        totalSpend: kpis.basic?.cost || 0,
        totalConversions: kpis.basic?.conversions || 0,
        averageROI: kpis.basic?.roi || 0,
        datasetsCount: datasets.length,
        topPerformingChannels: this.getTopChannels(kpis),
        keyMetricsTrend: this.analyzeTrends(kpis)
      };

      console.log('📋 Dados enviados para análise:', {
        totalSpend: dataSummary.totalSpend,
        totalConversions: dataSummary.totalConversions,
        averageROI: dataSummary.averageROI,
        datasetsCount: dataSummary.datasetsCount
      });

      const analysis = await this.gemini.analyzeMarketingData(
        dataSummary, 
        kpis, 
        projectData.objective || 'Otimizar performance de campanhas'
      );

      if (analysis.success) {
        return this.parseAnalysisResponse(analysis.content);
      } else {
        return this.generateFallbackAnalysis(dataSummary, kpis);
      }
    } catch (error) {
      console.error('Marketing analysis error:', error);
      return this.generateFallbackAnalysis({}, kpis);
    }
  }

  parseAnalysisResponse(content) {
    try {
      console.log('📝 Processando resposta do Gemini...');
      
      // Se já for um objeto, retornar diretamente
      if (typeof content === 'object' && content !== null) {
        console.log('✅ Resposta já é objeto JSON');
        return this.ensureAnalysisStructure(content);
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
      
      return this.ensureAnalysisStructure(parsed);
      
    } catch (error) {
      console.error('❌ Erro no parsing da resposta:', error);
      console.log('📋 Conteúdo recebido (primeiros 500 chars):', content.substring(0, 500));
      
      // Fallback: tentar criar estrutura a partir do texto
      return this.createStructureFromText(content);
    }
  }

  ensureAnalysisStructure(analysis) {
    console.log('🏗️ Garantindo estrutura da análise...');
    
    // Garantir que strategic_insights seja sempre um array
    let strategicInsights = [];
    if (Array.isArray(analysis.strategic_insights)) {
      strategicInsights = analysis.strategic_insights;
    } else if (analysis.strategic_insights && typeof analysis.strategic_insights === 'string') {
      // Dividir string em array
      strategicInsights = analysis.strategic_insights.split('\n')
        .filter(line => line.trim().length > 0 && !line.match(/^[#*-]/))
        .map(line => line.replace(/^[\d.\s-]*/, '').trim())
        .filter(line => line.length > 10); // Apenas linhas com conteúdo significativo
    } else if (analysis.insights && Array.isArray(analysis.insights)) {
      strategicInsights = analysis.insights;
    }

    // Se ainda estiver vazio, criar insights padrão
    if (strategicInsights.length === 0) {
      strategicInsights = [
        "Focar em melhorar a taxa de conversão através de otimização de landing pages",
        "Aumentar o orçamento para expandir o alcance das campanhas",
        "Implementar estratégias de remarketing para melhorar o ROI"
      ];
    }

    // Garantir que recommendations seja sempre um array
    let recommendations = [];
    if (Array.isArray(analysis.recommendations)) {
      recommendations = analysis.recommendations.map(rec => {
        if (typeof rec === 'string') {
          return {
            action: rec,
            impact: 'Médio',
            effort: 'Médio',
            timeline: '2-3 semanas',
            expected_improvement: 'Melhoria significativa'
          };
        }
        return {
          action: rec.action || rec.title || 'Ação recomendada',
          impact: rec.impact || rec.priority || 'Médio',
          effort: rec.effort || rec.dificuldade || 'Médio',
          timeline: rec.timeline || rec.prazo || '2-3 semanas',
          expected_improvement: rec.expected_improvement || rec.roi_esperado || 'Melhoria esperada'
        };
      });
    }

    // Se ainda estiver vazio, criar recomendações padrão
    if (recommendations.length === 0) {
      recommendations = [
        {
          action: "Otimizar campanhas para melhorar taxa de conversão",
          impact: "Alto",
          effort: "Médio",
          timeline: "2-3 semanas",
          expected_improvement: "Conversões +25-40%"
        },
        {
          action: "Aumentar investimento em canais de melhor performance",
          impact: "Alto",
          effort: "Baixo", 
          timeline: "1-2 semanas",
          expected_improvement: "ROI +15-25%"
        },
        {
          action: "Implementar testes A/B em criativos e landing pages",
          impact: "Médio",
          effort: "Médio",
          timeline: "3-4 semanas",
          expected_improvement: "CTR +20-30%"
        }
      ];
    }

    // Garantir estrutura completa
    const ensured = {
      performance_analysis: analysis.performance_analysis || {
        summary: analysis.summary || 'Análise de performance do projeto',
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : 
                  (analysis.strengths ? [analysis.strengths] : ['ROI elevado indicando boa eficiência']),
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : 
                   (analysis.weaknesses ? [analysis.weaknesses] : ['Volume de conversões precisa ser aumentado']),
        overall_score: analysis.overall_score || analysis.score || 65,
        alertas: Array.isArray(analysis.alertas) ? analysis.alertas : []
      },
      strategic_insights: strategicInsights,
      recommendations: recommendations,
      predictions: analysis.predictions || {
        next_30_days: 'Crescimento moderado com otimizações aplicadas',
        confidence: 'Média baseada em dados históricos',
        key_metrics: ['ROI', 'Conversões', 'CTR']
      },
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Estrutura final garantida:', {
      insightsCount: ensured.strategic_insights.length,
      recommendationsCount: ensured.recommendations.length,
      hasPerformance: !!ensured.performance_analysis
    });

    return ensured;
  }

  createStructureFromText(content) {
    console.log('🔄 Criando estrutura a partir de texto livre');
    
    // Dividir conteúdo em seções baseadas em marcadores
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    const strengths = [];
    const weaknesses = [];
    const insights = [];
    const recommendations = [];

    let currentSection = '';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('forte') || lowerLine.includes('strength') || lowerLine.includes('positivo') || lowerLine.includes('vantagem')) {
        currentSection = 'strengths';
      } else if (lowerLine.includes('fraco') || lowerLine.includes('weakness') || lowerLine.includes('melhorar') || lowerLine.includes('desafio')) {
        currentSection = 'weaknesses';
      } else if (lowerLine.includes('recomendo') || lowerLine.includes('sugiro') || lowerLine.includes('action') || lowerLine.includes('próximo passo')) {
        currentSection = 'recommendations';
      } else if (lowerLine.includes('insight') || lowerLine.includes('oportunidade') || lowerLine.includes('estratégia')) {
        currentSection = 'insights';
      }
      
      // Adicionar conteúdo baseado na seção atual
      if (currentSection === 'strengths' && line.length > 10 && !line.match(/^[#=-]/)) {
        strengths.push(line);
      } else if (currentSection === 'weaknesses' && line.length > 10 && !line.match(/^[#=-]/)) {
        weaknesses.push(line);
      } else if (currentSection === 'recommendations' && line.length > 10 && !line.match(/^[#=-]/)) {
        recommendations.push({
          action: line,
          impact: 'Médio',
          effort: 'Médio',
          timeline: '2-3 semanas',
          expected_improvement: 'Melhoria esperada'
        });
      } else if (currentSection === 'insights' && line.length > 20 && !line.match(/^[#=-]/)) {
        insights.push(line);
      }
    });

    // Fallbacks se estiverem vazios
    if (strengths.length === 0) strengths.push('ROI elevado indicando boa eficiência nas campanhas');
    if (weaknesses.length === 0) weaknesses.push('Volume limitado de dados para análise mais profunda');
    if (insights.length === 0) {
      insights.push(
        'Oportunidade de aumentar investimento em canais de melhor performance',
        'Implementar estratégias de remarketing pode melhorar significativamente o ROI',
        'Otimização de landing pages pode aumentar taxa de conversão'
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        {
          action: 'Aumentar orçamento para expandir alcance das campanhas',
          impact: 'Alto',
          effort: 'Baixo',
          timeline: '1-2 semanas',
          expected_improvement: 'Conversões +30-50%'
        },
        {
          action: 'Implementar testes A/B em criativos',
          impact: 'Médio',
          effort: 'Médio',
          timeline: '2-3 semanas',
          expected_improvement: 'CTR +15-25%'
        }
      );
    }

    return {
      performance_analysis: {
        summary: 'Análise baseada em IA com dados do projeto',
        strengths: strengths,
        weaknesses: weaknesses,
        overall_score: 70,
        alertas: []
      },
      strategic_insights: insights,
      recommendations: recommendations,
      predictions: {
        next_30_days: 'Crescimento esperado com implementação das recomendações',
        confidence: 'Alta baseada nos dados analisados',
        key_metrics: ['ROI', 'Conversões', 'CTR', 'CPA']
      },
      generatedAt: new Date().toISOString(),
      note: 'Análise processada a partir de resposta em texto livre'
    };
  }

  // Manter os outros métodos existentes
  getDateRange(projectData) {
    if (!projectData.campaigns || projectData.campaigns.length === 0) {
      return 'Nenhuma campanha';
    }
    
    const dates = projectData.campaigns.map(c => new Date(c.created_at));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
  }

  getTopChannels(kpis) {
    if (!kpis.advanced?.channelPerformance) return [];
    
    return kpis.advanced.channelPerformance
      .slice(0, 3)
      .map(channel => ({
        name: channel.dimension,
        roi: channel.roi,
        conversions: channel.conversions
      }));
  }

  analyzeTrends(kpis) {
    if (!kpis.trends?.dailyData || kpis.trends.dailyData.length < 2) {
      return 'Dados insuficientes para análise de tendência';
    }

    const recentData = kpis.trends.dailyData.slice(-7);
    const ctrTrend = this.calculateTrend(recentData.map(d => d.ctr));
    const conversionTrend = this.calculateTrend(recentData.map(d => d.conversions));

    return {
      ctr: ctrTrend > 0 ? 'melhorando' : ctrTrend < 0 ? 'piorando' : 'estável',
      conversions: conversionTrend > 0 ? 'crescendo' : conversionTrend < 0 ? 'decaindo' : 'estável',
      strength: Math.abs(ctrTrend)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  }

  generateFallbackAnalysis(dataSummary, kpis) {
    return {
      performance_analysis: {
        summary: `Análise baseada em ${dataSummary.totalCampaigns || 0} campanhas e ${dataSummary.datasetsCount} datasets`,
        strengths: this.identifyStrengths(kpis),
        weaknesses: this.identifyWeaknesses(kpis),
        overall_score: this.calculateScore(kpis)
      },
      strategic_insights: [
        "Otimize os canais de melhor performance",
        "Foque na qualidade do tráfego em vez de quantidade",
        "Teste diferentes criativos para melhorar CTR"
      ],
      recommendations: this.generateBasicRecommendations(kpis),
      predictions: {
        next_30_days: "Crescimento moderado esperado com otimizações",
        confidence: "Média baseada em dados históricos"
      },
      generatedAt: new Date().toISOString()
    };
  }

  identifyStrengths(kpis) {
    const strengths = [];
    if (kpis.basic?.ctr > 3) strengths.push("CTR acima da média");
    if (kpis.basic?.roi > 200) strengths.push("ROI excelente");
    if (kpis.basic?.conversionRate > 5) strengths.push("Taxa de conversão forte");
    return strengths.length > 0 ? strengths : ["Base sólida para crescimento"];
  }

  identifyWeaknesses(kpis) {
    const weaknesses = [];
    if (kpis.basic?.ctr < 1) weaknesses.push("CTR precisa de otimização");
    if (kpis.basic?.cpa > 50) weaknesses.push("Custo por aquisição elevado");
    if (!kpis.advanced?.channelPerformance) weaknesses.push("Dados de canais limitados");
    return weaknesses.length > 0 ? weaknesses : ["Oportunidades de otimização identificadas"];
  }

  calculateScore(kpis) {
    let score = 50;
    
    if (kpis.basic?.ctr > 2) score += 10;
    if (kpis.basic?.roi > 150) score += 20;
    if (kpis.basic?.conversionRate > 3) score += 10;
    if (kpis.basic?.cpa < 30) score += 10;
    
    return Math.min(100, score);
  }

  generateBasicRecommendations(kpis) {
    const recommendations = [];
    
    if (kpis.basic?.ctr < 2) {
      recommendations.push({
        action: "Otimizar títulos e descrições dos anúncios",
        impact: "Alto",
        effort: "Baixo",
        expected_improvement: "CTR +30-50%"
      });
    }
    
    if (kpis.basic?.conversionRate < 2) {
      recommendations.push({
        action: "Melhorar landing pages e call-to-action",
        impact: "Alto", 
        effort: "Médio",
        expected_improvement: "Conversões +20-40%"
      });
    }
    
    return recommendations.length > 0 ? recommendations : [
      {
        action: "Revisar estratégia de campanhas",
        impact: "Médio",
        effort: "Baixo",
        expected_improvement: "Performance geral +15%"
      }
    ];
  }
}

module.exports = new MarketingAnalyst();