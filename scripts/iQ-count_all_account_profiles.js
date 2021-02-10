const {
        reportHandler,
        constants : { DATABASE_TYPES },
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  {
    iQ,
    record,
    account,
    resolve,
    reject
  }){
  try {
    const [{ value:getProfiles}, { value:allProfiles }] = await Promise.allSettled([iQ.getProfiles(account), iQ.getAllProfileDetails(account)]);
    record({
      account,
      getProfilesCount: getProfiles.profiles.length,
      allProfilesCount: allProfiles.profiles.length
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `account_profile_count`,
    checkProfile : profileChecker,
    getProfiles : false,
    dbDataTypes : {
      getProfilesCount: DATABASE_TYPES.INTEGER,
      allProfilesCount: DATABASE_TYPES.INTEGER
    },
  dropDB: true,
  accountList: ["eng-ab"]
  }
);


