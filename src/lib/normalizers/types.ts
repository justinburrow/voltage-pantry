export type ComponentValueType = 'capacitance' | 'resistance' | 'switch' | 'voltage' | 'current';

export interface NormalizedValue {
	baseValue: number;
	displayValue: string;
	unit: string;
	type: ComponentValueType;
}

export interface UnitDefinition {
	symbol: string[];
	multiplier: number;
	preferredSymbol: string;
}
