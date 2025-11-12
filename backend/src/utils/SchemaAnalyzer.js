class SchemaAnalyzer {
  static detectColumnTypes(data) {
    if (!data || data.length === 0) return {};
    
    const firstRow = data[0];
    const columnTypes = {};
    
    for (const [key, value] of Object.entries(firstRow)) {
      columnTypes[key] = this.inferType(value, key);
    }
    
    return columnTypes;
  }
  
  static inferType(value, columnName) {
    if (value === null || value === undefined) return 'unknown';
    
    // Análise baseada no nome da coluna
    const lowerName = columnName.toLowerCase();
    
    if (lowerName.includes('date') || lowerName.includes('time')) {
      return 'datetime';
    }
    if (lowerName.includes('id')) {
      return 'id';
    }
    if (lowerName.includes('budget') || lowerName.includes('cost') || lowerName.includes('price') || lowerName.includes('bid') || lowerName.includes('margin')) {
      return 'currency';
    }
    if (lowerName.includes('impression') || lowerName.includes('click') || lowerName.includes('conversion') || lowerName.includes('reach')) {
      return 'metric';
    }
    if (lowerName.includes('rate') || lowerName.includes('ratio') || lowerName.includes('percentage')) {
      return 'percentage';
    }
    if (lowerName.includes('name') || lowerName.includes('title') || lowerName.includes('description')) {
      return 'text';
    }
    if (lowerName.includes('category') || lowerName.includes('type') || lowerName.includes('status')) {
      return 'category';
    }
    
    // Análise baseada no valor
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
      return 'numeric';
    }
    if (typeof value === 'boolean' || value === 'true' || value === 'false') {
      return 'boolean';
    }
    if (Date.parse(value)) {
      return 'datetime';
    }
    
    return 'text';
  }
  
  static generateFieldConfig(columnTypes, data) {
    const config = {};
    
    for (const [column, type] of Object.entries(columnTypes)) {
      config[column] = {
        type,
        role: this.determineRole(column, type),
        required: false,
        metadata: this.generateMetadata(column, type, data)
      };
    }
    
    return config;
  }
  
  static determineRole(columnName, type) {
    const lowerName = columnName.toLowerCase();
    
    if (lowerName.includes('id') && type === 'id') return 'identifier';
    if (type === 'datetime') return 'timestamp';
    if (type === 'currency') return 'monetary';
    if (type === 'metric') return 'kpi';
    if (lowerName.includes('target') || lowerName.includes('objective')) return 'target';
    
    return 'feature';
  }
  
  static generateMetadata(column, type, data) {
    const values = data.map(row => row[column]).filter(val => val != null);
    const metadata = {
      count: values.length,
      uniqueCount: new Set(values).size
    };
    
    if (type === 'numeric' || type === 'currency') {
      const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (numericValues.length > 0) {
        metadata.min = Math.min(...numericValues);
        metadata.max = Math.max(...numericValues);
        metadata.avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      }
    }
    
    if (type === 'datetime') {
      const dates = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
      if (dates.length > 0) {
        metadata.dateRange = {
          min: new Date(Math.min(...dates)),
          max: new Date(Math.max(...dates))
        };
      }
    }
    
    return metadata;
  }
}

module.exports = SchemaAnalyzer;