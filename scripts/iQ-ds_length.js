const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.define)) return resolve();

    const DSs = Object.values(profileData.define);

    let maxTitle = 0,
        maxName = 0, avgTitle = [], avgName = [];

    for (let i = 0; i < DSs.length; i++){
      const ds = DSs[i];
      let titleLen = (ds.title||"").length;
      let nameLen = (ds.name||"").length;
      maxName = Math.max(maxName, nameLen);
      maxTitle = Math.max(maxName, titleLen);
      avgName.push(nameLen);
      avgTitle.push(titleLen);
    }
    
    record({
      account,
      profile,
      count: DSs.length,
      maxTitle,
      maxName,
      avgTitle : (avgTitle.reduce((acc, len) => acc + len, 0) / DSs.length) | 0,
      avgName : (avgName.reduce((acc, len) => acc + len, 0) / DSs.length) | 0,
    });
    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "ds_length",
    checkProfile : profileChecker,
    dbDataTypes : {
      maxTitle : DATABASE_TYPES.INTEGER,
      avgTitle : DATABASE_TYPES.INTEGER,
      maxName : DATABASE_TYPES.INTEGER,
      avgName : DATABASE_TYPES.INTEGER,
      count : DATABASE_TYPES.INTEGER
    }
  }
);


