import { StorageObject } from "@heroiclabs/nakama-js/client";
import ccclass = cc._decorator.ccclass;
import NakamaManager from "./NakamaManager";

@ccclass
export default class NakamaStorageManager extends cc.Component {
  static readonly OnLoadedData: string = "NakamaStorageManager.OnLoadedData";
  static instance: NakamaStorageManager = null;
  autoLoadObjects: NakamaCollectionObject[];
  onLoadedData = null;
  loadingFinished: boolean = false;

  onLoad() {
    NakamaStorageManager.instance = this;
  }

  start() {
    this.node.on(NakamaManager.OnLoginSuccess, this.autoLoad);
  }

  onDestroy() {
    this.node.off(NakamaManager.OnLoginSuccess, this.autoLoad);
  }

  autoLoad() {
    this.updateCollectionObjectsAsync(this.autoLoadObjects);
  }

  updateCollectionObject(collectionObject: NakamaCollectionObject) {
    this.updateCollectionObjectsAsync([collectionObject]);
  }

  updateCollectionObjects(collectionObjects: NakamaCollectionObject[]) {
    this.updateCollectionObjectsAsync(collectionObjects);
  }

  async updateCollectionObjectsAsync(
    collectionObjects: NakamaCollectionObject[]
  ) {
    if (!collectionObjects?.length) {
      this.onLoadedData?.Invoke();
      return;
    }

    let storageObjectIds =
      //: IApiReadStorageObjectId[]
      [];

    for (const collectionObject of collectionObjects) {
      // collectionObject.resetData();//Sao lại reset trước khi lưu?

      let storageObjectId: StorageObject = {
        collection: collectionObject.collection,
        key: collectionObject.key,
        user_id: NakamaManager.instance.session.user_id,
      };
      storageObjectIds.push(storageObjectId);

      let result = await NakamaManager.instance.client.listStorageObjects(
        NakamaManager.instance.session,
        storageObjectIds.toString()
      );
      result.objects.forEach((storageObject) => {
        collectionObjects.forEach((collectionObject) => {
          if (storageObject.key == collectionObject.key) {
            collectionObject.resetData(); //Reset trước khi lưu?
            collectionObject.setDatabaseValue(
              storageObject.value.toString(),
              storageObject.version
            );
          }
        });
      });
      this.loadingFinished = true;
      this.node.dispatchEvent(
        new cc.Event.EventCustom(NakamaStorageManager.OnLoadedData, true)
      );
    }
  }

  public async sendValueToServer(
    collectionObject: NakamaCollectionObject,
    newValue: object
  ) {
    let writeStorageObject: StorageObject = {
      collection: collectionObject.collection,
      key: collectionObject.key,
      value: newValue,
      version: collectionObject.version,
    };

    let objectIds = await NakamaManager.instance.client.writeStorageObjects(
      NakamaManager.instance.session,
      [writeStorageObject]
    );
    objectIds.acks.forEach((storageObject) => {
      if (storageObject.key == collectionObject.key) {
        collectionObject.setDatabaseValue(
          newValue.toString(),
          storageObject.version
        );
      }
    });
  }
}
