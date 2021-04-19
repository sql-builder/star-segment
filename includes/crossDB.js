const { getUrlHost, getUrlParameter } = require('includes/webFunctions/urlClean');
const { platform, browser } = require('includes/webFunctions/userAgent');

function splitPart(string_text, delimiter_text, part_number, warehouse) {
    return ({
        bigquery: `split(${string_text},${delimiter_text})[safe_offset(${part_number - 1})]`,
        redshift: `split_part(${string_text},${delimiter_text},${part_number})`,
        postgres: `split_part(${string_text},${delimiter_text},${part_number})`,
        snowflake: `split_part(${string_text},${delimiter_text},${part_number})`,
        sqldatawarehouse: `split_part(${string_text},${delimiter_text},${part_number})`,
    })[warehouse || dataform.projectConfig.warehouse];
};

function typeString(warehouse) {
    return ({
        bigquery: 'string',
        redshift: 'varchar',
        postgres: 'varchar',
        snowflake: 'varchar',
        sqldatawarehouse: 'string',
    })[warehouse || dataform.projectConfig.warehouse];
};
function countryGroup(countryCodeField) {
    return `case
            when lower(${countryCodeField}) in ('united states', 'canada') then 'NA'
            when lower(${countryCodeField}) in ('united kingdom', 'france', 'germany', 'italy', 'poland') then 'EU'
            when lower(${countryCodeField}) in ('australia') then lower(${countryCodeField})
            else 'Other countries'
            end`;
};

function filterStitch(ctx, params, tableName, uniqueColumn) {
    return `
SELECT
  *
  FROM
    (
      SELECT
      *,
      MAX(_sdc_batched_at) OVER (PARTITION BY ${uniqueColumn} ORDER BY _sdc_batched_at RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS max_sdc_batched_at
    FROM
      ${ctx.ref({ database: params.defaultConfig.facebookDatabase, schema: params.defaultConfig.facebookSchema, name: `${tableName}` })}
  )
WHERE
_sdc_batched_at = max_sdc_batched_at
`;
};

function filterSegment(ctx, params, tableName, uniqueColumn) {
    return `
SELECT
  *
  FROM
    (
      SELECT
      *,
      MAX(uuid_ts) OVER (PARTITION BY ${uniqueColumn} ORDER BY uuid_ts RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS max_uuid_ts
    FROM
      ${ctx.ref({ database: params.defaultConfig.facebookDatabase, schema: params.defaultConfig.facebookSchema, name: `${tableName}` })}
  )
WHERE
uuid_ts = max_uuid_ts
`;
};

function castFloat(value, warehouse) {
    return ({
        bigquery: ` cast(${value} as float64) `,
        redshift: ` cast(${value} as float) `,
        postgres: ` cast(${value} as float) `,
        snowflake: ` cast(${value} as decimal) `,
        sqldatawarehouse: ` cast(${value} as float) `,
    })[warehouse || dataform.projectConfig.warehouse];
};

function castInt(value, warehouse) {
    return ({
        bigquery: ` cast(${value} as int64) `,
        redshift: ` cast(${value} as int) `,
        postgres: ` cast(${value} as int) `,
        snowflake: ` cast(${value} as int) `,
        sqldatawarehouse: ` cast(${value} as int) `,
    })[warehouse || dataform.projectConfig.warehouse];
};

function safeDivide(dividend, divisor, warehouse) {
    return ({
        bigquery: ` safe_divide(${dividend},${divisor})`,
        redshift: ` ${dividend} /nullif(${divisor},0) `,
        postgres: ` ${dividend} /nullif(${divisor},0) `,
        snowflake: ` ${dividend} /nullif(${divisor},0) `,
        sqldatawarehouse: `  ${dividend} /nullif(${divisor},0) `,
    })[warehouse || dataform.projectConfig.warehouse];
};

module.exports = {
    countryGroup,
    filterStitch,
    filterSegment,
    safeDivide,
    castInt,
    castFloat,
    splitPart,
    getUrlHost,
    getUrlParameter,
    platform,
    browser,
};