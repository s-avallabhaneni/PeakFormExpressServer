const pool = require('../db');

exports.getWorkoutData = async (req, res) => {
    const userId = req.params.userId;
    
    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
      const result = await pool.query(`
        SELECT
        t.id AS template_id,
        t.name AS template_name,
        t.user_id,
        t.created_at AS template_created_at,
        COALESCE(json_agg(
            json_build_object(
            'id', e.id,
            'name', e.name,
            'template_id', e.template_id,
            'created_at', e.created_at,
            'sets', (
                SELECT COALESCE(json_agg(
                json_build_object(
                    'id', s.id,
                    'reps', s.reps,
                    'weight', s.weight,
                    'exercise_id', s.exercise_id,
                    'created_at', s.created_at
                )
                ), '[]'::json)
                FROM sets s
                WHERE s.exercise_id = e.id
            )
            )
        ) FILTER (WHERE e.id IS NOT NULL), '[]'::json) AS exercises
        FROM templates t
        LEFT JOIN exercises e ON e.template_id = t.id
        WHERE t.user_id = $1
        GROUP BY t.id
        ORDER BY t.created_at DESC;
    
      `, [userId]);
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error in getWorkoutTree:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  