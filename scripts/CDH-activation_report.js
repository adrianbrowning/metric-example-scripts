const {
        reportHandler,
        constants: {DATABASE_TYPES},
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { CDH, record, account, profile, resolve, reject }){
  try {
    const profileData = await CDH.getProfile(account, profile);

    const { accountEnabled, audienceDBEnabled, audienceStoreEnabled, eventDBEnabled, eventStoreEnabled, eventStreamEnabled, region } = profileData.settings;

    record({account, profile, accountEnabled:String(accountEnabled), audienceDBEnabled:String(audienceDBEnabled), audienceStoreEnabled:String(audienceStoreEnabled), eventDBEnabled: String(eventDBEnabled), eventStoreEnabled:String(eventStoreEnabled), eventStreamEnabled: String(eventStreamEnabled), region});
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "cdh_activation_report",
    checkProfile : profileChecker,
    dbDataTypes : {
      accountEnabled:DATABASE_TYPES.TEXT,
      audienceDBEnabled: DATABASE_TYPES.TEXT,
      audienceStoreEnabled: DATABASE_TYPES.TEXT,
      eventDBEnabled:DATABASE_TYPES.TEXT,
      eventStoreEnabled:DATABASE_TYPES.TEXT,
      eventStreamEnabled:DATABASE_TYPES.TEXT,
      region: DATABASE_TYPES.TEXT},
    accountList : [""],
    getProfileData : false
  }
);


