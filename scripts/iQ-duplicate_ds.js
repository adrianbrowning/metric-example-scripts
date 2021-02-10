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

    const define = profileData.define;

    const hash = {};
    for (let dsId in define) {
      if (!define.hasOwnProperty(dsId)) {continue;}
      let ds = define[dsId] || {},
          key = ds.type + ds.name;
      if (ds.type === "va") {continue;}
      hash[key] =  (hash[key] || 0);
      hash[key]++;
      if (hash[key] > 1) {
        record({
          account,
          profile,
          key
        });
        break;
      }
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `duplicate_ds`,
    checkProfile : profileChecker,
    dbDataTypes : {
      key: DATABASE_TYPES.TEXT
    }
  }
);


