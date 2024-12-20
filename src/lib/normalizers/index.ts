import type { ComponentValueType } from '$app/DatabaseDefinitions';

interface UnitDefinition {
	symbol: string[];
	multiplier: number;
	preferredSymbol: string;
}

interface NormalizedResult {
	base_value: number;
	display_value: string;
}

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
	static normalizeValue(input: string, type: ComponentValueType): NormalizedResult {
		switch (type) {
			case 'capacitance':
				return this.normalizeCapacitance(input);
			case 'resistance':
				return this.normalizeResistance(input);
			case 'switch':
				return this.normalizeSwitch(input);
			default:
				throw new Error(`Unsupported value type: ${type}`);
		}
	}

	private static normalizeCapacitance(input: string): NormalizedResult {
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

		const base_value = value * unitDef.multiplier;
		const displayUnit = this.getPreferredCapacitanceUnit(base_value);

		return {
			base_value,
			display_value: this.formatValue(base_value, displayUnit)
		};
	}

	private static normalizeResistance(input: string): NormalizedResult {
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

		const base_value = value * unitDef.multiplier;
		const displayUnit = this.getPreferredResistanceUnit(base_value);

		return {
			base_value,
			display_value: this.formatValue(base_value, displayUnit)
		};
	}

	private static normalizeSwitch(input: string): NormalizedResult {
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

		const base_value = poles * 10 + throws;

		return {
			base_value,
			display_value: `${poles}P${throws}T`
		};
	}

	private static getPreferredCapacitanceUnit(base_value: number): UnitDefinition {
		if (base_value < 1e-9) return CAPACITANCE_UNITS.pico;
		if (base_value < 1e-6) return CAPACITANCE_UNITS.nano;
		if (base_value < 1e-3) return CAPACITANCE_UNITS.micro;
		if (base_value < 1) return CAPACITANCE_UNITS.milli;
		return CAPACITANCE_UNITS.base;
	}

	private static getPreferredResistanceUnit(base_value: number): UnitDefinition {
		if (base_value < 1) return RESISTANCE_UNITS.milli;
		if (base_value < 1e3) return RESISTANCE_UNITS.base;
		if (base_value < 1e6) return RESISTANCE_UNITS.kilo;
		return RESISTANCE_UNITS.mega;
	}

	private static formatValue(base_value: number, unit: UnitDefinition): string {
		const scaledValue = base_value / unit.multiplier;
		return `${scaledValue}${unit.preferredSymbol}`;
	}
}

export { CAPACITANCE_UNITS, RESISTANCE_UNITS, SWITCH_PATTERNS };
