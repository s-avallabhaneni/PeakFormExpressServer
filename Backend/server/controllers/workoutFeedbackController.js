const pool = require('../db');

exports.createFeedback = async (req, res) => {
    const {userId} = req.params;
    const {formScore, stabilityScore, controlScore } = req.body;

    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO workout_feedback (user_id, form_score, stability_score, control_score) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, formScore, stabilityScore, controlScore]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFeedback = async (req, res) => {
    const { id } = req.params;

    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }
  
    try {
      const result = await pool.query(
        `DELETE FROM workout_feedback WHERE id = $1 RETURNING *`,
        [id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Feedback not found" });
      }
  
      res.status(200).json({ message: "Feedback deleted", feedback: result.rows[0] });
    } catch (err) {
      console.error("Error deleting feedback:", err.message);
      res.status(500).json({ error: "Server error while deleting feedback" });
    }
  };

  exports.getFeedbacksByUser = async (req, res) => {
    const { userId } = req.params;

    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM workout_feedback WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};