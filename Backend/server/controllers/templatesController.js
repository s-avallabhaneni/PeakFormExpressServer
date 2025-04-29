const pool = require('../db');

exports.createTemplate = async (req, res) => {
    const { userId } = req.params;
    const { name } = req.body;

    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }


    try {
        const result = await pool.query(
            'INSERT INTO templates (user_id, name) VALUES ($1, $2) RETURNING *',
            [userId, name]
        );

        await exports.archiveTemplateById(result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTemplatesByUser = async (req, res) => {
    const { userId } = req.params;

    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTemplateById = async (req, res) => {
    const { templateId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM templates WHERE id = $1', [templateId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Template not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTemplate = async (req, res) => {
    const { templateId } = req.params;
    const { name } = req.body;
    try {
        await exports.archiveTemplateById(templateId);

        const result = await pool.query(
            'UPDATE templates SET name = $1 WHERE id = $2 RETURNING *',
            [name, templateId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Template not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    const { templateId } = req.params;
    try {
        await exports.archiveTemplateById(templateId);
        const result = await pool.query('DELETE FROM templates WHERE id = $1 RETURNING *', [templateId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Template not found' });
        res.json({ message: 'Template deleted', template: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.archiveTemplate = async (req, res) => {
    const { templateId } = req.params;

    try {
        // 1. Fetch the original template
        const templateResult = await pool.query('SELECT * FROM templates WHERE id = $1', [templateId]);
        if (templateResult.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const template = templateResult.rows[0];

        // 2. Insert into template_history
        const historyResult = await pool.query(
            `INSERT INTO template_history (user_id, original_template_id, name, created_at)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [template.user_id, template.id, template.name, template.created_at]
        );

        const historyTemplate = historyResult.rows[0];

        // 3. Fetch all exercises for this template
        const exercisesResult = await pool.query(
            'SELECT * FROM exercises WHERE template_id = $1',
            [template.id]
        );

        for (const exercise of exercisesResult.rows) {
            // 4. Insert each exercise into exercise_history
            const exerciseHistoryResult = await pool.query(
                `INSERT INTO exercise_history (history_template_id, name)
                 VALUES ($1, $2)
                 RETURNING *`,
                [historyTemplate.id, exercise.name]
            );

            const historyExercise = exerciseHistoryResult.rows[0];

            // 5. Fetch sets for this exercise
            const setsResult = await pool.query(
                'SELECT * FROM sets WHERE exercise_id = $1',
                [exercise.id]
            );

            // 6. Insert sets into set_history
            for (const set of setsResult.rows) {
                await pool.query(
                    `INSERT INTO set_history (exercise_history_id, reps, weight)
                     VALUES ($1, $2, $3)`,
                    [historyExercise.id, set.reps, set.weight]
                );
            }
        }

        res.status(201).json({
            message: 'Template archived successfully',
            archived_template: historyTemplate
        });

    } catch (err) {
        console.error('Error archiving template:', err.message);
        res.status(500).json({ error: err.message });
    }
};


exports.archiveTemplateById = async (templateId) => {
    // Same as existing archiveTemplate logic, but no `res` object
    const templateResult = await pool.query('SELECT * FROM templates WHERE id = $1', [templateId]);
    if (templateResult.rows.length === 0) throw new Error('Template not found');
    const template = templateResult.rows[0];

    const historyResult = await pool.query(
        `INSERT INTO template_history (user_id, original_template_id, name, created_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [template.user_id, template.id, template.name, template.created_at]
    );
    const historyTemplate = historyResult.rows[0];

    const exercisesResult = await pool.query(
        'SELECT * FROM exercises WHERE template_id = $1',
        [template.id]
    );

    for (const exercise of exercisesResult.rows) {
        const exerciseHistoryResult = await pool.query(
            `INSERT INTO exercise_history (history_template_id, name)
             VALUES ($1, $2)
             RETURNING *`,
            [historyTemplate.id, exercise.name]
        );
        const historyExercise = exerciseHistoryResult.rows[0];

        const setsResult = await pool.query(
            'SELECT * FROM sets WHERE exercise_id = $1',
            [exercise.id]
        );

        for (const set of setsResult.rows) {
            await pool.query(
                `INSERT INTO set_history (exercise_history_id, reps, weight)
                 VALUES ($1, $2, $3)`,
                [historyExercise.id, set.reps, set.weight]
            );
        }
    }
};