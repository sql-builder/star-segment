const segmentCommon = require('./common');

module.exports = (params) => {

  return publish('segment_sessionized_tracks', {
    ...params.defaultConfig,
    disabled: !params.includeTrackSessions
  }).query(ctx => `

-- annotate track records with session details
select
  segment_sessionized_events.session_index,
  segment_sessionized_events.session_id,
  segment_sessionized_events.source,
  segment_track_events.*
from 
  ${ctx.ref(params.defaultConfig.schema, 'segment_user_events')} as segment_sessionized_events
  left join ${ctx.ref(params.defaultConfig.schema, 'segment_tracks_events')} as segment_track_events
    on segment_sessionized_events.id = segment_track_events.id
where
  segment_sessionized_events.id is not null

`)
}

