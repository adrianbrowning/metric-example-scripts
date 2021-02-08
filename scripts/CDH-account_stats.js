const reportHandler = require("./base");
const _ = require("underscore");
const request = require("request");
const promisify = require("util").promisify;

process.on('uncaughtException', function(err){
  console.log(err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

const get = promisify((url, cb) => {
  request.get(url, (err, resp, body) => {
    if (resp.statusCode === 404) {
      return cb(err, null);
    }
    return cb(err, body);
  });
});

function getVersion(array){
  if (!array) return "N/A";
  for (let line of array){
    let match = line.match(/ut(\d.\d{1,4})/);
    if (match) {
      return match[1];
    }
  }
  return "N/A";
}

function getDate(d = new Date()){
  var mm = d.getMonth() + 1;
  return [d.getFullYear(), (mm < 10 ? "0" : "") + mm].join("-");
}

function _getASData(stats, profile, dataObj, params){

  dataObj = dataObj || [];
  for (var i = 0; i < dataObj.length; i++){

    var item = dataObj[i];
    var d = (new Date(item.start_time)), y = d.getFullYear(), m = d.getMonth() + 1, da = d.getDate(), d1;
    if (m < 10) {
      m = "0" + m;
    }

    d1 = y + "-" + m;

    // months[d1] = "";
    for (var j = 0; j < params.length; j++){
      var p = params[j];
      m = item.events;
      stats[d1] = stats[d1] || {};
      var _st = stats[d1];
      if (!_st[p]) {
        _st[p] = m;
      } else {
        _st[p] += m;
      }
    }
  }
  return stats;
}

const profileChecker = async function checkProfile(
  { collectProfilesBar, tealApi, record, account, profile, profileData, resolve, reject, accountType }){
  try {
    var [iq_error, iq_data] = await tealApi.iQUDHAPI
                                           .getReportingData({
                                             account,
                                             start : new Date("2019-01-01T00:00:00"),
                                             end : new Date("2019-12-31T23:59:59"),
                                             profile
                                           })
                                           .then(r => [null, r])
                                           .catch(e => [e, null]);

    var [as_error, as_data] = await tealApi.iQUDHAPI
                                           .getSSReportingData({
                                             account,
                                             start : new Date("2019-01-01T00:00:00").toISOString(),
                                             end : new Date("2019-12-31T23:59:59").toISOString(),
                                             profile
                                           })
                                           .then(r => [null, r])
                                           .catch(e => [e, null]);

    var stats = {
      "2019-01" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-02" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-03" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-04" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-05" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-06" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-07" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-08" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-09" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-10" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-11" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
      "2019-12" : {
        "all_inbound_events" : 0,
        "realtime_events" : 0,
        "cloud_connector_events" : 0,
        "VISIT" : 0
      },
    };

    //iQ
    if (!iq_error && iq_data) {
      for (var i = 0; i < iq_data.length; i++){
        const d1 = getDate(new Date(iq_data[i].start));

        let m = iq_data[i].metrics;
        for (var p in m){
          stats[d1] = stats[d1] || {};
          var _st = stats[d1];
          if (!_st[p]) {
            _st[p] = m[p];
          } else {
            _st[p] += m[p];
          }
        }
      }
    }

    if (!as_error && as_data) {
      _getASData(stats, profile, as_data.all_inbound_events, ["all_inbound_events"]);
      _getASData(stats, profile, as_data.audiencedb_visitors, ["audiencedb_visitors"]);
      _getASData(stats, profile, as_data.audiencestore_visitors, ["audiencestore_visitors"]);
      _getASData(stats, profile, as_data.audiencestream_filtered_events, ["audiencestream_filtered_events"]);
      _getASData(stats, profile, as_data.cloud_connector_all, ["cloud_connector_all"]);
      _getASData(stats, profile, as_data.cloud_connector_audiences, ["cloud_connector_audiences"]);
      _getASData(stats, profile, as_data.cloud_connector_events, ["cloud_connector_events"]);
      _getASData(stats, profile, as_data.data_access_all, ["data_access_all"]);
      _getASData(stats, profile, as_data.eventdb_events, ["eventdb_events"]);
      _getASData(stats, profile, as_data.eventstore_events, ["eventstore_events"]);
      _getASData(stats, profile, as_data.omnichannel_events, ["omnichannel_events"]);
      _getASData(stats, profile, as_data.predict_enrichments, ["predict_enrichments"]);
      _getASData(stats, profile, as_data.realtime_events, ["realtime_events"]);
      _getASData(stats, profile, as_data.viewthrough_reads, ["viewthrough_reads"]);
      _getASData(stats, profile, as_data.viewthrough_writes, ["viewthrough_writes"]);
      _getASData(stats, profile, as_data.visitor_dle, ["visitor_dle"]);
    }

    for (let i in stats){
      let _stats = stats[i] || {};
      record({
        account,
        profile,
        date : i,
        visits : _stats.VISIT,
        all_inbound_events : _stats.all_inbound_events || 0,
        audiencedb_visitors : _stats.audiencedb_visitors || 0,
        audiencestore_visitors : _stats.audiencestore_visitors || 0,
        audiencestream_filtered_events : _stats.audiencestream_filtered_events || 0,
        cloud_connector_all : _stats.cloud_connector_all || 0,
        cloud_connector_audiences : _stats.cloud_connector_audiences || 0,
        cloud_connector_events : _stats.cloud_connector_events || 0,
        data_access_all : _stats.data_access_all || 0,
        eventdb_events : _stats.eventdb_events || 0,
        eventstore_events : _stats.eventstore_events || 0,
        omnichannel_events : _stats.omnichannel_events || 0,
        predict_enrichments : _stats.predict_enrichments || 0,
        realtime_events : _stats.realtime_events || 0,
        viewthrough_reads : _stats.viewthrough_reads || 0,
        viewthrough_writes : _stats.viewthrough_writes || 0,
        visitor_dle : _stats.visitor_dle || 0,
      });
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : "accounts-stats",
    getProfile : false,
    checkProfile : profileChecker,
    dbDataTypes : {
      date : "TEXT",
      visits : "NUMBER",
      all_inbound_events : "NUMBER",
      audiencedb_visitors : "NUMBER",
      audiencestore_visitors : "NUMBER",
      audiencestream_filtered_events : "NUMBER",
      cloud_connector_all : "NUMBER",
      cloud_connector_audiences : "NUMBER",
      cloud_connector_events : "NUMBER",
      data_access_all : "NUMBER",
      eventdb_events : "NUMBER",
      eventstore_events : "NUMBER",
      omnichannel_events : "NUMBER",
      predict_enrichments : "NUMBER",
      realtime_events : "NUMBER",
      viewthrough_reads : "NUMBER",
      viewthrough_writes : "NUMBER",
      visitor_dle : "NUMBER"
    },
    accountOvrdList : [
      "abn-amro",
      "barclaysuk"
    ],
    [{account:"", profile:""}}
  }
);
























