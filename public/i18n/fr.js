// ============================================================================
// FRENCH TRANSLATIONS (All is Property)
// ============================================================================

import { STRING, LOCALE } from '../common/types.js';

export const frLocale = {
    id: 'fr',
    type: LOCALE,
    metadata: {
        name: { id: 'name', type: STRING, value: 'Français' },
        flag: { id: 'flag', type: STRING, value: '🇫🇷' },
        code: { id: 'code', type: STRING, value: 'fr' }
    },
    children: {
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
        panel: {
            id: 'panel',
            type: STRING,
            children: {
                schemaTitle: { id: 'schemaTitle', type: STRING, value: 'Schéma de Propriété' },
                dataTitle: { id: 'dataTitle', type: STRING, value: 'Données du Formulaire' },
                close: { id: 'close', type: STRING, value: 'Fermer' }
            }
        },
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
        steps: {
            id: 'steps',
            type: STRING,
            children: {
                step1: {
                    id: 'step1', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Bases' },
                        title: { id: 'title', type: STRING, value: 'Détails de l\'Événement' },
                        description: { id: 'description', type: STRING, value: 'Parlez-nous de votre événement' }
                    }
                },
                step2: {
                    id: 'step2', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Lieu' },
                        title: { id: 'title', type: STRING, value: 'Lieu & Traiteur' },
                        description: { id: 'description', type: STRING, value: 'Choisissez votre cadre et menu parfaits' }
                    }
                },
                step3: {
                    id: 'step3', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Extras' },
                        title: { id: 'title', type: STRING, value: 'Divertissement & Médias' },
                        description: { id: 'description', type: STRING, value: 'Rendez votre événement inoubliable' }
                    }
                },
                step4: {
                    id: 'step4', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Fin' },
                        title: { id: 'title', type: STRING, value: 'Contact & Révision' },
                        description: { id: 'description', type: STRING, value: 'Détails finaux et téléchargement d\'inspiration' }
                    }
                },
                ceremony: {
                    id: 'ceremony', type: STRING,
                    children: {
                        tab: { id: 'tab', type: STRING, value: 'Cérémonie' },
                        title: { id: 'title', type: STRING, value: 'Détails de la Cérémonie' },
                        description: { id: 'description', type: STRING, value: 'Planifiez votre cérémonie parfaite' }
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
                        title: { id: 'title', type: STRING, value: 'Type d\'Événement' },
                        description: { id: 'description', type: STRING, value: 'Quel type d\'événement planifiez-vous?' }
                    }
                },
                schedule: {
                    id: 'schedule', type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Horaire' },
                        description: { id: 'description', type: STRING, value: 'Définissez la date, l\'heure et la taille de votre événement' }
                    }
                },
                weddingExtras: {
                    id: 'weddingExtras', type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Options Mariage' },
                        description: { id: 'description', type: STRING, value: 'Options spéciales pour votre mariage' }
                    }
                },
                corporateExtras: {
                    id: 'corporateExtras', type: STRING,
                    children: {
                        title: { id: 'title', type: STRING, value: 'Options Corporatives' },
                        description: { id: 'description', type: STRING, value: 'Options additionnelles pour événements professionnels' }
                    }
                }
            }
        },
        sections: {
            id: 'sections',
            type: STRING,
            children: {
                eventIdentity: { id: 'eventIdentity', type: STRING, value: 'Identité de l\'Événement' },
                dateTime: { id: 'dateTime', type: STRING, value: 'Date & Heure' },
                guestInfo: { id: 'guestInfo', type: STRING, value: 'Informations sur les Invités' }
            }
        },
        fields: {
            id: 'fields',
            type: STRING,
            children: {
                selectEventType: { id: 'selectEventType', type: STRING, value: 'Sélectionner le Type d\'Événement' },
                companyName: { id: 'companyName', type: STRING, value: 'Nom de l\'Entreprise' },
                corporateEventType: { id: 'corporateEventType', type: STRING, value: 'Type d\'Événement Corporatif' },
                coupleNames: { id: 'coupleNames', type: STRING, value: 'Noms du Couple' },
                ceremonyType: { id: 'ceremonyType', type: STRING, value: 'Type de Cérémonie' },
                birthdayPerson: { id: 'birthdayPerson', type: STRING, value: 'Personne Fêtée' },
                turningAge: { id: 'turningAge', type: STRING, value: 'Âge à Célébrer' },
                performerName: { id: 'performerName', type: STRING, value: 'Nom de l\'Artiste/Interprète' },
                musicGenre: { id: 'musicGenre', type: STRING, value: 'Genre Musical' },
                eventName: { id: 'eventName', type: STRING, value: 'Nom de l\'Événement' },
                eventDate: { id: 'eventDate', type: STRING, value: 'Date de l\'Événement' },
                startTime: { id: 'startTime', type: STRING, value: 'Heure de Début' },
                expectedGuests: { id: 'expectedGuests', type: STRING, value: 'Invités Attendus' },
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
                ringBearerRequired: { id: 'ringBearerRequired', type: STRING, value: 'Le nom du porteur est requis quand un porteur est inclus' },
                flowerGirlRequired: { id: 'flowerGirlRequired', type: STRING, value: 'Le nom de la demoiselle est requis quand une demoiselle est incluse' },
                guestCountVenueWarning: { id: 'guestCountVenueWarning', type: STRING, value: 'Pour 200+ invités, une salle de bal ou lieu extérieur est recommandé' },
                officiantRequired: { id: 'officiantRequired', type: STRING, value: 'La préférence d\'officiant est requise quand un officiant est demandé' }
            }
        },
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
        ceremonyTypes: {
            id: 'ceremonyTypes',
            type: STRING,
            children: {
                religious: { id: 'religious', type: STRING, value: 'Cérémonie Religieuse' },
                religiousDesc: { id: 'religiousDesc', type: STRING, value: 'Mariage religieux traditionnel' },
                civil: { id: 'civil', type: STRING, value: 'Cérémonie Civile' },
                civilDesc: { id: 'civilDesc', type: STRING, value: 'Cérémonie civile légale' },
                symbolic: { id: 'symbolic', type: STRING, value: 'Cérémonie Symbolique' },
                symbolicDesc: { id: 'symbolicDesc', type: STRING, value: 'Célébration symbolique personnelle' },
                destination: { id: 'destination', type: STRING, value: 'Mariage de Destination' },
                destinationDesc: { id: 'destinationDesc', type: STRING, value: 'Mariage dans un lieu spécial' }
            }
        },
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
        footer: {
            id: 'footer',
            type: STRING,
            children: {
                text: { id: 'text', type: STRING, value: 'Tout l\'état du formulaire est géré par le système réactif Turing Property' }
            }
        }
    }
};

export default frLocale;
