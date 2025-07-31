const normalizeStatus = (input) => {
  if (!input || typeof input !== 'string') return undefined;

  const key = input.toLowerCase().trim();

  const statusMap = {
    'pending': 'pending',
    'in-progress': 'in-progress',
    'in progress': 'in-progress',
    'progress': 'in-progress',
    'done': 'done',
    'completed': 'done',
    'complete': 'done',
    'finished': 'done',
  };

  return statusMap[key];
};

const normalizeRole = (input, options = { preserveOriginal: false }) => {
  if (!input || typeof input !== 'string') return undefined;

  const key = input.toLowerCase().trim();

  const roleMap = {
    'admin': 'admin',
    'administrator': 'admin',
    'user': 'user',
    'client': 'user',
  };

  const normalized = roleMap[key];

  if (options.preserveOriginal && ['admin', 'administrator'].includes(key)) {
    return key; // e.g., preserve 'administrator'
  }

  return normalized;
};

module.exports = {
  normalizeStatus,
  normalizeRole,
};
