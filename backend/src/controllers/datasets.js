const supabase = require('../config/supabase');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

class DatasetController {
  constructor() {
    // Bind methods to maintain 'this' context
    this.uploadDataset = this.uploadDataset.bind(this);
    this.basicColumnAnalysis = this.basicColumnAnalysis.bind(this);
    this.basicFieldConfig = this.basicFieldConfig.bind(this);
    this.basicDataQuality = this.basicDataQuality.bind(this);
    this.inferBasicType = this.inferBasicType.bind(this);
    this.determineRole = this.determineRole.bind(this);
  }

  async uploadDataset(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.userId;

      console.log(`📤 Recebendo upload para projeto: ${projectId}`);

      // Verificar se o projeto pertence ao usuário
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Usar arrow function para manter o contexto do 'this'
      const processUpload = (err) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).json({ error: 'File upload failed' });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const results = [];
        const columns = new Set();

        console.log(`📁 Processando arquivo: ${req.file.originalname}`);

        // Processar CSV - usar arrow functions para manter contexto
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('headers', (headers) => {
            console.log(`📊 Colunas detectadas: ${headers.length}`);
            headers.forEach(header => columns.add(header));
          })
          .on('data', (data) => {
            results.push(data);
          })
          .on('end', async () => {
            try {
              console.log(`✅ CSV processado: ${results.length} linhas`);

              // Usar bind ou arrow function para manter contexto
              const columnTypes = this.basicColumnAnalysis(results);
              const fieldConfig = this.basicFieldConfig(columns);
              const dataQuality = this.basicDataQuality(results);

              console.log(`🔍 Análise concluída: ${Object.keys(columnTypes).length} colunas`);

              // Salvar informações do dataset no banco
              const { data: dataset, error } = await supabase
                .from('datasets')
                .insert([{
                  project_id: projectId,
                  name: req.body.name || req.file.originalname,
                  file_name: req.file.originalname,
                  file_path: filePath,
                  file_size: req.file.size,
                  row_count: results.length,
                  columns: Array.from(columns),
                  column_types: columnTypes,
                  field_config: fieldConfig,
                  data_quality: dataQuality,
                  sample_data: results.slice(0, 5)
                }])
                .select()
                .single();

              if (error) {
                console.error('❌ Database error:', error);
                throw error;
              }

              // Limpar arquivo temporário
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }

              console.log(`🎉 Dataset salvo com ID: ${dataset.id}`);

              res.status(201).json({
                message: 'Dataset uploaded successfully',
                dataset,
                analysis: {
                  columnTypes,
                  fieldConfig,
                  dataQuality
                }
              });

            } catch (error) {
              console.error('❌ Dataset processing error:', error);
              // Limpar arquivo em caso de erro
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
              res.status(500).json({ 
                error: 'Error processing dataset',
                details: error.message 
              });
            }
          })
          .on('error', (error) => {
            console.error('❌ CSV processing error:', error);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.status(500).json({ error: 'Error processing CSV file' });
          });
      };

      // Executar upload
      upload.single('file')(req, res, processUpload);

    } catch (error) {
      console.error('❌ Upload dataset error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // MÉTODOS DE ANÁLISE - AGORA COM BINDING CORRETO

  basicColumnAnalysis(data) {
    console.log('🔍 Iniciando análise de colunas...');
    if (!data || data.length === 0) {
      console.log('⚠️  Dados vazios para análise');
      return {};
    }
    
    const firstRow = data[0];
    const columnTypes = {};
    
    for (const [key, value] of Object.entries(firstRow)) {
      columnTypes[key] = this.inferBasicType(value, key);
    }
    
    console.log(`✅ Análise de colunas concluída: ${Object.keys(columnTypes).length} colunas`);
    return columnTypes;
  }

  inferBasicType(value, columnName) {
    if (value === null || value === undefined || value === '') {
      return 'unknown';
    }
    
    const lowerName = columnName.toLowerCase();
    
    // Análise baseada no nome da coluna
    if (lowerName.includes('date') || lowerName.includes('time')) {
      return 'datetime';
    }
    if (lowerName.includes('id')) {
      return 'id';
    }
    if (lowerName.includes('budget') || lowerName.includes('cost') || lowerName.includes('price') || 
        lowerName.includes('bid') || lowerName.includes('margin') || lowerName.includes('revenue')) {
      return 'currency';
    }
    if (lowerName.includes('impression') || lowerName.includes('click') || lowerName.includes('conversion') || 
        lowerName.includes('reach') || lowerName.includes('view')) {
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
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && isFinite(numValue)) {
      return 'numeric';
    }
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      return 'boolean';
    }
    
    // Tentar parse como data
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime())) {
      return 'datetime';
    }
    
    return 'text';
  }

  basicFieldConfig(columns) {
    console.log('🔧 Gerando configuração de campos...');
    const config = {};
    const columnArray = Array.from(columns);
    
    for (const column of columnArray) {
      config[column] = {
        type: 'text',
        role: this.determineRole(column),
        required: false,
        description: `Column: ${column}`
      };
    }
    
    console.log(`✅ Configuração gerada para ${columnArray.length} campos`);
    return config;
  }

  determineRole(columnName) {
    const lowerName = columnName.toLowerCase();
    
    if (lowerName.includes('id')) return 'identifier';
    if (lowerName.includes('date') || lowerName.includes('time')) return 'timestamp';
    if (lowerName.includes('budget') || lowerName.includes('cost') || lowerName.includes('price')) return 'monetary';
    if (lowerName.includes('target') || lowerName.includes('objective')) return 'target';
    if (lowerName.includes('impression') || lowerName.includes('click') || lowerName.includes('conversion')) return 'kpi';
    
    return 'feature';
  }

  basicDataQuality(data) {
    console.log('📈 Analisando qualidade dos dados...');
    if (!data || data.length === 0) {
      console.log('⚠️  Dados vazios para análise de qualidade');
      return {
        totalRows: 0,
        status: 'empty',
        note: 'No data available'
      };
    }

    const quality = {
      totalRows: data.length,
      completeness: {},
      uniqueness: {},
      status: 'analyzed'
    };

    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    for (const column of columns) {
      const values = data.map(row => row[column]);
      const nonEmptyValues = values.filter(val => 
        val !== null && val !== undefined && val !== '' && val !== 'NULL' && val !== 'null'
      );
      
      quality.completeness[column] = {
        percentage: values.length > 0 ? (nonEmptyValues.length / values.length) * 100 : 0,
        emptyCount: values.length - nonEmptyValues.length,
        totalCount: values.length
      };
      
      quality.uniqueness[column] = {
        uniqueCount: new Set(nonEmptyValues).size,
        percentage: nonEmptyValues.length > 0 ? (new Set(nonEmptyValues).size / nonEmptyValues.length) * 100 : 0
      };
    }

    console.log(`✅ Análise de qualidade concluída para ${columns.length} colunas`);
    return quality;
  }

  async getProjectDatasets(req, res) {
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

      const { data: datasets, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ datasets });
    } catch (error) {
      console.error('Get datasets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteDataset(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const { data: dataset } = await supabase
        .from('datasets')
        .select('project_id, file_path')
        .eq('id', id)
        .single();

      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', dataset.project_id)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (dataset.file_path && fs.existsSync(dataset.file_path)) {
        fs.unlinkSync(dataset.file_path);
      }

      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Dataset deleted successfully' });
    } catch (error) {
      console.error('Delete dataset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async testUpload(req, res) {
    try {
      res.json({
        message: 'Upload endpoint is working',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test upload error:', error);
      res.status(500).json({ error: 'Test failed' });
    }
  }
}

module.exports = new DatasetController();