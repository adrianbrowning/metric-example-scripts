const {
        reportHandler,
        constants:{DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");
const HttpProxyAgent = require('http-proxy-agent');

const profileChecker = async function checkProfile(
  {
    record,
    account,
    profile,
    profileData,
    resolve,
    reject
  }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.settings)) return resolve();
    if (isEmpty(profileData.settings.env_alias)) return resolve();
    if (isEmpty(profileData.settings.env_alias.alias_info)) return resolve();

    const envs_info = profileData.settings.env_alias.alias_info;

    delete envs_info.dev;
    delete envs_info.qa;
    delete envs_info.prod;

    for (const env in envs_info){
      record({
        account,
        profile,
        alias_name : envs_info[env].alias_name,
        display_name : envs_info[env].display_name,
      });
    }
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};

reportHandler({
    logName : `customEnvs_proxyTest`,
    checkProfile : profileChecker,
    dbDataTypes : {
      alias_name : DATABASE_TYPES.TEXT,
      display_name : DATABASE_TYPES.TEXT,
    }
  }
);


