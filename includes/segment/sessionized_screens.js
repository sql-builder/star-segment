const segmentCommon = require('./common');

module.exports = (params) => {

  return publish('segment_sessionized_screens', {
    ...params.defaultConfig,
    disabled: !params.includeScreenSessions
  }).query(ctx => `

-- annotate screen records with session details
select
  segment_sessionized_events.session_index,
  segment_sessionized_events.session_id,
  segment_screen_events.*
from 
  ${ctx.ref(params.defaultConfig.schema, 'segment_user_events')} as segment_sessionized_events
  left join ${ctx.ref(params.defaultConfig.schema, 'segment_screens_events')} as segment_screen_events
    on segment_sessionized_events.id = segment_screen_events.id
where
  segment_sessionized_events.id is not null

`)
}
