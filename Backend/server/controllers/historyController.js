const pool = require('../db');

// ✅ Get all archived templates for a user
exports.getTemplateHistoryForUser = async (req, res) => {
    const { userId } = req.params;

    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM template_history 
             WHERE user_id = $1 
             ORDER BY archived_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get full details of an archived template (including exercises & sets)
exports.getArchivedTemplateDetails = async (req, res) => {
    const { historyId } = req.params;

    try {
        // 1. Get the archived template
        const templateRes = await pool.query(
            'SELECT * FROM template_history WHERE id = $1',
            [historyId]
        );
        if (templateRes.rows.length === 0) {
            return res.status(404).json({ message: 'Archived template not found' });
        }
        const template = templateRes.rows[0];

        // 2. Get exercises
        const exercisesRes = await pool.query(
            'SELECT * FROM exercise_history WHERE history_template_id = $1',
            [historyId]
        );
        const exercises = exercisesRes.rows;

        // 3. For each exercise, get sets
        for (let i = 0; i < exercises.length; i++) {
            const setsRes = await pool.query(
                'SELECT * FROM set_history WHERE exercise_history_id = $1',
                [exercises[i].id]
            );
            exercises[i].sets = setsRes.rows;
        }

        // 4. Return full archived template structure
        res.json({
            template,
            exercises
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
