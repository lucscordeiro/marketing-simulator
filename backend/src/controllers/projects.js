const supabase = require('../config/supabase');

class ProjectController {
  async createProject(req, res) {
    try {
      const { name, description, objective, budget } = req.body;
      const userId = req.userId;

      const { data: project, error } = await supabase
        .from('projects')
        .insert([{
          user_id: userId,
          name,
          description,
          objective,
          budget
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        message: 'Project created successfully',
        project
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProjects(req, res) {
    try {
      const userId = req.userId;

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ projects });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          datasets (*),
          ai_models (*),
          simulations (*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ project });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const updates = req.body;

      // Verificar se o projeto pertence ao usuário
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { data: project, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: 'Project updated successfully',
        project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // Verificar se o projeto pertence ao usuário
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ProjectController();