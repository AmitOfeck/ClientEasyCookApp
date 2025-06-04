export enum Cuisine {
    ITALIAN = 'ITALIAN',
    CHINESE = 'CHINESE',
    INDIAN = 'INDIAN',
    MEXICAN = 'MEXICAN',
}

export enum Limitation {
    VEGETARIAN = 'VEGETARIAN',
    VEGAN = 'VEGAN',
    GLUTEN_FREE = 'GLUTEN_FREE',
}

export enum Level {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
}

export type VariantType = 'original' | 'healthy' | 'cheap';

export interface IIngredient {
    name: string;
    unit: string;
    quantity: number;
    cost: number;
}

export interface IDish {
    _id: string;
    name: string;
    price: number;
    cuisine: Cuisine;
    limitation: Limitation;
    level: Level;
    ingredients: IIngredient[];
    details: string;
    recipe: string;
    dishCalories: number;
    ingredientsCost: number;
    averageDishCost: number;
    imageUrl: string;
    variantType: VariantType;
    createdAt: string;
    updatedAt: string;
}
