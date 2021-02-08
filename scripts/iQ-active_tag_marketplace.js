const {
        reportHandler,
        constants:{DATABASE_TYPES},
      } = require("magic-metrics-tool");


const profileChecker = async function checkProfile(
  { iQ, record, account, profile, resolve, reject }){
  try {
 if (profile !== "main") return void resolve();
    const [error, response] = await iQ.getMarketPlacePolicy(account)
                                    .then(r => [null, r])
                                    .catch(e => [e, null]);

    record({
      account,
      profile,
      returned : String(!!error),
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "accounts-tag_marketplace",
    getProfile: false,
    checkProfile : profileChecker,
    allAccounts: true,
    dbDataTypes : {
      returned : DATABASE_TYPES.TEXT,
    }
  }
);


