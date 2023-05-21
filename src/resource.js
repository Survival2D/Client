/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var game_UIs = {
  LOGIN_SCENE: "res/ui/LoginScene.json",
  LOBBY_SCENE: "res/ui/LobbyScene.json",
  HOME_SCENE: "res/ui/HomeScene.json",
  MATCH_SCENE: "res/ui/MatchScene.json",

  MINIMAP_LAYER: "res/ui/MiniMapUI.json",
  SAFE_ZONE_LAYER: "res/ui/SafeZoneUI.json",

  RESULT_LAYER: "res/ui/ResultGUI.json",
  SETTING_LAYER: "res/ui/SettingGUI.json"
};

var game_images = {
  obstacle_tree: "res/ui/Game/Obstacle/tree.png",
  obstacle_crate: "res/ui/Game/Obstacle/crate.png",
  obstacle_stone_1: "res/ui/Game/Obstacle/stone_1.png",
  obstacle_stone_2: "res/ui/Game/Obstacle/stone_2.png",
  obstacle_wall: "res/ui/Game/Obstacle/wall.png",

  bullet_trail: "res/ui/Game/bullet_trail.png",

  game_art: "res/ui/Game/game_art.png"
};

var game_plist = {
  game_art: "res/ui/Game/game_art.plist"
}

var game_fonts = {
  normal: "res/ui/Font/Roboto-Regular.ttf",
  bold: "res/ui/Font/Roboto-Bold.ttf"
}

var g_resources = [];
for (var i in game_UIs) {
    g_resources.push(game_UIs[i]);
}

for (var i in game_images) {
  g_resources.push(game_images[i]);
}

for (var i in game_plist) {
  g_resources.push(game_plist[i]);
}
