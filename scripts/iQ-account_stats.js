const {
        reportHandler,
        constants : { DATABASE_TYPES },
        utils : {
          getFormattedDate
        }
      } = require("magic-metrics-tool");

const reportStart = new Date("2020-01-01");
const reportEnd = new Date("2021-03-31");

const profileChecker = async function checkProfile(
  {
    iQ,
    record,
    account,
    profile,
    resolve,
    reject
  }){
  try {
if (profile === "main") debugger;

    /**@type []*/
    const data = await iQ.getReportingData(account, profile, reportStart, reportEnd);
    let lastStart = new Date(reportStart);

    const monthly = populateMonthKeys(reportStart, reportEnd);

    if (data.length > 0) {
      data.forEach(_data => {
        const metricStart = new Date(_data.start);

        while (metricStart > lastStart){
          recordStats("day", getFormattedDate(lastStart, "-"), 0, 0, 0, 0, 0);
          lastStart.setDate(lastStart.getDate() + 1);
        }
        lastStart = new Date(metricStart);
        lastStart.setDate(lastStart.getDate() + 1);
        const day = getFormattedDate(metricStart, "-");
        const {
                VISIT,
                VENDOR,
                LOADER,
                SYNC,
                MOBILE
              } = _data.metrics;
        recordStats("day", day, VISIT || 0, VENDOR || 0, LOADER || 0, SYNC || 0, MOBILE || 0);

        const monthStr = day.split("-").slice(0, 2).join("-");
        const month = monthly[monthStr];

        month.visit = month.visit + (VISIT || 0);
        month.loader = month.loader + (LOADER || 0);
        month.vendor = month.vendor + (VENDOR || 0);
        month.sync = month.sync + (SYNC || 0);
        month.mobile = month.mobile + (MOBILE || 0);
      });

      for (const monthStr in monthly){
        const month = monthly[monthStr];
        recordStats("month", monthStr, month.visit, month.vendor, month.loader, month.sync, month.mobile);
      }
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }

  function recordStats(table, ts, visit, vendor, loader, sync, mobile){
    record(table, {
      account,
      profile,
      ts,
      visit,
      vendor,
      loader,
      sync,
      mobile
    });
  }
};

function populateMonthKeys(start, end){
  const keys = {};
  const currentDate = new Date(start);

  while (currentDate < end){
    const day = getFormattedDate(currentDate, "-");
    const monthStr = day.split("-").slice(0, 2).join("-");
    keys[monthStr] = {
      visit : 0,
      loader : 0,
      sync : 0,
      mobile : 0,
      vendor : 0
    };
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return keys;
}

reportHandler({
    logName : "iQ_account_stats",
    getProfileData : false,
    checkProfile : profileChecker,
    dbDataTypes : [
      {
        name : "day",
        definition : {
          ts : DATABASE_TYPES.TEXT,
          visit : DATABASE_TYPES.INTEGER,
          vendor : DATABASE_TYPES.INTEGER,
          loader : DATABASE_TYPES.INTEGER,
          sync : DATABASE_TYPES.INTEGER,
          mobile : DATABASE_TYPES.INTEGER
        },
      },
      {
        name : "month",
        definition : {
          ts : DATABASE_TYPES.TEXT,
          visit : DATABASE_TYPES.INTEGER,
          vendor : DATABASE_TYPES.INTEGER,
          loader : DATABASE_TYPES.INTEGER,
          sync : DATABASE_TYPES.INTEGER,
          mobile : DATABASE_TYPES.INTEGER
        },
      }
    ],
    accountList : ["eng-ab"]
  }
);


