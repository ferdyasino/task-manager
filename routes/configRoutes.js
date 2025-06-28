const express = require('express');
const os = require('os');
const router = express.Router();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      return iface.address;
    }
  }
  return '127.0.0.1'; // fallback
}

router.get('/config', (req, res) => {
  res.json({
    host: getLocalIP(),
    port: process.env.PORT || '4000'
  });
});

module.exports = router;
