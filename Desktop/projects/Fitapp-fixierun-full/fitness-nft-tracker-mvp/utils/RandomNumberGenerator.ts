/**
* Implementation of the XorShift128+ random number generator algorithm
* Based on V8's implementation and the work by Marsaglia and Vigna.
* 
* Features:
* - High-quality random number generation with a period of 2^128-1
* - Seedable for reproducible sequences
* - Methods for generating integers, floats, and arrays
* 
* @example
* ```typescript
* const rng = new RandomNumberGenerator(12345); // Seeded
* const random = rng.random(); // Float between 0 and 1
* const dice = rng.integer(1, 6); // Integer between 1 and 6
* ```
*/
export class RandomNumberGenerator {
private state0: bigint;
private state1: bigint;

/**
* Creates a new random number generator instance
* @param seed Optional seed value. If not provided, uses current timestamp
*/
constructor(seed?: number) {
    // Initialize state with seed or timestamp
    const s = BigInt(seed ?? Date.now());
    this.state0 = s;
    this.state1 = s ^ BigInt(0x8a5cd789635d2dff); // Magic constant for better initialization
    
    // Warm up the generator
    for (let i = 0; i < 10; i++) {
    this.next();
    }
}

/**
* Generates the next random value using XorShift128+
* @private
* @returns A BigInt containing the next random value
*/
private next(): bigint {
    let s1 = this.state0;
    let s0 = this.state1;
    
    this.state0 = s0;
    
    s1 ^= s1 << 23n;
    s1 ^= s1 >> 17n;
    s1 ^= s0;
    s1 ^= s0 >> 26n;
    
    this.state1 = s1;
    
    return s0 + s1;
}

/**
* Returns a random floating-point number between 0 (inclusive) and 1 (exclusive)
* @returns number between 0 and 1
*/
public random(): number {
    const value = this.next();
    // Convert to float between 0 and 1
    return Number(value & BigInt(0x1fffffffffffff)) / 0x20000000000000;
}

/**
* Returns a random integer between min (inclusive) and max (inclusive)
* @param min Minimum value (inclusive)
* @param max Maximum value (inclusive)
* @returns Random integer in the specified range
*/
public integer(min: number, max: number): number {
    if (min > max) {
    throw new Error('Min must be less than or equal to max');
    }
    const range = max - min + 1;
    return Math.floor(this.random() * range) + min;
}

/**
* Returns a random double between min (inclusive) and max (exclusive)
* @param min Minimum value (inclusive)
* @param max Maximum value (exclusive)
* @returns Random double in the specified range
*/
public double(min: number, max: number): number {
    if (min >= max) {
    throw new Error('Min must be less than max');
    }
    return min + (this.random() * (max - min));
}

/**
* Generates an array of random numbers
* @param length Length of the array to generate
* @param generator Function to generate each element
* @returns Array of random numbers
*/
public array<T>(length: number, generator: () => T): T[] {
    return Array.from({ length }, generator);
}

/**
* Shuffles an array in place using the Fisher-Yates algorithm
* @param array Array to shuffle
* @returns The shuffled array
*/
public shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(this.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
* Pick a random element from an array
* @param array Array to pick from
* @returns Random element from the array
*/
public pick<T>(array: T[]): T {
    if (array.length === 0) {
    throw new Error('Cannot pick from empty array');
    }
    return array[Math.floor(this.random() * array.length)];
}
}

