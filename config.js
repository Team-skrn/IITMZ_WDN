/**
 * ✅ DYNAMIC PAGE CONFIGURATION
 * Define all pages, sensors, and API credentials here
 * Changes here automatically apply to the entire app
 */

const appConfig = {
    appTitle: 'IITMZ Water Management',
    defaultLanguage: 'en',
    
    // ✅ All Pages in the App
    pages: {
        reservoir: {
            id: 'reservoir',
            displayName: 'Reservoir',
            title: 'Reservoir Water Level Monitoring',
            icon: '💧',
            sensors: {
                Reservoir: {
                    displayName: 'Reservoir',
                    channelID: '3132083',
                    apiKey: '50S4XP3WORJWBWQJ',
                    field: 'field3',
                    isInteger: true,
                    limits: { warning: 150, danger: 60 }
                },
                // Main_Sump: {
                //     displayName: 'Main Sump',
                //     channelID: '3132083',
                //     apiKey: '50S4XP3WORJWBWQJ',
                //     field: 'field4',
                //     isInteger: true,
                //     limits: { warning: 200, danger: 50 }
                // },
                // Pampa_Sump: {
                //     displayName: 'Pampa Sump',
                //     channelID: '3132083',
                //     apiKey: '50S4XP3WORJWBWQJ',
                //     field: 'field5',
                //     isInteger: true,
                //     limits: { warning: 200, danger: 50 }
                // },
                // ICSR_Sump: {
                //     displayName: 'ICSR Sump',
                //     channelID: '3132083',
                //     apiKey: '50S4XP3WORJWBWQJ',
                //     field: 'field7',
                //     isInteger: true,
                //     limits: { warning: 200, danger: 50 }
                // }
            }
        },
        overheadTank: {
            id: 'overheadTank',
            displayName: 'Overhead Tank',
            title: 'Overhead Tank Water Level Monitoring',
            icon: '🏢',
            sensors: {
                OverheadTank: {
                    displayName: 'Overhead Tank',
                    channelID: '3132083',
                    apiKey: '50S4XP3WORJWBWQJ',
                    field: 'field6',
                    isInteger: true,
                    limits: { warning: 150, danger: 60 }
                },
                // BoreWell_Sump: {
                //     displayName: 'BoreWell Sump',
                //     channelID: '3132083',
                //     apiKey: '50S4XP3WORJWBWQJ',
                //     field: 'field8',
                //     isInteger: true,
                //     limits: { warning: 200, danger: 50 }
                // },
                // Return_Sump: {
                //     displayName: 'Return Sump',
                //     channelID: '3132083',
                //     apiKey: '50S4XP3WORJWBWQJ',
                //     field: 'field9',
                //     isInteger: true,
                //     limits: { warning: 200, danger: 50 }
                // },
                // WashOut_Sump: {
                //     displayName: 'WashOut Sump',
                //     channelID: '3132083',
                //     apiKey: '50S4XP3WORJWBWQJ',
                //     field: 'field10',
                //     isInteger: true,
                //     limits: { warning: 200, danger: 50 }
                // }
            }
        }
    },

    // ✅ Get all page info (for index/hub)
    getAllPages: function() {
        return Object.values(this.pages).map(page => ({
            id: page.id,
            displayName: page.displayName,
            icon: page.icon,
            sensorCount: Object.keys(page.sensors).length
        }));
    },

    // ✅ Get specific page config
    getPage: function(pageId) {
        return this.pages[pageId] || null;
    },

    // ✅ Get all sensors for a page
    getSensorsForPage: function(pageId) {
        const page = this.getPage(pageId);
        return page ? page.sensors : {};
    }
};

// Make config accessible globally
if (typeof window !== 'undefined') {
    window.appConfig = appConfig;
}
