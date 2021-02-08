const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {
    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.define)) return resolve();

    _.forEach(profileData.define, (obj, id) => {
      if (obj.name) return;
      record({
        account,
        profile,
        uid: +id,
      });
    });

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `broken_ds`,
    checkProfile : profileChecker,
    dbDataTypes : {
      uid: DATABASE_TYPES.INTEGER
    }
  }
);


