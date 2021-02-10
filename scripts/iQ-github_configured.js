const {
        reportHandler,
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { iQ, record, account, profile, resolve, reject }){
  try {

    const accountData = await iQ.getAccount(account);
    if(accountData && accountData.github_configuration && accountData.github_configuration.github_user) {
      record({
        account,
        profile
      });
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "github_configured",
    checkProfile : profileChecker,
    dbDataTypes : {},
  getProfiles: false,
  getProfileData: false
  }
);


