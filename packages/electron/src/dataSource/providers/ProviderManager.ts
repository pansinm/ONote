import type { IDataSourceProvider } from './IDataSourceProvider';

class ProviderManager {
  private providers: Record<string, IDataSourceProvider<any>> = {};

  register<T>(provider: IDataSourceProvider<T>) {
    this.providers[provider.providerId()] = provider;
  }

  getProvider<T>(id: string): IDataSourceProvider<T> | undefined {
    return this.providers[id];
  }
}

export default ProviderManager;
