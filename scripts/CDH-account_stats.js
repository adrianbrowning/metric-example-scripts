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
    CDH,
    record,
    account,
    profile,
    resolve,
    reject
  }){
  try {

    /**@type []*/
    const data = await CDH.getReportingData(account, profile, reportStart, reportEnd);
    const monthly = populateMonthKeys(reportStart, reportEnd);
    const daily = populateDayKeys(reportStart, reportEnd);
    debugger;

    for (const col in data) {
      data[col].forEach(data => {
        const metricStart = new Date(data.start_time);
        const day = getFormattedDate(metricStart, "-");
        daily[day][col] = daily[day][col] + data.events;

        const monthStr = day.split("-").slice(0, 2).join("-");
        monthly[monthStr][col] = monthly[monthStr][col] + data.events;
      });
    }


      for (const dayStr in daily){
        const day = daily[dayStr];
        recordStats("day", dayStr, day);
      }
      for (const monthStr in monthly){
        const month = monthly[monthStr];
        recordStats("month", monthStr, month);
      }

    resolve();

  }
  catch (e) {
    return reject(e);
  }

  function recordStats(table, ts,
                       {all_inbound_events = 0,
                       audiencedb_visitors = 0,
                       audiencestore_visitors = 0,
                       audiencestream_filtered_events = 0,
                       cloud_connector_all = 0,
                       cloud_connector_audiences = 0,
                       cloud_connector_events = 0,
                       data_access_all = 0,
                       eventdb_events = 0,
                       eventstore_events = 0,
                       omnichannel_events = 0,
                       predict_enrichments = 0,
                       realtime_events = 0,
                       viewthrough_reads = 0,
                       viewthrough_writes = 0,
                       visitor_dle = 0} = {}){
    record(table, {
      account,
      profile,
      ts,
      all_inbound_events,
      audiencedb_visitors,
      audiencestore_visitors,
      audiencestream_filtered_events,
      cloud_connector_all,
      cloud_connector_audiences,
      cloud_connector_events,
      data_access_all,
      eventdb_events,
      eventstore_events,
      omnichannel_events,
      predict_enrichments,
      realtime_events,
      viewthrough_reads,
      viewthrough_writes,
      visitor_dle
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
      all_inbound_events: 0,
      audiencedb_visitors: 0,
      audiencestore_visitors: 0,
      audiencestream_filtered_events: 0,
      cloud_connector_all: 0,
      cloud_connector_audiences: 0,
      cloud_connector_events: 0,
      data_access_all: 0,
      eventdb_events: 0,
      eventstore_events: 0,
      omnichannel_events: 0,
      predict_enrichments: 0,
      realtime_events: 0,
      viewthrough_reads: 0,
      viewthrough_writes: 0,
      visitor_dle: 0
    };
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return keys;
}

function populateDayKeys(start, end){
  const keys = {};
  const currentDate = new Date(start);

  while (currentDate < end){
    const day = getFormattedDate(currentDate, "-");
    keys[day] = {
      all_inbound_events: 0,
      audiencedb_visitors: 0,
      audiencestore_visitors: 0,
      audiencestream_filtered_events: 0,
      cloud_connector_all: 0,
      cloud_connector_audiences: 0,
      cloud_connector_events: 0,
      data_access_all: 0,
      eventdb_events: 0,
      eventstore_events: 0,
      omnichannel_events: 0,
      predict_enrichments: 0,
      realtime_events: 0,
      viewthrough_reads: 0,
      viewthrough_writes: 0,
      visitor_dle: 0
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return keys;
}

reportHandler({
    logName : "as_account_stats",
    getProfileData : false,
    checkProfile : profileChecker,
    dbDataTypes : [
      {
        name : "day",
        definition : {
          ts : DATABASE_TYPES.TEXT,
          all_inbound_events : DATABASE_TYPES.INTEGER,
          audiencedb_visitors: DATABASE_TYPES.INTEGER,
          audiencestore_visitors: DATABASE_TYPES.INTEGER,
          audiencestream_filtered_events: DATABASE_TYPES.INTEGER,
          cloud_connector_all: DATABASE_TYPES.INTEGER,
          cloud_connector_audiences: DATABASE_TYPES.INTEGER,
          cloud_connector_events: DATABASE_TYPES.INTEGER,
          data_access_all: DATABASE_TYPES.INTEGER,
          eventdb_events: DATABASE_TYPES.INTEGER,
          eventstore_events: DATABASE_TYPES.INTEGER,
          omnichannel_events: DATABASE_TYPES.INTEGER,
          predict_enrichments: DATABASE_TYPES.INTEGER,
          realtime_events: DATABASE_TYPES.INTEGER,
          viewthrough_reads: DATABASE_TYPES.INTEGER,
          viewthrough_writes: DATABASE_TYPES.INTEGER,
          visitor_dle: DATABASE_TYPES.INTEGER
        },
      },
      {
        name : "month",
        definition : {
          ts : DATABASE_TYPES.TEXT,
          all_inbound_events : DATABASE_TYPES.INTEGER,
          audiencedb_visitors: DATABASE_TYPES.INTEGER,
          audiencestore_visitors: DATABASE_TYPES.INTEGER,
          audiencestream_filtered_events: DATABASE_TYPES.INTEGER,
          cloud_connector_all: DATABASE_TYPES.INTEGER,
          cloud_connector_audiences: DATABASE_TYPES.INTEGER,
          cloud_connector_events: DATABASE_TYPES.INTEGER,
          data_access_all: DATABASE_TYPES.INTEGER,
          eventdb_events: DATABASE_TYPES.INTEGER,
          eventstore_events: DATABASE_TYPES.INTEGER,
          omnichannel_events: DATABASE_TYPES.INTEGER,
          predict_enrichments: DATABASE_TYPES.INTEGER,
          realtime_events: DATABASE_TYPES.INTEGER,
          viewthrough_reads: DATABASE_TYPES.INTEGER,
          viewthrough_writes: DATABASE_TYPES.INTEGER,
          visitor_dle: DATABASE_TYPES.INTEGER
        },
      }
    ],
    accountList : ["eng-ab"]
  }
);


