const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return void resolve();

    if (!profileData.publish || isEmpty(profileData.publish)) {
      return void resolve();
    }

    const publish = profileData.publish;

    if (publish.publish_dev || publish.publish_qa || publish.publish_prod) {
      record({
        account,
        profile,
        dev: publish.publish_dev,
        qa: publish.publish_qa,
        prod: publish.publish_prod,
      });
    }


    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "publish_locations",
    checkProfile : profileChecker,
    dbDataTypes : {
      dev : DATABASE_TYPES.TEXT,
      qa : DATABASE_TYPES.TEXT,
      prod : DATABASE_TYPES.TEXT
    }
  }
);


