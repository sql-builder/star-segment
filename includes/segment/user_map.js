const sql = require('@dataform/sql')();
const segmentCommon = require('./common');

module.exports = (params) => {
  return publish('segment_user_map', {
    ...params.defaultConfig
  }).query(ctx => `

-- for each anonymous_id, find a user_id mapped to it (if one exists)
with anonymous_id_user_id_pairs as (
select
    anonymous_id,
    user_id,
    timestamp
from
  (
${segmentCommon.enabledEvents(params).map((event) => 
`select
    anonymous_id,
    user_id,
    timestamp
  from
    ${ctx.ref(params.defaultConfig.schema, `segment_${event}_events`)}`).join(`\nunion all\n`)}

  UNION ALL
  
  select 
    anonymous_id,
    user_id,
    timestamp
  from
    ${ctx.ref(params.defaultConfig.schema, 'segment_identify_events')}
  ) as combined
)
select distinct
  anonymous_id,
  ${sql.windowFunction(
        'last_value',
        'user_id',
        false,
        {
          partitionFields: ['anonymous_id'],
          orderFields: ['anonymous_id_user_id_pairs.timestamp asc'],
          frameClause: 'rows between unbounded preceding and unbounded following'
        }
      )} as user_id
from
  anonymous_id_user_id_pairs
where
  anonymous_id is not null
  or user_id is not null
`)
}
