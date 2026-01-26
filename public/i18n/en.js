// ============================================================================
// ENGLISH TRANSLATIONS (All is Property)
// ============================================================================

import { STRING, LOCALE } from '../common/types.js';

export const enLocale = {
    id: 'en',
    type: LOCALE,
    metadata: {
        name: { id: 'name', type: STRING, value: 'English' },
        flag: { id: 'flag', type: STRING, value: '🇺🇸' },
        code: { id: 'code', type: STRING, value: 'en' }
    },
    children: {
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
        panel: {
            id: 'panel',
            type: STRING,
            children: {
                schemaTitle: { id: 'schemaTitle', type: STRING, value: 'Property Schema' },
                dataTitle: { id: 'dataTitle', type: STRING, value: 'Live Form Data' },
                close: { id: 'close', type: STRING, value: 'Close' }
            }
        },
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
        steps: {
            id: 'steps',
            type: STRING,
            children: {
                step1: {
                    id: 'step1', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Basics' },
                        title: { id: 'title', type: STRING, value: 'Event Details' },
                        description: { id: 'description', type: STRING, value: 'Tell us about your event' }
                    }
                },
                step2: {
                    id: 'step2', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Venue' },
                        title: { id: 'title', type: STRING, value: 'Venue & Catering' },
                        description: { id: 'description', type: STRING, value: 'Choose your perfect setting and menu' }
                    }
                },
                step3: {
                    id: 'step3', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Extras' },
                        title: { id: 'title', type: STRING, value: 'Entertainment & Media' },
                        description: { id: 'description', type: STRING, value: 'Make your event unforgettable' }
                    }
                },
                step4: {
                    id: 'step4', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Finish' },
                        title: { id: 'title', type: STRING, value: 'Contact & Review' },
                        description: { id: 'description', type: STRING, value: 'Final details and upload inspiration' }
                    }
                },
                ceremony: {
                    id: 'ceremony', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Ceremony' },
                        title: { id: 'title', type: STRING, value: 'Wedding Ceremony Details' },
                        description: { id: 'description', type: STRING, value: 'Plan your perfect ceremony' }
                    }
                }
            }
        },
        subSteps: {
            id: 'subSteps',
            type: STRING,
            children: {
                eventType: {
                    id: 'eventType', type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Event Type' },
                        description: { id: 'description', type: STRING, value: 'What kind of event are you planning?' }
                    }
                },
                schedule: {
                    id: 'schedule', type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Schedule' },
                        description: { id: 'description', type: STRING, value: 'Set the date, time, and size of your event' }
                    }
                },
                weddingExtras: {
                    id: 'weddingExtras', type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Wedding Extras' },
                        description: { id: 'description', type: STRING, value: 'Special options for your wedding' }
                    }
                },
                corporateExtras: {
                    id: 'corporateExtras', type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Corporate Options' },
                        description: { id: 'description', type: STRING, value: 'Additional options for corporate events' }
                    }
                }
            }
        },
        sections: {
            id: 'sections',
            type: STRING,
            children: {
                eventIdentity: { id: 'eventIdentity', type: STRING, value: 'Event Identity' },
                dateTime: { id: 'dateTime', type: STRING, value: 'Date & Time' },
                guestInfo: { id: 'guestInfo', type: STRING, value: 'Guest Information' }
            }
        },
        fields: {
            id: 'fields',
            type: STRING,
            children: {
                selectEventType: { id: 'selectEventType', type: STRING, value: 'Select Event Type' },
                companyName: { id: 'companyName', type: STRING, value: 'Company Name' },
                corporateEventType: { id: 'corporateEventType', type: STRING, value: 'Corporate Event Type' },
                coupleNames: { id: 'coupleNames', type: STRING, value: 'Couple Names' },
                ceremonyType: { id: 'ceremonyType', type: STRING, value: 'Ceremony Type' },
                birthdayPerson: { id: 'birthdayPerson', type: STRING, value: 'Birthday Person' },
                turningAge: { id: 'turningAge', type: STRING, value: 'Turning Age' },
                performerName: { id: 'performerName', type: STRING, value: 'Performer/Artist Name' },
                musicGenre: { id: 'musicGenre', type: STRING, value: 'Music Genre' },
                eventName: { id: 'eventName', type: STRING, value: 'Event Name' },
                eventDate: { id: 'eventDate', type: STRING, value: 'Event Date' },
                startTime: { id: 'startTime', type: STRING, value: 'Start Time' },
                expectedGuests: { id: 'expectedGuests', type: STRING, value: 'Expected Guests' },
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
                ringBearerRequired: { id: 'ringBearerRequired', type: STRING, value: 'Ring bearer name is required when ring bearer is included' },
                flowerGirlRequired: { id: 'flowerGirlRequired', type: STRING, value: 'Flower girl name is required when flower girl is included' },
                guestCountVenueWarning: { id: 'guestCountVenueWarning', type: STRING, value: 'Large guest count (200+) recommended with ballroom or outdoor venue' },
                officiantRequired: { id: 'officiantRequired', type: STRING, value: 'Officiant preference required when officiant is needed' }
            }
        },
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
        ceremonyTypes: {
            id: 'ceremonyTypes',
            type: STRING,
            children: {
                religious: { id: 'religious', type: STRING, value: 'Religious Ceremony' },
                religiousDesc: { id: 'religiousDesc', type: STRING, value: 'Traditional religious wedding' },
                civil: { id: 'civil', type: STRING, value: 'Civil Ceremony' },
                civilDesc: { id: 'civilDesc', type: STRING, value: 'Legal civil ceremony' },
                symbolic: { id: 'symbolic', type: STRING, value: 'Symbolic Ceremony' },
                symbolicDesc: { id: 'symbolicDesc', type: STRING, value: 'Personal symbolic celebration' },
                destination: { id: 'destination', type: STRING, value: 'Destination Wedding' },
                destinationDesc: { id: 'destinationDesc', type: STRING, value: 'Wedding at a special location' }
            }
        },
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
        footer: {
            id: 'footer',
            type: STRING,
            children: {
                text: { id: 'text', type: STRING, value: 'All form state managed by reactive Turing Property system' }
            }
        }
    }
};

export default enLocale;
