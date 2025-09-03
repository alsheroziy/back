// const { $where } = require("../models/balance");
const Seriya = require("../models/seriya");
var cron = require("node-cron");

const CronSeriya = async () => {
  cron.schedule("* * * * *", async () => {
    const currentDate = new Date();
    let data = await Seriya.updateMany(
      {
        status: "pending",
        premery: { $lte: currentDate },
      },
      { $set: { status: "active" } }
    );
  });
};
// console.log
// CronSeriya();
module.exports = CronSeriya;
// UPDATE series SET status='active'  where series.premery <= current_date
