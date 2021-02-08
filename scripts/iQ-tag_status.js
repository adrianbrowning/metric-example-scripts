const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return void resolve();

    let tags = profileData.manage;
    if (isEmpty(tags)) return void resolve();

    for (let tagId in tags) {
      let tag = tags[tagId];
      record({
        account,
        profile,
        uid: tagId,
        title: tag.title,
        status: tag.status
      });
    }
    

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "account_profile_tag_status",
    checkProfile : profileChecker,
    dbDataTypes : {
      uid : DATABASE_TYPES.INTEGER,
      title : DATABASE_TYPES.TEXT,
      status : DATABASE_TYPES.TEXT
    }
  }
);


