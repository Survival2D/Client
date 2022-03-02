class SetDisplayName
    {
        readonly delay:number= 1;

         private  inputField:cc.EditBox = null;
        private  firstPart:string[] = null;
        private  secondPart:string[] = null;

        private  nakamaUserManager:NakamaUserManager = null;



        private onLoad()
        {
            nakamaUserManager = NakamaUserManager.Instance;
            nakamaUserManager.onLoaded += ObtainName;
            inputField.onValueChanged.AddListener(ValueChanged);
            if (nakamaUserManager.LoadingFinished)
                ObtainName();
        }

        private void OnDestroy()
        {
            inputField.onValueChanged.RemoveListener(ValueChanged);
            nakamaUserManager.onLoaded -= ObtainName;
        }

        private void ObtainName()
        {
            if (string.IsNullOrEmpty(nakamaUserManager.DisplayName))
                inputField.text = firstPart[Random.Range(0, firstPart.Length)] + secondPart[Random.Range(0, secondPart.Length)];
            else
                inputField.text = nakamaUserManager.DisplayName;
        }

        private void ValueChanged(string newValue)
        {
            CancelInvoke(nameof(UpdateName));
            Invoke(nameof(UpdateName), delay);
        }

        private void UpdateName()
        {
            if (inputField.text != nakamaUserManager.DisplayName)
                nakamaUserManager.UpdateDisplayName(inputField.text);
        }

        #endregion
    }
}
