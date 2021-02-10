const {
        reportHandler,
        utils: { isEmpty }
      } = require("magic-metrics-tool");

reportHandler({
  logName : "cm_collect_report",
  checkProfile : profileChecker,
  dbDataTypes : {}
});


async function profileChecker(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData.privacy_management))  return void resolve();
    if (isEmpty(profileData.privacy_management.preferences))  return void resolve();
    if (isEmpty(profileData.privacy_management.preferences.categories))  return void resolve();

    for (let cat in profileData.privacy_management.preferences.categories) {
      let catObj = profileData.privacy_management.preferences.categories[cat];
      if(isEmpty(catObj.tagid)) continue;
      if (_.where(catObj.tagid, {tag_id: "20064"}).length > 0){
        record({
          account,
          profile
        });
        return void resolve();
      }
    }

    resolve();
  }
  catch (e) {
    return reject(e);
  }
}
