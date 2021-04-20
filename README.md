# Automated Buildout of Segment User Schema in Star Schema format

This Segment model builds a complete schema for user tracking and is flexible to handle multiple schemas and custom backend and frontend calls.

## Instructions
1. Duplicate the javascript below into a .js file in your definitions folder.
2. Set the defaultConfig to be where you want the model to deploy all the final tables/views built by the model.
3. If you have a simple build from only one schema in your Snowflake warehouse, set declareSources = true and comment out all the declarations at the bottom of the file.
4. If you have a more complicated build as illustrated in the sample below (IOS app, Android App, Backend Events, web events), set declareSources = false and fill out each section.
5. If you don't have an app, set includeScreen = false.
6. If you don't have webpage data, set includePages = false.
7. User Event Fields are properties of the users you want to see attached to their profile (first and last values of each property).


* segment_users.js *
```js
const segment = require('../');

const segmentDeclare = segment({

    // defaultConfig is the warehouse default setup info
    defaultConfig: {
        database: 'analytics',
        schema: 'segment_users_star', // Destination Schema
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
    includePageSchemas: ['website'], // List out all schemas for page calls
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
        // context_campaign_placement: 'utm_placement'
    },
    // Defaults for page calls
    includePageSessions: true,
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
    includeScreenSchemas: ['ios_prod','android_prod'], // List out all schemas for page calls
    customScreenFields: {},
    // Defaults for screen calls
    includeScreenSessions: true,
    defaultScreenFields: {
        id: 'id',
        user_id: 'user_id',
        timestamp: 'timestamp'
    },

    ////////////////////
    //  Track Calls   //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/track/
    // List out all web schemas for identity calls
    frontendTrackSchemas: ['website', 'ios_prod', 'android_prod'],
    frontendTrackFields: {},

    // List out all server-side schemas for identity calls
    backendTrackSchemas: ['javascript'],
    backendTrackFields: {
    }, // Must be present in all tables

    includeTrackSessions: false,
    defaultTrackFields: {
        id: 'id',
        user_id: 'user_id',
        timestamp: 'timestamp',
        event: 'event',
        event_text: 'event_name'
    },

    ////////////////////
    // Identity Calls //
    ////////////////////
    // From here: https://segment.com/docs/connections/spec/identify/
    // List out all web/app schemas for identity calls
    frontendIdentifySchemas: ['website'],
    frontendIdentifyFields: { anonymous_id: 'anonymous_id'},

    // List out all server-side schemas for identity calls
    backendIdentifySchemas: ['android_prod', 'ios_prod', 'javascript'],
    backendIdentifyFields: {
    }, // Must be present in all tables

    defaultIdentifyFields: {
        id: 'id',
        user_id: 'user_id',
        timestamp: 'timestamp'
    },

    ////////////////////////
    // User Events Fields //
    ////////////////////////
    customUserFields: [],
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
    includeUserSessions: true,

    // Include Screens in build if source is app 
    // Include Pages if source is website
    includeScreens: true,
    includePages: true,
    includeTracks: true
});


// List of all source tables for segment pages, screens, tracks and identifies. 
// Pages
declare({
    database: 'raw',
    schema: 'website',
    name: 'pages'
});


// Screens
declare({
  database: 'raw',
  schema: 'ios_prod',
  name: 'screens'
});
declare({
    database: 'raw',
    schema: 'android_prod',
    name: 'screens'
});


// Tracks Web Events
declare({
    database: 'raw',
    schema: 'website',
    name: 'tracks'
});


// App Track Events
declare({
    database: 'raw',
    schema: 'ios_prod',
    name: 'tracks'
});
declare({
    database: 'raw',
    schema: 'android_prod',
    name: 'tracks'
});

// Tracks Backend Events
declare({
    database: 'raw',
    schema: 'javascript',
    name: 'tracks'
});


// Identifies Web Events
declare({
    database: 'raw',
    schema: 'website',
    name: 'identifies'
});


// Identifies App Events
declare({
    database: 'raw',
    schema: 'ios_prod',
    name: 'identifies'
});
declare({
    database: 'raw',
    schema: 'android_prod',
    name: 'identifies'
});


// Identifies Backend Events
declare({
    database: 'raw',
    schema: 'javascript',
    name: 'identifies'
});
```