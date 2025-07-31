require("dotenv").config();
const { Sequelize } = require("sequelize");
const { setSequelizeInstance } = require("../config/sequelizeInstance");

async function connectDB() {
  let sequelize;

  try {
    console.log("Trying remote DB...");
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false,
        connectTimeout: 5000,
      }
    );
    await sequelize.authenticate();
    console.log("Connected to remote DB");
  } catch (err) {
    console.error("Remote DB unreachable:", err.message);
    console.log("Trying local fallback DB...");

    sequelize = new Sequelize(
      process.env.LOCAL_DB_NAME,
      process.env.LOCAL_DB_USER,
      process.env.LOCAL_DB_PASS,
      {
        host: process.env.LOCAL_DB_HOST,
        port: process.env.LOCAL_DB_PORT,
        dialect: process.env.LOCAL_DB_DIALECT || "mysql",
        logging: false,
      }
    );
    await sequelize.authenticate();
    console.log("Connected to local fallback DB");
  }

  return sequelize;
}

async function createAdmin() {
  const sequelize = await connectDB();
  setSequelizeInstance(sequelize);

  require("../users/User");
  await sequelize.sync();

  const { User } = require("../users/User");
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
    process.exit(1);
  }

  const existing = await User.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin already exists");
  } else {
    await User.create({
      name: "Global Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      birthDate: "1990-01-01",
    });
    console.log(`Admin account created: ${adminEmail}`);
  }

  await sequelize.close();
}

createAdmin().catch((err) => {
  console.error("Error creating admin:", err);
});
