/**
 * Created by quantm7 on 9/10/2022.
 */

const Config = function () {};

Config.FPS = 60;

Config.IS_OFFLINE = false;

/**
 * SPEED: pixel per frame
 */
Config.PLAYER_BASE_SPEED = 10;
Config.BULLET_BASE_SPEED = 20;

Config.BULLET_CREATE_DISTANCE = 10;

Config.PLAYER_RADIUS = 30;
Config.ITEM_RADIUS = 35;

Config.PLAYER_MAX_HP = 100;

Config.MINI_MAP_SCALE = 0.3;

Config.COOLDOWN_FIRE = 0.1;     // second
Config.COOLDOWN_ATTACK = 0.2;   // second

Config.SYNC_DELTA_TIME = 2;     // second