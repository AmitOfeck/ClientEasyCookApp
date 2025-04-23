// interfaces/dish.ts

export enum Cuisine {
    ITALIAN = 'ITALIAN',
    CHINESE = 'CHINESE',
    INDIAN = 'INDIAN',
    MEXICAN = 'MEXICAN',
    // Add more as needed
}

export enum Limitation {
    VEGETARIAN = 'VEGETARIAN',
    VEGAN = 'VEGAN',
    GLUTEN_FREE = 'GLUTEN_FREE',
    // Add more as needed
}

export enum Level {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
}

export interface IIngredient {
    name: string;
    unit: string;
    quantity: number;
    cost: number;
}

export interface IDish {
    _id: string;  // MongoDB auto-generated ID field
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
    createdAt: string;
    updatedAt: string;
}
