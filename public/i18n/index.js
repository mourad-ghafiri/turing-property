// ============================================================================
// I18N PROPERTY - Internationalization as Property (All is Property)
// ============================================================================
// Translations are Properties. Each locale is a child Property containing
// translation keys as children. The current locale is metadata/state.

import { STRING, I18N as UI_I18N, LOCALE as UI_LOCALE } from '../common/types.js';

// ============================================================================
// ENGLISH TRANSLATIONS
// ============================================================================

const enTranslations = {
    id: 'en',
    type: UI_LOCALE,
    metadata: {
        name: { id: 'name', type: STRING, value: 'English' },
        flag: { id: 'flag', type: STRING, value: '🇺🇸' },
        code: { id: 'code', type: STRING, value: 'en' }
    },
    children: {
        // App-level translations
        app: {
            id: 'app',
            type: STRING,
            children: {
                title: { id: 'title', type: STRING, value: 'Event Planning Wizard' },
                subtitle: { id: 'subtitle', type: STRING, value: 'Powered by Turing Property - All is Property' },
                loading: { id: 'loading', type: STRING, value: 'Loading...' },
                error: { id: 'error', type: STRING, value: 'An error occurred' }
            }
        },
        // Header translations
        header: {
            id: 'header',
            type: STRING,
            children: {
                schema: { id: 'schema', type: STRING, value: 'Schema' },
                liveData: { id: 'liveData', type: STRING, value: 'Live Data' },
                theme: { id: 'theme', type: STRING, value: 'Theme' },
                language: { id: 'language', type: STRING, value: 'Language' }
            }
        },
        // Panel translations
        panel: {
            id: 'panel',
            type: STRING,
            children: {
                schemaTitle: { id: 'schemaTitle', type: STRING, value: 'Property Schema' },
                dataTitle: { id: 'dataTitle', type: STRING, value: 'Live Form Data' },
                close: { id: 'close', type: STRING, value: 'Close' }
            }
        },
        // Wizard translations
        wizard: {
            id: 'wizard',
            type: STRING,
            children: {
                title: { id: 'title', type: STRING, value: 'Plan Your Event' },
                description: { id: 'description', type: STRING, value: 'Create an unforgettable experience' },
                progress: { id: 'progress', type: STRING, value: 'Overall Progress' },
                next: { id: 'next', type: STRING, value: 'Next' },
                previous: { id: 'previous', type: STRING, value: 'Previous' },
                submit: { id: 'submit', type: STRING, value: 'Book Event' },
                step: { id: 'step', type: STRING, value: 'Step' },
                validationAlert: { id: 'validationAlert', type: STRING, value: 'Please complete all required fields before continuing.' }
            }
        },
        // Step translations
        steps: {
            id: 'steps',
            type: STRING,
            children: {
                step1: {
                    id: 'step1',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Basics' },
                        title: { id: 'title', type: STRING, value: 'Event Details' },
                        description: { id: 'description', type: STRING, value: 'Tell us about your event' }
                    }
                },
                step2: {
                    id: 'step2',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Venue' },
                        title: { id: 'title', type: STRING, value: 'Venue & Catering' },
                        description: { id: 'description', type: STRING, value: 'Choose your perfect setting and menu' }
                    }
                },
                step3: {
                    id: 'step3',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Extras' },
                        title: { id: 'title', type: STRING, value: 'Entertainment & Media' },
                        description: { id: 'description', type: STRING, value: 'Make your event unforgettable' }
                    }
                },
                step4: {
                    id: 'step4',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Finish' },
                        title: { id: 'title', type: STRING, value: 'Contact & Review' },
                        description: { id: 'description', type: STRING, value: 'Final details and upload inspiration' }
                    }
                },
                ceremony: {
                    id: 'ceremony',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Ceremony' },
                        title: { id: 'title', type: STRING, value: 'Wedding Ceremony Details' },
                        description: { id: 'description', type: STRING, value: 'Plan your perfect ceremony' }
                    }
                }
            }
        },
        // Sub-steps translations
        subSteps: {
            id: 'subSteps',
            type: STRING,
            children: {
                eventType: {
                    id: 'eventType',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Event Type' },
                        description: { id: 'description', type: STRING, value: 'What kind of event are you planning?' }
                    }
                },
                schedule: {
                    id: 'schedule',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Schedule' },
                        description: { id: 'description', type: STRING, value: 'Set the date, time, and size of your event' }
                    }
                },
                weddingExtras: {
                    id: 'weddingExtras',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Wedding Extras' },
                        description: { id: 'description', type: STRING, value: 'Special options for your wedding' }
                    }
                },
                corporateExtras: {
                    id: 'corporateExtras',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Corporate Options' },
                        description: { id: 'description', type: STRING, value: 'Additional options for corporate events' }
                    }
                }
            }
        },
        // Sections translations
        sections: {
            id: 'sections',
            type: STRING,
            children: {
                eventIdentity: { id: 'eventIdentity', type: STRING, value: 'Event Identity' },
                dateTime: { id: 'dateTime', type: STRING, value: 'Date & Time' },
                guestInfo: { id: 'guestInfo', type: STRING, value: 'Guest Information' }
            }
        },
        // Field labels
        fields: {
            id: 'fields',
            type: STRING,
            children: {
                // Event Type Sub-step
                selectEventType: { id: 'selectEventType', type: STRING, value: 'Select Event Type' },
                companyName: { id: 'companyName', type: STRING, value: 'Company Name' },
                corporateEventType: { id: 'corporateEventType', type: STRING, value: 'Corporate Event Type' },
                coupleNames: { id: 'coupleNames', type: STRING, value: 'Couple Names' },
                ceremonyType: { id: 'ceremonyType', type: STRING, value: 'Ceremony Type' },
                birthdayPerson: { id: 'birthdayPerson', type: STRING, value: 'Birthday Person' },
                turningAge: { id: 'turningAge', type: STRING, value: 'Turning Age' },
                performerName: { id: 'performerName', type: STRING, value: 'Performer/Artist Name' },
                musicGenre: { id: 'musicGenre', type: STRING, value: 'Music Genre' },
                // Schedule Sub-step
                eventName: { id: 'eventName', type: STRING, value: 'Event Name' },
                eventDate: { id: 'eventDate', type: STRING, value: 'Event Date' },
                startTime: { id: 'startTime', type: STRING, value: 'Start Time' },
                expectedGuests: { id: 'expectedGuests', type: STRING, value: 'Expected Guests' },
                // Step 2: Venue & Catering
                venueType: { id: 'venueType', type: STRING, value: 'Venue Type' },
                outdoorBackup: { id: 'outdoorBackup', type: STRING, value: 'Add indoor backup option (+$500)' },
                beachPermit: { id: 'beachPermit', type: STRING, value: 'Include beach permit handling (+$200)' },
                rooftopHeaters: { id: 'rooftopHeaters', type: STRING, value: 'Add outdoor heaters (+$300)' },
                ballroomDecor: { id: 'ballroomDecor', type: STRING, value: 'Ballroom Decor Package' },
                cateringStyle: { id: 'cateringStyle', type: STRING, value: 'Catering Style' },
                dietaryOptions: { id: 'dietaryOptions', type: STRING, value: 'Include vegetarian/vegan options (+$5/guest)' },
                openBar: { id: 'openBar', type: STRING, value: 'Open bar service (+$25/guest)' },
                barPackageLevel: { id: 'barPackageLevel', type: STRING, value: 'Bar Package Level' },
                coursesCount: { id: 'coursesCount', type: STRING, value: 'Number of Courses' },
                buffetStations: { id: 'buffetStations', type: STRING, value: 'Number of Buffet Stations' },
                specialRequests: { id: 'specialRequests', type: STRING, value: 'Special Dietary Requirements' },
                // Step 3: Entertainment & Media
                musicOption: { id: 'musicOption', type: STRING, value: 'Music & Entertainment' },
                djGenre: { id: 'djGenre', type: STRING, value: 'DJ Music Style' },
                djLighting: { id: 'djLighting', type: STRING, value: 'Add professional lighting package (+$400)' },
                bandSize: { id: 'bandSize', type: STRING, value: 'Band Size' },
                bandStyle: { id: 'bandStyle', type: STRING, value: 'Band Style' },
                acousticInstruments: { id: 'acousticInstruments', type: STRING, value: 'Instrument Preference' },
                mediaServices: { id: 'mediaServices', type: STRING, value: 'Media Services' },
                photoStyle: { id: 'photoStyle', type: STRING, value: 'Photography Style' },
                videoPackage: { id: 'videoPackage', type: STRING, value: 'Video Package' },
                droneShots: { id: 'droneShots', type: STRING, value: 'Drone Coverage' },
                boothType: { id: 'boothType', type: STRING, value: 'Photo Booth Type' },
                boothProps: { id: 'boothProps', type: STRING, value: 'Include premium props package (+$75)' },
                decorationBudget: { id: 'decorationBudget', type: STRING, value: 'Decoration Budget' },
                themeColor: { id: 'themeColor', type: STRING, value: 'Theme Color' },
                eventRating: { id: 'eventRating', type: STRING, value: 'Expected Event Scale (1-5)' },
                eventTags: { id: 'eventTags', type: STRING, value: 'Event Keywords' },
                // Step 4: Contact
                yourName: { id: 'yourName', type: STRING, value: 'Your Name' },
                emailAddress: { id: 'emailAddress', type: STRING, value: 'Email Address' },
                phoneNumber: { id: 'phoneNumber', type: STRING, value: 'Phone Number' },
                vipCoordinator: { id: 'vipCoordinator', type: STRING, value: 'Request dedicated VIP coordinator' },
                alternateContact: { id: 'alternateContact', type: STRING, value: 'Alternate Contact Name' },
                alternatePhone: { id: 'alternatePhone', type: STRING, value: 'Alternate Contact Phone' },
                weddingCoordinator: { id: 'weddingCoordinator', type: STRING, value: 'Add day-of wedding coordinator (+$800)' },
                invoiceRequired: { id: 'invoiceRequired', type: STRING, value: 'Require formal invoice for accounting' },
                companyTaxId: { id: 'companyTaxId', type: STRING, value: 'Company Tax ID / VAT Number' },
                customDesignConsultation: { id: 'customDesignConsultation', type: STRING, value: 'Request custom design consultation (free)' },
                inspirationImages: { id: 'inspirationImages', type: STRING, value: 'Inspiration Images' },
                estimatedTotal: { id: 'estimatedTotal', type: STRING, value: 'Estimated Total' },
                termsAccepted: { id: 'termsAccepted', type: STRING, value: 'I agree to the terms and conditions' },
                // Wedding Extras fields
                weddingStyle: { id: 'weddingStyle', type: STRING, value: 'Wedding Style' },
                hasRingBearer: { id: 'hasRingBearer', type: STRING, value: 'Include Ring Bearer' },
                ringBearerName: { id: 'ringBearerName', type: STRING, value: 'Ring Bearer Name' },
                hasFlowerGirl: { id: 'hasFlowerGirl', type: STRING, value: 'Include Flower Girl' },
                flowerGirlName: { id: 'flowerGirlName', type: STRING, value: 'Flower Girl Name' },
                // Corporate Extras fields
                eventPurpose: { id: 'eventPurpose', type: STRING, value: 'Event Purpose' },
                needsAV: { id: 'needsAV', type: STRING, value: 'Audio/Visual Equipment (+$500)' },
                expectedROI: { id: 'expectedROI', type: STRING, value: 'Expected Event ROI' },
                // Ceremony fields
                ceremonyTypeSelect: { id: 'ceremonyTypeSelect', type: STRING, value: 'Ceremony Type' },
                vowStyle: { id: 'vowStyle', type: STRING, value: 'Vow Style' },
                hasOfficiant: { id: 'hasOfficiant', type: STRING, value: 'Need Officiant (+$300)' },
                officiantPreference: { id: 'officiantPreference', type: STRING, value: 'Officiant Preference' },
                ceremonyMusic: { id: 'ceremonyMusic', type: STRING, value: 'Ceremony Music' },
                // Cross-field constraint messages
                guestCountVenueWarning: { id: 'guestCountVenueWarning', type: STRING, value: 'Large guest count (200+) recommended with ballroom or outdoor venue' }
            }
        },
        // Placeholders
        placeholders: {
            id: 'placeholders',
            type: STRING,
            children: {
                companyName: { id: 'companyName', type: STRING, value: 'e.g., Acme Corporation' },
                coupleNames: { id: 'coupleNames', type: STRING, value: 'e.g., John & Jane' },
                birthdayPerson: { id: 'birthdayPerson', type: STRING, value: 'Who is celebrating?' },
                performerName: { id: 'performerName', type: STRING, value: 'e.g., The Jazz Quartet' },
                eventName: { id: 'eventName', type: STRING, value: 'Give your event a memorable name' },
                specialRequests: { id: 'specialRequests', type: STRING, value: 'e.g., nut allergies, kosher, halal...' },
                fullName: { id: 'fullName', type: STRING, value: 'Full name' },
                email: { id: 'email', type: STRING, value: 'your@email.com' },
                phone: { id: 'phone', type: STRING, value: '(555) 123-4567' },
                alternateContact: { id: 'alternateContact', type: STRING, value: 'Secondary point of contact' },
                taxId: { id: 'taxId', type: STRING, value: 'XX-XXXXXXX' },
                addTags: { id: 'addTags', type: STRING, value: 'Add keywords (press Enter)' },
                selectType: { id: 'selectType', type: STRING, value: 'Select type...' },
                selectVenue: { id: 'selectVenue', type: STRING, value: 'Select venue...' },
                selectPackage: { id: 'selectPackage', type: STRING, value: 'Select package...' },
                selectStyle: { id: 'selectStyle', type: STRING, value: 'Select style...' },
                selectGenre: { id: 'selectGenre', type: STRING, value: 'Select genre...' },
                selectCeremony: { id: 'selectCeremony', type: STRING, value: 'Select ceremony type...' },
                selectCoverage: { id: 'selectCoverage', type: STRING, value: 'Select coverage...' },
                selectInstruments: { id: 'selectInstruments', type: STRING, value: 'Select instruments...' }
            }
        },
        // Hints
        hints: {
            id: 'hints',
            type: STRING,
            children: {
                outdoorBackup: { id: 'outdoorBackup', type: STRING, value: 'Recommended for outdoor events in case of bad weather' },
                beachPermit: { id: 'beachPermit', type: STRING, value: 'We handle all permits and local regulations' },
                rooftopHeaters: { id: 'rooftopHeaters', type: STRING, value: 'Keep guests comfortable in cooler weather' },
                djLighting: { id: 'djLighting', type: STRING, value: 'LED uplighting, dance floor effects, and moving heads' },
                boothProps: { id: 'boothProps', type: STRING, value: 'Hats, signs, glasses, and themed accessories' },
                droneShots: { id: 'droneShots', type: STRING, value: 'Subject to FAA regulations and venue approval' },
                themeColor: { id: 'themeColor', type: STRING, value: 'Choose your event\'s primary color theme' },
                eventRating: { id: 'eventRating', type: STRING, value: '1 = Casual, 5 = Grand luxury' },
                eventTags: { id: 'eventTags', type: STRING, value: 'Add tags to help us customize your event' },
                vipCoordinator: { id: 'vipCoordinator', type: STRING, value: 'Complimentary for grand luxury events' },
                alternateContact: { id: 'alternateContact', type: STRING, value: 'Recommended for large events with 200+ guests' },
                weddingCoordinator: { id: 'weddingCoordinator', type: STRING, value: 'Professional coordinator to manage your special day' },
                taxId: { id: 'taxId', type: STRING, value: 'Required for formal invoice generation' },
                customDesign: { id: 'customDesign', type: STRING, value: 'Complimentary for premium decoration budgets' },
                inspirationImages: { id: 'inspirationImages', type: STRING, value: 'Upload images or PDFs for inspiration (max 10MB each)' },
                largeEvent: { id: 'largeEvent', type: STRING, value: 'Large event! We recommend extra staff.' },
                intimateGathering: { id: 'intimateGathering', type: STRING, value: 'Intimate gathering' },
                extensiveVariety: { id: 'extensiveVariety', type: STRING, value: 'Extensive variety for your guests!' }
            }
        },
        // Error messages
        errors: {
            id: 'errors',
            type: STRING,
            children: {
                selectEventType: { id: 'selectEventType', type: STRING, value: 'Please select an event type' },
                nameTooShort: { id: 'nameTooShort', type: STRING, value: 'Name must be at least 3 characters' },
                selectDate: { id: 'selectDate', type: STRING, value: 'Please select a date' },
                selectTime: { id: 'selectTime', type: STRING, value: 'Please select a time' },
                selectVenue: { id: 'selectVenue', type: STRING, value: 'Please select a venue' },
                selectCatering: { id: 'selectCatering', type: STRING, value: 'Please select catering' },
                selectMusic: { id: 'selectMusic', type: STRING, value: 'Please select music option' },
                enterName: { id: 'enterName', type: STRING, value: 'Please enter your name' },
                validEmail: { id: 'validEmail', type: STRING, value: 'Please enter valid email' },
                validPhone: { id: 'validPhone', type: STRING, value: 'Please enter valid phone' },
                acceptTerms: { id: 'acceptTerms', type: STRING, value: 'You must accept the terms' }
            }
        },
        // Event type options
        eventTypes: {
            id: 'eventTypes',
            type: STRING,
            children: {
                wedding: { id: 'wedding', type: STRING, value: 'Wedding' },
                weddingDesc: { id: 'weddingDesc', type: STRING, value: 'Celebrate your special day' },
                corporate: { id: 'corporate', type: STRING, value: 'Corporate' },
                corporateDesc: { id: 'corporateDesc', type: STRING, value: 'Business events & conferences' },
                birthday: { id: 'birthday', type: STRING, value: 'Birthday' },
                birthdayDesc: { id: 'birthdayDesc', type: STRING, value: 'Birthday celebrations' },
                concert: { id: 'concert', type: STRING, value: 'Concert' },
                concertDesc: { id: 'concertDesc', type: STRING, value: 'Live performances & shows' }
            }
        },
        // Corporate event types
        corporateTypes: {
            id: 'corporateTypes',
            type: STRING,
            children: {
                conference: { id: 'conference', type: STRING, value: 'Conference' },
                teambuilding: { id: 'teambuilding', type: STRING, value: 'Team Building' },
                launch: { id: 'launch', type: STRING, value: 'Product Launch' },
                gala: { id: 'gala', type: STRING, value: 'Awards Gala' }
            }
        },
        // Ceremony types
        ceremonyTypes: {
            id: 'ceremonyTypes',
            type: STRING,
            children: {
                religious: { id: 'religious', type: STRING, value: 'Religious' },
                civil: { id: 'civil', type: STRING, value: 'Civil' },
                symbolic: { id: 'symbolic', type: STRING, value: 'Symbolic' }
            }
        },
        // Music genres
        musicGenres: {
            id: 'musicGenres',
            type: STRING,
            children: {
                rock: { id: 'rock', type: STRING, value: 'Rock' },
                jazz: { id: 'jazz', type: STRING, value: 'Jazz' },
                classical: { id: 'classical', type: STRING, value: 'Classical' },
                pop: { id: 'pop', type: STRING, value: 'Pop' }
            }
        },
        // Venue types
        venueTypes: {
            id: 'venueTypes',
            type: STRING,
            children: {
                indoor: { id: 'indoor', type: STRING, value: 'Indoor Venue' },
                outdoor: { id: 'outdoor', type: STRING, value: 'Outdoor Garden' },
                beach: { id: 'beach', type: STRING, value: 'Beach/Waterfront' },
                rooftop: { id: 'rooftop', type: STRING, value: 'Rooftop' },
                ballroom: { id: 'ballroom', type: STRING, value: 'Ballroom' }
            }
        },
        // Decor packages
        decorPackages: {
            id: 'decorPackages',
            type: STRING,
            children: {
                classic: { id: 'classic', type: STRING, value: 'Classic Elegance (+$800)' },
                modern: { id: 'modern', type: STRING, value: 'Modern Luxe (+$1200)' },
                royal: { id: 'royal', type: STRING, value: 'Royal Grandeur (+$2000)' }
            }
        },
        // Catering styles
        cateringStyles: {
            id: 'cateringStyles',
            type: STRING,
            children: {
                buffet: { id: 'buffet', type: STRING, value: 'Buffet' },
                buffetDesc: { id: 'buffetDesc', type: STRING, value: 'Self-service variety' },
                plated: { id: 'plated', type: STRING, value: 'Plated' },
                platedDesc: { id: 'platedDesc', type: STRING, value: 'Elegant service' },
                stations: { id: 'stations', type: STRING, value: 'Food Stations' },
                stationsDesc: { id: 'stationsDesc', type: STRING, value: 'Interactive dining' },
                cocktail: { id: 'cocktail', type: STRING, value: 'Cocktail' },
                cocktailDesc: { id: 'cocktailDesc', type: STRING, value: 'Light & social' }
            }
        },
        // Bar packages
        barPackages: {
            id: 'barPackages',
            type: STRING,
            children: {
                standard: { id: 'standard', type: STRING, value: 'Standard' },
                standardDesc: { id: 'standardDesc', type: STRING, value: 'Beer, wine, basic spirits' },
                premium: { id: 'premium', type: STRING, value: 'Premium' },
                premiumDesc: { id: 'premiumDesc', type: STRING, value: 'Top-shelf spirits included (+$10/guest)' },
                craft: { id: 'craft', type: STRING, value: 'Craft Cocktails' },
                craftDesc: { id: 'craftDesc', type: STRING, value: 'Custom cocktail menu (+$15/guest)' }
            }
        },
        // Courses
        courses: {
            id: 'courses',
            type: STRING,
            children: {
                three: { id: 'three', type: STRING, value: '3 Courses (Starter, Main, Dessert)' },
                four: { id: 'four', type: STRING, value: '4 Courses (+$15/guest)' },
                five: { id: 'five', type: STRING, value: '5 Courses - Tasting Menu (+$30/guest)' }
            }
        },
        // Music options
        musicOptions: {
            id: 'musicOptions',
            type: STRING,
            children: {
                dj: { id: 'dj', type: STRING, value: 'Professional DJ' },
                band: { id: 'band', type: STRING, value: 'Live Band' },
                acoustic: { id: 'acoustic', type: STRING, value: 'Acoustic Duo' },
                playlist: { id: 'playlist', type: STRING, value: 'Curated Playlist' }
            }
        },
        // Wedding styles
        weddingStyles: {
            id: 'weddingStyles',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Select style' },
                classic: { id: 'classic', type: STRING, value: 'Classic & Elegant' },
                rustic: { id: 'rustic', type: STRING, value: 'Rustic & Country' },
                modern: { id: 'modern', type: STRING, value: 'Modern & Minimalist' },
                bohemian: { id: 'bohemian', type: STRING, value: 'Bohemian & Free-spirited' }
            }
        },
        // Vow styles
        vowStyles: {
            id: 'vowStyles',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Select vow style' },
                traditional: { id: 'traditional', type: STRING, value: 'Traditional Vows' },
                personal: { id: 'personal', type: STRING, value: 'Personal/Custom Vows' },
                mixed: { id: 'mixed', type: STRING, value: 'Mix of Traditional & Personal' }
            }
        },
        // Officiant types
        officiantTypes: {
            id: 'officiantTypes',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Select preference' },
                religious: { id: 'religious', type: STRING, value: 'Religious Leader' },
                secular: { id: 'secular', type: STRING, value: 'Secular Officiant' },
                friend: { id: 'friend', type: STRING, value: 'Friend/Family (we help with licensing)' }
            }
        },
        // Ceremony music options
        ceremonyMusicOptions: {
            id: 'ceremonyMusicOptions',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Select music option' },
                live: { id: 'live', type: STRING, value: 'Live Musicians (+$500)' },
                recorded: { id: 'recorded', type: STRING, value: 'Recorded Music' },
                both: { id: 'both', type: STRING, value: 'Mix of Live & Recorded (+$300)' }
            }
        },
        // Event purposes
        eventPurposes: {
            id: 'eventPurposes',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Select purpose' },
                conference: { id: 'conference', type: STRING, value: 'Conference / Seminar' },
                teambuilding: { id: 'teambuilding', type: STRING, value: 'Team Building' },
                productLaunch: { id: 'productLaunch', type: STRING, value: 'Product Launch' },
                networking: { id: 'networking', type: STRING, value: 'Networking Event' }
            }
        },
        // DJ styles
        djStyles: {
            id: 'djStyles',
            type: STRING,
            children: {
                top40: { id: 'top40', type: STRING, value: 'Top 40 / Pop' },
                edm: { id: 'edm', type: STRING, value: 'EDM / Dance' },
                hiphop: { id: 'hiphop', type: STRING, value: 'Hip-Hop / R&B' },
                retro: { id: 'retro', type: STRING, value: 'Retro / 80s-90s' },
                latin: { id: 'latin', type: STRING, value: 'Latin / Salsa' }
            }
        },
        // Band sizes
        bandSizes: {
            id: 'bandSizes',
            type: STRING,
            children: {
                trio: { id: 'trio', type: STRING, value: 'Trio (3 members)' },
                trioDesc: { id: 'trioDesc', type: STRING, value: 'Intimate sound' },
                quartet: { id: 'quartet', type: STRING, value: 'Quartet (4 members)' },
                quartetDesc: { id: 'quartetDesc', type: STRING, value: 'Full sound' },
                full: { id: 'full', type: STRING, value: 'Full Band (6+ members)' },
                fullDesc: { id: 'fullDesc', type: STRING, value: 'Big band experience (+$1000)' }
            }
        },
        // Band styles
        bandStyles: {
            id: 'bandStyles',
            type: STRING,
            children: {
                jazz: { id: 'jazz', type: STRING, value: 'Jazz & Swing' },
                rock: { id: 'rock', type: STRING, value: 'Rock & Pop Covers' },
                soul: { id: 'soul', type: STRING, value: 'Soul & Motown' },
                classical: { id: 'classical', type: STRING, value: 'Classical Ensemble' }
            }
        },
        // Acoustic instruments
        acousticOptions: {
            id: 'acousticOptions',
            type: STRING,
            children: {
                guitarVocal: { id: 'guitarVocal', type: STRING, value: 'Guitar & Vocals' },
                violinPiano: { id: 'violinPiano', type: STRING, value: 'Violin & Piano' },
                harp: { id: 'harp', type: STRING, value: 'Harp Solo' },
                stringQuartet: { id: 'stringQuartet', type: STRING, value: 'String Quartet (+$200)' }
            }
        },
        // Media services
        mediaServiceOptions: {
            id: 'mediaServiceOptions',
            type: STRING,
            children: {
                photo: { id: 'photo', type: STRING, value: 'Photography ($1,200)' },
                video: { id: 'video', type: STRING, value: 'Videography ($1,800)' },
                drone: { id: 'drone', type: STRING, value: 'Drone Footage ($500)' },
                booth: { id: 'booth', type: STRING, value: 'Photo Booth ($400)' }
            }
        },
        // Photo styles
        photoStyles: {
            id: 'photoStyles',
            type: STRING,
            children: {
                traditional: { id: 'traditional', type: STRING, value: 'Traditional & Posed' },
                candid: { id: 'candid', type: STRING, value: 'Candid & Documentary' },
                artistic: { id: 'artistic', type: STRING, value: 'Artistic & Editorial' },
                mixed: { id: 'mixed', type: STRING, value: 'Mixed Style' }
            }
        },
        // Video packages
        videoPackages: {
            id: 'videoPackages',
            type: STRING,
            children: {
                highlights: { id: 'highlights', type: STRING, value: 'Highlights Reel' },
                highlightsDesc: { id: 'highlightsDesc', type: STRING, value: '3-5 minute cinematic edit' },
                documentary: { id: 'documentary', type: STRING, value: 'Full Documentary' },
                documentaryDesc: { id: 'documentaryDesc', type: STRING, value: '15-20 minute film (+$500)' },
                both: { id: 'both', type: STRING, value: 'Both Packages' },
                bothDesc: { id: 'bothDesc', type: STRING, value: 'Best of both worlds (+$800)' }
            }
        },
        // Drone coverage
        droneCoverage: {
            id: 'droneCoverage',
            type: STRING,
            children: {
                venue: { id: 'venue', type: STRING, value: 'Venue Aerials Only' },
                ceremony: { id: 'ceremony', type: STRING, value: 'Ceremony Coverage' },
                full: { id: 'full', type: STRING, value: 'Full Event Coverage (+$200)' }
            }
        },
        // Booth types
        boothTypes: {
            id: 'boothTypes',
            type: STRING,
            children: {
                classic: { id: 'classic', type: STRING, value: 'Classic Enclosed' },
                classicDesc: { id: 'classicDesc', type: STRING, value: 'Traditional booth experience' },
                open: { id: 'open', type: STRING, value: 'Open Air' },
                openDesc: { id: 'openDesc', type: STRING, value: 'Modern backdrop setup' },
                video360: { id: 'video360', type: STRING, value: '360 Video Booth' },
                video360Desc: { id: 'video360Desc', type: STRING, value: 'Viral-worthy videos (+$200)' }
            }
        },
        // Units
        units: {
            id: 'units',
            type: STRING,
            children: {
                guests: { id: 'guests', type: STRING, value: ' guests' },
                stations: { id: 'stations', type: STRING, value: ' stations' }
            }
        },
        // Common UI text
        common: {
            id: 'common',
            type: STRING,
            children: {
                required: { id: 'required', type: STRING, value: 'Required' },
                optional: { id: 'optional', type: STRING, value: 'Optional' },
                save: { id: 'save', type: STRING, value: 'Save' },
                cancel: { id: 'cancel', type: STRING, value: 'Cancel' },
                confirm: { id: 'confirm', type: STRING, value: 'Confirm' },
                back: { id: 'back', type: STRING, value: 'Back' },
                continue: { id: 'continue', type: STRING, value: 'Continue' },
                success: { id: 'success', type: STRING, value: 'Success!' },
                error: { id: 'error', type: STRING, value: 'Error' }
            }
        },
        // Footer
        footer: {
            id: 'footer',
            type: STRING,
            children: {
                text: { id: 'text', type: STRING, value: 'All form state managed by reactive Turing Property system' }
            }
        }
    }
};

// ============================================================================
// FRENCH TRANSLATIONS
// ============================================================================

const frTranslations = {
    id: 'fr',
    type: UI_LOCALE,
    metadata: {
        name: { id: 'name', type: STRING, value: 'Français' },
        flag: { id: 'flag', type: STRING, value: '🇫🇷' },
        code: { id: 'code', type: STRING, value: 'fr' }
    },
    children: {
        // App-level translations
        app: {
            id: 'app',
            type: STRING,
            children: {
                title: { id: 'title', type: STRING, value: 'Assistant de Planification d\'Événement' },
                subtitle: { id: 'subtitle', type: STRING, value: 'Propulsé par Turing Property - Tout est Propriété' },
                loading: { id: 'loading', type: STRING, value: 'Chargement...' },
                error: { id: 'error', type: STRING, value: 'Une erreur est survenue' }
            }
        },
        // Header translations
        header: {
            id: 'header',
            type: STRING,
            children: {
                schema: { id: 'schema', type: STRING, value: 'Schéma' },
                liveData: { id: 'liveData', type: STRING, value: 'Données en Direct' },
                theme: { id: 'theme', type: STRING, value: 'Thème' },
                language: { id: 'language', type: STRING, value: 'Langue' }
            }
        },
        // Panel translations
        panel: {
            id: 'panel',
            type: STRING,
            children: {
                schemaTitle: { id: 'schemaTitle', type: STRING, value: 'Schéma de Propriété' },
                dataTitle: { id: 'dataTitle', type: STRING, value: 'Données du Formulaire' },
                close: { id: 'close', type: STRING, value: 'Fermer' }
            }
        },
        // Wizard translations
        wizard: {
            id: 'wizard',
            type: STRING,
            children: {
                title: { id: 'title', type: STRING, value: 'Planifiez Votre Événement' },
                description: { id: 'description', type: STRING, value: 'Créez une expérience inoubliable' },
                progress: { id: 'progress', type: STRING, value: 'Progression Globale' },
                next: { id: 'next', type: STRING, value: 'Suivant' },
                previous: { id: 'previous', type: STRING, value: 'Précédent' },
                submit: { id: 'submit', type: STRING, value: 'Réserver l\'Événement' },
                step: { id: 'step', type: STRING, value: 'Étape' },
                validationAlert: { id: 'validationAlert', type: STRING, value: 'Veuillez compléter tous les champs obligatoires avant de continuer.' }
            }
        },
        // Step translations
        steps: {
            id: 'steps',
            type: STRING,
            children: {
                step1: {
                    id: 'step1',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Bases' },
                        title: { id: 'title', type: STRING, value: 'Détails de l\'Événement' },
                        description: { id: 'description', type: STRING, value: 'Parlez-nous de votre événement' }
                    }
                },
                step2: {
                    id: 'step2',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Lieu' },
                        title: { id: 'title', type: STRING, value: 'Lieu & Traiteur' },
                        description: { id: 'description', type: STRING, value: 'Choisissez votre cadre et menu parfaits' }
                    }
                },
                step3: {
                    id: 'step3',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Extras' },
                        title: { id: 'title', type: STRING, value: 'Divertissement & Médias' },
                        description: { id: 'description', type: STRING, value: 'Rendez votre événement inoubliable' }
                    }
                },
                step4: {
                    id: 'step4',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Fin' },
                        title: { id: 'title', type: STRING, value: 'Contact & Révision' },
                        description: { id: 'description', type: STRING, value: 'Détails finaux et téléchargement d\'inspiration' }
                    }
                },
                ceremony: {
                    id: 'ceremony',
                    type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Cérémonie' },
                        title: { id: 'title', type: STRING, value: 'Détails de la Cérémonie' },
                        description: { id: 'description', type: STRING, value: 'Planifiez votre cérémonie parfaite' }
                    }
                }
            }
        },
        // Sub-steps translations
        subSteps: {
            id: 'subSteps',
            type: STRING,
            children: {
                eventType: {
                    id: 'eventType',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Type d\'Événement' },
                        description: { id: 'description', type: STRING, value: 'Quel type d\'événement planifiez-vous?' }
                    }
                },
                schedule: {
                    id: 'schedule',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Horaire' },
                        description: { id: 'description', type: STRING, value: 'Définissez la date, l\'heure et la taille de votre événement' }
                    }
                },
                weddingExtras: {
                    id: 'weddingExtras',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Options Mariage' },
                        description: { id: 'description', type: STRING, value: 'Options spéciales pour votre mariage' }
                    }
                },
                corporateExtras: {
                    id: 'corporateExtras',
                    type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Options Corporatives' },
                        description: { id: 'description', type: STRING, value: 'Options additionnelles pour événements professionnels' }
                    }
                }
            }
        },
        // Sections translations
        sections: {
            id: 'sections',
            type: STRING,
            children: {
                eventIdentity: { id: 'eventIdentity', type: STRING, value: 'Identité de l\'Événement' },
                dateTime: { id: 'dateTime', type: STRING, value: 'Date & Heure' },
                guestInfo: { id: 'guestInfo', type: STRING, value: 'Informations sur les Invités' }
            }
        },
        // Field labels
        fields: {
            id: 'fields',
            type: STRING,
            children: {
                // Event Type Sub-step
                selectEventType: { id: 'selectEventType', type: STRING, value: 'Sélectionner le Type d\'Événement' },
                companyName: { id: 'companyName', type: STRING, value: 'Nom de l\'Entreprise' },
                corporateEventType: { id: 'corporateEventType', type: STRING, value: 'Type d\'Événement Corporatif' },
                coupleNames: { id: 'coupleNames', type: STRING, value: 'Noms du Couple' },
                ceremonyType: { id: 'ceremonyType', type: STRING, value: 'Type de Cérémonie' },
                birthdayPerson: { id: 'birthdayPerson', type: STRING, value: 'Personne Fêtée' },
                turningAge: { id: 'turningAge', type: STRING, value: 'Âge à Célébrer' },
                performerName: { id: 'performerName', type: STRING, value: 'Nom de l\'Artiste/Interprète' },
                musicGenre: { id: 'musicGenre', type: STRING, value: 'Genre Musical' },
                // Schedule Sub-step
                eventName: { id: 'eventName', type: STRING, value: 'Nom de l\'Événement' },
                eventDate: { id: 'eventDate', type: STRING, value: 'Date de l\'Événement' },
                startTime: { id: 'startTime', type: STRING, value: 'Heure de Début' },
                expectedGuests: { id: 'expectedGuests', type: STRING, value: 'Invités Attendus' },
                // Step 2: Venue & Catering
                venueType: { id: 'venueType', type: STRING, value: 'Type de Lieu' },
                outdoorBackup: { id: 'outdoorBackup', type: STRING, value: 'Ajouter option intérieure de secours (+500$)' },
                beachPermit: { id: 'beachPermit', type: STRING, value: 'Inclure gestion des permis de plage (+200$)' },
                rooftopHeaters: { id: 'rooftopHeaters', type: STRING, value: 'Ajouter chauffages extérieurs (+300$)' },
                ballroomDecor: { id: 'ballroomDecor', type: STRING, value: 'Forfait Décoration Salle de Bal' },
                cateringStyle: { id: 'cateringStyle', type: STRING, value: 'Style de Traiteur' },
                dietaryOptions: { id: 'dietaryOptions', type: STRING, value: 'Inclure options végétariennes/véganes (+5$/invité)' },
                openBar: { id: 'openBar', type: STRING, value: 'Service bar ouvert (+25$/invité)' },
                barPackageLevel: { id: 'barPackageLevel', type: STRING, value: 'Niveau du Forfait Bar' },
                coursesCount: { id: 'coursesCount', type: STRING, value: 'Nombre de Plats' },
                buffetStations: { id: 'buffetStations', type: STRING, value: 'Nombre de Stations Buffet' },
                specialRequests: { id: 'specialRequests', type: STRING, value: 'Exigences Alimentaires Spéciales' },
                // Step 3: Entertainment & Media
                musicOption: { id: 'musicOption', type: STRING, value: 'Musique & Divertissement' },
                djGenre: { id: 'djGenre', type: STRING, value: 'Style Musical DJ' },
                djLighting: { id: 'djLighting', type: STRING, value: 'Ajouter forfait éclairage professionnel (+400$)' },
                bandSize: { id: 'bandSize', type: STRING, value: 'Taille du Groupe' },
                bandStyle: { id: 'bandStyle', type: STRING, value: 'Style du Groupe' },
                acousticInstruments: { id: 'acousticInstruments', type: STRING, value: 'Préférence d\'Instruments' },
                mediaServices: { id: 'mediaServices', type: STRING, value: 'Services Médias' },
                photoStyle: { id: 'photoStyle', type: STRING, value: 'Style de Photographie' },
                videoPackage: { id: 'videoPackage', type: STRING, value: 'Forfait Vidéo' },
                droneShots: { id: 'droneShots', type: STRING, value: 'Couverture Drone' },
                boothType: { id: 'boothType', type: STRING, value: 'Type de Photobooth' },
                boothProps: { id: 'boothProps', type: STRING, value: 'Inclure forfait accessoires premium (+75$)' },
                decorationBudget: { id: 'decorationBudget', type: STRING, value: 'Budget Décoration' },
                themeColor: { id: 'themeColor', type: STRING, value: 'Couleur du Thème' },
                eventRating: { id: 'eventRating', type: STRING, value: 'Échelle d\'Événement Attendue (1-5)' },
                eventTags: { id: 'eventTags', type: STRING, value: 'Mots-clés de l\'Événement' },
                // Step 4: Contact
                yourName: { id: 'yourName', type: STRING, value: 'Votre Nom' },
                emailAddress: { id: 'emailAddress', type: STRING, value: 'Adresse Email' },
                phoneNumber: { id: 'phoneNumber', type: STRING, value: 'Numéro de Téléphone' },
                vipCoordinator: { id: 'vipCoordinator', type: STRING, value: 'Demander un coordinateur VIP dédié' },
                alternateContact: { id: 'alternateContact', type: STRING, value: 'Nom du Contact Alternatif' },
                alternatePhone: { id: 'alternatePhone', type: STRING, value: 'Téléphone du Contact Alternatif' },
                weddingCoordinator: { id: 'weddingCoordinator', type: STRING, value: 'Ajouter coordinateur jour-J mariage (+800$)' },
                invoiceRequired: { id: 'invoiceRequired', type: STRING, value: 'Demander facture formelle pour comptabilité' },
                companyTaxId: { id: 'companyTaxId', type: STRING, value: 'Numéro TVA / SIRET Entreprise' },
                customDesignConsultation: { id: 'customDesignConsultation', type: STRING, value: 'Demander consultation design personnalisé (gratuit)' },
                inspirationImages: { id: 'inspirationImages', type: STRING, value: 'Images d\'Inspiration' },
                estimatedTotal: { id: 'estimatedTotal', type: STRING, value: 'Total Estimé' },
                termsAccepted: { id: 'termsAccepted', type: STRING, value: 'J\'accepte les conditions générales' },
                // Wedding Extras fields
                weddingStyle: { id: 'weddingStyle', type: STRING, value: 'Style de Mariage' },
                hasRingBearer: { id: 'hasRingBearer', type: STRING, value: 'Inclure Porteur d\'Alliances' },
                ringBearerName: { id: 'ringBearerName', type: STRING, value: 'Nom du Porteur d\'Alliances' },
                hasFlowerGirl: { id: 'hasFlowerGirl', type: STRING, value: 'Inclure Demoiselle d\'Honneur' },
                flowerGirlName: { id: 'flowerGirlName', type: STRING, value: 'Nom de la Demoiselle d\'Honneur' },
                // Corporate Extras fields
                eventPurpose: { id: 'eventPurpose', type: STRING, value: 'Objectif de l\'Événement' },
                needsAV: { id: 'needsAV', type: STRING, value: 'Équipement Audio/Visuel (+500$)' },
                expectedROI: { id: 'expectedROI', type: STRING, value: 'ROI Attendu de l\'Événement' },
                // Ceremony fields
                ceremonyTypeSelect: { id: 'ceremonyTypeSelect', type: STRING, value: 'Type de Cérémonie' },
                vowStyle: { id: 'vowStyle', type: STRING, value: 'Style des Vœux' },
                hasOfficiant: { id: 'hasOfficiant', type: STRING, value: 'Besoin d\'Officiant (+300$)' },
                officiantPreference: { id: 'officiantPreference', type: STRING, value: 'Préférence d\'Officiant' },
                ceremonyMusic: { id: 'ceremonyMusic', type: STRING, value: 'Musique de Cérémonie' },
                // Cross-field constraint messages
                guestCountVenueWarning: { id: 'guestCountVenueWarning', type: STRING, value: 'Pour 200+ invités, une salle de bal ou lieu extérieur est recommandé' }
            }
        },
        // Placeholders
        placeholders: {
            id: 'placeholders',
            type: STRING,
            children: {
                companyName: { id: 'companyName', type: STRING, value: 'ex., Société Acme' },
                coupleNames: { id: 'coupleNames', type: STRING, value: 'ex., Jean & Marie' },
                birthdayPerson: { id: 'birthdayPerson', type: STRING, value: 'Qui célèbre?' },
                performerName: { id: 'performerName', type: STRING, value: 'ex., Le Quatuor Jazz' },
                eventName: { id: 'eventName', type: STRING, value: 'Donnez un nom mémorable à votre événement' },
                specialRequests: { id: 'specialRequests', type: STRING, value: 'ex., allergies aux noix, casher, halal...' },
                fullName: { id: 'fullName', type: STRING, value: 'Nom complet' },
                email: { id: 'email', type: STRING, value: 'votre@email.com' },
                phone: { id: 'phone', type: STRING, value: '06 12 34 56 78' },
                alternateContact: { id: 'alternateContact', type: STRING, value: 'Point de contact secondaire' },
                taxId: { id: 'taxId', type: STRING, value: 'XX-XXXXXXX' },
                addTags: { id: 'addTags', type: STRING, value: 'Ajouter mots-clés (appuyez Entrée)' },
                selectType: { id: 'selectType', type: STRING, value: 'Sélectionner type...' },
                selectVenue: { id: 'selectVenue', type: STRING, value: 'Sélectionner lieu...' },
                selectPackage: { id: 'selectPackage', type: STRING, value: 'Sélectionner forfait...' },
                selectStyle: { id: 'selectStyle', type: STRING, value: 'Sélectionner style...' },
                selectGenre: { id: 'selectGenre', type: STRING, value: 'Sélectionner genre...' },
                selectCeremony: { id: 'selectCeremony', type: STRING, value: 'Sélectionner type de cérémonie...' },
                selectCoverage: { id: 'selectCoverage', type: STRING, value: 'Sélectionner couverture...' },
                selectInstruments: { id: 'selectInstruments', type: STRING, value: 'Sélectionner instruments...' }
            }
        },
        // Hints
        hints: {
            id: 'hints',
            type: STRING,
            children: {
                outdoorBackup: { id: 'outdoorBackup', type: STRING, value: 'Recommandé pour les événements extérieurs en cas de mauvais temps' },
                beachPermit: { id: 'beachPermit', type: STRING, value: 'Nous gérons tous les permis et réglementations locales' },
                rooftopHeaters: { id: 'rooftopHeaters', type: STRING, value: 'Gardez vos invités confortables par temps frais' },
                djLighting: { id: 'djLighting', type: STRING, value: 'Éclairage LED, effets piste de danse et projecteurs mobiles' },
                boothProps: { id: 'boothProps', type: STRING, value: 'Chapeaux, pancartes, lunettes et accessoires thématiques' },
                droneShots: { id: 'droneShots', type: STRING, value: 'Soumis aux réglementations DGAC et approbation du lieu' },
                themeColor: { id: 'themeColor', type: STRING, value: 'Choisissez la couleur principale de votre événement' },
                eventRating: { id: 'eventRating', type: STRING, value: '1 = Décontracté, 5 = Grand luxe' },
                eventTags: { id: 'eventTags', type: STRING, value: 'Ajoutez des tags pour personnaliser votre événement' },
                vipCoordinator: { id: 'vipCoordinator', type: STRING, value: 'Offert pour les événements grand luxe' },
                alternateContact: { id: 'alternateContact', type: STRING, value: 'Recommandé pour les grands événements de 200+ invités' },
                weddingCoordinator: { id: 'weddingCoordinator', type: STRING, value: 'Coordinateur professionnel pour gérer votre jour spécial' },
                taxId: { id: 'taxId', type: STRING, value: 'Requis pour la génération de facture formelle' },
                customDesign: { id: 'customDesign', type: STRING, value: 'Offert pour les budgets décoration premium' },
                inspirationImages: { id: 'inspirationImages', type: STRING, value: 'Téléchargez images ou PDFs d\'inspiration (max 10Mo chacun)' },
                largeEvent: { id: 'largeEvent', type: STRING, value: 'Grand événement! Nous recommandons du personnel supplémentaire.' },
                intimateGathering: { id: 'intimateGathering', type: STRING, value: 'Rassemblement intime' },
                extensiveVariety: { id: 'extensiveVariety', type: STRING, value: 'Grande variété pour vos invités!' }
            }
        },
        // Error messages
        errors: {
            id: 'errors',
            type: STRING,
            children: {
                selectEventType: { id: 'selectEventType', type: STRING, value: 'Veuillez sélectionner un type d\'événement' },
                nameTooShort: { id: 'nameTooShort', type: STRING, value: 'Le nom doit comporter au moins 3 caractères' },
                selectDate: { id: 'selectDate', type: STRING, value: 'Veuillez sélectionner une date' },
                selectTime: { id: 'selectTime', type: STRING, value: 'Veuillez sélectionner une heure' },
                selectVenue: { id: 'selectVenue', type: STRING, value: 'Veuillez sélectionner un lieu' },
                selectCatering: { id: 'selectCatering', type: STRING, value: 'Veuillez sélectionner un traiteur' },
                selectMusic: { id: 'selectMusic', type: STRING, value: 'Veuillez sélectionner une option musicale' },
                enterName: { id: 'enterName', type: STRING, value: 'Veuillez entrer votre nom' },
                validEmail: { id: 'validEmail', type: STRING, value: 'Veuillez entrer un email valide' },
                validPhone: { id: 'validPhone', type: STRING, value: 'Veuillez entrer un téléphone valide' },
                acceptTerms: { id: 'acceptTerms', type: STRING, value: 'Vous devez accepter les conditions' }
            }
        },
        // Event type options
        eventTypes: {
            id: 'eventTypes',
            type: STRING,
            children: {
                wedding: { id: 'wedding', type: STRING, value: 'Mariage' },
                weddingDesc: { id: 'weddingDesc', type: STRING, value: 'Célébrez votre jour spécial' },
                corporate: { id: 'corporate', type: STRING, value: 'Corporatif' },
                corporateDesc: { id: 'corporateDesc', type: STRING, value: 'Événements professionnels & conférences' },
                birthday: { id: 'birthday', type: STRING, value: 'Anniversaire' },
                birthdayDesc: { id: 'birthdayDesc', type: STRING, value: 'Célébrations d\'anniversaire' },
                concert: { id: 'concert', type: STRING, value: 'Concert' },
                concertDesc: { id: 'concertDesc', type: STRING, value: 'Spectacles & performances live' }
            }
        },
        // Corporate event types
        corporateTypes: {
            id: 'corporateTypes',
            type: STRING,
            children: {
                conference: { id: 'conference', type: STRING, value: 'Conférence' },
                teambuilding: { id: 'teambuilding', type: STRING, value: 'Team Building' },
                launch: { id: 'launch', type: STRING, value: 'Lancement de Produit' },
                gala: { id: 'gala', type: STRING, value: 'Gala de Remise de Prix' }
            }
        },
        // Ceremony types
        ceremonyTypes: {
            id: 'ceremonyTypes',
            type: STRING,
            children: {
                religious: { id: 'religious', type: STRING, value: 'Religieuse' },
                civil: { id: 'civil', type: STRING, value: 'Civile' },
                symbolic: { id: 'symbolic', type: STRING, value: 'Symbolique' }
            }
        },
        // Music genres
        musicGenres: {
            id: 'musicGenres',
            type: STRING,
            children: {
                rock: { id: 'rock', type: STRING, value: 'Rock' },
                jazz: { id: 'jazz', type: STRING, value: 'Jazz' },
                classical: { id: 'classical', type: STRING, value: 'Classique' },
                pop: { id: 'pop', type: STRING, value: 'Pop' }
            }
        },
        // Venue types
        venueTypes: {
            id: 'venueTypes',
            type: STRING,
            children: {
                indoor: { id: 'indoor', type: STRING, value: 'Lieu Intérieur' },
                outdoor: { id: 'outdoor', type: STRING, value: 'Jardin Extérieur' },
                beach: { id: 'beach', type: STRING, value: 'Plage/Bord de Mer' },
                rooftop: { id: 'rooftop', type: STRING, value: 'Rooftop' },
                ballroom: { id: 'ballroom', type: STRING, value: 'Salle de Bal' }
            }
        },
        // Decor packages
        decorPackages: {
            id: 'decorPackages',
            type: STRING,
            children: {
                classic: { id: 'classic', type: STRING, value: 'Élégance Classique (+800$)' },
                modern: { id: 'modern', type: STRING, value: 'Luxe Moderne (+1200$)' },
                royal: { id: 'royal', type: STRING, value: 'Grandeur Royale (+2000$)' }
            }
        },
        // Catering styles
        cateringStyles: {
            id: 'cateringStyles',
            type: STRING,
            children: {
                buffet: { id: 'buffet', type: STRING, value: 'Buffet' },
                buffetDesc: { id: 'buffetDesc', type: STRING, value: 'Self-service varié' },
                plated: { id: 'plated', type: STRING, value: 'Service à l\'Assiette' },
                platedDesc: { id: 'platedDesc', type: STRING, value: 'Service élégant' },
                stations: { id: 'stations', type: STRING, value: 'Stations Culinaires' },
                stationsDesc: { id: 'stationsDesc', type: STRING, value: 'Restauration interactive' },
                cocktail: { id: 'cocktail', type: STRING, value: 'Cocktail' },
                cocktailDesc: { id: 'cocktailDesc', type: STRING, value: 'Léger & convivial' }
            }
        },
        // Bar packages
        barPackages: {
            id: 'barPackages',
            type: STRING,
            children: {
                standard: { id: 'standard', type: STRING, value: 'Standard' },
                standardDesc: { id: 'standardDesc', type: STRING, value: 'Bière, vin, spiritueux basiques' },
                premium: { id: 'premium', type: STRING, value: 'Premium' },
                premiumDesc: { id: 'premiumDesc', type: STRING, value: 'Spiritueux haut de gamme inclus (+10$/invité)' },
                craft: { id: 'craft', type: STRING, value: 'Cocktails Artisanaux' },
                craftDesc: { id: 'craftDesc', type: STRING, value: 'Menu cocktails personnalisé (+15$/invité)' }
            }
        },
        // Courses
        courses: {
            id: 'courses',
            type: STRING,
            children: {
                three: { id: 'three', type: STRING, value: '3 Plats (Entrée, Plat, Dessert)' },
                four: { id: 'four', type: STRING, value: '4 Plats (+15$/invité)' },
                five: { id: 'five', type: STRING, value: '5 Plats - Menu Dégustation (+30$/invité)' }
            }
        },
        // Music options
        musicOptions: {
            id: 'musicOptions',
            type: STRING,
            children: {
                dj: { id: 'dj', type: STRING, value: 'DJ Professionnel' },
                band: { id: 'band', type: STRING, value: 'Groupe Live' },
                acoustic: { id: 'acoustic', type: STRING, value: 'Duo Acoustique' },
                playlist: { id: 'playlist', type: STRING, value: 'Playlist Personnalisée' }
            }
        },
        // Wedding styles
        weddingStyles: {
            id: 'weddingStyles',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Sélectionner le style' },
                classic: { id: 'classic', type: STRING, value: 'Classique & Élégant' },
                rustic: { id: 'rustic', type: STRING, value: 'Rustique & Champêtre' },
                modern: { id: 'modern', type: STRING, value: 'Moderne & Minimaliste' },
                bohemian: { id: 'bohemian', type: STRING, value: 'Bohème & Libre' }
            }
        },
        // Vow styles
        vowStyles: {
            id: 'vowStyles',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Sélectionner le style de vœux' },
                traditional: { id: 'traditional', type: STRING, value: 'Vœux Traditionnels' },
                personal: { id: 'personal', type: STRING, value: 'Vœux Personnalisés' },
                mixed: { id: 'mixed', type: STRING, value: 'Mix Traditionnel & Personnel' }
            }
        },
        // Officiant types
        officiantTypes: {
            id: 'officiantTypes',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Sélectionner la préférence' },
                religious: { id: 'religious', type: STRING, value: 'Religieux' },
                secular: { id: 'secular', type: STRING, value: 'Officiant Laïque' },
                friend: { id: 'friend', type: STRING, value: 'Ami/Famille (aide pour l\'agrément)' }
            }
        },
        // Ceremony music options
        ceremonyMusicOptions: {
            id: 'ceremonyMusicOptions',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Sélectionner l\'option musicale' },
                live: { id: 'live', type: STRING, value: 'Musiciens Live (+500$)' },
                recorded: { id: 'recorded', type: STRING, value: 'Musique Enregistrée' },
                both: { id: 'both', type: STRING, value: 'Mix Live & Enregistré (+300$)' }
            }
        },
        // Event purposes
        eventPurposes: {
            id: 'eventPurposes',
            type: STRING,
            children: {
                select: { id: 'select', type: STRING, value: 'Sélectionner l\'objectif' },
                conference: { id: 'conference', type: STRING, value: 'Conférence / Séminaire' },
                teambuilding: { id: 'teambuilding', type: STRING, value: 'Team Building' },
                productLaunch: { id: 'productLaunch', type: STRING, value: 'Lancement de Produit' },
                networking: { id: 'networking', type: STRING, value: 'Événement Networking' }
            }
        },
        // DJ styles
        djStyles: {
            id: 'djStyles',
            type: STRING,
            children: {
                top40: { id: 'top40', type: STRING, value: 'Top 40 / Pop' },
                edm: { id: 'edm', type: STRING, value: 'EDM / Dance' },
                hiphop: { id: 'hiphop', type: STRING, value: 'Hip-Hop / R&B' },
                retro: { id: 'retro', type: STRING, value: 'Rétro / 80s-90s' },
                latin: { id: 'latin', type: STRING, value: 'Latin / Salsa' }
            }
        },
        // Band sizes
        bandSizes: {
            id: 'bandSizes',
            type: STRING,
            children: {
                trio: { id: 'trio', type: STRING, value: 'Trio (3 membres)' },
                trioDesc: { id: 'trioDesc', type: STRING, value: 'Son intimiste' },
                quartet: { id: 'quartet', type: STRING, value: 'Quatuor (4 membres)' },
                quartetDesc: { id: 'quartetDesc', type: STRING, value: 'Son complet' },
                full: { id: 'full', type: STRING, value: 'Grand Groupe (6+ membres)' },
                fullDesc: { id: 'fullDesc', type: STRING, value: 'Expérience big band (+1000$)' }
            }
        },
        // Band styles
        bandStyles: {
            id: 'bandStyles',
            type: STRING,
            children: {
                jazz: { id: 'jazz', type: STRING, value: 'Jazz & Swing' },
                rock: { id: 'rock', type: STRING, value: 'Reprises Rock & Pop' },
                soul: { id: 'soul', type: STRING, value: 'Soul & Motown' },
                classical: { id: 'classical', type: STRING, value: 'Ensemble Classique' }
            }
        },
        // Acoustic instruments
        acousticOptions: {
            id: 'acousticOptions',
            type: STRING,
            children: {
                guitarVocal: { id: 'guitarVocal', type: STRING, value: 'Guitare & Chant' },
                violinPiano: { id: 'violinPiano', type: STRING, value: 'Violon & Piano' },
                harp: { id: 'harp', type: STRING, value: 'Harpe Solo' },
                stringQuartet: { id: 'stringQuartet', type: STRING, value: 'Quatuor à Cordes (+200$)' }
            }
        },
        // Media services
        mediaServiceOptions: {
            id: 'mediaServiceOptions',
            type: STRING,
            children: {
                photo: { id: 'photo', type: STRING, value: 'Photographie (1 200$)' },
                video: { id: 'video', type: STRING, value: 'Vidéographie (1 800$)' },
                drone: { id: 'drone', type: STRING, value: 'Prises de Vue Drone (500$)' },
                booth: { id: 'booth', type: STRING, value: 'Photobooth (400$)' }
            }
        },
        // Photo styles
        photoStyles: {
            id: 'photoStyles',
            type: STRING,
            children: {
                traditional: { id: 'traditional', type: STRING, value: 'Traditionnel & Posé' },
                candid: { id: 'candid', type: STRING, value: 'Naturel & Documentaire' },
                artistic: { id: 'artistic', type: STRING, value: 'Artistique & Éditorial' },
                mixed: { id: 'mixed', type: STRING, value: 'Style Mixte' }
            }
        },
        // Video packages
        videoPackages: {
            id: 'videoPackages',
            type: STRING,
            children: {
                highlights: { id: 'highlights', type: STRING, value: 'Montage Best-of' },
                highlightsDesc: { id: 'highlightsDesc', type: STRING, value: 'Montage cinématique 3-5 minutes' },
                documentary: { id: 'documentary', type: STRING, value: 'Documentaire Complet' },
                documentaryDesc: { id: 'documentaryDesc', type: STRING, value: 'Film 15-20 minutes (+500$)' },
                both: { id: 'both', type: STRING, value: 'Les Deux Forfaits' },
                bothDesc: { id: 'bothDesc', type: STRING, value: 'Le meilleur des deux mondes (+800$)' }
            }
        },
        // Drone coverage
        droneCoverage: {
            id: 'droneCoverage',
            type: STRING,
            children: {
                venue: { id: 'venue', type: STRING, value: 'Vues Aériennes du Lieu Uniquement' },
                ceremony: { id: 'ceremony', type: STRING, value: 'Couverture Cérémonie' },
                full: { id: 'full', type: STRING, value: 'Couverture Événement Complet (+200$)' }
            }
        },
        // Booth types
        boothTypes: {
            id: 'boothTypes',
            type: STRING,
            children: {
                classic: { id: 'classic', type: STRING, value: 'Cabine Classique' },
                classicDesc: { id: 'classicDesc', type: STRING, value: 'Expérience photobooth traditionnelle' },
                open: { id: 'open', type: STRING, value: 'Open Air' },
                openDesc: { id: 'openDesc', type: STRING, value: 'Installation fond moderne' },
                video360: { id: 'video360', type: STRING, value: 'Booth Vidéo 360' },
                video360Desc: { id: 'video360Desc', type: STRING, value: 'Vidéos virales (+200$)' }
            }
        },
        // Units
        units: {
            id: 'units',
            type: STRING,
            children: {
                guests: { id: 'guests', type: STRING, value: ' invités' },
                stations: { id: 'stations', type: STRING, value: ' stations' }
            }
        },
        // Common UI text
        common: {
            id: 'common',
            type: STRING,
            children: {
                required: { id: 'required', type: STRING, value: 'Obligatoire' },
                optional: { id: 'optional', type: STRING, value: 'Optionnel' },
                save: { id: 'save', type: STRING, value: 'Sauvegarder' },
                cancel: { id: 'cancel', type: STRING, value: 'Annuler' },
                confirm: { id: 'confirm', type: STRING, value: 'Confirmer' },
                back: { id: 'back', type: STRING, value: 'Retour' },
                continue: { id: 'continue', type: STRING, value: 'Continuer' },
                success: { id: 'success', type: STRING, value: 'Succès!' },
                error: { id: 'error', type: STRING, value: 'Erreur' }
            }
        },
        // Footer
        footer: {
            id: 'footer',
            type: STRING,
            children: {
                text: { id: 'text', type: STRING, value: 'Tout l\'état du formulaire est géré par le système réactif Turing Property' }
            }
        }
    }
};

// ============================================================================
// I18N ROOT PROPERTY
// ============================================================================

export const i18nProperty = {
    id: 'i18n',
    type: UI_I18N,
    metadata: {
        description: { id: 'description', type: STRING, value: 'Internationalization configuration' }
    },
    children: {
        // Current locale (state)
        currentLocale: {
            id: 'currentLocale',
            type: STRING,
            value: 'en'
        },
        // Available locales as children
        locales: {
            id: 'locales',
            type: UI_I18N,
            children: {
                en: enTranslations,
                fr: frTranslations
            }
        }
    }
};
