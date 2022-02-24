import {StorageObject} from "@heroiclabs/nakama-js/client";

class NakamaStorageManager {


    private autoLoadObjects: NakamaCollectionObject[];

    public onLoadedData = null;


    public static instance: NakamaStorageManager = null;
    public loadingFinished: boolean = false;

    private Awake() {
        NakamaStorageManager.instance = this;
    }

    private Start() {
        NakamaManager.instance.onLoginSuccess += AutoLoad;
    }

    private OnDestroy() {
        NakamaManager.instance.onLoginSuccess -= AutoLoad;
    }

    private AutoLoad() {
        this.updateCollectionObjectsAsync(this.autoLoadObjects);
    }

    public updateCollectionObject(collectionObject: NakamaCollectionObject) {
        this.updateCollectionObjectsAsync(new List<NakamaCollectionObject>()
        {
            collectionObject
        }
    )
        ;
    }

    public updateCollectionObjects(collectionObjects: IEnumerable<NakamaCollectionObject>) {
        this.updateCollectionObjectsAsync(collectionObjects);
    }

    private async updateCollectionObjectsAsync(collectionObjects: NakamaCollectionObject[]) {
        if (!collectionObjects?.length) {
            this.onLoadedData?.Invoke();
            return;
        }

        let storageObjectIds: IApiReadStorageObjectId[] = new List<IApiReadStorageObjectId>();

        collectionObjects.forEach(collectionObject => {
            // collectionObject.resetData();//Sao lại reset trước khi lưu?

            let storageObjectId: StorageObject = new StorageObject();
            storageObjectId.collection = collectionObject.collection;
            storageObjectId.key = collectionObject.key;
            storageObjectId.user_id = NakamaManager.Instance.Session.UserId;
            storageObjectIds.push(storageObjectId);
        });

        let result = await NakamaManager.instance.client.listStorageObjects(NakamaManager.instance.session, storageObjectIds.ToArray<IApiReadStorageObjectId>());
        result.objects.forEach(storageObject => {
            collectionObjects.forEach(collectionObject => {
                if (storageObject.key == collectionObject.key) {
                    collectionObject.resetData();//Reset trước khi lưu?
                    collectionObject.setDatabaseValue(storageObject.value, storageObject.version);
                }

            });
        })
        this.loadingFinished = true;
        this.onLoadedData?.Invoke();
    }

    public async sendValueToServer(collectionObject: NakamaCollectionObject, newValue: object) {
        let writeStorageObject: StorageObject = new StorageObject();
        writeStorageObject.collection = collectionObject.collection;
        writeStorageObject.key = collectionObject.key;
        writeStorageObject.value = newValue;
        writeStorageObject.version = collectionObject.version;

        let objectIds = await NakamaManager.instance.client.writeStorageObjects(NakamaManager.instance.session, [writeStorageObject]);
        objectIds.acks.forEach(storageObject => {
                if (storageObject.key == collectionObject.key) {
                    collectionObject.setDatabaseValue(newValue.toString(), storageObject.version);
                }
            }
        )
    }

}
