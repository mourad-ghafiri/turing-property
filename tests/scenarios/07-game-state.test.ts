// ============================================================================
// SCENARIO 7: RPG Game State
// ============================================================================
// Demonstrates game state management using the Property expression system.
// All character stats, combat calculations, and level progression are
// computed declaratively via expressions.
//
// Real-world use case: RPG character system with computed stats
// ============================================================================

import { describe, test, expect } from 'bun:test';
import { Property } from '../../src/core/property';
import { PropertyNode } from '../../src/core/node';
import { defaultRegistry } from '../../src/builtin/operators';
import { TYPE, STRING, NUMBER, BOOLEAN } from '../../src/builtin/types';
import { lit, ref, op } from '../../src/builtin/expressions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const CHARACTER = { id: 'Character', type: TYPE };
const EQUIPMENT = { id: 'Equipment', type: TYPE };

// ============================================================================
// CHARACTER FACTORY
// ============================================================================

interface CharacterData {
    id: string;
    name: string;
    class: 'warrior' | 'mage' | 'rogue' | 'healer';
    level: number;
    experience: number;
    baseStrength: number;
    baseIntelligence: number;
    baseAgility: number;
    baseVitality: number;
    currentHealth: number;
    currentMana: number;
    equipmentAttack: number;
    equipmentDefense: number;
    equipmentMagic: number;
}

function createCharacter(data: CharacterData): Property {
    return {
        id: data.id,
        type: CHARACTER,
        children: {
            name: { id: 'name', type: STRING, value: data.name },
            class: { id: 'class', type: STRING, value: data.class },
            level: { id: 'level', type: NUMBER, value: data.level },
            experience: { id: 'experience', type: NUMBER, value: data.experience },

            // Base stats
            baseStrength: { id: 'baseStrength', type: NUMBER, value: data.baseStrength },
            baseIntelligence: { id: 'baseIntelligence', type: NUMBER, value: data.baseIntelligence },
            baseAgility: { id: 'baseAgility', type: NUMBER, value: data.baseAgility },
            baseVitality: { id: 'baseVitality', type: NUMBER, value: data.baseVitality },

            // Current resources
            currentHealth: { id: 'currentHealth', type: NUMBER, value: data.currentHealth },
            currentMana: { id: 'currentMana', type: NUMBER, value: data.currentMana },

            // Equipment bonuses
            equipmentAttack: { id: 'equipmentAttack', type: NUMBER, value: data.equipmentAttack },
            equipmentDefense: { id: 'equipmentDefense', type: NUMBER, value: data.equipmentDefense },
            equipmentMagic: { id: 'equipmentMagic', type: NUMBER, value: data.equipmentMagic },

            // ========== COMPUTED STATS ==========

            // EXPRESSION: Experience needed for next level = level * 100
            expToNextLevel: {
                id: 'expToNextLevel',
                type: NUMBER,
                value: op('mul',
                    ref(['self', 'parent', 'level', 'value']),
                    lit(100)
                )
            },

            // EXPRESSION: Level progress percentage
            levelProgress: {
                id: 'levelProgress',
                type: NUMBER,
                value: op('mul',
                    op('div',
                        ref(['self', 'parent', 'experience', 'value']),
                        op('mul', ref(['self', 'parent', 'level', 'value']), lit(100))
                    ),
                    lit(100)
                )
            },

            // EXPRESSION: Can level up (exp >= expToNextLevel)
            canLevelUp: {
                id: 'canLevelUp',
                type: BOOLEAN,
                value: op('gte',
                    ref(['self', 'parent', 'experience', 'value']),
                    op('mul', ref(['self', 'parent', 'level', 'value']), lit(100))
                )
            },

            // EXPRESSION: Max health = vitality * 10 + level * 5
            maxHealth: {
                id: 'maxHealth',
                type: NUMBER,
                value: op('add',
                    op('mul', ref(['self', 'parent', 'baseVitality', 'value']), lit(10)),
                    op('mul', ref(['self', 'parent', 'level', 'value']), lit(5))
                )
            },

            // EXPRESSION: Max mana = intelligence * 8 + level * 3
            maxMana: {
                id: 'maxMana',
                type: NUMBER,
                value: op('add',
                    op('mul', ref(['self', 'parent', 'baseIntelligence', 'value']), lit(8)),
                    op('mul', ref(['self', 'parent', 'level', 'value']), lit(3))
                )
            },

            // EXPRESSION: Health percentage
            healthPercent: {
                id: 'healthPercent',
                type: NUMBER,
                value: op('round',
                    op('mul',
                        op('div',
                            ref(['self', 'parent', 'currentHealth', 'value']),
                            op('add',
                                op('mul', ref(['self', 'parent', 'baseVitality', 'value']), lit(10)),
                                op('mul', ref(['self', 'parent', 'level', 'value']), lit(5))
                            )
                        ),
                        lit(100)
                    )
                )
            },

            // EXPRESSION: Is alive (currentHealth > 0)
            isAlive: {
                id: 'isAlive',
                type: BOOLEAN,
                value: op('gt',
                    ref(['self', 'parent', 'currentHealth', 'value']),
                    lit(0)
                )
            },

            // EXPRESSION: Is low health (< 25%)
            isLowHealth: {
                id: 'isLowHealth',
                type: BOOLEAN,
                value: op('lt',
                    op('mul',
                        op('div',
                            ref(['self', 'parent', 'currentHealth', 'value']),
                            op('add',
                                op('mul', ref(['self', 'parent', 'baseVitality', 'value']), lit(10)),
                                op('mul', ref(['self', 'parent', 'level', 'value']), lit(5))
                            )
                        ),
                        lit(100)
                    ),
                    lit(25)
                )
            },

            // EXPRESSION: Physical attack = strength * 2 + equipmentAttack + level
            physicalAttack: {
                id: 'physicalAttack',
                type: NUMBER,
                value: op('add',
                    op('add',
                        op('mul', ref(['self', 'parent', 'baseStrength', 'value']), lit(2)),
                        ref(['self', 'parent', 'equipmentAttack', 'value'])
                    ),
                    ref(['self', 'parent', 'level', 'value'])
                )
            },

            // EXPRESSION: Magic attack = intelligence * 2.5 + equipmentMagic + level
            magicAttack: {
                id: 'magicAttack',
                type: NUMBER,
                value: op('add',
                    op('add',
                        op('mul', ref(['self', 'parent', 'baseIntelligence', 'value']), lit(2.5)),
                        ref(['self', 'parent', 'equipmentMagic', 'value'])
                    ),
                    ref(['self', 'parent', 'level', 'value'])
                )
            },

            // EXPRESSION: Defense = vitality + equipmentDefense + level * 0.5
            defense: {
                id: 'defense',
                type: NUMBER,
                value: op('add',
                    op('add',
                        ref(['self', 'parent', 'baseVitality', 'value']),
                        ref(['self', 'parent', 'equipmentDefense', 'value'])
                    ),
                    op('mul', ref(['self', 'parent', 'level', 'value']), lit(0.5))
                )
            },

            // EXPRESSION: Evasion chance = agility * 0.5 (max 30%)
            evasionChance: {
                id: 'evasionChance',
                type: NUMBER,
                value: op('min',
                    op('mul', ref(['self', 'parent', 'baseAgility', 'value']), lit(0.5)),
                    lit(30)
                )
            },

            // EXPRESSION: Critical chance = agility * 0.3 + luck bonus (max 50%)
            criticalChance: {
                id: 'criticalChance',
                type: NUMBER,
                value: op('min',
                    op('mul', ref(['self', 'parent', 'baseAgility', 'value']), lit(0.3)),
                    lit(50)
                )
            },

            // EXPRESSION: Power rating (overall combat strength)
            powerRating: {
                id: 'powerRating',
                type: NUMBER,
                value: op('round',
                    op('add',
                        op('add',
                            op('add',
                                op('mul', ref(['self', 'parent', 'baseStrength', 'value']), lit(2)),
                                ref(['self', 'parent', 'equipmentAttack', 'value'])
                            ),
                            ref(['self', 'parent', 'level', 'value'])
                        ),
                        op('add',
                            op('add',
                                op('add',
                                    op('mul', ref(['self', 'parent', 'baseIntelligence', 'value']), lit(2.5)),
                                    ref(['self', 'parent', 'equipmentMagic', 'value'])
                                ),
                                ref(['self', 'parent', 'level', 'value'])
                            ),
                            op('add',
                                op('add',
                                    ref(['self', 'parent', 'baseVitality', 'value']),
                                    ref(['self', 'parent', 'equipmentDefense', 'value'])
                                ),
                                op('mul', ref(['self', 'parent', 'level', 'value']), lit(0.5))
                            )
                        )
                    )
                )
            },

            // EXPRESSION: Is tank class (warrior or healer)
            isTankClass: {
                id: 'isTankClass',
                type: BOOLEAN,
                value: op('or',
                    op('eq', ref(['self', 'parent', 'class', 'value']), lit('warrior')),
                    op('eq', ref(['self', 'parent', 'class', 'value']), lit('healer'))
                )
            },

            // EXPRESSION: Primary damage type based on class
            primaryDamage: {
                id: 'primaryDamage',
                type: NUMBER,
                value: op('if',
                    op('or',
                        op('eq', ref(['self', 'parent', 'class', 'value']), lit('mage')),
                        op('eq', ref(['self', 'parent', 'class', 'value']), lit('healer'))
                    ),
                    // Magic classes use magic attack
                    op('add',
                        op('add',
                            op('mul', ref(['self', 'parent', 'baseIntelligence', 'value']), lit(2.5)),
                            ref(['self', 'parent', 'equipmentMagic', 'value'])
                        ),
                        ref(['self', 'parent', 'level', 'value'])
                    ),
                    // Physical classes use physical attack
                    op('add',
                        op('add',
                            op('mul', ref(['self', 'parent', 'baseStrength', 'value']), lit(2)),
                            ref(['self', 'parent', 'equipmentAttack', 'value'])
                        ),
                        ref(['self', 'parent', 'level', 'value'])
                    )
                )
            }
        }
    };
}

// ============================================================================
// TESTS
// ============================================================================

describe('Scenario 7: RPG Game State', () => {
    describe('Experience and Leveling', () => {
        test('should calculate experience to next level', async () => {
            const char = createCharacter({
                id: 'hero',
                name: 'Aragorn',
                class: 'warrior',
                level: 10,
                experience: 500,
                baseStrength: 20,
                baseIntelligence: 10,
                baseAgility: 15,
                baseVitality: 18,
                currentHealth: 200,
                currentMana: 50,
                equipmentAttack: 25,
                equipmentDefense: 30,
                equipmentMagic: 5
            });

            const node = new PropertyNode(char);
            node.setRegistry(defaultRegistry);

            const expNeeded = await node.getValue(['expToNextLevel']);
            expect(expNeeded).toBe(1000);  // level 10 * 100 = 1000
        });

        test('should calculate level progress', async () => {
            const char = createCharacter({
                id: 'leveling',
                name: 'Leveling Hero',
                class: 'rogue',
                level: 5,
                experience: 250,  // 50% of 500 needed
                baseStrength: 12,
                baseIntelligence: 10,
                baseAgility: 20,
                baseVitality: 10,
                currentHealth: 100,
                currentMana: 50,
                equipmentAttack: 10,
                equipmentDefense: 5,
                equipmentMagic: 0
            });

            const node = new PropertyNode(char);
            node.setRegistry(defaultRegistry);

            const progress = await node.getValue(['levelProgress']);
            expect(progress).toBe(50);
        });

        test('should detect when character can level up', async () => {
            const canLevel = createCharacter({
                id: 'ready',
                name: 'Ready',
                class: 'mage',
                level: 3,
                experience: 300,  // >= 300 needed
                baseStrength: 8,
                baseIntelligence: 20,
                baseAgility: 10,
                baseVitality: 10,
                currentHealth: 100,
                currentMana: 150,
                equipmentAttack: 0,
                equipmentDefense: 5,
                equipmentMagic: 15
            });

            const canNode = new PropertyNode(canLevel);
            canNode.setRegistry(defaultRegistry);
            expect(await canNode.getValue(['canLevelUp'])).toBe(true);

            const cantLevel = createCharacter({
                id: 'notready',
                name: 'Not Ready',
                class: 'mage',
                level: 3,
                experience: 200,  // < 300 needed
                baseStrength: 8,
                baseIntelligence: 20,
                baseAgility: 10,
                baseVitality: 10,
                currentHealth: 100,
                currentMana: 150,
                equipmentAttack: 0,
                equipmentDefense: 5,
                equipmentMagic: 15
            });

            const cantNode = new PropertyNode(cantLevel);
            cantNode.setRegistry(defaultRegistry);
            expect(await cantNode.getValue(['canLevelUp'])).toBe(false);
        });
    });

    describe('Health and Mana', () => {
        test('should calculate max health', async () => {
            const char = createCharacter({
                id: 'tank',
                name: 'Tank',
                class: 'warrior',
                level: 15,
                experience: 0,
                baseStrength: 25,
                baseIntelligence: 8,
                baseAgility: 10,
                baseVitality: 30,  // 30 * 10 = 300
                currentHealth: 350,
                currentMana: 30,
                equipmentAttack: 40,
                equipmentDefense: 50,
                equipmentMagic: 0
            });

            const node = new PropertyNode(char);
            node.setRegistry(defaultRegistry);

            // maxHealth = vitality * 10 + level * 5 = 300 + 75 = 375
            const maxHealth = await node.getValue(['maxHealth']);
            expect(maxHealth).toBe(375);
        });

        test('should calculate max mana', async () => {
            const mage = createCharacter({
                id: 'mage',
                name: 'Gandalf',
                class: 'mage',
                level: 20,
                experience: 0,
                baseStrength: 10,
                baseIntelligence: 35,  // 35 * 8 = 280
                baseAgility: 12,
                baseVitality: 15,
                currentHealth: 150,
                currentMana: 300,
                equipmentAttack: 5,
                equipmentDefense: 10,
                equipmentMagic: 50
            });

            const node = new PropertyNode(mage);
            node.setRegistry(defaultRegistry);

            // maxMana = intelligence * 8 + level * 3 = 280 + 60 = 340
            const maxMana = await node.getValue(['maxMana']);
            expect(maxMana).toBe(340);
        });

        test('should calculate health percentage', async () => {
            const char = createCharacter({
                id: 'wounded',
                name: 'Wounded',
                class: 'warrior',
                level: 10,
                experience: 0,
                baseStrength: 20,
                baseIntelligence: 10,
                baseAgility: 15,
                baseVitality: 20,  // maxHealth = 200 + 50 = 250
                currentHealth: 125,  // 50%
                currentMana: 50,
                equipmentAttack: 20,
                equipmentDefense: 25,
                equipmentMagic: 0
            });

            const node = new PropertyNode(char);
            node.setRegistry(defaultRegistry);

            const healthPercent = await node.getValue(['healthPercent']);
            expect(healthPercent).toBe(50);
        });

        test('should detect alive status', async () => {
            const alive = createCharacter({
                id: 'alive',
                name: 'Alive',
                class: 'rogue',
                level: 5,
                experience: 0,
                baseStrength: 12,
                baseIntelligence: 10,
                baseAgility: 18,
                baseVitality: 12,
                currentHealth: 1,  // Barely alive
                currentMana: 20,
                equipmentAttack: 15,
                equipmentDefense: 10,
                equipmentMagic: 0
            });

            const aliveNode = new PropertyNode(alive);
            aliveNode.setRegistry(defaultRegistry);
            expect(await aliveNode.getValue(['isAlive'])).toBe(true);

            const dead = createCharacter({
                id: 'dead',
                name: 'Fallen',
                class: 'rogue',
                level: 5,
                experience: 0,
                baseStrength: 12,
                baseIntelligence: 10,
                baseAgility: 18,
                baseVitality: 12,
                currentHealth: 0,  // Dead
                currentMana: 0,
                equipmentAttack: 15,
                equipmentDefense: 10,
                equipmentMagic: 0
            });

            const deadNode = new PropertyNode(dead);
            deadNode.setRegistry(defaultRegistry);
            expect(await deadNode.getValue(['isAlive'])).toBe(false);
        });

        test('should detect low health status', async () => {
            const lowHealth = createCharacter({
                id: 'low',
                name: 'Critical',
                class: 'healer',
                level: 10,
                experience: 0,
                baseStrength: 10,
                baseIntelligence: 25,
                baseAgility: 12,
                baseVitality: 15,  // maxHealth = 150 + 50 = 200
                currentHealth: 40,  // 20% < 25%
                currentMana: 100,
                equipmentAttack: 5,
                equipmentDefense: 15,
                equipmentMagic: 30
            });

            const node = new PropertyNode(lowHealth);
            node.setRegistry(defaultRegistry);
            expect(await node.getValue(['isLowHealth'])).toBe(true);
        });
    });

    describe('Combat Stats', () => {
        test('should calculate physical attack', async () => {
            const warrior = createCharacter({
                id: 'fighter',
                name: 'Fighter',
                class: 'warrior',
                level: 10,
                experience: 0,
                baseStrength: 25,  // 25 * 2 = 50
                baseIntelligence: 8,
                baseAgility: 12,
                baseVitality: 20,
                currentHealth: 200,
                currentMana: 30,
                equipmentAttack: 30,  // +30
                equipmentDefense: 40,
                equipmentMagic: 0
            });

            const node = new PropertyNode(warrior);
            node.setRegistry(defaultRegistry);

            // physicalAttack = strength * 2 + equipment + level = 50 + 30 + 10 = 90
            const attack = await node.getValue(['physicalAttack']);
            expect(attack).toBe(90);
        });

        test('should calculate magic attack', async () => {
            const mage = createCharacter({
                id: 'caster',
                name: 'Caster',
                class: 'mage',
                level: 15,
                experience: 0,
                baseStrength: 8,
                baseIntelligence: 30,  // 30 * 2.5 = 75
                baseAgility: 12,
                baseVitality: 12,
                currentHealth: 120,
                currentMana: 250,
                equipmentAttack: 5,
                equipmentDefense: 10,
                equipmentMagic: 40  // +40
            });

            const node = new PropertyNode(mage);
            node.setRegistry(defaultRegistry);

            // magicAttack = intelligence * 2.5 + equipment + level = 75 + 40 + 15 = 130
            const attack = await node.getValue(['magicAttack']);
            expect(attack).toBe(130);
        });

        test('should calculate defense', async () => {
            const tank = createCharacter({
                id: 'defender',
                name: 'Defender',
                class: 'warrior',
                level: 20,
                experience: 0,
                baseStrength: 22,
                baseIntelligence: 10,
                baseAgility: 10,
                baseVitality: 28,  // +28
                currentHealth: 300,
                currentMana: 50,
                equipmentAttack: 25,
                equipmentDefense: 45,  // +45
                equipmentMagic: 0
            });

            const node = new PropertyNode(tank);
            node.setRegistry(defaultRegistry);

            // defense = vitality + equipment + level * 0.5 = 28 + 45 + 10 = 83
            const defense = await node.getValue(['defense']);
            expect(defense).toBe(83);
        });

        test('should calculate evasion chance with cap', async () => {
            const rogue = createCharacter({
                id: 'dodger',
                name: 'Dodger',
                class: 'rogue',
                level: 15,
                experience: 0,
                baseStrength: 15,
                baseIntelligence: 12,
                baseAgility: 40,  // 40 * 0.5 = 20%, under cap
                baseVitality: 12,
                currentHealth: 120,
                currentMana: 60,
                equipmentAttack: 25,
                equipmentDefense: 15,
                equipmentMagic: 5
            });

            const node = new PropertyNode(rogue);
            node.setRegistry(defaultRegistry);

            const evasion = await node.getValue(['evasionChance']);
            expect(evasion).toBe(20);

            // Test cap
            const superDodger = createCharacter({
                id: 'superdodge',
                name: 'Super Dodger',
                class: 'rogue',
                level: 30,
                experience: 0,
                baseStrength: 15,
                baseIntelligence: 12,
                baseAgility: 80,  // 80 * 0.5 = 40%, capped at 30%
                baseVitality: 15,
                currentHealth: 150,
                currentMana: 70,
                equipmentAttack: 35,
                equipmentDefense: 20,
                equipmentMagic: 10
            });

            const superNode = new PropertyNode(superDodger);
            superNode.setRegistry(defaultRegistry);

            const cappedEvasion = await superNode.getValue(['evasionChance']);
            expect(cappedEvasion).toBe(30);  // Capped at 30%
        });
    });

    describe('Class-Based Stats', () => {
        test('should identify tank classes', async () => {
            const warrior = createCharacter({
                id: 'war',
                name: 'Warrior',
                class: 'warrior',
                level: 10,
                experience: 0,
                baseStrength: 20,
                baseIntelligence: 10,
                baseAgility: 12,
                baseVitality: 20,
                currentHealth: 200,
                currentMana: 50,
                equipmentAttack: 20,
                equipmentDefense: 30,
                equipmentMagic: 0
            });

            const warriorNode = new PropertyNode(warrior);
            warriorNode.setRegistry(defaultRegistry);
            expect(await warriorNode.getValue(['isTankClass'])).toBe(true);

            const rogue = createCharacter({
                id: 'rog',
                name: 'Rogue',
                class: 'rogue',
                level: 10,
                experience: 0,
                baseStrength: 15,
                baseIntelligence: 12,
                baseAgility: 22,
                baseVitality: 12,
                currentHealth: 120,
                currentMana: 60,
                equipmentAttack: 25,
                equipmentDefense: 10,
                equipmentMagic: 5
            });

            const rogueNode = new PropertyNode(rogue);
            rogueNode.setRegistry(defaultRegistry);
            expect(await rogueNode.getValue(['isTankClass'])).toBe(false);
        });

        test('should select primary damage based on class', async () => {
            // Warrior uses physical attack
            const warrior = createCharacter({
                id: 'phys',
                name: 'Physical',
                class: 'warrior',
                level: 10,
                experience: 0,
                baseStrength: 25,  // physical = 25*2 + 30 + 10 = 90
                baseIntelligence: 10,  // magic = 10*2.5 + 0 + 10 = 35
                baseAgility: 12,
                baseVitality: 18,
                currentHealth: 180,
                currentMana: 50,
                equipmentAttack: 30,
                equipmentDefense: 25,
                equipmentMagic: 0
            });

            const warriorNode = new PropertyNode(warrior);
            warriorNode.setRegistry(defaultRegistry);
            expect(await warriorNode.getValue(['primaryDamage'])).toBe(90);

            // Mage uses magic attack
            const mage = createCharacter({
                id: 'magic',
                name: 'Magical',
                class: 'mage',
                level: 10,
                experience: 0,
                baseStrength: 10,  // physical = 10*2 + 5 + 10 = 35
                baseIntelligence: 25,  // magic = 25*2.5 + 30 + 10 = 102.5
                baseAgility: 12,
                baseVitality: 12,
                currentHealth: 120,
                currentMana: 200,
                equipmentAttack: 5,
                equipmentDefense: 10,
                equipmentMagic: 30
            });

            const mageNode = new PropertyNode(mage);
            mageNode.setRegistry(defaultRegistry);
            expect(await mageNode.getValue(['primaryDamage'])).toBe(102.5);
        });
    });

    describe('Power Rating', () => {
        test('should calculate overall power rating', async () => {
            const hero = createCharacter({
                id: 'hero',
                name: 'Hero',
                class: 'warrior',
                level: 20,
                experience: 0,
                baseStrength: 25,
                baseIntelligence: 15,
                baseAgility: 18,
                baseVitality: 22,
                currentHealth: 250,
                currentMana: 80,
                equipmentAttack: 35,
                equipmentDefense: 40,
                equipmentMagic: 10
            });

            const node = new PropertyNode(hero);
            node.setRegistry(defaultRegistry);

            // physicalAttack = 25*2 + 35 + 20 = 105
            // magicAttack = 15*2.5 + 10 + 20 = 67.5
            // defense = 22 + 40 + 10 = 72
            // powerRating = 105 + 67.5 + 72 = 244.5 → 245
            const power = await node.getValue(['powerRating']);
            expect(power).toBe(245);
        });

        test('should scale power with equipment', async () => {
            const noGear = createCharacter({
                id: 'nogear',
                name: 'No Gear',
                class: 'warrior',
                level: 10,
                experience: 0,
                baseStrength: 20,
                baseIntelligence: 10,
                baseAgility: 15,
                baseVitality: 18,
                currentHealth: 200,
                currentMana: 50,
                equipmentAttack: 0,
                equipmentDefense: 0,
                equipmentMagic: 0
            });

            const geared = createCharacter({
                id: 'geared',
                name: 'Geared',
                class: 'warrior',
                level: 10,
                experience: 0,
                baseStrength: 20,
                baseIntelligence: 10,
                baseAgility: 15,
                baseVitality: 18,
                currentHealth: 200,
                currentMana: 50,
                equipmentAttack: 50,
                equipmentDefense: 50,
                equipmentMagic: 30
            });

            const noGearNode = new PropertyNode(noGear);
            noGearNode.setRegistry(defaultRegistry);

            const gearedNode = new PropertyNode(geared);
            gearedNode.setRegistry(defaultRegistry);

            const noGearPower = await noGearNode.getValue(['powerRating']) as number;
            const gearedPower = await gearedNode.getValue(['powerRating']) as number;

            // Gear should significantly increase power
            expect(gearedPower).toBeGreaterThan(noGearPower);
            expect(gearedPower - noGearPower).toBe(130);  // 50 + 50 + 30 = 130 from equipment
        });
    });
});
