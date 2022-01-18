import { reactive } from 'vue';

export interface State {
  userId?: number;
}

export class Store implements State {
  public static readonly state: State = reactive<State>({});

  public static set userId(value: number) {
    this.state.userId = value;
    this.save();
  }

  public static get userId(): number {
    return this.state.userId || 0;
  }

  public static hydrate() {
    const stateJson = localStorage.getItem('state');
    if (stateJson) {
      Object.assign(Store.state, JSON.parse(stateJson));
    }
  }

  private static save() {
    const stateJson = JSON.stringify(Store.state);
    localStorage.setItem('state', stateJson);
  }
}
