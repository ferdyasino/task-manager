const normalizeStatus = (input) => {
  if (!input || typeof input !== 'string') return undefined;

  const statusMap = {
    'pending': 'pending',
    'in-progress': 'in-progress',
    'in progress': 'in-progress',
    'progress': 'in-progress',
    'done': 'done',
    'completed': 'done',
    'complete': 'done'
  };

  const key = input.toLowerCase().trim();
  return statusMap[key];
};

const normalizeRole = (input) => {
  if (!input || typeof input !== 'string') return undefined;

  const roleMap = {
    'admin': 'administrator',
    'administrator': 'administrator',
    'user': 'user',
    'client': 'user'
  };

  const key = input.toLowerCase().trim();
  return roleMap[key];
};

module.exports = {
  normalizeStatus,
  normalizeRole,
};
