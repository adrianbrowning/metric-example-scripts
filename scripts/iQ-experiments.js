const {
        reportHandler,
        constants: {DATABASE_TYPES}
      } = require("magic-metrics-tool");
const _ = require("underscore");


reportHandler({
    dbDataTypes: {
      experiment : DATABASE_TYPES.TEXT,
      enabled : DATABASE_TYPES.TEXT
    },
    logName: "experiments",
    checkProfile : profileChecker
}
);

async function profileChecker(
  {record, account, profile, profileData, resolve, reject }){
  try {
    if (_.isEmpty(profileData)) return void resolve();
    if (_.isEmpty(profileData.experiments)) return void resolve();

     _.forEach(profileData.experiments, function(experiment){
       record({
         account,
         profile,
         experiment: experiment.id,
         enabled : String(experiment.enabled),
       });
    });

    resolve();

  }
  catch (e) {
    return reject(e);
  }
}



