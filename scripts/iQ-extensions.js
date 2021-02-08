const {
        reportHandler,
        constants:{DATABASE_TYPES},
        utils: {isEmpty, date}
      } = require("magic-metrics-tool");

const active = "active";


const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.customizations)) return resolve();

    const extensions = {};

    for (let extId in profileData.customizations){
      const ext = profileData.customizations[extId];
      extensions[ext.id] = extensions[ext.id] || {
        active : 0,
        inactive : 0
      };

      if (ext.status === active) {
        extensions[ext.id].active++;
      } else {
        extensions[ext.id].inactive++;
      }
    }

    for (let extId in extensions){
      const ext = extensions[extId];
      record({
        account,
        profile,
        id : Number(extId),
        status : active,
        active : ext.active,
        inactive : ext.inactive
      });
    }
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};

reportHandler({
    logName : "extension_count_"+date,
    useLocal: true,
    checkProfile : profileChecker,
    dbDataTypes : {
      id : DATABASE_TYPES.INTEGER,
      status : DATABASE_TYPES.TEXT,
      active : DATABASE_TYPES.INTEGER,
      inactive : DATABASE_TYPES.INTEGER
    },
    dropDB : true
  }
);


