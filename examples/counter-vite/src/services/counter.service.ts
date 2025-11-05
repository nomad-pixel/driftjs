import { state, computed, setState } from 'drift-spa';
import { LoggerService } from './logger.service';

export class CounterService {
  count = state(0);
  step = state(1);
  
  double = computed(() => this.count.value * 2);
  canDecrement = computed(() => this.count.value > 0);
  
  constructor(private logger: LoggerService) {}
  
  increment() {
    setState(() => {
      this.count.value += this.step.value;
    });
    this.logger.info(`Counter incremented to ${this.count.value}`);
  }
  
  decrement() {
    if (this.canDecrement()) {
      setState(() => {
        this.count.value -= this.step.value;
      });
      this.logger.info(`Counter decremented to ${this.count.value}`);
    } else {
      this.logger.warn('Cannot decrement below 0');
    }
  }
  
  reset() {
    setState(() => {
      this.count.value = 0;
    });
    this.logger.info('Counter reset to 0');
  }
  
  setStep(value: number) {
    setState(() => {
      this.step.value = value;
    });
    this.logger.debug(`Step changed to ${value}`);
  }
  
  onInit() {
    this.logger.info('CounterService initialized');
  }
  
  onDestroy() {
    this.logger.info('CounterService destroyed');
  }
}

