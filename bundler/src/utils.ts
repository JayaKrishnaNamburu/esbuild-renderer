type ClassContructor<K> = new (...args: unknown[]) => K;

export class Container<Instances> {
  static getInstnace<Instances>() {
    if (!Container.instance) {
      Container.instance = new Container<Instances>();
    }
    return Container.instance;
  }

  private static instance: Container<any>;
  private nameMap: Record<string, ClassContructor<Instances[keyof Instances]>>;
  private instanceMap: Map<
    ClassContructor<Instances[keyof Instances]>,
    Instances[keyof Instances] | null
  >;

  constructor() {
    this.instanceMap = new Map();
    this.nameMap = {};
  }

  register<T extends keyof Instances>(
    key: keyof Instances,
    classInstance: ClassContructor<Instances[T]>
  ) {
    if (this.nameMap[key as string]) {
      throw new Error(`Class is already registered`);
    }

    this.nameMap[key as unknown as string] = classInstance;
    this.instanceMap.set(classInstance, null);
  }

  getInstance<T extends keyof Instances>(key: T): Instances[T] {
    const constructor = this.nameMap[key as unknown as string];
    if (!constructor) {
      throw new Error(`Class ${String(key)} is not registered`);
    }

    let createdInstance = this.instanceMap.get(constructor);
    if (!createdInstance) {
      createdInstance = new constructor();
      this.instanceMap.set(constructor, createdInstance);
    }

    return createdInstance as Instances[T];
  }
}

export function provide<Instances>(key: keyof Instances) {
  return <K extends new (...args: any[]) => Instances[keyof Instances]>(
    target: K
  ): K => {
    Container.getInstnace<Instances>().register(key, target);
    return target;
  };
}

export function inject<Instances>(key: keyof Instances) {
  return (target: any, propKey: string) => {
    Object.defineProperty(target, propKey, {
      get: () => {
        return Container.getInstnace<Instances>().getInstance(key);
      },
    });
    return target;
  };
}
