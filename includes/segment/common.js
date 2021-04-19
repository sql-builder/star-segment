function allPageFields(params) {
  const customPageFieldsObj = params.customPageFields;
  return {
    ...params.defaultPageFields,
    ...customPageFieldsObj
  };
}

function allTrackFields(params) {
  const customTrackFieldsObj = params.customTrackFields;
  return {
    ...params.defaultTrackFields,
    ...customTrackFieldsObj
  };
}

function allScreenFields(params) {
  const customScreenFieldsObj = params.customScreenFields;
  return {
    ...params.defaultScreenFields,
    ...customScreenFieldsObj
  };
}

function enabledEvents(params) {
  const events = [];

  if (params.includeTracks) {
    events.push('tracks');
  }
  if (params.includePages) {
    events.push('pages');
  }
  if (params.includeScreens) {
    events.push('screens');
  }
  return events;
}

module.exports = {
  allTrackFields,
  allPageFields,
  allScreenFields,
  enabledEvents
}
