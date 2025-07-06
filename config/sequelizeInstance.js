let sequelize = null;

function setSequelizeInstance(instance) {
  sequelize = instance;
}

function getSequelizeInstance() {
  if (!sequelize) {
    throw new Error('Sequelize instance not set yet.');
  }
  return sequelize;
}

module.exports = {
  setSequelizeInstance,
  getSequelizeInstance,
};
