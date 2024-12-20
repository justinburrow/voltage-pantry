import type { ComponentValueType, NormalizedValue, UnitDefinition } from './types';

const CAPACITANCE_UNITS: Record<string, UnitDefinition> = {
	pico: { symbol: ['p', 'pf'], multiplier: 1e-12, preferredSymbol: 'pF' },
	nano: { symbol: ['n', 'nf'], multiplier: 1e-9, preferredSymbol: 'nF' },
	micro: { symbol: ['u', 'µ', 'uf', 'µf'], multiplier: 1e-6, preferredSymbol: 'µF' },
	milli: { symbol: ['m', 'mf'], multiplier: 1e-3, preferredSymbol: 'mF' },
	base: { symbol: ['f'], multiplier: 1, preferredSymbol: 'F' }
};

const RESISTANCE_UNITS: Record<string, UnitDefinition> = {
	milli: { symbol: ['m'], multiplier: 1e-3, preferredSymbol: 'mΩ' },
	base: { symbol: ['r', 'Ω', 'ohm', 'ohms', ''], multiplier: 1, preferredSymbol: 'Ω' },
	kilo: { symbol: ['k'], multiplier: 1e3, preferredSymbol: 'kΩ' },
	mega: { symbol: ['m', 'meg'], multiplier: 1e6, preferredSymbol: 'MΩ' }
};

const SWITCH_PATTERNS = {
	spst: { poles: 1, throws: 1 },
	spdt: { poles: 1, throws: 2 },
	dpst: { poles: 2, throws: 1 },
	dpdt: { poles: 2, throws: 2 },
	'3pdt': { poles: 3, throws: 2 },
	'4pdt': { poles: 4, throws: 2 }
} as const;

export class ValueNormalizer {
	static normalizeCapacitance(input: string): NormalizedValue {
		const cleaned = input.toLowerCase().replace(/\s+/g, '');
		const match = cleaned.match(/^(\d*\.?\d+)([a-zµ]+)$/i);

		if (!match) {
			throw new Error('Invalid capacitance format');
		}

		const [, valueStr, unitStr] = match;
		const value = parseFloat(valueStr);

		const unitDef = Object.values(CAPACITANCE_UNITS).find((def) =>
			def.symbol.some((s) => unitStr.includes(s))
		);

		if (!unitDef) {
			throw new Error('Unknown capacitance unit');
		}

		const baseValue = value * unitDef.multiplier;
		const displayUnit = this.getPreferredCapacitanceUnit(baseValue);
		const displayValue = this.formatValue(baseValue, displayUnit);

		return {
			baseValue,
			displayValue,
			unit: 'farad',
			type: 'capacitance'
		};
	}

	static normalizeResistance(input: string): NormalizedValue {
		const cleaned = input.toLowerCase().replace(/\s+/g, '');
		const match = cleaned.match(/^(\d*\.?\d+)([a-zΩ]*)$/i);

		if (!match) {
			throw new Error('Invalid resistance format');
		}

		const [, valueStr, unitStr] = match;
		const value = parseFloat(valueStr);

		const unitDef =
			Object.values(RESISTANCE_UNITS).find((def) => def.symbol.some((s) => unitStr.includes(s))) ||
			RESISTANCE_UNITS.base;

		const baseValue = value * unitDef.multiplier;
		const displayUnit = this.getPreferredResistanceUnit(baseValue);
		const displayValue = this.formatValue(baseValue, displayUnit);

		return {
			baseValue,
			displayValue,
			unit: 'ohm',
			type: 'resistance'
		};
	}

	static normalizeSwitch(input: string): NormalizedValue {
		const cleaned = input.toLowerCase().replace(/\s+/g, '');

		let poles: number;
		let throws: number;

		const standardMatch = cleaned.match(/^(\d+)p(\d+)t$/);
		if (standardMatch) {
			[, poles, throws] = standardMatch.map(Number);
		} else {
			const config = SWITCH_PATTERNS[cleaned as keyof typeof SWITCH_PATTERNS];
			if (!config) {
				throw new Error('Invalid switch configuration');
			}
			poles = config.poles;
			throws = config.throws;
		}

		const baseValue = poles * 10 + throws;
		const displayValue = `${poles}P${throws}T`;

		return {
			baseValue,
			displayValue,
			unit: 'configuration',
			type: 'switch'
		};
	}

	private static getPreferredCapacitanceUnit(baseValue: number): UnitDefinition {
		if (baseValue < 1e-9) return CAPACITANCE_UNITS.pico;
		if (baseValue < 1e-6) return CAPACITANCE_UNITS.nano;
		if (baseValue < 1e-3) return CAPACITANCE_UNITS.micro;
		if (baseValue < 1) return CAPACITANCE_UNITS.milli;
		return CAPACITANCE_UNITS.base;
	}

	private static getPreferredResistanceUnit(baseValue: number): UnitDefinition {
		if (baseValue < 1) return RESISTANCE_UNITS.milli;
		if (baseValue < 1e3) return RESISTANCE_UNITS.base;
		if (baseValue < 1e6) return RESISTANCE_UNITS.kilo;
		return RESISTANCE_UNITS.mega;
	}

	private static formatValue(baseValue: number, unit: UnitDefinition): string {
		const scaledValue = baseValue / unit.multiplier;
		return `${scaledValue}${unit.preferredSymbol}`;
	}
}

// Convenience exports
export { CAPACITANCE_UNITS, RESISTANCE_UNITS, SWITCH_PATTERNS };
