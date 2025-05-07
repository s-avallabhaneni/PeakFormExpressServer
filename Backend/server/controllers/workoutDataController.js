const pool = require('../db');

exports.getWorkoutData = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // 1. Get all templates for this user
      const templatesResult = await pool.query(
        'SELECT * FROM templates WHERE user_id = $1',
        [userId]
      );
      const templates = templatesResult.rows;
  
      // 2. For each template, get exercises and sets
      for (const template of templates) {
        const exercisesResult = await pool.query(
          'SELECT * FROM exercises WHERE template_id = $1',
          [template.id]
        );
        const exercises = exercisesResult.rows;
  
        for (const exercise of exercises) {
          const setsResult = await pool.query(
            'SELECT * FROM sets WHERE exercise_id = $1',
            [exercise.id]
          );
          exercise.sets = setsResult.rows;
        }
  
        template.exercises = exercises;
      }
  
      return res.json(templates);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error fetching workout tree.' });
    }
  };
  