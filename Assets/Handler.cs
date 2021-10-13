using System.Collections;
using System.Collections.Generic;
using Nakama;
using UnityEngine;
using UnityEngine.UI;
using System;
using System.Text.RegularExpressions;
using FlatBuffers;
using Nakama.TinyJson;
using Sample;
using Color = Sample.Color;
using Random = Unity.Mathematics.Random;

public class Handler : MonoBehaviour
{
    public Text text;

    private const string PrefKeyName = "nakama.session";

    private string _input;

    private IClient _client = new Client("http", "localhost", 7350, "defaultkey");

    private ISession _session;
    private ISocket _socket;
    private IMatchmakerMatched _match;
    private String _matchId;

    private async void Start()
    {
        Debug.developerConsoleVisible = true;
        Debug.LogError("I am an Error");
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

        // PlayerPrefs.SetString(PrefKeyName, _session.AuthToken);
        Debug.Log(_session);
    }

    public void ReadInput(string input)
    {
        _input = input;
        Debug.Log(input);
    }

    public async void onTienTest()
    {
        var id = _input;
        _session = await _client.AuthenticateCustomAsync("00000000000" + id);
        Debug.Log(_session.UserId);

        var payload = _input;
        Debug.Log(payload);
        // var rpcid = "TienTest";
        // var builder = new FlatBufferBuilder(1);
        //
        // // Create some weapons for our Monster ('Sword' and 'Axe').
        // var weapon1Name = builder.CreateString("Sword");
        // var weapon1Damage = 3;
        // var weapon2Name = builder.CreateString("Axe");
        // var weapon2Damage = 5;
        //
        // // Use the `CreateWeapon()` helper function to create the weapons, since we set every field.
        // var weaps = new Offset<Weapon>[2];
        // weaps[0] = Weapon.CreateWeapon(builder, weapon1Name, (short)weapon1Damage);
        // weaps[1] = Weapon.CreateWeapon(builder, weapon2Name, (short)weapon2Damage);
        //
        // // Serialize the FlatBuffer data.
        // var name = builder.CreateString("Orc");
        // var treasure = new byte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
        // var inv = Monster.CreateInventoryVector(builder, treasure);
        // var weapons = Monster.CreateWeaponsVector(builder, weaps);
        // var pos = Vec3.CreateVec3(builder, 1.0f, 2.0f, 3.0f);
        //
        // Monster.StartMonster(builder);
        // Monster.AddPos(builder, pos);
        // Monster.AddHp(builder, (short)300);
        // Monster.AddName(builder, name);
        // Monster.AddInventory(builder, inv);
        // Monster.AddColor(builder, Color.Red);
        // Monster.AddWeapons(builder, weapons);
        // Monster.AddEquippedType(builder, Equipment.Weapon);
        // Monster.AddEquipped(builder, weaps[1].Value);
        // var orc = Monster.EndMonster(builder);
        //
        // builder.Finish(orc.Value); // You could also call `Monster.FinishMonsterBuffer(builder, orc);`.

        // Debug.Log(builder.DataBuffer.GetStringUTF8(0, builder.DataBuffer.Length));

        // var result = await _client.RpcAsync(_session, rpcid, payload);
        // text.text = result.Payload;
        // Debug.LogFormat("Result: {0}", result);

        _socket = _client.NewSocket();
        _socket.Connected += () => { Debug.Log("Socket connected."); };
        _socket.Closed += () => { Debug.Log("Socket closed."); };
        _socket.ReceivedMatchState += OnReceiveInGamePacket;
        _socket.ReceivedMatchmakerMatched += OnMatchmakerMatched;

        await _socket.ConnectAsync(_session);
        var query = "*";
        var minCount = 2;
        var maxCount = 2;
        var matchmakerTicket = await _socket.AddMatchmakerAsync(query, minCount, maxCount);
        Debug.Log(matchmakerTicket.ToJson());
    }

    private async void OnMatchmakerMatched(IMatchmakerMatched matched)
    {
        _match = matched;
        _matchId = matched.MatchId;
        Debug.LogFormat("Received: {0}", _match);
        _socket.ReceivedMatchmakerMatched -= OnMatchmakerMatched;
        await _socket.JoinMatchAsync(_match);
    }

    public async void sendInGamePacket()
    {
        var id = _matchId;
        var opCode = 1;
        var newState = new Dictionary<string, string> { { "hello", "world" } }.ToJson();
        Debug.LogFormat("Before send {0} {1} {2}", id, opCode, newState);
        await _socket.SendMatchStateAsync(id, opCode, newState);
    }

    private void OnReceiveInGamePacket(IMatchState newState)
    {
        var enc = System.Text.Encoding.UTF8;
        var content = enc.GetString(newState.State);
        Debug.Log(content);
        switch (newState.OpCode)
        {
            case 101:
                Debug.Log("A custom opcode.");
                break;
            default:
                Debug.LogFormat("User '{0}'' sent '{1}'", newState.ToJson(), content);
                break;
        }
    }
}