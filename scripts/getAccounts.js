const {reportHandler, constants, utils:{size}} = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  {
    resolve,
    reject
  }){
  try {

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `accounts`,
    checkProfile : profileChecker,
    dbDataTypes : {},
    dropDB: true,
    getProfiles: false,
    getProfileData: true
  }
);


