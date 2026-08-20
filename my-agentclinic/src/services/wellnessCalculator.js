// Wellness Score Calculation Service
// Formula: (Therapy Diversity) × (Completion Rate) / 100
// Range: 0-100

async function calculateTherapyDiversity(dbAll, agentId) {
  // Get unique therapies completed by agent
  const completedTherapies = await dbAll(
    `SELECT DISTINCT t.id FROM therapies t
     INNER JOIN appointments a ON a.therapyId = t.id
     WHERE a.agentId = ? AND a.status = 'completed'`,
    [agentId]
  );

  // Get total available therapies
  const totalTherapies = await dbAll('SELECT id FROM therapies');

  if (totalTherapies.length === 0) {
    return 0;
  }

  const diversityPercentage = (completedTherapies.length / totalTherapies.length) * 100;
  return Math.min(diversityPercentage, 100); // Cap at 100
}

async function calculateCompletionRate(dbAll, agentId) {
  // Get appointments with terminal status (completed or cancelled)
  const stats = await dbAll(
    `SELECT
      COUNT(*) as totalAppointments,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedAppointments
     FROM appointments
     WHERE agentId = ?`,
    [agentId]
  );

  const row = stats[0];
  if (!row || row.totalAppointments === 0) {
    return 0;
  }

  const completionPercentage = (row.completedAppointments / row.totalAppointments) * 100;
  return Math.min(completionPercentage, 100); // Cap at 100
}

async function calculateWellnessScore(dbAll, agentId) {
  const diversity = await calculateTherapyDiversity(dbAll, agentId);
  const completion = await calculateCompletionRate(dbAll, agentId);

  // Formula: (Diversity × Completion) / 100
  const wellnessScore = (diversity * completion) / 100;
  return Math.round(wellnessScore); // Round to nearest integer
}

async function getTherapiesCompleted(dbAll, agentId) {
  const result = await dbAll(
    `SELECT COUNT(*) as count FROM appointments
     WHERE agentId = ? AND status = 'completed'`,
    [agentId]
  );

  return result[0]?.count || 0;
}

async function getAilmentResolutionRate(dbAll, agentId) {
  // Get all ailments agent has had appointments for
  const allAilments = await dbAll(
    `SELECT DISTINCT a.id FROM ailments a
     INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
     INNER JOIN appointments app ON app.therapyId = ta.therapyId
     WHERE app.agentId = ?`,
    [agentId]
  );

  if (allAilments.length === 0) {
    return 0;
  }

  // Get ailments that have been "resolved" (completed appointments exist)
  const resolvedAilments = await dbAll(
    `SELECT DISTINCT a.id FROM ailments a
     INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
     INNER JOIN appointments app ON app.therapyId = ta.therapyId
     WHERE app.agentId = ? AND app.status = 'completed'`,
    [agentId]
  );

  const resolutionRate = (resolvedAilments.length / allAilments.length) * 100;
  return Math.round(resolutionRate);
}

async function getActiveAilments(dbAll, agentId) {
  // Get ailments that have pending/confirmed appointments but no completed appointments
  const result = await dbAll(
    `SELECT DISTINCT a.id FROM ailments a
     INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
     INNER JOIN appointments app ON app.therapyId = ta.therapyId
     WHERE app.agentId = ? AND app.status IN ('pending', 'confirmed')
     AND a.id NOT IN (
       SELECT DISTINCT a2.id FROM ailments a2
       INNER JOIN therapy_ailments ta2 ON a2.id = ta2.ailmentId
       INNER JOIN appointments app2 ON app2.therapyId = ta2.therapyId
       WHERE app2.agentId = ? AND app2.status = 'completed'
     )`,
    [agentId, agentId]
  );

  return result.length;
}

async function getPerformanceMetrics(dbAll, agentId) {
  const therapiesCompleted = await getTherapiesCompleted(dbAll, agentId);
  const ailmentResolutionRate = await getAilmentResolutionRate(dbAll, agentId);
  const activeAilments = await getActiveAilments(dbAll, agentId);

  return {
    therapiesCompleted,
    ailmentResolutionRate,
    activeAilments
  };
}

export {
  calculateWellnessScore,
  calculateTherapyDiversity,
  calculateCompletionRate,
  getTherapiesCompleted,
  getAilmentResolutionRate,
  getActiveAilments,
  getPerformanceMetrics
};
