const {
        reportHandler,
        constants : { DATABASE_TYPES },
        utils : { size }
      } = require("magic-metrics-tool");

function getActiveCount(obj){
  return Object.values(obj || {}).filter(data => data.status === "active").length || 0;
}

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

    record({
      account,
      profile,
      tags : size(profileData.manage),
      tags_active : getActiveCount(profileData.manage),
      loadRules : size(profileData.loadrules),
      loadRules_active : getActiveCount(profileData.loadrules),
      extensions : size(profileData.customizations),
      extensions_active : getActiveCount(profileData.customizations),
      dataSources : size(profileData.define)
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "account_profile_counts",
    checkProfile : profileChecker,
    dbDataTypes : {
      tags : DATABASE_TYPES.INTEGER,
      tags_active : DATABASE_TYPES.INTEGER,
      loadRules : DATABASE_TYPES.INTEGER,
      loadRules_active : DATABASE_TYPES.INTEGER,
      extensions : DATABASE_TYPES.INTEGER,
      extensions_active : DATABASE_TYPES.INTEGER,
      dataSources : DATABASE_TYPES.INTEGER
    }
  }
);


