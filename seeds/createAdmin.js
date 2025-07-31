// scripts/createAdmin.js
require("dotenv").config();
const connectDB = require("../config/database");
const { setSequelizeInstance } = require("../config/sequelizeInstance");

(async () => {
  try {
    const sequelize = await connectDB();
    setSequelizeInstance(sequelize);

    const  User  = require("../users/User");
    await sequelize.sync();

    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
      process.exit(1);
    }

    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log("⚠️ Admin already exists");
    } else {
      await User.create({
        name: "Global Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
        birthDate: "1990-01-01",
      });
      console.log(`✅ Admin account created: ${ADMIN_EMAIL}`);
    }

    await sequelize.close();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  }
})();
