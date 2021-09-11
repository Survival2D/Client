using System.Collections;
using System.Collections.Generic;
using Nakama;
using UnityEngine;
using UnityEngine.UI;

public class Handler : MonoBehaviour
{
    public Text text;
    
    private const string PrefKeyName = "nakama.session";

    private string _input;

    private IClient _client = new Client("http", "127.0.0.1", 7350, "defaultkey");

    private ISession _session;

    private async void Start()
    {
        // var authtoken = PlayerPrefs.GetString(PrefKeyName);
        // if (!string.IsNullOrEmpty(authtoken))
        // {
        //     var session = Session.Restore(authtoken);
        //     if (!session.IsExpired)
        //     {
        //         _session = session;
        //         Debug.Log(_session);
        //         return;
        //     }
        // }

        var deviceid = SystemInfo.deviceUniqueIdentifier;
        _session = await _client.AuthenticateDeviceAsync(deviceid);
        PlayerPrefs.SetString(PrefKeyName, _session.AuthToken);
        Debug.Log(_session);
    }

    public void ReadInput(string input)
    {
        _input = input;
        Debug.Log(input);
    }

    public async void onTienTest()
    {
        var payload = _input;
        Debug.Log(payload);
        var rpcid = "TienTest";
        var result = await _client.RpcAsync(_session, rpcid, payload);
        text.text = result.Payload;
        Debug.LogFormat("Result: {0}", result);
    }
}