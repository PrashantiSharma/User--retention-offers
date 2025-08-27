
/**
 * A simple implementation of a Multi-Armed Bandit using Thompson Sampling
 * This simulates a reinforcement learning agent that learns to select
 * the best offer and communication channel for each customer segment.
 */

interface Arm {
  id: string;
  name: string;
  successCount: number;
  failureCount: number;
  probability?: number;
}

interface BanditParameters {
  explorationRate: number;
  learningRate: number;
  recencyWeight: number;
}

class MultiArmedBandit {
  private arms: Arm[];
  private parameters: BanditParameters;
  private history: { armId: string; reward: number; timestamp: number }[];
  
  constructor(arms: Arm[], parameters: BanditParameters) {
    this.arms = arms;
    this.parameters = parameters;
    this.history = [];
  }
  
  /**
   * Select an arm using Thompson Sampling algorithm
   * This draws from a beta distribution for each arm and selects the one
   * with the highest sample value
   */
  public selectArm(): string {
    // Use beta distribution to model the probability of success for each arm
    const armSamples = this.arms.map(arm => {
      const { successCount, failureCount } = arm;
      // Sample from beta distribution using success and failure counts
      // Beta distribution is approximated here with a simplified method
      const alpha = successCount + 1; // Adding 1 as prior (Laplace smoothing)
      const beta = failureCount + 1;
      
      // Simple approximation of a beta distribution sample
      const sample = this.betaSample(alpha, beta);
      
      return {
        id: arm.id,
        sample
      };
    });
    
    // Select the arm with the highest sample value
    const selectedArm = armSamples.reduce((max, current) => 
      current.sample > max.sample ? current : max, armSamples[0]);
    
    return selectedArm.id;
  }
  
  /**
   * Update the arm statistics based on the reward received
   */
  public updateArm(armId: string, reward: number): void {
    const arm = this.arms.find(a => a.id === armId);
    if (!arm) return;
    
    // Binary reward: 1 = success, 0 = failure
    if (reward > 0) {
      arm.successCount += 1;
    } else {
      arm.failureCount += 1;
    }
    
    // Calculate updated probability
    arm.probability = arm.successCount / (arm.successCount + arm.failureCount);
    
    // Store in history for analysis
    this.history.push({
      armId,
      reward,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get the current state of all arms
   */
  public getArms(): Arm[] {
    return this.arms;
  }
  
  /**
   * Get the current parameters
   */
  public getParameters(): BanditParameters {
    return this.parameters;
  }
  
  /**
   * Update the bandit parameters (e.g., decrease exploration rate over time)
   */
  public updateParameters(parameters: Partial<BanditParameters>): void {
    this.parameters = { ...this.parameters, ...parameters };
  }
  
  /**
   * A simplified approximation of sampling from a beta distribution
   * Note: In a production system, you'd use a proper random number generator
   * with beta distribution sampling
   */
  private betaSample(alpha: number, beta: number): number {
    // This is a very rough approximation
    // In a real system, use a proper statistical library
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
    
    // Generate a random normally distributed number
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const stdNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    
    // Scale by variance and shift by mean
    let sample = mean + Math.sqrt(variance) * stdNormal;
    
    // Ensure the sample is between 0 and 1
    sample = Math.max(0.001, Math.min(0.999, sample));
    
    return sample;
  }
}

export default MultiArmedBandit;
