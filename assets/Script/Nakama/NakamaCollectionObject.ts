class NakamaCollectionObject {
  readonly MenuName = "Nakama/Collection object";

  public collection: string;
  public key: string;
  public value: string;
  public version: string;

  public onUpdated = null;

  public resetData() {
    this.value = "";
    this.version = "";
  }

  public setValue(newValue: string) {
    this.value = newValue;
  }

  public getValue(): string {
    return this.value;
  }

  public setDatabaseValue(newValue: string, newVersion: string) {
    this.value = newValue;
    this.version = newVersion;
    this.onUpdated?.Invoke();
  }
}
