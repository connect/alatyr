/**
 * Options and Global variables
 *
 */

GQ              = 10; // geocube size
Quad            = 50;  // Quadrant size in QG

// OBJECT TYPES
//
TMP             = -1;
OBJ_GROUND      = 0;
OBJ_TREE        = 1;
OBJ_WATER       = 2;
OBJ_SNOW        = 3;
OBJ_SAND        = 4;
OBJ_SUN         = 5;
OBJ_GRASS       = 6;
OBJ_MOON        = 7;
OBJ_CLAY        = 8;
OBJ_HIGHGRASS   = 9;
OBJ_ROCK        = 10;

// CONTROL TYPES
//
CTRL_ORBIT      = 0;
CTRL_FREECAM    = 1;
CTRL_EYES       = 2;

//
// OPTIONS
//
var cfg             = {
    shadow          : 0,
    debug           : 1,
    debugMoon       : 0,
    debugSun        : 0,
    controls        : CTRL_EYES,
    worldWidth      : 300, 
    worldDepth      : 300,
    ready           : 0,
    antialias       : 0,
    eyeHeight       : GQ,
    sensitivity     : 1,
    waterHeight     : 0,
    snowHeight      : 10,
    worldVary       : 2.0,
    rocks           : 1,
    trees           : 1,
    grass           : 1
}
cfg.sunHeight       = cfg.worldWidth*GQ*1.5