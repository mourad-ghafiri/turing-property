// ============================================================================
// EVENT PLANNING WIZARD - Complete Wizard with Conditional Steps & SubSteps
// ============================================================================
// Demonstrates:
// - Conditional SUBSTEPS (Wedding Extras, Corporate Options in Step 1)
// - Conditional STEP (Wedding Ceremony - Step 3, only for weddings)
// - Reactive computed total
// - Field visibility based on other fields

import { TYPE, CONSTRAINT, lit, ref, op } from '../.././dist/index.js';
import { STRING, NUMBER, BOOLEAN, WIZARD, STEP, SUBSTEP, SECTION } from '../../common/types.js';
import {
    INPUT_TEXT, INPUT_SELECT, INPUT_RADIO,
    INPUT_RANGE, INPUT_DATE, INPUT_TIME, INPUT_TOGGLE, INPUT_TEXTAREA,
    INPUT_MULTISELECT, INPUT_COLOR, INPUT_RATING, INPUT_TAGS, INPUT_FILE,
    INPUT_CHECKBOX, INPUT_SUBSTEP, INPUT_SECTION,
    REQUIRED_TRUE, COLLAPSIBLE_TRUE, DEFAULT_EXPANDED_TRUE,
    HAS_SUBSTEPS_TRUE, ICON_WARNING, MULTIPLE_TRUE,
    MULTISELECT_SELECTED_LABEL, MULTISELECT_UNSELECTED_LABEL,
    MULTISELECT_SELECTED_BOX, MULTISELECT_UNSELECTED_BOX, MULTISELECT_CHECK_ICON,
    ACCEPT_IMAGES_PDF, MAX_SIZE_10MB
} from '../../common/metadata.js';
import { REQUIRED, minLength, EMAIL, PHONE, MUST_BE_TRUE } from '../../common/constraints.js';

// ============================================================================
// HELPERS
// ============================================================================

const createStepMeta = (stepNum) => ({
    // Computed state (ALL computed values in metadata per best practices!)
    isActive: op('eq', ref(['root', 'wizard', 'currentStep', 'value']), lit(stepNum)),
    isVisited: op('lte', lit(stepNum), ref(['root', 'wizard', 'highestVisitedStep', 'value'])),
    isValid: ref(['root', 'wizard', `step${stepNum}Valid`, 'value']),
    // isComplete = visited AND valid (for green color)
    isComplete: op('and',
        op('lte', lit(stepNum), ref(['root', 'wizard', 'highestVisitedStep', 'value'])),
        ref(['root', 'wizard', `step${stepNum}Valid`, 'value'])
    ),
    // hasErrors = visited AND NOT valid (for red color)
    hasErrors: op('and',
        op('lte', lit(stepNum), ref(['root', 'wizard', 'highestVisitedStep', 'value'])),
        op('not', ref(['root', 'wizard', `step${stepNum}Valid`, 'value']))
    ),
    // isClickable = visited AND all previous steps are valid
    isClickable: op('and',
        op('lte', lit(stepNum), ref(['root', 'wizard', 'highestVisitedStep', 'value'])),
        // For step 1, always clickable if visited. For others, check previous step validity
        stepNum === 1 ? lit(true) : ref(['root', 'wizard', `step${stepNum - 1}Valid`, 'value'])
    ),
    ...ICON_WARNING
});

const option = (id, value, labelKey, extra = {}) => ({
    id, type: STRING, value,
    metadata: { label: op('t', lit(labelKey)), ...extra }
});

const staticOption = (id, value, label, extra = {}) => ({
    id, type: STRING, value,
    metadata: { label: lit(label), ...extra }
});

// ============================================================================
// EVENT WIZARD
// ============================================================================

export const eventWizard = {
    id: 'eventWizard',
    type: WIZARD,
    metadata: {
        title: op('t', lit('wizard.title')),
        description: op('t', lit('wizard.description'))
    },
    children: {
        // ====================================================================
        // NAVIGATION STATE
        // ====================================================================
        currentStep: { id: 'currentStep', type: NUMBER, value: 1 },
        totalSteps: { id: 'totalSteps', type: NUMBER, value: 5 },
        highestVisitedStep: { id: 'highestVisitedStep', type: NUMBER, value: 1 },

        // ====================================================================
        // COMPUTED UI STATE
        // ====================================================================
        progressBarWidth: {
            id: 'progressBarWidth', type: STRING,
            value: op('concat',
                op('toString', op('mul', op('div', ref(['self', 'parent', 'currentStep', 'value']), ref(['self', 'parent', 'totalSteps', 'value'])), lit(100))),
                lit('%')
            )
        },
        progressText: {
            id: 'progressText', type: STRING,
            value: op('concat',
                op('toString', op('mul', op('div', ref(['self', 'parent', 'currentStep', 'value']), ref(['self', 'parent', 'totalSteps', 'value'])), lit(100))),
                lit('%')
            )
        },
        prevButtonDisabled: {
            id: 'prevButtonDisabled', type: BOOLEAN,
            value: op('eq', ref(['self', 'parent', 'currentStep', 'value']), lit(1))
        },
        isLastStep: {
            id: 'isLastStep', type: BOOLEAN,
            value: op('eq', ref(['self', 'parent', 'currentStep', 'value']), ref(['self', 'parent', 'totalSteps', 'value']))
        },
        // Current step validity (for Next button disabled state)
        currentStepValid: {
            id: 'currentStepValid', type: BOOLEAN,
            value: op('if', op('eq', ref(['self', 'parent', 'currentStep', 'value']), lit(1)),
                ref(['self', 'parent', 'step1Valid', 'value']),
                op('if', op('eq', ref(['self', 'parent', 'currentStep', 'value']), lit(2)),
                    ref(['self', 'parent', 'step2Valid', 'value']),
                    op('if', op('eq', ref(['self', 'parent', 'currentStep', 'value']), lit(3)),
                        ref(['self', 'parent', 'step3Valid', 'value']),
                        op('if', op('eq', ref(['self', 'parent', 'currentStep', 'value']), lit(4)),
                            ref(['self', 'parent', 'step4Valid', 'value']),
                            ref(['self', 'parent', 'step5Valid', 'value'])
                        )
                    )
                )
            )
        },

        // ====================================================================
        // STEP VALIDATION
        // ====================================================================
        step1Valid: {
            id: 'step1Valid', type: BOOLEAN,
            value: op('and',
                // Type substep: eventType selected
                op('neq', ref(['root', 'wizard', 'step1', 'typeSubStep', 'eventType', 'value']), lit('')),
                op('and',
                    // Details substep: required fields filled
                    op('gte', op('strlen', ref(['root', 'wizard', 'step1', 'detailsSubStep', 'identitySection', 'eventName', 'value'])), lit(3)),
                    op('and',
                        op('neq', ref(['root', 'wizard', 'step1', 'detailsSubStep', 'scheduleSection', 'eventDate', 'value']), lit('')),
                        op('and',
                            op('neq', ref(['root', 'wizard', 'step1', 'detailsSubStep', 'scheduleSection', 'eventTime', 'value']), lit('')),
                            op('and',
                                // Wedding Extras: valid if NOT wedding OR (weddingStyle + cross-field constraints)
                                op('or',
                                    op('neq', ref(['root', 'wizard', 'step1', 'typeSubStep', 'eventType', 'value']), lit('wedding')),
                                    op('and',
                                        op('neq', ref(['root', 'wizard', 'step1', 'weddingExtrasSubStep', 'weddingStyle', 'value']), lit('')),
                                        op('and',
                                            // CROSS-FIELD: Ring bearer name if enabled
                                            op('or',
                                                op('not', ref(['root', 'wizard', 'step1', 'weddingExtrasSubStep', 'hasRingBearer', 'value'])),
                                                op('gte', op('strlen', ref(['root', 'wizard', 'step1', 'weddingExtrasSubStep', 'ringBearerName', 'value'])), lit(2))
                                            ),
                                            // CROSS-FIELD: Flower girl name if enabled
                                            op('or',
                                                op('not', ref(['root', 'wizard', 'step1', 'weddingExtrasSubStep', 'hasFlowerGirl', 'value'])),
                                                op('gte', op('strlen', ref(['root', 'wizard', 'step1', 'weddingExtrasSubStep', 'flowerGirlName', 'value'])), lit(2))
                                            )
                                        )
                                    )
                                ),
                                // Corporate Extras: valid if NOT corporate OR eventPurpose selected
                                op('or',
                                    op('neq', ref(['root', 'wizard', 'step1', 'typeSubStep', 'eventType', 'value']), lit('corporate')),
                                    op('neq', ref(['root', 'wizard', 'step1', 'corporateExtrasSubStep', 'eventPurpose', 'value']), lit(''))
                                )
                            )
                        )
                    )
                )
            )
        },
        step2Valid: {
            id: 'step2Valid', type: BOOLEAN,
            value: op('and',
                op('neq', ref(['root', 'wizard', 'step2', 'venueType', 'value']), lit('')),
                op('neq', ref(['root', 'wizard', 'step2', 'cateringStyle', 'value']), lit(''))
            )
        },
        // Step 3 (Wedding Ceremony) - valid if not wedding OR (ceremony type + cross-field constraints)
        step3Valid: {
            id: 'step3Valid', type: BOOLEAN,
            value: op('or',
                // If not wedding, step is valid (skipped)
                op('neq', ref(['root', 'wizard', 'step1', 'typeSubStep', 'eventType', 'value']), lit('wedding')),
                // If wedding: ceremony type selected AND cross-field constraint for officiant
                op('and',
                    op('neq', ref(['root', 'wizard', 'step3', 'ceremonyType', 'value']), lit('')),
                    // CROSS-FIELD CONSTRAINT: Officiant preference required if hasOfficiant is true
                    op('or',
                        op('not', ref(['root', 'wizard', 'step3', 'hasOfficiant', 'value'])),
                        op('neq', ref(['root', 'wizard', 'step3', 'officiantPreference', 'value']), lit(''))
                    )
                )
            )
        },
        step4Valid: {
            id: 'step4Valid', type: BOOLEAN,
            value: op('neq', ref(['root', 'wizard', 'step4', 'musicOption', 'value']), lit(''))
        },
        step5Valid: {
            id: 'step5Valid', type: BOOLEAN,
            value: op('and',
                op('gte', op('strlen', ref(['root', 'wizard', 'step5', 'contactName', 'value'])), lit(2)),
                op('and',
                    op('isEmail', ref(['root', 'wizard', 'step5', 'contactEmail', 'value'])),
                    op('and',
                        op('gte', op('strlen', ref(['root', 'wizard', 'step5', 'contactPhone', 'value'])), lit(10)),
                        ref(['root', 'wizard', 'step5', 'termsAccepted', 'value'])
                    )
                )
            )
        },

        isWizardComplete: {
            id: 'isWizardComplete', type: BOOLEAN,
            value: op('and',
                ref(['root', 'wizard', 'step1Valid', 'value']),
                op('and',
                    ref(['root', 'wizard', 'step2Valid', 'value']),
                    op('and',
                        ref(['root', 'wizard', 'step3Valid', 'value']),
                        op('and',
                            ref(['root', 'wizard', 'step4Valid', 'value']),
                            ref(['root', 'wizard', 'step5Valid', 'value'])
                        )
                    )
                )
            )
        },

        // ====================================================================
        // ESTIMATED TOTAL (reactive to all selections)
        // ====================================================================
        estimatedTotal: {
            id: 'estimatedTotal', type: NUMBER,
            value: op('add',
                // Base catering cost: guests × price per guest
                op('mul',
                    ref(['root', 'wizard', 'step1', 'detailsSubStep', 'guestSection', 'guestCount', 'value']),
                    op('if', op('eq', ref(['root', 'wizard', 'step2', 'cateringStyle', 'value']), lit('buffet')), lit(45),
                        op('if', op('eq', ref(['root', 'wizard', 'step2', 'cateringStyle', 'value']), lit('plated')), lit(75),
                            op('if', op('eq', ref(['root', 'wizard', 'step2', 'cateringStyle', 'value']), lit('stations')), lit(60),
                                op('if', op('eq', ref(['root', 'wizard', 'step2', 'cateringStyle', 'value']), lit('cocktail')), lit(35),
                                    lit(0)))))
                ),
                op('add',
                    // Dietary options: +$5/guest if enabled
                    op('if',
                        op('eq', ref(['root', 'wizard', 'step2', 'dietaryOptions', 'value']), lit(true)),
                        op('mul', ref(['root', 'wizard', 'step1', 'detailsSubStep', 'guestSection', 'guestCount', 'value']), lit(5)),
                        lit(0)
                    ),
                    op('add',
                        // Open bar cost if enabled
                        op('if',
                            op('eq', ref(['root', 'wizard', 'step2', 'openBar', 'value']), lit(true)),
                            op('mul',
                                ref(['root', 'wizard', 'step1', 'detailsSubStep', 'guestSection', 'guestCount', 'value']),
                                op('if', op('eq', ref(['root', 'wizard', 'step2', 'barPackage', 'value']), lit('beer_wine')), lit(15),
                                    op('if', op('eq', ref(['root', 'wizard', 'step2', 'barPackage', 'value']), lit('standard')), lit(25),
                                        op('if', op('eq', ref(['root', 'wizard', 'step2', 'barPackage', 'value']), lit('premium')), lit(40),
                                            op('if', op('eq', ref(['root', 'wizard', 'step2', 'barPackage', 'value']), lit('top_shelf')), lit(60),
                                                lit(0)))))
                            ),
                            lit(0)
                        ),
                        op('add',
                            // Entertainment cost
                            op('if', op('eq', ref(['root', 'wizard', 'step4', 'musicOption', 'value']), lit('dj')), lit(800),
                                op('if', op('eq', ref(['root', 'wizard', 'step4', 'musicOption', 'value']), lit('band')), lit(2500),
                                    op('if', op('eq', ref(['root', 'wizard', 'step4', 'musicOption', 'value']), lit('acoustic')), lit(600),
                                        op('if', op('eq', ref(['root', 'wizard', 'step4', 'musicOption', 'value']), lit('playlist')), lit(100),
                                            lit(0))))),
                            op('add',
                                // Decoration budget
                                ref(['root', 'wizard', 'step4', 'decorationBudget', 'value']),
                                // Tent cost if required
                                op('if',
                                    op('eq', ref(['root', 'wizard', 'step2', 'outdoorTentRequired', 'value']), lit(true)),
                                    lit(1500),
                                    lit(0)
                                )
                            )
                        )
                    )
                )
            )
        },

        // ====================================================================
        // STEP 1: Event Basics (with CONDITIONAL SUBSTEPS)
        // ====================================================================
        step1: {
            id: 'step1', type: STEP,
            metadata: {
                tabTitle: op('t', lit('steps.step1.tab')),
                stepTitle: op('t', lit('steps.step1.title')),
                stepDescription: op('t', lit('steps.step1.description')),
                stepNumber: { id: 'stepNumber', type: NUMBER, value: 1 },
                ...HAS_SUBSTEPS_TRUE,
                ...createStepMeta(1)
            },
            children: {
                currentSubStep: { id: 'currentSubStep', type: NUMBER, value: 1 },

                // SUBSTEP 1: Event Type Selection
                typeSubStep: {
                    id: 'typeSubStep', type: SUBSTEP,
                    metadata: {
                        ...INPUT_SUBSTEP,
                        subStepTitle: op('t', lit('subSteps.eventType.title')),
                        subStepIcon: { id: 'subStepIcon', type: STRING, value: '1' },
                        subStepDescription: op('t', lit('subSteps.eventType.description')),
                        subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 1 },
                        // isComplete: event type is selected
                        isComplete: op('neq', ref(['self', 'eventType', 'value']), lit('')),
                        // hasErrors: visited but not complete
                        hasErrors: op('and',
                            op('gte', ref(['root', 'wizard', 'highestVisitedStep', 'value']), lit(1)),
                            op('eq', ref(['self', 'eventType', 'value']), lit(''))
                        ),
                        ...ICON_WARNING
                    },
                    children: {
                        eventType: {
                            id: 'eventType', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.selectEventType')),
                                ...REQUIRED_TRUE,
                                ...INPUT_RADIO,
                                options: { id: 'options', type: TYPE, value: [
                                    option('wedding', 'wedding', 'eventTypes.wedding', { icon: { id: 'icon', type: STRING, value: '💒' }, description: op('t', lit('eventTypes.weddingDesc')) }),
                                    option('corporate', 'corporate', 'eventTypes.corporate', { icon: { id: 'icon', type: STRING, value: '🏢' }, description: op('t', lit('eventTypes.corporateDesc')) }),
                                    option('birthday', 'birthday', 'eventTypes.birthday', { icon: { id: 'icon', type: STRING, value: '🎂' }, description: op('t', lit('eventTypes.birthdayDesc')) }),
                                    option('concert', 'concert', 'eventTypes.concert', { icon: { id: 'icon', type: STRING, value: '🎵' }, description: op('t', lit('eventTypes.concertDesc')) })
                                ]}
                            },
                            constraints: { required: { ...REQUIRED } }
                        },
                        // Conditional field: Company Name (corporate only)
                        companyName: {
                            id: 'companyName', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.companyName')),
                                placeholder: op('t', lit('placeholders.companyName')),
                                ...INPUT_TEXT,
                                visible: op('eq', ref(['self', 'parent', 'eventType', 'value']), lit('corporate'))
                            }
                        },
                        // Conditional field: Couple Names (wedding only)
                        coupleNames: {
                            id: 'coupleNames', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.coupleNames')),
                                placeholder: op('t', lit('placeholders.coupleNames')),
                                ...INPUT_TEXT,
                                visible: op('eq', ref(['self', 'parent', 'eventType', 'value']), lit('wedding'))
                            }
                        },
                        // Conditional field: Birthday Person (birthday only)
                        birthdayPerson: {
                            id: 'birthdayPerson', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.birthdayPerson')),
                                placeholder: op('t', lit('placeholders.birthdayPerson')),
                                ...INPUT_TEXT,
                                visible: op('eq', ref(['self', 'parent', 'eventType', 'value']), lit('birthday'))
                            }
                        },
                        // Conditional field: Performer Name (concert only)
                        performerName: {
                            id: 'performerName', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.performerName')),
                                placeholder: op('t', lit('placeholders.performerName')),
                                ...INPUT_TEXT,
                                visible: op('eq', ref(['self', 'parent', 'eventType', 'value']), lit('concert'))
                            }
                        }
                    }
                },

                // SUBSTEP 2: Schedule & Details
                detailsSubStep: {
                    id: 'detailsSubStep', type: SUBSTEP,
                    metadata: {
                        ...INPUT_SUBSTEP,
                        subStepTitle: op('t', lit('subSteps.schedule.title')),
                        subStepIcon: { id: 'subStepIcon', type: STRING, value: '2' },
                        subStepDescription: op('t', lit('subSteps.schedule.description')),
                        subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 2 },
                        // isComplete: all required fields filled
                        isComplete: op('and',
                            op('gte', op('strlen', ref(['self', 'identitySection', 'eventName', 'value'])), lit(3)),
                            op('and',
                                op('neq', ref(['self', 'scheduleSection', 'eventDate', 'value']), lit('')),
                                op('neq', ref(['self', 'scheduleSection', 'eventTime', 'value']), lit(''))
                            )
                        ),
                        // hasErrors: visited but not complete
                        hasErrors: op('and',
                            op('gte', ref(['root', 'wizard', 'highestVisitedStep', 'value']), lit(1)),
                            op('or',
                                op('lt', op('strlen', ref(['self', 'identitySection', 'eventName', 'value'])), lit(3)),
                                op('or',
                                    op('eq', ref(['self', 'scheduleSection', 'eventDate', 'value']), lit('')),
                                    op('eq', ref(['self', 'scheduleSection', 'eventTime', 'value']), lit(''))
                                )
                            )
                        ),
                        ...ICON_WARNING
                    },
                    children: {
                        identitySection: {
                            id: 'identitySection', type: SECTION,
                            metadata: {
                                ...INPUT_SECTION,
                                sectionTitle: op('t', lit('sections.eventIdentity')),
                                sectionIcon: { id: 'sectionIcon', type: STRING, value: '✨' },
                                ...COLLAPSIBLE_TRUE, ...DEFAULT_EXPANDED_TRUE
                            },
                            children: {
                                eventName: {
                                    id: 'eventName', type: STRING, value: '',
                                    metadata: {
                                        label: op('t', lit('fields.eventName')),
                                        placeholder: op('t', lit('placeholders.eventName')),
                                        ...REQUIRED_TRUE, ...INPUT_TEXT
                                    },
                                    constraints: {
                                        required: { ...REQUIRED },
                                        minLength: minLength(3, 'Event name must be at least 3 characters')
                                    }
                                }
                            }
                        },
                        scheduleSection: {
                            id: 'scheduleSection', type: SECTION,
                            metadata: {
                                ...INPUT_SECTION,
                                sectionTitle: op('t', lit('sections.dateTime')),
                                sectionIcon: { id: 'sectionIcon', type: STRING, value: '🕐' },
                                ...COLLAPSIBLE_TRUE, ...DEFAULT_EXPANDED_TRUE
                            },
                            children: {
                                eventDate: {
                                    id: 'eventDate', type: STRING, value: '',
                                    metadata: { label: op('t', lit('fields.eventDate')), ...REQUIRED_TRUE, ...INPUT_DATE },
                                    constraints: { required: { ...REQUIRED } }
                                },
                                eventTime: {
                                    id: 'eventTime', type: STRING, value: '',
                                    metadata: { label: op('t', lit('fields.startTime')), ...REQUIRED_TRUE, ...INPUT_TIME },
                                    constraints: { required: { ...REQUIRED } }
                                }
                            }
                        },
                        guestSection: {
                            id: 'guestSection', type: SECTION,
                            metadata: {
                                ...INPUT_SECTION,
                                sectionTitle: op('t', lit('sections.guestInfo')),
                                sectionIcon: { id: 'sectionIcon', type: STRING, value: '👥' },
                                ...COLLAPSIBLE_TRUE, ...DEFAULT_EXPANDED_TRUE
                            },
                            children: {
                                guestCount: {
                                    id: 'guestCount', type: NUMBER, value: 50,
                                    metadata: {
                                        label: op('t', lit('fields.expectedGuests')),
                                        ...INPUT_RANGE,
                                        min: { id: 'min', type: NUMBER, value: 10 },
                                        max: { id: 'max', type: NUMBER, value: 500 },
                                        step: { id: 'step', type: NUMBER, value: 10 }
                                    }
                                }
                            }
                        }
                    }
                },

                // CONDITIONAL SUBSTEP 3: Wedding Extras (only for weddings)
                weddingExtrasSubStep: {
                    id: 'weddingExtrasSubStep', type: SUBSTEP,
                    metadata: {
                        ...INPUT_SUBSTEP,
                        subStepTitle: op('t', lit('subSteps.weddingExtras.title')),
                        subStepIcon: { id: 'subStepIcon', type: STRING, value: '💍' },
                        subStepDescription: op('t', lit('subSteps.weddingExtras.description')),
                        subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 3 },
                        // CONDITIONAL: Only visible for weddings
                        visible: op('eq', ref(['root', 'wizard', 'step1', 'typeSubStep', 'eventType', 'value']), lit('wedding')),
                        // isComplete: weddingStyle AND cross-field constraints pass
                        isComplete: op('and',
                            op('neq', ref(['self', 'weddingStyle', 'value']), lit('')),
                            op('and',
                                // CROSS-FIELD: Ring bearer name required if ring bearer enabled
                                op('or',
                                    op('not', ref(['self', 'hasRingBearer', 'value'])),
                                    op('gte', op('strlen', ref(['self', 'ringBearerName', 'value'])), lit(2))
                                ),
                                // CROSS-FIELD: Flower girl name required if flower girl enabled
                                op('or',
                                    op('not', ref(['self', 'hasFlowerGirl', 'value'])),
                                    op('gte', op('strlen', ref(['self', 'flowerGirlName', 'value'])), lit(2))
                                )
                            )
                        ),
                        // hasErrors: visited AND not complete
                        hasErrors: op('and',
                            op('gte', ref(['root', 'wizard', 'highestVisitedStep', 'value']), lit(1)),
                            op('not', op('and',
                                op('neq', ref(['self', 'weddingStyle', 'value']), lit('')),
                                op('and',
                                    op('or',
                                        op('not', ref(['self', 'hasRingBearer', 'value'])),
                                        op('gte', op('strlen', ref(['self', 'ringBearerName', 'value'])), lit(2))
                                    ),
                                    op('or',
                                        op('not', ref(['self', 'hasFlowerGirl', 'value'])),
                                        op('gte', op('strlen', ref(['self', 'flowerGirlName', 'value'])), lit(2))
                                    )
                                )
                            ))
                        ),
                        ...ICON_WARNING
                    },
                    children: {
                        weddingStyle: {
                            id: 'weddingStyle', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.weddingStyle')),
                                ...REQUIRED_TRUE,
                                ...INPUT_SELECT,
                                options: { id: 'options', type: TYPE, value: [
                                    option('empty', '', 'weddingStyles.select'),
                                    option('classic', 'classic', 'weddingStyles.classic'),
                                    option('rustic', 'rustic', 'weddingStyles.rustic'),
                                    option('modern', 'modern', 'weddingStyles.modern'),
                                    option('bohemian', 'bohemian', 'weddingStyles.bohemian')
                                ]}
                            },
                            constraints: { required: { ...REQUIRED } }
                        },
                        hasRingBearer: {
                            id: 'hasRingBearer', type: BOOLEAN, value: false,
                            metadata: { label: op('t', lit('fields.hasRingBearer')), ...INPUT_TOGGLE }
                        },
                        // CROSS-FIELD CONSTRAINT: ringBearerName required if hasRingBearer is true
                        ringBearerName: {
                            id: 'ringBearerName', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.ringBearerName')),
                                placeholder: op('t', lit('placeholders.fullName')),
                                // Dynamically required based on cross-field reference
                                required: ref(['self', 'parent', 'hasRingBearer', 'value']),
                                ...INPUT_TEXT,
                                visible: ref(['self', 'parent', 'hasRingBearer', 'value'])
                            },
                            constraints: {
                                // CROSS-FIELD CONSTRAINT: Validates only when hasRingBearer is true
                                conditionalRequired: {
                                    id: 'conditionalRequired',
                                    type: CONSTRAINT,
                                    value: op('or',
                                        op('not', ref(['self', 'parent', 'hasRingBearer', 'value'])),
                                        op('gte', op('strlen', ref('self.value')), lit(2))
                                    ),
                                    metadata: {
                                        message: { id: 'message', type: STRING, value: 'Ring bearer name is required (min 2 characters)' }
                                    }
                                }
                            }
                        },
                        hasFlowerGirl: {
                            id: 'hasFlowerGirl', type: BOOLEAN, value: false,
                            metadata: { label: op('t', lit('fields.hasFlowerGirl')), ...INPUT_TOGGLE }
                        },
                        // CROSS-FIELD CONSTRAINT: flowerGirlName required if hasFlowerGirl is true
                        flowerGirlName: {
                            id: 'flowerGirlName', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.flowerGirlName')),
                                placeholder: op('t', lit('placeholders.fullName')),
                                required: ref(['self', 'parent', 'hasFlowerGirl', 'value']),
                                ...INPUT_TEXT,
                                visible: ref(['self', 'parent', 'hasFlowerGirl', 'value'])
                            },
                            constraints: {
                                // CROSS-FIELD CONSTRAINT: Validates only when hasFlowerGirl is true
                                conditionalRequired: {
                                    id: 'conditionalRequired',
                                    type: CONSTRAINT,
                                    value: op('or',
                                        op('not', ref(['self', 'parent', 'hasFlowerGirl', 'value'])),
                                        op('gte', op('strlen', ref('self.value')), lit(2))
                                    ),
                                    metadata: {
                                        message: { id: 'message', type: STRING, value: 'Flower girl name is required (min 2 characters)' }
                                    }
                                }
                            }
                        }
                    }
                },

                // CONDITIONAL SUBSTEP 4: Corporate Options (only for corporate)
                corporateExtrasSubStep: {
                    id: 'corporateExtrasSubStep', type: SUBSTEP,
                    metadata: {
                        ...INPUT_SUBSTEP,
                        subStepTitle: op('t', lit('subSteps.corporateExtras.title')),
                        subStepIcon: { id: 'subStepIcon', type: STRING, value: '📊' },
                        subStepDescription: op('t', lit('subSteps.corporateExtras.description')),
                        subStepNumber: { id: 'subStepNumber', type: NUMBER, value: 4 },
                        // CONDITIONAL: Only visible for corporate
                        visible: op('eq', ref(['root', 'wizard', 'step1', 'typeSubStep', 'eventType', 'value']), lit('corporate')),
                        // isComplete: eventPurpose is selected
                        isComplete: op('neq', ref(['self', 'eventPurpose', 'value']), lit('')),
                        // hasErrors: visited AND not complete
                        hasErrors: op('and',
                            op('gte', ref(['root', 'wizard', 'highestVisitedStep', 'value']), lit(1)),
                            op('eq', ref(['self', 'eventPurpose', 'value']), lit(''))
                        ),
                        ...ICON_WARNING
                    },
                    children: {
                        eventPurpose: {
                            id: 'eventPurpose', type: STRING, value: '',
                            metadata: {
                                label: op('t', lit('fields.eventPurpose')),
                                ...REQUIRED_TRUE,
                                ...INPUT_SELECT,
                                options: { id: 'options', type: TYPE, value: [
                                    option('empty', '', 'eventPurposes.select'),
                                    option('conference', 'conference', 'eventPurposes.conference'),
                                    option('teambuilding', 'teambuilding', 'eventPurposes.teambuilding'),
                                    option('product_launch', 'product_launch', 'eventPurposes.productLaunch'),
                                    option('networking', 'networking', 'eventPurposes.networking')
                                ]}
                            },
                            constraints: { required: { ...REQUIRED } }
                        },
                        needsAV: {
                            id: 'needsAV', type: BOOLEAN, value: false,
                            metadata: {
                                label: op('t', lit('fields.needsAV')),
                                hint: lit('Projector, screens, microphones'),
                                ...INPUT_TOGGLE
                            }
                        },
                        // CROSS-STEP CONSTRAINT: Warning if 200+ guests and no AV equipment
                        expectedROI: {
                            id: 'expectedROI', type: NUMBER, value: 3,
                            metadata: {
                                label: op('t', lit('fields.expectedROI')),
                                hint: lit('Rate expected return on investment'),
                                ...INPUT_RATING,
                                max: { id: 'max', type: NUMBER, value: 5 }
                            }
                        }
                    }
                }
            }
        },

        // ====================================================================
        // STEP 2: Venue & Catering
        // ====================================================================
        step2: {
            id: 'step2', type: STEP,
            metadata: {
                tabTitle: op('t', lit('steps.step2.tab')),
                stepTitle: op('t', lit('steps.step2.title')),
                stepDescription: op('t', lit('steps.step2.description')),
                stepNumber: { id: 'stepNumber', type: NUMBER, value: 2 },
                ...createStepMeta(2)
            },
            children: {
                venueType: {
                    id: 'venueType', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.venueType')),
                        ...REQUIRED_TRUE, ...INPUT_SELECT,
                        options: { id: 'options', type: TYPE, value: [
                            option('empty', '', 'placeholders.selectVenue'),
                            option('indoor', 'indoor', 'venueTypes.indoor'),
                            option('outdoor', 'outdoor', 'venueTypes.outdoor'),
                            option('beach', 'beach', 'venueTypes.beach'),
                            option('rooftop', 'rooftop', 'venueTypes.rooftop'),
                            option('ballroom', 'ballroom', 'venueTypes.ballroom')
                        ]},
                        // CROSS-STEP CONSTRAINT: Warning when guest count > 200 with indoor venue
                        warning: op('if',
                            op('and',
                                op('gt', ref(['root', 'wizard', 'step1', 'detailsSubStep', 'guestSection', 'guestCount', 'value']), lit(200)),
                                op('eq', ref('self.value'), lit('indoor'))
                            ),
                            op('t', lit('fields.guestCountVenueWarning')),
                            lit('')
                        )
                    },
                    constraints: { required: { ...REQUIRED } }
                },
                // Conditional: Tent option for outdoor venues
                outdoorTentRequired: {
                    id: 'outdoorTentRequired', type: BOOLEAN, value: false,
                    metadata: {
                        label: lit('Tent/Canopy Required (+$1,500)'),
                        hint: lit('Recommended for outdoor events'),
                        ...INPUT_TOGGLE,
                        visible: op('or',
                            op('eq', ref(['self', 'parent', 'venueType', 'value']), lit('outdoor')),
                            op('or',
                                op('eq', ref(['self', 'parent', 'venueType', 'value']), lit('beach')),
                                op('eq', ref(['self', 'parent', 'venueType', 'value']), lit('rooftop'))
                            )
                        )
                    }
                },
                cateringStyle: {
                    id: 'cateringStyle', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.cateringStyle')),
                        ...REQUIRED_TRUE, ...INPUT_RADIO,
                        options: { id: 'options', type: TYPE, value: [
                            option('buffet', 'buffet', 'cateringStyles.buffet', { icon: { id: 'icon', type: STRING, value: '🍽️' }, description: op('t', lit('cateringStyles.buffetDesc')), price: { id: 'price', type: STRING, value: '$45/guest' } }),
                            option('plated', 'plated', 'cateringStyles.plated', { icon: { id: 'icon', type: STRING, value: '🍴' }, description: op('t', lit('cateringStyles.platedDesc')), price: { id: 'price', type: STRING, value: '$75/guest' } }),
                            option('stations', 'stations', 'cateringStyles.stations', { icon: { id: 'icon', type: STRING, value: '🍲' }, description: op('t', lit('cateringStyles.stationsDesc')), price: { id: 'price', type: STRING, value: '$60/guest' } }),
                            option('cocktail', 'cocktail', 'cateringStyles.cocktail', { icon: { id: 'icon', type: STRING, value: '🍸' }, description: op('t', lit('cateringStyles.cocktailDesc')), price: { id: 'price', type: STRING, value: '$35/guest' } })
                        ]}
                    },
                    constraints: { required: { ...REQUIRED } }
                },
                dietaryOptions: {
                    id: 'dietaryOptions', type: BOOLEAN, value: false,
                    metadata: {
                        label: op('t', lit('fields.dietaryOptions')),
                        hint: lit('Vegetarian, vegan, gluten-free (+$5/guest)'),
                        ...INPUT_TOGGLE
                    }
                },
                openBar: {
                    id: 'openBar', type: BOOLEAN, value: false,
                    metadata: {
                        label: op('t', lit('fields.openBar')),
                        hint: lit('Premium open bar service'),
                        ...INPUT_TOGGLE
                    }
                },
                // Conditional: Bar package selection
                barPackage: {
                    id: 'barPackage', type: STRING, value: '',
                    metadata: {
                        label: lit('Bar Package'),
                        ...INPUT_SELECT,
                        options: { id: 'options', type: TYPE, value: [
                            staticOption('empty', '', 'Select bar package'),
                            staticOption('beer_wine', 'beer_wine', 'Beer & Wine - $15/guest'),
                            staticOption('standard', 'standard', 'Standard Bar - $25/guest'),
                            staticOption('premium', 'premium', 'Premium Bar - $40/guest'),
                            staticOption('top_shelf', 'top_shelf', 'Top Shelf - $60/guest')
                        ]},
                        visible: op('eq', ref(['self', 'parent', 'openBar', 'value']), lit(true))
                    }
                }
            }
        },

        // ====================================================================
        // STEP 3: CONDITIONAL STEP - Wedding Ceremony (only for weddings!)
        // ====================================================================
        step3: {
            id: 'step3', type: STEP,
            metadata: {
                tabTitle: op('t', lit('steps.ceremony.tab')),
                stepTitle: op('t', lit('steps.ceremony.title')),
                stepDescription: op('t', lit('steps.ceremony.description')),
                stepNumber: { id: 'stepNumber', type: NUMBER, value: 3 },
                // CONDITIONAL STEP: Only visible for weddings!
                visible: op('eq', ref(['root', 'wizard', 'step1', 'typeSubStep', 'eventType', 'value']), lit('wedding')),
                ...createStepMeta(3)
            },
            children: {
                ceremonyType: {
                    id: 'ceremonyType', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.ceremonyTypeSelect')),
                        ...REQUIRED_TRUE, ...INPUT_RADIO,
                        options: { id: 'options', type: TYPE, value: [
                            option('religious', 'religious', 'ceremonyTypes.religious', { icon: { id: 'icon', type: STRING, value: '⛪' }, description: op('t', lit('ceremonyTypes.religiousDesc')) }),
                            option('civil', 'civil', 'ceremonyTypes.civil', { icon: { id: 'icon', type: STRING, value: '📜' }, description: op('t', lit('ceremonyTypes.civilDesc')) }),
                            option('symbolic', 'symbolic', 'ceremonyTypes.symbolic', { icon: { id: 'icon', type: STRING, value: '💕' }, description: op('t', lit('ceremonyTypes.symbolicDesc')) }),
                            option('destination', 'destination', 'ceremonyTypes.destination', { icon: { id: 'icon', type: STRING, value: '✈️' }, description: op('t', lit('ceremonyTypes.destinationDesc')) })
                        ]}
                    },
                    constraints: { required: { ...REQUIRED } }
                },
                vowStyle: {
                    id: 'vowStyle', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.vowStyle')),
                        ...INPUT_SELECT,
                        options: { id: 'options', type: TYPE, value: [
                            option('empty', '', 'vowStyles.select'),
                            option('traditional', 'traditional', 'vowStyles.traditional'),
                            option('personal', 'personal', 'vowStyles.personal'),
                            option('mixed', 'mixed', 'vowStyles.mixed')
                        ]}
                    }
                },
                hasOfficiant: {
                    id: 'hasOfficiant', type: BOOLEAN, value: false,
                    metadata: {
                        label: op('t', lit('fields.hasOfficiant')),
                        hint: lit('We can provide a licensed officiant'),
                        ...INPUT_TOGGLE
                    }
                },
                // CROSS-FIELD CONSTRAINT: Officiant preference required when hasOfficiant is true
                officiantPreference: {
                    id: 'officiantPreference', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.officiantPreference')),
                        required: ref(['self', 'parent', 'hasOfficiant', 'value']),
                        ...INPUT_SELECT,
                        options: { id: 'options', type: TYPE, value: [
                            option('empty', '', 'officiantTypes.select'),
                            option('religious', 'religious', 'officiantTypes.religious'),
                            option('secular', 'secular', 'officiantTypes.secular'),
                            option('friend', 'friend', 'officiantTypes.friend')
                        ]},
                        visible: op('eq', ref(['self', 'parent', 'hasOfficiant', 'value']), lit(true))
                    },
                    constraints: {
                        // CROSS-FIELD CONSTRAINT: Required only when hasOfficiant is true
                        conditionalRequired: {
                            id: 'conditionalRequired',
                            type: CONSTRAINT,
                            value: op('or',
                                op('not', ref(['self', 'parent', 'hasOfficiant', 'value'])),
                                op('neq', ref('self.value'), lit(''))
                            ),
                            metadata: {
                                message: { id: 'message', type: STRING, value: 'Officiant preference is required when officiant is needed' }
                            }
                        }
                    }
                },
                hasRingBearer: {
                    id: 'hasRingBearer', type: BOOLEAN, value: false,
                    metadata: { label: op('t', lit('fields.hasRingBearer')), ...INPUT_TOGGLE }
                },
                hasFlowerGirl: {
                    id: 'hasFlowerGirl', type: BOOLEAN, value: false,
                    metadata: { label: op('t', lit('fields.hasFlowerGirl')), ...INPUT_TOGGLE }
                },
                ceremonyMusic: {
                    id: 'ceremonyMusic', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.ceremonyMusic')),
                        ...INPUT_SELECT,
                        options: { id: 'options', type: TYPE, value: [
                            option('empty', '', 'ceremonyMusicOptions.select'),
                            option('live', 'live', 'ceremonyMusicOptions.live'),
                            option('recorded', 'recorded', 'ceremonyMusicOptions.recorded'),
                            option('both', 'both', 'ceremonyMusicOptions.both')
                        ]}
                    }
                }
            }
        },

        // ====================================================================
        // STEP 4: Entertainment & Media
        // ====================================================================
        step4: {
            id: 'step4', type: STEP,
            metadata: {
                tabTitle: op('t', lit('steps.step3.tab')),
                stepTitle: op('t', lit('steps.step3.title')),
                stepDescription: op('t', lit('steps.step3.description')),
                stepNumber: { id: 'stepNumber', type: NUMBER, value: 4 },
                ...createStepMeta(4)
            },
            children: {
                musicOption: {
                    id: 'musicOption', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.musicOption')),
                        ...REQUIRED_TRUE, ...INPUT_RADIO,
                        options: { id: 'options', type: TYPE, value: [
                            option('dj', 'dj', 'musicOptions.dj', { icon: { id: 'icon', type: STRING, value: '🎧' }, price: { id: 'price', type: STRING, value: '$800' } }),
                            option('band', 'band', 'musicOptions.band', { icon: { id: 'icon', type: STRING, value: '🎸' }, price: { id: 'price', type: STRING, value: '$2,500' } }),
                            option('acoustic', 'acoustic', 'musicOptions.acoustic', { icon: { id: 'icon', type: STRING, value: '🎵' }, price: { id: 'price', type: STRING, value: '$600' } }),
                            option('playlist', 'playlist', 'musicOptions.playlist', { icon: { id: 'icon', type: STRING, value: '📱' }, price: { id: 'price', type: STRING, value: '$100' } })
                        ]}
                    },
                    constraints: { required: { ...REQUIRED } }
                },
                // Conditional: DJ genre
                djGenre: {
                    id: 'djGenre', type: STRING, value: '',
                    metadata: {
                        label: lit('Preferred Genre'),
                        ...INPUT_SELECT,
                        options: { id: 'options', type: TYPE, value: [
                            staticOption('empty', '', 'Select genre'),
                            staticOption('pop', 'pop', 'Pop & Top 40'),
                            staticOption('rock', 'rock', 'Rock & Classic'),
                            staticOption('hiphop', 'hiphop', 'Hip Hop & R&B'),
                            staticOption('electronic', 'electronic', 'Electronic & EDM'),
                            staticOption('mixed', 'mixed', 'Mixed - All Genres')
                        ]},
                        visible: op('eq', ref(['self', 'parent', 'musicOption', 'value']), lit('dj'))
                    }
                },
                // Conditional: Band type
                bandType: {
                    id: 'bandType', type: STRING, value: '',
                    metadata: {
                        label: lit('Band Type'),
                        ...INPUT_SELECT,
                        options: { id: 'options', type: TYPE, value: [
                            staticOption('empty', '', 'Select type'),
                            staticOption('cover', 'cover', 'Cover Band'),
                            staticOption('jazz', 'jazz', 'Jazz Ensemble'),
                            staticOption('string', 'string', 'String Quartet')
                        ]},
                        visible: op('eq', ref(['self', 'parent', 'musicOption', 'value']), lit('band'))
                    }
                },
                mediaServices: {
                    id: 'mediaServices', type: TYPE, value: [],
                    metadata: {
                        label: op('t', lit('fields.mediaServices')),
                        ...INPUT_MULTISELECT,
                        options: { id: 'options', type: TYPE, value: [
                            staticOption('photo', 'photo', 'Photography ($500)'),
                            staticOption('video', 'video', 'Videography ($800)'),
                            staticOption('drone', 'drone', 'Drone Coverage ($400)'),
                            staticOption('booth', 'booth', 'Photo Booth ($350)')
                        ]},
                        ...MULTISELECT_SELECTED_LABEL, ...MULTISELECT_UNSELECTED_LABEL,
                        ...MULTISELECT_SELECTED_BOX, ...MULTISELECT_UNSELECTED_BOX, ...MULTISELECT_CHECK_ICON
                    }
                },
                decorationBudget: {
                    id: 'decorationBudget', type: NUMBER, value: 1000,
                    metadata: {
                        label: op('t', lit('fields.decorationBudget')),
                        ...INPUT_RANGE,
                        min: { id: 'min', type: NUMBER, value: 500 },
                        max: { id: 'max', type: NUMBER, value: 10000 },
                        step: { id: 'step', type: NUMBER, value: 500 },
                        prefix: { id: 'prefix', type: STRING, value: '$' }
                    }
                },
                themeColor: {
                    id: 'themeColor', type: STRING, value: '#3b82f6',
                    metadata: { label: op('t', lit('fields.themeColor')), ...INPUT_COLOR }
                },
                eventRating: {
                    id: 'eventRating', type: NUMBER, value: 0,
                    metadata: {
                        label: op('t', lit('fields.eventRating')),
                        hint: lit('Rate entertainment importance (1-5)'),
                        ...INPUT_RATING,
                        max: { id: 'max', type: NUMBER, value: 5 }
                    }
                },
                eventTags: {
                    id: 'eventTags', type: TYPE, value: [],
                    metadata: {
                        label: op('t', lit('fields.eventTags')),
                        placeholder: op('t', lit('placeholders.addTags')),
                        ...INPUT_TAGS
                    }
                }
            }
        },

        // ====================================================================
        // STEP 5: Contact & Review
        // ====================================================================
        step5: {
            id: 'step5', type: STEP,
            metadata: {
                tabTitle: op('t', lit('steps.step4.tab')),
                stepTitle: op('t', lit('steps.step4.title')),
                stepDescription: op('t', lit('steps.step4.description')),
                stepNumber: { id: 'stepNumber', type: NUMBER, value: 5 },
                ...createStepMeta(5)
            },
            children: {
                contactName: {
                    id: 'contactName', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.yourName')),
                        placeholder: op('t', lit('placeholders.fullName')),
                        ...REQUIRED_TRUE, ...INPUT_TEXT
                    },
                    constraints: {
                        required: { ...REQUIRED },
                        minLength: minLength(2, 'Name must be at least 2 characters')
                    }
                },
                contactEmail: {
                    id: 'contactEmail', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.emailAddress')),
                        placeholder: op('t', lit('placeholders.email')),
                        ...REQUIRED_TRUE, ...INPUT_TEXT
                    },
                    constraints: { required: { ...REQUIRED }, email: { ...EMAIL } }
                },
                contactPhone: {
                    id: 'contactPhone', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.phoneNumber')),
                        placeholder: op('t', lit('placeholders.phone')),
                        ...REQUIRED_TRUE, ...INPUT_TEXT
                    },
                    constraints: { required: { ...REQUIRED }, phone: { ...PHONE } }
                },
                specialRequests: {
                    id: 'specialRequests', type: STRING, value: '',
                    metadata: {
                        label: lit('Special Requests'),
                        placeholder: lit('Any special requirements?'),
                        ...INPUT_TEXTAREA,
                        rows: { id: 'rows', type: NUMBER, value: 4 }
                    }
                },
                inspirationImages: {
                    id: 'inspirationImages', type: STRING, value: '',
                    metadata: {
                        label: op('t', lit('fields.inspirationImages')),
                        ...INPUT_FILE, ...ACCEPT_IMAGES_PDF, ...MAX_SIZE_10MB, ...MULTIPLE_TRUE
                    }
                },
                termsAccepted: {
                    id: 'termsAccepted', type: BOOLEAN, value: false,
                    metadata: {
                        label: op('t', lit('fields.termsAccepted')),
                        ...REQUIRED_TRUE, ...INPUT_CHECKBOX
                    },
                    constraints: { mustAccept: { ...MUST_BE_TRUE } }
                }
            }
        }
    }
};

export default eventWizard;
