const {
        reportHandler,
        constants : { DATABASE_TYPES }
      } = require("magic-metrics-tool");
const _ = require("underscore");

const profileChecker = async function checkProfile(
  {
    record,
    account,
    profile,
    profileData,
    resolve,
    reject
  }){
  try {

    const latestVersion = Object.keys(profileData.publish_history).sort().reverse()[0];
    const latestRevision = Object.keys(profileData.publish_history[latestVersion]).filter(key => /\d{12}/.test(key)).sort().reverse()[0];

    record({
      account,
      profile,
      tagsCount : Object.keys(profileData.manage || {}).length,
      tagsActive : _.where(profileData.manage || {}, { status : "active" }).length,
      extensionsCount : Object.keys(profileData.customizations || {}).length,
      extensionsActive : _.where(profileData.customizations || {}, { status : "active" }).length,
      lastPublish : latestRevision,
      lastPublishNotes : profileData.publish_history[latestVersion][latestRevision].notes
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
  logName : "active_accounts",
  checkProfile : profileChecker,
  dbDataTypes : {
    tagsCount : DATABASE_TYPES.INTEGER,
    tagsActive : DATABASE_TYPES.INTEGER,
    extensionsCount : DATABASE_TYPES.INTEGER,
    extensionsActive : DATABASE_TYPES.INTEGER,
    lastPublish : DATABASE_TYPES.TEXT,
    lastPublishNotes : DATABASE_TYPES.TEXT
  }
}
);


