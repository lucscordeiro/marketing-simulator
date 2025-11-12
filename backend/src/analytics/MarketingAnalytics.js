class MarketingAnalytics {
  static calculateKPIs(data) {
    const kpis = {
      basic: {},
      advanced: {},
      trends: {}
    };

    if (!data || data.length === 0) return kpis;

    // KPIs Básicos
    kpis.basic = this.calculateBasicKPIs(data);
    
    // KPIs Avançados
    kpis.advanced = this.calculateAdvancedKPIs(data);
    
    // Tendências
    kpis.trends = this.analyzeTrends(data);

    return kpis;
  }

  static calculateBasicKPIs(data) {
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalCost = 0;
    let totalRevenue = 0;

    data.forEach(row => {
      totalImpressions += parseFloat(row.impressions || 0);
      totalClicks += parseFloat(row.clicks || 0);
      totalConversions += parseFloat(row.conversions || 0);
      totalCost += parseFloat(row.media_cost_usd || 0);
      // Estimativa de receita baseada nas conversões
      totalRevenue += parseFloat(row.conversions || 0) * 100; // $100 por conversão
    });

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
    const cpa = totalConversions > 0 ? totalCost / totalConversions : 0;
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      cost: totalCost,
      revenue: totalRevenue,
      ctr: parseFloat(ctr.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      cpa: parseFloat(cpa.toFixed(2)),
      roi: parseFloat(roi.toFixed(2))
    };
  }

  static calculateAdvancedKPIs(data) {
    // Análise por canal
    const channelPerformance = this.analyzeByDimension(data, 'channel_name');
    
    // Análise por creative
    const creativePerformance = this.analyzeByDimension(data, 'creative_id');
    
    // Eficiência de budget
    const budgetEfficiency = this.analyzeBudgetEfficiency(data);
    
    // Engajamento por período
    const timePerformance = this.analyzeTimePerformance(data);

    return {
      channelPerformance,
      creativePerformance: creativePerformance.slice(0, 10), // Top 10
      budgetEfficiency,
      timePerformance
    };
  }

  static analyzeByDimension(data, dimension) {
    const groups = {};
    
    data.forEach(row => {
      const key = row[dimension] || 'Unknown';
      if (!groups[key]) {
        groups[key] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          cost: 0
        };
      }
      
      groups[key].impressions += parseFloat(row.impressions || 0);
      groups[key].clicks += parseFloat(row.clicks || 0);
      groups[key].conversions += parseFloat(row.conversions || 0);
      groups[key].cost += parseFloat(row.media_cost_usd || 0);
    });

    // Calcular métricas derivadas
    return Object.entries(groups).map(([key, metrics]) => {
      const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
      const conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
      const cpc = metrics.clicks > 0 ? metrics.cost / metrics.clicks : 0;
      const roi = metrics.cost > 0 ? ((metrics.conversions * 100 - metrics.cost) / metrics.cost) * 100 : 0;
      
      return {
        dimension: key,
        ...metrics,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        efficiency: roi / (cpc || 1) // Score de eficiência
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
  }

  static analyzeBudgetEfficiency(data) {
    const totalBudget = data.reduce((sum, row) => 
      sum + parseFloat(row.approved_budget || 0), 0
    );
    
    const spentBudget = data.reduce((sum, row) => 
      sum + parseFloat(row.media_cost_usd || 0), 0
    );
    
    const estimatedRevenue = data.reduce((sum, row) => 
      sum + (parseFloat(row.conversions || 0) * 100), 0
    );

    return {
      totalBudget,
      spentBudget,
      remainingBudget: totalBudget - spentBudget,
      budgetUtilization: totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0,
      revenuePerDollar: spentBudget > 0 ? estimatedRevenue / spentBudget : 0
    };
  }

  static analyzeTrends(data) {
    // Agrupar por data (simplificado)
    const dailyData = {};
    
    data.forEach(row => {
      if (row.time) {
        const date = new Date(row.time).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            cost: 0
          };
        }
        
        dailyData[date].impressions += parseFloat(row.impressions || 0);
        dailyData[date].clicks += parseFloat(row.clicks || 0);
        dailyData[date].conversions += parseFloat(row.conversions || 0);
        dailyData[date].cost += parseFloat(row.media_cost_usd || 0);
      }
    });

    const trends = Object.entries(dailyData)
      .map(([date, metrics]) => ({
        date,
        ...metrics,
        ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calcular tendências
    if (trends.length > 1) {
      const first = trends[0];
      const last = trends[trends.length - 1];
      
      return {
        ctrTrend: ((last.ctr - first.ctr) / first.ctr) * 100,
        costTrend: ((last.cost - first.cost) / first.cost) * 100,
        conversionTrend: ((last.conversions - first.conversions) / (first.conversions || 1)) * 100,
        dailyData: trends
      };
    }

    return { dailyData: trends };
  }

  static generateOptimizationRecommendations(kpis) {
    const recommendations = [];

    if (kpis.basic.ctr < 2) {
      recommendations.push({
        type: 'ctr_optimization',
        priority: 'high',
        message: 'CTR está abaixo da média do setor (2%). Considere otimizar creatives e targeting.',
        actions: [
          'Testar diferentes creatives',
          'Refinar segmentação de audience',
          'Otimizar copy e call-to-action'
        ]
      });
    }

    if (kpis.basic.conversionRate < 3) {
      recommendations.push({
        type: 'conversion_optimization',
        priority: 'high',
        message: 'Taxa de conversão pode ser melhorada.',
        actions: [
          'Otimizar landing pages',
          'Simplificar funnel de conversão',
          'Implementar remarketing'
        ]
      });
    }

    if (kpis.basic.cpa > 50) {
      recommendations.push({
        type: 'cost_optimization',
        priority: 'medium',
        message: 'Custo por aquisição está elevado.',
        actions: [
          'Revisar estratégia de bidding',
          'Focar em canais mais eficientes',
          'Negociar melhores tarifas com redes'
        ]
      });
    }

    // Recomendações baseadas em performance por canal
    if (kpis.advanced.channelPerformance && kpis.advanced.channelPerformance.length > 0) {
      const bestChannel = kpis.advanced.channelPerformance[0];
      const worstChannel = kpis.advanced.channelPerformance[kpis.advanced.channelPerformance.length - 1];

      recommendations.push({
        type: 'channel_optimization',
        priority: 'medium',
        message: `Alocar mais budget para ${bestChannel.dimension} (ROI: ${bestChannel.roi.toFixed(2)}%)`,
        actions: [
          `Aumentar investimento em ${bestChannel.dimension}`,
          `Reduzir ou otimizar ${worstChannel.dimension}`,
          'Testar estratégias similares aos canais de melhor performance'
        ]
      });
    }

    return recommendations;
  }
}

module.exports = MarketingAnalytics;