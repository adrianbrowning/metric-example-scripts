const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");
const _ = require("underscore");

const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.customizations)) return resolve();

    const oldJS = _.where(profileData.customizations, {id: "100011"});

    if (oldJS.length === 0) {return void resolve();}

    record({
      account,
      profile,
      count: oldJS.length,
      active: oldJS.filter(ext => ext.status === "active").length,
      noAdvExec: oldJS.filter(ext => !ext.advExecOption).length
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `old_js`,
    checkProfile : profileChecker,
    dbDataTypes : {
      count: DATABASE_TYPES.INTEGER,
      active: DATABASE_TYPES.INTEGER,
      noAdvExec: DATABASE_TYPES.TEXT
    }
  }
);


