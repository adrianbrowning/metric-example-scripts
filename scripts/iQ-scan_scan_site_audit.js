const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {formattedDate}
      } = require("magic-metrics-tool");
const _ = require("underscore");

const profileChecker = async function checkProfile(
  { iQ, record, account, profile, resolve, reject }){
  try {
    /** @type []*/
    const sm = await iQ.getSiteMapAudit(account,profile).catch(e=>[]);
    for (const audit of sm){
      /** @type []*/
      const reports = await iQ.getSiteMapAuditReport(account,profile, audit._id).catch(e=>[]);
      reports.forEach(function(report){
        record({
          account,
          profile,
          type : "site_map_report",
          created : new Date(report.created).toISOString(),
          updated : new Date(report.updated).toISOString()
        });
      })
    }

    /** @type []*/
    const ss =  await iQ.getScanCompanionReport(account,profile).catch(e=>[]);
    ss.forEach(function(report){
      record({
        account,
        profile,
        type: "scan_companion",
        created: new Date(report.created).toISOString(),
        updated: new Date(report.updated).toISOString()
      });
    });

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `sitescan_sitemap_${formattedDate}`,
    checkProfile : profileChecker,
    dbDataTypes : {
      type: DATABASE_TYPES.TEXT,
      created: DATABASE_TYPES.TEXT,
      updated: DATABASE_TYPES.TEXT
    },
  getProfileData: false
  }
);


