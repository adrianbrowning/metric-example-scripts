const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { tealApi, record, error, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.loadrules)) return resolve();

    const loadRules = profileData.loadrules;

    for (let uid in loadRules){
      const lr = loadRules[uid];
      const ors = Object.entries(lr).filter(l => /\d+/.test(l[0])).map(l => l[1]);
      const ands = ors.reduce((acc, lr) => acc + Object.keys(lr).filter(cond => /filter_/.test(cond)).length, 0);
      recordItem(uid, ors.length, ands, lr.status);
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }
  function recordItem(uid = "N/A", ors = 0, ands = 0, status = "-"){
    record({
      account,
      profile,
      uid,
      ors,
      ands,
      status
    });
  }
};
reportHandler({
    logName : `load_rules`,
    checkProfile : profileChecker,
    dbDataTypes : {
      uid: DATABASE_TYPES.TEXT,
      ors: DATABASE_TYPES.INTEGER,
      ands: DATABASE_TYPES.INTEGER,
      status: DATABASE_TYPES.TEXT
    }
  }
);


