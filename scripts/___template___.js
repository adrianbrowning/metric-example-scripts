const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty, formattedDateTime}
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { iQ, record, error, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();

    record({
      account,
      profile
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `<>`,
    checkProfile : profileChecker,
    dbDataTypes : {}
  }
);


