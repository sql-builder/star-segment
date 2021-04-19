const segmentCommon = require('./common');

// Format track calls into a format suitable to join with all other events
module.exports = (params) => {

  return publish('segment_tracks_events', {
    assertions: {
      uniqueKey: 'id'
    },
    ...params.defaultConfig
  }).query(ctx => `
 ${params.includeTrackSchemas.map((schema) => 
    `select
        'segment'           as source,
        '${schema}'||'.'||'tracks' as source_table,
        current_timestamp() as updated_dt,

        ${Object.entries(params.defaultTrackFields).map(
          ([key, value]) => `${key} as ${value}`).join(',\n    ')}
        
        ${Object.keys(params.customTrackFields).length ? `,` : ``}

        ${Object.entries(params.customTrackFields).map(
            ([key, value]) => `${key} as ${value}`).join(',\n    ')}
      from 
        ${ctx.ref(`${schema}`, `tracks`)}
  `).join(`\nunion all \n`)}
`)
}
