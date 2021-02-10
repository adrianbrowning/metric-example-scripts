const {
        reportHandler,
        constants: {DATABASE_TYPES},
        utils: {isEmpty}
      } = require("magic-metrics-tool");

const eventMaps = Object.freeze({
  "cart" : "AddToCart",
  "purch" : "Purchase",
  "vc" : "ViewContent",
  "page" : "PageView",
  "payment" : 'AddPaymentInfo',
  "wish" : "AddToWishlist",
  "reg" : "CompleteRegistration",
  "contact" : "Contact",
  "customizeproduct":"CustomizeProduct",
  "donate" : "Donate",
  "findlocation" : "FindLocation",
  "cout" : "InitiateCheckout",
  "lead" : "Lead",
  "schedule" : "Schedule",
  "search" : "Search",
  "starttrial" : "StartTrail",
  "submitapplication" : "SubmitApplication",
  "subscribe" : "Subscribe",
  "cust" : "Custom",
  "cnv" : "Conversion",
  "AddPaymentInfo" : "AddPaymentInfo",
  "AddToCart" : "AddToCart",
  "AddToWishlist" : "AddToWishlist",
  "CompleteRegistration" : "CompleteRegistration",
  "Contact" : "Contact",
  "CustomizeProduct" : "CustomizeProduct",
  "Donate" : "Donate",
  "FindLocation" : "FindLocation",
  "InitiateCheckout" : "InitiateCheckout",
  "Lead" : "Lead",
  "PageView" : "PageView",
  "Purchase" : "Purchase",
  "Schedule" : "Schedule",
  "Search" : "Search",
  "StartTrial" : "StartTrial",
  "SubmitApplication" : "SubmitApplication",
  "Subscribe" : "Subscribe",
  "ViewContent" : "ViewContent"
});


const profileChecker = async function checkProfile(
  { record, account, profile, profileData, resolve, reject }){
  try {

    if (isEmpty(profileData)) return resolve();
    if (isEmpty(profileData.manage)) return resolve();

    function get_rule(ruleid) {
      var lr = profileData.loadrules[ruleid] || {title: 'Unknown'};
      var rules=[];
      for (var prop in lr){
        if (typeof lr[prop] == "object"){
          var part = [];
          for (var i in lr[prop]){
            var x = lr[prop][i];
            var y = i.split("_")[1];
            var obj = part[y] || {};
            obj[i.split("_")[0]] = x;
            part[y] = obj;
          }
          rules.push(part)
        }
      }
      return {id: ruleid, name:lr.title, logic:rules};
    }

    for (var uid in profileData.manage){
      var tag = profileData.manage[uid];
      if (!(tag.tag_id == "6026" || tag.tag_id == "6037")){
        continue;
      }
      var map = tag.map;
      var events = {};
      for (var i in map){
        var dest = map[i].variable.split(", ");
        for (var x in dest){

          // Check for event triggers
          var ev = dest[x].split(":");
          if (ev.length> 1){
            map[i].type = map[i].type.replace("customization1", "js")
            eventMap = events[ev[1]] || {} ;
            if (typeof eventMap.triggers !== "undefined"){
              eventMap.triggers.push({key: map[i].type + "." + map[i].key, value: ev[0]})
              events[ev[1]] = eventMap;
            } else {
              eventMap.triggers = [{key: map[i].type + "." + map[i].key, value: ev[0]}];
              events[ev[1]] = eventMap;
            }
          }

          // check for event parameters
          var param = dest[x].split(".");
          if (param.length > 1){
            var dest_ev = eventMaps[param[0]] || param[0];
            eventMap = events[dest_ev] || {};
            console.log("adding event mapping: " + dest[x]);

            if (typeof eventMap.maps !== "undefined"){
              eventMap.maps.push({key: map[i].type + "." + map[i].key, value: param[1]})
              events[dest_ev] = eventMap;
            } else {
              eventMap.maps = [{key: map[i].type + "." + map[i].key, value: param[1]}];
              events[dest_ev] = eventMap;
            }
          }
        }
      }
      if(tag.config_page_view){
        var pv = events.PageView || {};
        pv.default_view = true;
        events.PageView = pv;
      }
      if(tag.config_default_event !== "None"){
        var de = events[tag.config_default_event] || {};
        de.default = true;
        events[tag.config_default_event] = de;
      }

      // v1


      var rules = [];
      var lr = tag.loadrule;
      if (lr !== "all"){
        var split = lr.split(",");
        for (var i = 0; i < split.length; i++){
          rules.push(get_rule(split[i]));
        }
      }

      record({
        account,
        profile,
        events: JSON.stringify(events),
        rules: JSON.stringify(rules),
        rule_match: tag.loadrule_join_operator,
        fb_pixel_id : tag.config_cust_pixel,
        mappings : JSON.stringify(tag.map || {})
      });
    }

    resolve();

  }
  catch (e) {
    return reject(e);
  }
};
reportHandler({
    logName : `facebook_mappings`,
    checkProfile : profileChecker,
    dbDataTypes : {
      events: DATABASE_TYPES.TEXT,
      rules: DATABASE_TYPES.TEXT,
      rule_match: DATABASE_TYPES.TEXT,
      fb_pixel_id: DATABASE_TYPES.TEXT,
      mappings: DATABASE_TYPES.TEXT,
    },
  useLocal:true,
  dropDB: true
  }
);


