const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty, formattedDate}
      } = require("magic-metrics-tool");

const jqueryExtensions = {100027:1, 100029:1, 100032:1 };
const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.customizations)) return resolve();

    const customizations = profileData.customizations;

    for (let customizationsId in customizations){
      const obj = customizations[customizationsId]
      if (!jqueryExtensions[obj.id]) continue;

      record({
        account,
        profile,
        uid : +customizationsId,
        event: obj.event,
        hasCondition: String(Object.keys(obj).filter(k=>/.*?_filter$/.test(k)).length !==0)
      });
    }


    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "jquery_"+formattedDate,
    checkProfile : profileChecker,
    dbDataTypes : {
      uid: DATABASE_TYPES.INTEGER,
      event: DATABASE_TYPES.TEXT,
      hasCondition: DATABASE_TYPES.TEXT
    }
  }
);


