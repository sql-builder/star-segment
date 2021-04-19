const segment = require('../');

const segmentDeclare = segment({

    // defaultConfig is the warehouse default setup info
    defaultConfig: {
        database: 'databaseName',
        schema: 'users', // Destination Schema
        tags: ['segment'],
        type: 'table'
    },

    // If sources are not in the same destination warehouse schema as the defaultConfig, set to false and declare below
    declareSources: false,
    segmentSource: 'javascript',

    ////////////////////
    //   Page Calls   //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/page/
    includePageSchemas: ['webSchema'], // List out all schemas for page calls
    customPageFields: {
        url: 'url',
        title: 'title',
        name: 'name',
        search: 'search',
        referrer: 'referrer',
        path: 'path',
        context_ip: 'ip',
        context_locale: 'locale',
        context_user_agent: 'user_agent',
        context_campaign_term: 'utm_term',
        context_campaign_medium: 'utm_medium',
        context_campaign_source: 'utm_source',
        context_campaign_name: 'utm_campaign',
        context_campaign_content: 'utm_content',
        context_campaign_placement: 'utm_placement'
    },
    // Defaults for page calls
    includePageSessions: false,
    defaultPageFields: {
        id: 'id',
        anonymous_id: 'anonymous_id',
        user_id: 'user_id',
        timestamp: 'timestamp'
    },

    ////////////////////
    //  Screen Calls  //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/screen/
    includeScreenSchemas: [], // List out all schemas for page calls
    customScreenFields: {},
    // Defaults for screen calls
    includeScreenSessions: false,
    defaultScreenFields: {
        id: 'id',
        anonymous_id: 'anonymous_id',
        user_id: 'user_id',
        timestamp: 'timestamp'
    },

    ////////////////////
    //  Track Calls   //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/track/
    includeTrackSchemas: ['webSchema','javascript'],
    customTrackFields: {},
    includeTrackSessions: false,
    defaultTrackFields: {
        id: 'id',
        user_id: 'user_id',
        anonymous_id: 'anonymous_id',
        timestamp: 'timestamp',
        event: 'event',
        event_text: 'event_name'
    },

    ////////////////////
    // Identity Calls //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/identify/
    // List out all web/app schemas for identity calls
    frontendIdentifySchemas: ['webSchema'], 
    frontendIdentifyFields: {},

    // List out all server-side schemas for identity calls
    backendIdentifySchemas: ['javascript'], 
    backendIdentifyFields: {
    }, // Must be present in all tables

    defaultIdentifyFields: {
        id: 'id',
        user_id: 'user_id',
        anonymous_id: 'anonymous_id',
        timestamp: 'timestamp'
    },

    ////////////////////////
    // User Events Fields //
    ////////////////////////
    customUserFields: ['source'],
        // 'url',
        // 'title',
        // 'name',
        // 'search',
        // 'referrer',
        // 'path',
        // 'ip',
        // 'locale',
        // 'user_agent',
        // 'utm_term',
        // 'utm_medium',
        // 'utm_source',
        // 'utm_campaign',
        // 'utm_content',
        // 'utm_placement'],
    includeUserSessions: false,

    // Include Screens in build if source is app 
    // Include Pages if source is website
    includeScreens: false,
    includePages: true,
    includeTracks: true
});

// List of all source tables for segment pages, screens, tracks and identifies. 

// Pages
declare({
    database: 'source',
    schema: 'webSchema',
    name: 'pages'
});

// // Screens
// declare({
//   database: 'source',
//   schema: 'webSchema',
//   name: 'screens'
// });

// Tracks Web Events
declare({
    database: 'source',
    schema: 'webSchema',
    name: 'tracks'
});

// Tracks Backend Events
declare({
    database: 'source',
    schema: 'javascript',
    name: 'tracks'
});


// Identifies Web Events
declare({
    database: 'source',
    schema: 'webSchema',
    name: 'identifies'
});

// Identifies Backend Events
declare({
    database: 'source',
    schema: 'javascript',
    name: 'identifies'
});
