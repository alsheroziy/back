const Users = require("../models/auth");
const Tarif = require("../models/Tarif");
const cron = require("node-cron");

const usersCrone = async () => {
  await cron.schedule("* */24 * * *", async () => {
    let users = await Users.find({ status: "vip" });

    users.forEach(async (item) => {
      let tarif = await Tarif.find({ user: item._id })
        .sort({ createdAt: -1 })
        .limit(1);

      if (new Date(tarif[0].endDate) < new Date(Date.now())) {
        await Users.updateOne({ _id: item._id }, { $set: { status: "user" } });
      }
    });
  });
};

module.exports = usersCrone;
