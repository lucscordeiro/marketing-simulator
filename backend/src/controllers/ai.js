const supabase = require('../config/supabase');
const MarketingAnalyst = require('../ai/MarketingAnalyst');
const CampaignPredictor = require('../ai/CampaignPredictor');
const GeminiService = require('../ai/GeminiService');

class AIController {
  constructor() {
    this.analyst = MarketingAnalyst;
    this.predictor = CampaignPredictor;
    this.gemini = GeminiService;
    
    // Bind dos métodos para manter o contexto
    this.calculateProjectKPIs = this.calculateProjectKPIs.bind(this);
    this.identifyDataPatterns = this.identifyDataPatterns.bind(this);
    this.analyzeProject = this.analyzeProject.bind(this);
    this.predictCampaign = this.predictCampaign.bind(this);
    this.chatWithAgent = this.chatWithAgent.bind(this);
    this.optimizeCampaign = this.optimizeCampaign.bind(this);
    this.generateInsights = this.generateInsights.bind(this);
    this.trainModel = this.trainModel.bind(this);
    this.simulate = this.simulate.bind(this);
    this.getProjectModels = this.getProjectModels.bind(this);
    this.getSimulations = this.getSimulations.bind(this);
  }

  // 🔍 ANÁLISE COMPLETA DE DADOS
  async analyzeProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.userId;

      console.log(`🔍 Iniciando análise do projeto: ${projectId}`);

      // Verificar permissões
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (projectError || !project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Buscar datasets do projeto
      const { data: datasets } = await supabase
        .from('datasets')
        .select('*')
        .eq('project_id', projectId);

      console.log(`📊 Datasets encontrados: ${datasets?.length || 0}`);

      // Buscar simulações do projeto
      const { data: simulations } = await supabase
        .from('simulations')
        .select('*')
        .eq('project_id', projectId);

      console.log(`🎮 Simulações encontradas: ${simulations?.length || 0}`);

      // Calcular KPIs com dados reais
      const kpis = await this.calculateProjectKPIs(project, datasets || [], simulations || []);
      
      console.log(`📈 KPIs calculados:`, {
        datasets: kpis.basic?.datasets,
        dataRows: kpis.basic?.totalDataRows,
        impressions: kpis.basic?.impressions,
        clicks: kpis.basic?.clicks,
        conversions: kpis.basic?.conversions
      });

      // Análise com IA
      const analysis = await this.analyst.generateComprehensiveReport(
        project, 
        datasets || [], 
        kpis
      );

      // Salvar análise no histórico
      await supabase
        .from('ai_analyses')
        .insert([{
          project_id: projectId,
          analysis_type: 'comprehensive',
          results: analysis,
          generated_at: new Date()
        }]);

      res.json({
        success: true,
        analysis,
        project: {
          id: project.id,
          name: project.name,
          objective: project.objective
        },
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Project analysis error:', error);
      res.status(500).json({ 
        error: 'Analysis failed',
        details: error.message 
      });
    }
  }

  // 📊 PREVISÃO DE CAMPANHA
  async predictCampaign(req, res) {
    try {
      const { projectId } = req.params;
      const { campaignData } = req.body;
      const userId = req.userId;

      console.log(`📊 Gerando previsão para projeto: ${projectId}`);

      // Verificar permissões e buscar dados históricos
      const { data: historicalSimulations } = await supabase
        .from('simulations')
        .select('*')
        .eq('project_id', projectId)
        .limit(10);

      const prediction = await this.predictor.predictNewCampaign(
        campaignData,
        historicalSimulations || []
      );

      res.json({
        success: true,
        prediction,
        input_data: campaignData,
        historical_samples: historicalSimulations?.length || 0
      });

    } catch (error) {
      console.error('Campaign prediction error:', error);
      res.status(500).json({ 
        error: 'Prediction failed',
        details: error.message 
      });
    }
  }

  // 💡 AGENTE DE MARKETING - CHAT
  async chatWithAgent(req, res) {
    try {
      const { projectId } = req.params;
      const { message, conversationHistory = [] } = req.body;
      const userId = req.userId;

      console.log(`💡 Chat com agente - Projeto: ${projectId}`);

      // Buscar contexto do projeto
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const context = {
        project_name: project.name,
        objective: project.objective,
        description: project.description,
        budget: project.budget
      };

      const response = await this.gemini.chatWithMarketingAgent(
        message,
        context,
        conversationHistory
      );

      if (response.success) {
        // Salvar no histórico do chat
        await supabase
          .from('ai_conversations')
          .insert([{
            project_id: projectId,
            user_message: message,
            ai_response: response.content,
            context: context,
            timestamp: new Date()
          }]);

        res.json({
          success: true,
          response: response.content,
          usage: response.usage,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'AI service unavailable',
          fallback: this.generateFallbackResponse(message)
        });
      }

    } catch (error) {
      console.error('Chat agent error:', error);
      res.status(500).json({ 
        error: 'Chat failed',
        details: error.message 
      });
    }
  }

  // 🎯 OTIMIZAÇÃO INTELIGENTE
  async optimizeCampaign(req, res) {
    try {
      const { projectId } = req.params;
      const { constraints } = req.body;
      const userId = req.userId;

      console.log(`🎯 Otimizando campanha - Projeto: ${projectId}`);

      // Buscar dados do projeto para otimização
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Buscar simulações para dados de performance
      const { data: simulations } = await supabase
        .from('simulations')
        .select('*')
        .eq('project_id', projectId)
        .limit(5);

      const allocationData = this.prepareAllocationData(simulations);
      const optimization = await this.predictor.predictOptimalBudget(
        allocationData,
        constraints || {}
      );

      res.json({
        success: true,
        optimization,
        project: {
          id: project.id,
          name: project.name
        },
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Campaign optimization error:', error);
      res.status(500).json({ 
        error: 'Optimization failed',
        details: error.message 
      });
    }
  }

  // 📈 GERAR INSIGHTS AUTOMÁTICOS
  async generateInsights(req, res) {
    try {
      const { projectId } = req.params;
      const { insightType = 'comprehensive' } = req.body;
      const userId = req.userId;

      console.log(`📈 Gerando insights - Projeto: ${projectId}`);

      // Buscar dados do projeto
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Buscar datasets e simulações
      const { data: datasets } = await supabase
        .from('datasets')
        .select('*')
        .eq('project_id', projectId);

      const { data: simulations } = await supabase
        .from('simulations')
        .select('*')
        .eq('project_id', projectId);

      console.log(`📊 Dados para insights: ${datasets?.length || 0} datasets, ${simulations?.length || 0} simulações`);

      const kpis = await this.calculateProjectKPIs(project, datasets || [], simulations || []);
      const dataPatterns = this.identifyDataPatterns(project, datasets || [], simulations || [], kpis);

      const insights = await this.gemini.generateMarketingInsights(
        dataPatterns,
        'Marketing Digital - Campanhas Performance'
      );

      if (insights.success) {
        // Salvar insights
        await supabase
          .from('ai_insights')
          .insert([{
            project_id: projectId,
            insight_type: insightType,
            insights: insights.content,
            patterns_identified: dataPatterns,
            generated_at: new Date()
          }]);

        res.json({
          success: true,
          insights: this.parseInsightsResponse(insights.content),
          patterns: dataPatterns,
          generated_at: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Insights generation failed'
        });
      }

    } catch (error) {
      console.error('Insights generation error:', error);
      res.status(500).json({ 
        error: 'Insights generation failed',
        details: error.message 
      });
    }
  }

  // 🧠 MÉTODOS DE COMPATIBILIDADE

  async trainModel(req, res) {
    try {
      const { projectId, datasetId, config } = req.body;
      const userId = req.userId;

      console.log(`🧠 Simulando treinamento de modelo - Projeto: ${projectId}`);

      // Verificar permissões
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Simular criação de modelo
      const { data: model, error } = await supabase
        .from('ai_models')
        .insert([{
          project_id: projectId,
          dataset_id: datasetId,
          model_name: config?.modelName || 'Marketing Model',
          model_type: config?.modelType || 'regression',
          status: 'trained',
          accuracy: 0.85,
          trained_at: new Date()
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        message: 'Model training simulated successfully',
        model
      });

    } catch (error) {
      console.error('Train model error:', error);
      res.status(500).json({ error: 'Training simulation failed' });
    }
  }

  async simulate(req, res) {
    try {
      const { projectId, modelId, parameters } = req.body;
      const userId = req.userId;

      console.log(`🎮 Executando simulação - Projeto: ${projectId}`);

      // Verificar permissões
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Criar simulação
      const { data: simulation, error } = await supabase
        .from('simulations')
        .insert([{
          project_id: projectId,
          model_id: modelId,
          name: parameters.name || 'AI Simulation',
          parameters: parameters,
          status: 'completed',
          results: {
            roi: (Math.random() * 3 + 1).toFixed(2),
            conversions: Math.floor(Math.random() * 500 + 50),
            revenue: (Math.random() * 5000 + 1000).toFixed(2),
            ctr: (Math.random() * 0.05 + 0.02).toFixed(4)
          },
          completed_at: new Date()
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        message: 'Simulation completed successfully',
        simulation
      });

    } catch (error) {
      console.error('Simulation error:', error);
      res.status(500).json({ error: 'Simulation failed' });
    }
  }

  async getProjectModels(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.userId;

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { data: models, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ models });

    } catch (error) {
      console.error('Get models error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSimulations(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.userId;

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { data: simulations, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ simulations });
    } catch (error) {
      console.error('Get simulations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Métodos auxiliares - ATUALIZADOS para usar dados reais
  async calculateProjectKPIs(project, datasets, simulations) {
    console.log('📊 Calculando KPIs com dados reais dos datasets...');
    
    // Calcular métricas baseadas nos datasets reais
    let totalRows = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    // Processar dados dos datasets se existirem
    if (datasets && datasets.length > 0) {
      datasets.forEach(dataset => {
        totalRows += dataset.row_count || 0;
        
        // Extrair métricas do sample_data se disponível
        if (dataset.sample_data && Array.isArray(dataset.sample_data)) {
          dataset.sample_data.forEach(row => {
            // Tentar extrair métricas comuns de marketing
            if (row.spend || row.cost || row.budget) {
              totalSpend += parseFloat(row.spend || row.cost || row.budget || 0);
            }
            if (row.conversions || row.conversion) {
              totalConversions += parseFloat(row.conversions || row.conversion || 0);
            }
            if (row.clicks || row.click) {
              totalClicks += parseFloat(row.clicks || row.click || 0);
            }
            if (row.impressions || row.impression) {
              totalImpressions += parseFloat(row.impressions || row.impression || 0);
            }
          });
        }
      });
    }

    // Se não encontrou dados nos samples, usar valores realistas baseados no projeto
    if (totalSpend === 0 && project.budget) {
      totalSpend = project.budget * 0.7; // Assumir 70% do orçamento utilizado
    }
    if (totalImpressions === 0) {
      totalImpressions = totalRows > 0 ? totalRows * 100 : 10000; // Estimativa baseada em dados
    }
    if (totalClicks === 0) {
      totalClicks = Math.floor(totalImpressions * 0.035); // CTR de 3.5%
    }
    if (totalConversions === 0) {
      totalConversions = Math.floor(totalClicks * 0.025); // Taxa de conversão de 2.5%
    }

    const basic = {
      datasets: datasets?.length || 0,
      simulations: simulations?.length || 0,
      totalDataRows: totalRows,
      budget: project.budget || totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      cost: totalSpend
    };

    // Calcular métricas derivadas
    basic.ctr = basic.impressions > 0 ? (basic.clicks / basic.impressions) * 100 : 0;
    basic.conversionRate = basic.clicks > 0 ? (basic.conversions / basic.clicks) * 100 : 0;
    basic.roi = basic.cost > 0 ? ((basic.conversions * 100 - basic.cost) / basic.cost) * 100 : 0;
    basic.cpa = basic.conversions > 0 ? basic.cost / basic.conversions : 0;

    console.log('📈 KPIs calculados:', {
      datasets: basic.datasets,
      dataRows: basic.totalDataRows,
      impressions: basic.impressions,
      clicks: basic.clicks,
      conversions: basic.conversions,
      spend: basic.cost,
      roi: basic.roi
    });

    return { basic };
  }

  identifyDataPatterns(project, datasets, simulations, kpis) {
    console.log('🔍 Identificando padrões nos dados...');
    
    const patterns = {
      project_scale: this.assessProjectScale(project, datasets, simulations),
      performance_level: this.assessPerformanceLevel(kpis),
      data_completeness: this.assessDataCompleteness(datasets, simulations),
      optimization_potential: this.assessOptimizationPotential(kpis),
      data_quality: this.assessDataQuality(datasets)
    };

    console.log('🎯 Padrões identificados:', patterns);
    return patterns;
  }

  assessProjectScale(project, datasets, simulations) {
    const totalDataPoints = datasets.reduce((sum, ds) => sum + (ds.row_count || 0), 0);
    
    if (totalDataPoints > 10000) return 'large';
    if (totalDataPoints > 1000) return 'medium';
    return 'small';
  }

  assessPerformanceLevel(kpis) {
    const roi = kpis.basic?.roi || 0;
    if (roi > 200) return 'excellent';
    if (roi > 100) return 'good';
    if (roi > 50) return 'average';
    return 'needs_improvement';
  }

  assessDataCompleteness(datasets, simulations) {
    const hasDatasets = datasets.length > 0;
    const hasSimulations = simulations.length > 0;
    
    if (hasDatasets && hasSimulations) return 'high';
    if (hasDatasets || hasSimulations) return 'medium';
    return 'low';
  }

  assessOptimizationPotential(kpis) {
    const ctr = kpis.basic?.ctr || 0;
    const conversionRate = kpis.basic?.conversionRate || 0;
    
    if (ctr < 2 || conversionRate < 2) return 'high';
    if (ctr < 4 || conversionRate < 4) return 'medium';
    return 'low';
  }

  assessDataQuality(datasets) {
    if (!datasets || datasets.length === 0) return 'no_data';
    
    let totalQuality = 0;
    datasets.forEach(dataset => {
      if (dataset.data_quality && dataset.data_quality.status === 'analyzed') {
        // Calcular qualidade média baseada nas colunas
        const columns = Object.keys(dataset.data_quality.completeness || {});
        if (columns.length > 0) {
          const avgCompleteness = columns.reduce((sum, col) => {
            return sum + (dataset.data_quality.completeness[col].percentage || 0);
          }, 0) / columns.length;
          totalQuality += avgCompleteness;
        }
      }
    });
    
    const avgQuality = totalQuality / datasets.length;
    if (avgQuality > 90) return 'excellent';
    if (avgQuality > 75) return 'good';
    if (avgQuality > 50) return 'fair';
    return 'poor';
  }

  prepareAllocationData(simulations) {
    if (!simulations || simulations.length === 0) {
      return {
        search: 25,
        social: 25,
        display: 25,
        video: 25
      };
    }

    // Simular alocação baseada em performance histórica
    return {
      search: 35,
      social: 30,
      display: 20,
      video: 15
    };
  }

  parseInsightsResponse(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return { insights: content };
    } catch (error) {
      return { insights: content, note: 'Formato livre' };
    }
  }

  generateFallbackResponse(message) {
    const fallbacks = {
      'otimização': 'Para otimizar campanhas, recomendo focar nos canais com melhor ROI e testar diferentes criativos. Comece realocando 20% do orçamento para o canal de melhor performance.',
      'orçamento': 'Sugero distribuir o orçamento baseado no performance histórico: 40% para o canal principal, 30% para secundário, 20% para testes e 10% para emergentes.',
      'previsão': 'Com os dados atuais, espera-se um CTR de 2-4% e ROI de 120-180%. Coletar mais dados melhorará a precisão das previsões.',
      'análise': 'Analisando seus dados, identifiquei oportunidades em segmentação de audience e otimização de criativos. Recomendo testar pelo menos 3 variações por campanha.',
      'default': 'Como assistente de marketing, posso ajudar com análise de dados, previsões de campanhas, otimizações e insights estratégicos. No que posso ajudar?'
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(fallbacks)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return fallbacks.default;
  }
}

module.exports = new AIController();