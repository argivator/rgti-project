// Global variable definition
var canvas;
var gl;
var shaderProgram;

var konecIgre = false;

var counterShowConsole = 0;

var zombiesKilled = 0;

// Buffers
var outerWallVertexPositionBuffer= null;
var outterWallVertexTextureCoordBuffer = null;
var outterWallVertexIndexBuffer = null;

var worldVertexPositionBuffer = null;
var worldVertexTextureCoordBuffer = null;

var playerVertexPositionBuffer = null;
var playerVertexTextureCoordBuffer = null;
var playerVertexIndexBuffer = null;

var headVertexPositionBuffer = null;
var headVertexTextureCoordBuffer = null;
var headVertexIndexBuffer = null;

var zombieVertexPositionBuffer = null;
var zombieVertexTextureCoordBuffer = null;
var zombieVertexIndexBuffer = null;

var wallVertexPositionBuffer = null;
var wallVertexTextureCoordBuffer = null;
var wallVertexIndexBuffer = null;

var bulletVertexPositionBuffer = null;
var bulletVertexTextureCoordBuffer = null;
var bulletVertexIndexBuffer = null;
// bullets
var bullets = [];
var stevecMetkov = 0; // za identifikacijo dolocenega metka
var lahkoStrelja = true;

var stMetkov = 10;


// wall config

var walls = [];
// level config

var level = 1;
var levelClear = false;
var zacetnoZombijev = 5;

// zombie configurations

var zombiesNr = zacetnoZombijev;
var zombies = [];
var zombieMS = 0;
var zombieXsmer = 1;
var zombieYsmer = 1;
var spremenjeno = 0;

var skacejo = false; // ali skacejo al monotono hodjo (false - monotono)
var maxHitrostZombijev = 0.01;

// Model-View and Projection matrices
var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var currentlyPressedKeys = {};

//koordinate kamere za pogled celotne mape
// premik kamere po X osi
var fullViewCameraPositionX = 0;
// premik kamere po Y osi
var fullViewCameraPositionY = -4;
// premik kamere po Z osi
var fullViewCameraPositionZ = -2.6;
// rotacija kamere po Y osi
var fullViewCameraRotationY = 45;

// koordinate kamere ki sledijo igralcu
var playerCameraMoveX = 0;
var playerCameraMoveY = 0;
var playerCameraMoveZ = 0;
var playerCameraRotationY = 40;
var playerCameraPositonX = 0;
var playerCameraPositionY = -4.5;
var playerCameraPositionZ = 2.7;



//premik "igralca" levo/desno
var playerMovementLR = 0;
//premik "igralca" gor/dol
var playerMovementUpDown = 0;
//rotacija igralca
var playerXposition = 0;
var playerYposition = 0;

var playerRotation = 0;

// izbira kamere
var camera1 = true;
var buttonVpressed = false;   // zazna pritisk tipke V za zamenjavo kamere (da se ob pritisku kamera ne zamenja 100x)
var buttonBpressed = false;   // zazna pritisk tipke B za zamenjavo nacina vrtenja
var rotation8Controlls = false;

var cameraPositionX;
var cameraPositionY;
var cameraPositionZ;
var cameraRotationY;
switchCameraView();


var texturesLoaded = 0;

var grassTexture;
var playerTexture;
var wallTexture;
var bulletTexture;
var eyeTexture;
var fogTexture;
var headTexture

var playerSpeed = 0.02;
// generiranje random stevil znotraj mej prvi in drugi (tudi randomly negativno)

var generirajStevilo = function(prvi, drugi){
  var stevilo = ((Math.random() * drugi) + prvi);
  var neg = Math.random();
  if(neg < 0.5) stevilo = stevilo * -1;
  return stevilo;
}

// objekt Zombie

function Zombie(X, Y, smerX, smerY, ms, rot){
  this.x = X;
  this.y = Y;
  this.smerX = smerX;
  this.smerY = smerY;  // smerX (1 -> x se mora večati, -1 -> x se mora manjsati) (GLEDE NA IGRALCA)
  this.ms = ms;   // movement speed
  this.rot = rot; // rotacija
  this.health = 100;
}
Zombie.prototype.draw = function(rot){
  mvPushMatrix();

      //var x = zombies[i].x;
      //var y = zombies[i].y;
      var x = this.x;
      var y = this.y;


      mat4.identity(mvMatrix);
      mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);

      // v ktero smer obrnjen:
      var smerX = this.smerX;
      var smerY = this.smerY;




      mat4.translate(mvMatrix, [x, 0, y]);
      mat4.rotateY(mvMatrix, rot);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, zombieTexture);
      gl.uniform1i(shaderProgram.samplerUniform, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, zombieVertexTextureCoordBuffer);
      gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, zombieVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, zombieVertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, zombieVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, zombieVertexIndexBuffer);
      setMatrixUniforms();
      gl.drawElements(gl.TRIANGLES, zombieVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
      //console.log("pushed real good");

      mvPopMatrix();
}
// objekt bullets
function Bullet(x, y, rot){
  this.x = x;
  this.y = y;
  this.rot = rot;
}

























function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}
function radToDeg(rad){
  return rad*180 / Math.PI;
}
//
// initGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initGL(canvas) {
  var gl = null;
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch(e) {}

  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  return gl;
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  // Didn't find an element with the specified ID; abort.
  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) {
        shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  // Now figure out what type of shader script we have,
  // based on its MIME type.
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object
  gl.shaderSource(shader, shaderSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  // Create the shader program
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }

  // start using shading program for rendering
  gl.useProgram(shaderProgram);

  // store location of aVertexPosition variable defined in shader
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  // turn on vertex position attribute at specified position
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  // store location of aVertexNormal variable defined in shader
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

  // store location of aTextureCoord variable defined in shader
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  // store location of uPMatrix variable defined in shader - projection matrix
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  // store location of uMVMatrix variable defined in shader - model-view matrix
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  // store location of uSampler variable defined in shader
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

//
// setMatrixUniforms
//
// Set the uniforms in shaders.
//
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        TEXTURES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initTextures() {
  grassTexture = gl.createTexture();
  grassTexture.image = new Image();
  grassTexture.image.onload = function () {
    handleTextureLoaded(grassTexture)
  }
  grassTexture.image.src = "./assets/grass.jpg";

  playerTexture = gl.createTexture();
  playerTexture.image = new Image();
  playerTexture.image.onload = function() {
    handleTextureLoaded(playerTexture);
  }
  playerTexture.image.src = "./assets/clothes.jpg";

  // za zombije

  zombieTexture = gl.createTexture();
  zombieTexture.image = new Image();
  zombieTexture.image.onload = function() {
    handleTextureLoaded(zombieTexture);
  }
  zombieTexture.image.src = "./assets/zombie.png";

  // za zide

  wallTexture = gl.createTexture();
  wallTexture.image = new Image();
  wallTexture.image.onload = function(){
    handleTextureLoaded(wallTexture);
  }
  wallTexture.image.src = "./assets/wall.jpg";

  // bulleti
  bulletTexture = gl.createTexture();
  bulletTexture.image = new Image();
  bulletTexture.image.onload = function(){
    handleTextureLoaded(bulletTexture);
  }
  bulletTexture.image.src = "./assets/bullet.jpg";

  // head

  headTexture = gl.createTexture();
  headTexture.image = new Image();
  headTexture.image.onload = function(){
    handleTextureLoaded(headTexture);
  }
  headTexture.image.src = "./assets/skin.jpg";

  // oči

  eyeTexture = gl.createTexture();
  eyeTexture.image = new Image();
  eyeTexture.image.onload = function(){
    handleTextureLoaded(eyeTexture);
  }
  eyeTexture.image.src = "./assets/eye.jpg";

  //fog
  fogTexture = gl.createTexture();
  fogTexture.image = new Image();
  fogTexture.image.onload = function() {
    handleTextureLoaded(fogTexture);
  }
  fogTexture.image.src = "./assets/fog.jpg";

}

function handleTextureLoaded(texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Third texture usus Linear interpolation approximation with nearest Mipmap selection
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.bindTexture(gl.TEXTURE_2D, null);

  // when texture loading is finished we can draw scene.
  texturesLoaded += 1;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        LOAD WORLD
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// funkcija za nalaganje sveta (podn)
function loadWorld() {
  // outer wall
  var oWVertexPositions = [
    -3.375, 0,  4.025,
    -3.375, 0, -3.025,
    -3.375, 1, -3.025,
    -3.375, 1,  4.025,

    -3.375, 0, -3.025,
    3.375, 0, -3.025,
    3.375, 1, -3.025,
    -3.375, 1, -3.025,

    3.375, 0, -3.025,
    3.375, 0, 4.025,
    3.375, 1, 4.025,
    3.375, 1, -3.025
  ];

  outerWallVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, outerWallVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oWVertexPositions), gl.STATIC_DRAW);
  outerWallVertexPositionBuffer.itemSize = 3;
  outerWallVertexPositionBuffer.numItems = 12;

  var oWvertexTextureCoords = [
    0, 0,
    4, 0,
    4, 1,
    0, 1,

    0, 0,
    4, 0,
    4, 1,
    0, 1,

    0, 0,
    4, 0,
    4, 1,
    0, 1
  ];

  outterWallVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, outterWallVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oWvertexTextureCoords), gl.STATIC_DRAW);
  outterWallVertexTextureCoordBuffer.itemSize = 2;
  outterWallVertexTextureCoordBuffer.numItems = 12;

  // buffer ki naredi trikotnike iz koordinat kocke
  outterWallVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outterWallVertexIndexBuffer);
  var oWIndices = [
    0, 1, 2,      0, 2, 3,    // Left face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Right face
    12, 13, 14,   12, 14, 15, // Front vertical face
    16, 17, 18,   16, 18, 19, // Front Horizontal
    20, 21, 22,   20, 22, 23,
    24, 25, 26,   24, 26, 27  //
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(oWIndices), gl.STATIC_DRAW);
  outterWallVertexIndexBuffer.itemSize = 1;
  outterWallVertexIndexBuffer.numItems = 18;


  //koordinate velikosti/oblike sveta
  var vertexPositions = [
     -3.375, 0, -3.025,
     -3.375, 0,  4.025,
      3.375, 0,  4.025,

     -3.375, 0, -3.025,
      3.375, 0, -3.025,
      3.375, 0,  4.025
      ];



  //koordinate texture sveta (vecje stevilke (trenutno 5) ---> veckrat ponovljena textura)
  var vertexTextureCoords = [
    0, 5,
    0, 0,
    5, 0,

    0, 5,
    5, 5,
    5, 0];

  //ustvarjanje bufferja za svet
  worldVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
  worldVertexPositionBuffer.itemSize = 3;
  worldVertexPositionBuffer.numItems = 6;

  //ustvarjanje bufferja za texture
  worldVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
  worldVertexTextureCoordBuffer.itemSize = 2;
  worldVertexTextureCoordBuffer.numItems = 6;

  // zidovi
  var xm = 0; // X minimum
  var xb = 0.05;    // X maximum
  var zm = 0;  // Z minimum
  var zb = 0.5;   // Z maximum
  var v = 0.2;      // visina
  var wallVertexes = [
    // front
    /*
    -1.75, 0, -1.6,
    -1,    0, -1.6,
    -1,    2, -1.6,
    -1.75, 2, -1.6,
    */
    xm, 0, zm,
    xb, 0, zm,
    xb, v, zm,
    xm, v, zm,
    //side right

    xb, 0, zm,
    xb, 0, zb,
    xb, v, zb,
    xb, v, zm,

    // back

    xb, 0, zb,
    xm, 0, zb,
    xm, v, zb,
    xb, v, zb,

    // left
    xm, 0, zb,
    xm, 0, zm,
    xm, v, zm,
    xm, v, zb,

    // top
    xb, v, zm,
    xb, v, zb,
    xm, v, zb,
    xm, v, zm,

    // bottom
    xb, 0, zm,
    xb, 0, zb,
    xm, 0, zb,
    xm, 0, zm

  ];

  wallVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallVertexes), gl.STATIC_DRAW);
  wallVertexPositionBuffer.itemSize = 3;
  wallVertexPositionBuffer.numItems = 24;

  var wallTextures = [
    // front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // right
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    // back
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    // left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // top
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    // bottom
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0
  ];

  wallVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallTextures), gl.STATIC_DRAW);
  wallVertexTextureCoordBuffer.itemSize = 2;
  wallVertexTextureCoordBuffer.numItems = 24;

  wallVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wallVertexIndexBuffer);
  var wallVertexIndices = [
    0, 1, 2,    0, 2, 3,    // front
    16, 17, 18,   16, 18, 19, // Right face
    4, 5, 6,      4, 6, 7,    // Back face
    20, 21, 22,   20, 22, 23,  // Left face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15 // Bottom face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wallVertexIndices), gl.STATIC_DRAW);
  wallVertexIndexBuffer.itemSize = 1;
  wallVertexIndexBuffer.numItems = 36;


}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        LOAD PLAYER
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// funkcija za nalaganje igralca (zaenkrat kocke :) )
function loadPlayer() {
  var scP = 0.05;  //velikost kocke
  var vertexPositions = [
     // Front face
     -scP, 0,  scP,
     scP, 0,  scP,
     scP,  scP,  scP,
     -scP,  scP,  scP,

     // Back face
     -scP, 0, -scP,
     -scP,  scP, -scP,
     scP,  scP, -scP,
     scP, 0, -scP,

     // Top face
     -scP,  scP, -scP,
     -scP,  scP,  scP,
     scP,  scP,  scP,
     scP,  scP, -scP,

     // Bottom face
     -scP, 0, -scP,
     scP, 0, -scP,
     scP, 0,  scP,
     -scP, 0,  scP,

     // Right face
     scP, 0, -scP,
     scP,  scP, -scP,
     scP,  scP,  scP,
     scP, 0,  scP,

     // Left face
     -scP, 0, -scP,
     -scP, 0,  scP,
     -scP,  scP,  scP,
     -scP,  scP, -scP
  ];

  // ustcarjanje bufferja za igralca
  playerVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, playerVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
  playerVertexPositionBuffer.itemSize = 3;
  playerVertexPositionBuffer.numItems = 24;

  // koordinate texture kocke (lego face)
  var textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,



    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ];

  // ustvarjanje bufferja za lego face
  playerVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, playerVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  playerVertexTextureCoordBuffer.itemSize = 2;
  playerVertexTextureCoordBuffer.numItems = 24;

  // buffer ki naredi trikotnike iz koordinat kocke
  playerVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, playerVertexIndexBuffer);
  var playerVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(playerVertexIndices), gl.STATIC_DRAW);
  playerVertexIndexBuffer.itemSize = 1;
  playerVertexIndexBuffer.numItems = 36;


  // GLAVA IGRALCA

  scP = 0.03;  //velikost kocke
  vertexPositions = [
     // Front face
     -scP, 0,  scP,
     scP, 0,  scP,
     scP,  scP,  scP,
     -scP,  scP,  scP,

     // Back face
     -scP, 0, -scP,
     -scP,  scP, -scP,
     scP,  scP, -scP,
     scP, 0, -scP,

     // Top face
     -scP,  scP, -scP,
     -scP,  scP,  scP,
     scP,  scP,  scP,
     scP,  scP, -scP,

     // Bottom face
     -scP, 0, -scP,
     scP, 0, -scP,
     scP, 0,  scP,
     -scP, 0,  scP,

     // Right face
     scP, 0, -scP,
     scP,  scP, -scP,
     scP,  scP,  scP,
     scP, 0,  scP,

     // Left face
     -scP, 0, -scP,
     -scP, 0,  scP,
     -scP,  scP,  scP,
     -scP,  scP, -scP
  ];

  // ustcarjanje bufferja za igralca
  headVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
  headVertexPositionBuffer.itemSize = 3;
  headVertexPositionBuffer.numItems = 24;

  // koordinate texture kocke (lego face)
  textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,



    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ];

  // ustvarjanje bufferja za lego face
  
  headVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  headVertexTextureCoordBuffer.itemSize = 2;
  headVertexTextureCoordBuffer.numItems = 24;

  // buffer ki naredi trikotnike iz koordinat kocke
  
  headVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headVertexIndexBuffer);
  playerVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(playerVertexIndices), gl.STATIC_DRAW);
  headVertexIndexBuffer.itemSize = 1;
  headVertexIndexBuffer.numItems = 36;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        INIT/LOAD ZOMBIES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initZombies(){

  for(var i = 0; i < zombiesNr; i++){
    var st = Math.floor((Math.random() * 8) + 1);
    initZombie(st);
    }
}
function loadZombie(){
    mvPushMatrix();

    var scP = 0.07;  //velikost kocke
    var vertexPositions = [
       // Front face
       -scP, 0,  scP,
       scP, 0,  scP,
       scP,  scP,  scP,
       -scP,  scP,  scP,

       // Back face
       -scP, 0, -scP,
       -scP,  scP, -scP,
       scP,  scP, -scP,
       scP, 0, -scP,

       // Top face
       -scP,  scP, -scP,
       -scP,  scP,  scP,
       scP,  scP,  scP,
       scP,  scP, -scP,

       // Bottom face
       -scP, 0, -scP,
       scP, 0, -scP,
       scP, 0,  scP,
       -scP, 0,  scP,

       // Right face
       scP, 0, -scP,
       scP,  scP, -scP,
       scP,  scP,  scP,
       scP, 0,  scP,

       // Left face
       -scP, 0, -scP,
       -scP, 0,  scP,
       -scP,  scP,  scP,
       -scP,  scP, -scP
    ];

    // ustcarjanje bufferja za zombie
    zombieVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, zombieVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    zombieVertexPositionBuffer.itemSize = 3;
    zombieVertexPositionBuffer.numItems = 24;

    // koordinate texture kocke (lego face)
    var textureCoords = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,



      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ];

    // ustvarjanje bufferja za lego face
    zombieVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, zombieVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    zombieVertexTextureCoordBuffer.itemSize = 2;
    zombieVertexTextureCoordBuffer.numItems = 24;

    // buffer ki naredi trikotnike iz koordinat kocke
    zombieVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, zombieVertexIndexBuffer);
    var zombieVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(zombieVertexIndices), gl.STATIC_DRAW);
    zombieVertexIndexBuffer.itemSize = 1;
    zombieVertexIndexBuffer.numItems = 36;

    mvPopMatrix();
}
function initZombie(idx){
  //console.log("klic za indeks: " + idx);
  var randomSt1 = generirajStevilo(0, 0.5);
  var randomSt2 = generirajStevilo(0, 0.5);
  //console.log(randomSt1 + " " + randomSt2);
  var defaultMovement = 0.01;
  switch(idx){
    case 1:
      zombies.push(new Zombie(2.8 + randomSt1, 2.8 + randomSt2, -1, -1, defaultMovement, 0));  // spodi desno
      break;
    case 2:
      zombies.push(new Zombie(2.8+ randomSt1, -2.8 + randomSt2, -1, 1, defaultMovement, 0)); // zgori desno
      break;
    case 3:
     zombies.push(new Zombie(-2.8+ randomSt1, 2.8 + randomSt2, 1, -1, defaultMovement, 0)); // spodi levo
      break;
    case 4:
      zombies.push(new Zombie(-2.8+ randomSt1, -2.8 + randomSt2, 1, 1, defaultMovement, 0)); // zgori levo
      break;
    case 5:
      zombies.push(new Zombie(0+ randomSt1, 2.8 + randomSt2, 1, -1, defaultMovement, 0)); // sredina spodi
      break;
    case 6:
      zombies.push(new Zombie(0+ randomSt1, -2.8 + randomSt2, 1, 1, defaultMovement, 0)); // sredina zgori
      break;
    case 7:
      zombies.push(new Zombie(-2.8+ randomSt1, 0 + randomSt2, 1, 1, defaultMovement, 0)); // levo sredina
      break;
    case 8:
      zombies.push(new Zombie( 2.8+ randomSt1, 0 + randomSt2, -1, 1, defaultMovement, 0)); // desno sredina
      break;
    default:
      break;
  }



}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        BULLETS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function addBullet(){
  bullets.push(new Bullet(playerXposition, playerYposition, playerRotation));
  //console.log(playerXposition + " " + playerYposition);
  //console.log(playerMovementLR, playerMovementUpDown, playerRotation);
  var bulletSound = new Audio('./sounds/bullet.wav');
  bulletSound.play();
}
function drawBullets(){


  for(var i in bullets){
    if(bullets[i]){
      if(bullets[i].x > 10 || bullets[i].y > 10) bullets[i] = null; // nastavi, ce gre bullet iz mape.
      else{
        var x = bullets[i].x;
        var y = bullets[i].y;
        var rot = bullets[i].rot;

        rot = rot%360;
        if(rot < 0) rot = rot + 360;
        rot = rot;
        rot = degToRad(rot);


        var hipotenuza = 0.1;  // kako hitro hocemo, da se premika metek
        var deltaX;
        var deltaY;
        if(rot < 90){                   // desno gor

          deltaX = hipotenuza * Math.cos(rot);
          deltaY = hipotenuza * Math.sin(rot);
          deltaY = -deltaY;

        }else if(rot == 90){

          deltaX = 0;
          deltaY = -hipotenuza;

        }else if(rot > 90 && rot < 180){ // levo gor

          deltaX = hipotenuza * Math.cos(rot);
          deltaY = hipotenuza * Math.sin(rot);
          deltaY = -deltaY;

        }else if(rot == 180){
          deltaX = -hipotenuza;
          deltaY = 0;
        }else if(rot > 180 && rot < 270){  // levo dol
          deltaX = hipotenuza * Math.cos(rot);
          deltaY = hipotenuza * Math.sin(rot);
          deltaY = -deltaY;
        }else if(rot == 270){
          deltaX = 0;
          deltaY = hipotenuza;
        }else if(rot > 270 && rot < 360){
          deltaX = hipotenuza * Math.cos(rot);
          deltaY = hipotenuza * Math.sin(rot);
          deltaY = -deltaY;
        }


        mvPushMatrix();

        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);

        mat4.translate(mvMatrix, [x, 0, y]);
        mat4.rotateY(mvMatrix, rot);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, bulletTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bulletVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, bulletVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bulletVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, bulletVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bulletVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, bulletVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        //console.log("pushed real good");

        mvPopMatrix();

        bullets[i].x += deltaX;
        bullets[i].y += deltaY;

      }

    }
  }
}

function loadBullet(){
  var scP = 0.05;  //velikost kocke
  var vertexPositions = [
     // Front face
     -scP, 0,  scP,
     scP, 0,  scP,
     scP,  scP,  scP,
     -scP,  scP,  scP,

     // Back face
     -scP, 0, -scP,
     -scP,  scP, -scP,
     scP,  scP, -scP,
     scP, 0, -scP,

     // Top face
     -scP,  scP, -scP,
     -scP,  scP,  scP,
     scP,  scP,  scP,
     scP,  scP, -scP,

     // Bottom face
     -scP, 0, -scP,
     scP, 0, -scP,
     scP, 0,  scP,
     -scP, 0,  scP,

     // Right face
     scP, 0, -scP,
     scP,  scP, -scP,
     scP,  scP,  scP,
     scP, 0,  scP,

     // Left face
     -scP, 0, -scP,
     -scP, 0,  scP,
     -scP,  scP,  scP,
     -scP,  scP, -scP
  ];

  // ustcarjanje bufferja za igralca
  bulletVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bulletVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
  bulletVertexPositionBuffer.itemSize = 3;
  bulletVertexPositionBuffer.numItems = 24;

  // koordinate texture kocke (lego face)
  var textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,



    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ];

  // ustvarjanje bufferja za lego face

  bulletVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bulletVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  bulletVertexTextureCoordBuffer.itemSize = 2;
  bulletVertexTextureCoordBuffer.numItems = 24;

  // buffer ki naredi trikotnike iz koordinat kocke
  bulletVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bulletVertexIndexBuffer);
  var bulletIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bulletIndices), gl.STATIC_DRAW);
  bulletVertexIndexBuffer.itemSize = 1;
  bulletVertexIndexBuffer.numItems = 36;
}
function manageLevel(){
  var vsiMrtvi = true;

  for(var i in zombies){
    if(zombies[i] != null) vsiMrtvi = false;
  }

  if(vsiMrtvi){
    levelClear = true;
    document.getElementById("valTekst").classList.toggle("skrito");
    document.getElementById("valSt").classList.toggle("skrito");

    zombies = [];
    level++;
    zombiesNr = zacetnoZombijev * level;

    setTimeout(function(){
      initZombies();
      levelClear = false;
      document.getElementById("valTekst").classList.toggle("skrito");
      document.getElementById("valSt").classList.toggle("skrito");


    }, 10000);
    var sekund = 10;
    reset();
    function reset(){
      document.getElementById("valSt").innerHTML = sekund;
      sekund -= 1;
      if(sekund >= 0){
        setTimeout(reset, 1000);
      }

    }

  }



}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        DRAW SCENE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// drawScene
//
// Draw the scene.
//
function drawScene() {
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // preventiva da gre igralec iz trave
  if(playerXposition + playerMovementLR > 3.3) {
    playerMovementLR = 0;
    playerCameraMoveX = 0;
  }
  if(playerXposition + playerMovementLR < -3.3) {
    playerMovementLR = 0;
    playerCameraMoveX = 0;
  }

  if(playerYposition + playerMovementUpDown > 3.92) {
    playerMovementUpDown = 0;
    playerCameraMoveY = 0;
    playerCameraMoveZ = 0;
  }
  if(playerYposition + playerMovementUpDown < -3) {
    playerMovementUpDown = 0;
    playerCameraMoveY = 0;
    playerCameraMoveZ = 0;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //collisionDetection
    var wallRect1 = {x: 1.1, y: -0.8, width: 0.12, height: 1.0};
    var wallRect2 = {x: 1.1, y: 0.5, width: 0.12, height: 1};
    var wallRect3 = {x: 0.11, y: 1.4, width: 1.1, height: 0.12};
    var wallRect4 = {x: -1.15 , y: 1.4, width: 1, height: 0.12};
    var wallRect5 = {x: -1.2, y: 0.5, width: 0.12, height: 1};
    var wallRect6 = {x: -1.2, y: -0.8, width: 0.12, height: 0.95};
    var wallRect7 = {x: -1.15, y: -0.9, width: 1.095, height: 0.12};
    var wallRect8 = {x: 0.17, y: -0.9, width: 1, height: 0.12};

    var playerXRect = {x: playerXposition + playerMovementLR, y: playerYposition, width: 0.05, height: 0.05};
    if (collision(playerXRect, wallRect1) ||
        collision(playerXRect, wallRect2) ||
        collision(playerXRect, wallRect3) ||
        collision(playerXRect, wallRect4) ||
        collision(playerXRect, wallRect5) ||
        collision(playerXRect, wallRect6) ||
        collision(playerXRect, wallRect7) ||
        collision(playerXRect, wallRect8)) {

    } else {
      playerXposition += playerMovementLR;
      playerCameraPositonX += playerCameraMoveX;
    }
    var playerYRect = {x: playerXposition, y: playerYposition + playerMovementUpDown, width: 0.05, height: 0.05};
    if (collision(playerYRect, wallRect1) ||
        collision(playerYRect, wallRect2) ||
        collision(playerYRect, wallRect3) ||
        collision(playerYRect, wallRect4) ||
        collision(playerYRect, wallRect5) ||
        collision(playerYRect, wallRect6) ||
        collision(playerYRect, wallRect7) ||
        collision(playerYRect, wallRect8)) {

    } else {
      playerYposition += playerMovementUpDown;
      playerCameraPositionY += playerCameraMoveY;
      playerCameraPositionZ += playerCameraMoveZ;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BULLET WALL collision
    for (b in bullets) {
      if (bullets[b] == null) continue;

      var bulletRect = {x: bullets[b].x, y: bullets[b].y, width: 0.05, height: 0.05};
      if (collision(bulletRect, wallRect1) ||
          collision(bulletRect, wallRect2) ||
          collision(bulletRect, wallRect3) ||
          collision(bulletRect, wallRect4) ||
          collision(bulletRect, wallRect5) ||
          collision(bulletRect, wallRect6) ||
          collision(bulletRect, wallRect7) ||
          collision(bulletRect, wallRect8)) {
            bullets[b] = null;
          }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //console.log("draw scene");
  // set the rendering environment to full canvas size
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (worldVertexTextureCoordBuffer == null || worldVertexPositionBuffer == null) {
    return;
  }

  // kamera: premiki in rotacija glede na tipke
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.translate(pMatrix, [cameraPositionX, cameraPositionY, cameraPositionZ]);
  mat4.rotateX(pMatrix, degToRad(cameraRotationY));


  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  mat4.identity(mvMatrix);

  //premik sveta za -7 po Z koordinati
  mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);

  // Activate textures
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, grassTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  // Set the texture coordinates attribute for the vertices.
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Draw the world by binding the array buffer to the world's vertices
  // array, setting attributes, and pushing it to GL.
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Draw the world.
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer.numItems);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fogTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  // Set the texture coordinates attribute for the vertices.
  gl.bindBuffer(gl.ARRAY_BUFFER, outterWallVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, outterWallVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, outerWallVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, outerWallVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outterWallVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, outterWallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  // izris igralca (zaenkrat kocke)
  mat4.translate(mvMatrix, [playerXposition, 0.0, playerYposition]);
  mat4.rotateY(mvMatrix, degToRad(playerRotation)); // rotacija


  // izpisemo v console X in Y pozicijo igralca vsakih 500 klicov metode drawScene ( ZA POMOČ )
  if(counterShowConsole > 500){
    //console.log("Trenutna pozicija: " + playerXposition + " " + playerYposition);
    counterShowConsole = 0;
  }else{
    counterShowConsole += 1;
  }



  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, playerTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, playerVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, playerVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, playerVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, playerVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, playerVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, playerVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  // glava

  mat4.translate(mvMatrix, [0, 0.05, 0]);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, headTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, headVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, headVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, headVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  // trebuh
  mat4.translate(mvMatrix, [0.03, -0.04, 0]);
  
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, headTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, headVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, headVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, headVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, headVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, headVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  // roke

  mat4.translate(mvMatrix, [-0.02, 0, 0]);
  mat4.scale(mvMatrix, [1, 1, 2]);
  
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, headTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, headVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, headVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, headVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, headVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, headVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

// oci

mat4.translate(mvMatrix, [0.025, 0.052, 0.01]);
mat4.scale(mvMatrix, [0.1, 0.3, 0.1]);

  // desna

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, eyeTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, headVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, headVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, headVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  // leva
  mat4.translate(mvMatrix, [0, 0, -0.2]);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, eyeTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, headVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, headVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, headVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


  // ZIDOVI

    // zidovi
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [1.1, 0, -7.86]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, wallTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, wallVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, wallVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wallVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


    mat4.translate(mvMatrix, [0, 0, 0.5]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.8]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.5]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.rotateY(mvMatrix, degToRad(-90));
    mat4.translate(mvMatrix, [0.45, 0, 0]);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.5]);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.8]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.5]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.rotateY(mvMatrix, degToRad(-90));
    mat4.translate(mvMatrix, [0.45, 0, 0]);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.5]);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.8]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.5]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.rotateY(mvMatrix, degToRad(-90));
    mat4.translate(mvMatrix, [0.45, 0, 0]);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.5]);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.8]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mat4.translate(mvMatrix, [0, 0, 0.5]);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, wallVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);





  // izris zombijev

  // da zombiji ne hodijo skos enako hitro, ampak v valih (kot koraki)
  if(zombieMS < 0.005) zombieMS += 0.0001;
  //else zombieMS = 0.0005; // TUKI SM SPREMENU TAK DA CE NE DELA RIP XD.



  for(var i in zombies){
    if (zombies[i] == null) continue;
    //zombies[i].draw();



    // PREMIKANJE ZOMBIJEV (sory za grdo kodo rip :(

    var st1 = generirajStevilo(0, 1);
    var st2 = generirajStevilo(0, 1);
    var treshold = 0.5; // ce bo random generirano stevilo med 0 in 1 manjse od tresholda se bo naredu pozitivni premik, drugac negativni
                        // (malo bolj random)
    if(skacejo){
      if(zombies[i].ms >= maxHitrostZombijev){
        // se spremeni smer kam skacejo
        //console.log(zombies[i].x +  " and " + playerMovementLR);
        if(zombies[i].x < playerXposition){


          zombies[i].smerX = 1;
        }else{

          zombies[i].smerX = -1;

        }
        if(zombies[i].y < playerYposition){
          zombies[i].smerY = 1;

        }else{
          zombies[i].smerY = -1;

        }
        //console.log("skok");
        zombies[i].ms = 0.00001;

      }
    }else{
      if(zombies[i].x < playerXposition){


                zombies[i].smerX = 1;
              }else{

                zombies[i].smerX = -1;

              }
              if(zombies[i].y < playerYposition){
                zombies[i].smerY = 1;

              }else{
                zombies[i].smerY = -1;

              }
      zombies[i].ms = maxHitrostZombijev;
    }


      var deltaX;
      var deltaY;
      if(zombies[i].smerX == 1){
        deltaX = (playerXposition - zombies[i].x);
      }else{
        deltaX = (zombies[i].x - playerXposition);
      }

      if(zombies[i].smerY == 1){
        deltaY = playerYposition - zombies[i].y;
      }else{
        deltaY = zombies[i].y - playerYposition;
      }

      // console.log(deltaX +  " " + deltaY); // vecji kot je delta vecji more bit ms v tej smeri!

      var vsotaObeh = deltaX + deltaY;

      var spremembaX = deltaX / vsotaObeh;
      var spremembaY = deltaY / vsotaObeh;

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
      var zombieXRect;
      var sprX = zombies[i].ms * spremembaX;
      if (zombies[i].smerX == 1) zombieXRect = {x: zombies[i].x + sprX, y: zombies[i].y, width: 0.07, height: 0.07};
      else zombieXRect = {x: zombies[i].x - sprX, y: zombies[i].y, width: 0.07, height: 0.07};
      if (collision(zombieXRect, wallRect1) ||
          collision(zombieXRect, wallRect2) ||
          collision(zombieXRect, wallRect3) ||
          collision(zombieXRect, wallRect4) ||
          collision(zombieXRect, wallRect5) ||
          collision(zombieXRect, wallRect6) ||
          collision(zombieXRect, wallRect7) ||
          collision(zombieXRect, wallRect8)) {
          spremembaX = 0;
      }

      var zombieYRect;
      var sprY = zombies[i].ms * spremembaY;
      if (zombies[i].smerY == 1) zombieYRect = {x: zombies[i].x, y: zombies[i].y + sprY, width: 0.07, height: 0.07};
      else zombieYRect = {x: zombies[i].x, y: zombies[i].y - sprY, width: 0.07, height: 0.07};
      if (collision(zombieYRect, wallRect1) ||
          collision(zombieYRect, wallRect2) ||
          collision(zombieYRect, wallRect3) ||
          collision(zombieYRect, wallRect4) ||
          collision(zombieYRect, wallRect5) ||
          collision(zombieYRect, wallRect6) ||
          collision(zombieYRect, wallRect7) ||
          collision(zombieYRect, wallRect8)) {
          spremembaY = 0;
      }
//////////////////////////////////////////////////////////////////////////////////////////////////////////
      var zombie2Rect;
      for (j in zombies) {
        if (j == i || zombies[j] == null) continue;

        zombie2Rect = {x: zombies[j].x, y: zombies[j].y, width: 0.1, height: 0.1};
        if (collision(zombieXRect, zombie2Rect)) spremembaX = 0;
        if (collision(zombieYRect, zombie2Rect)) spremembaY = 0;
      }
//////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (collision({x: playerXposition, y: playerYposition, width: 0.07, height: 0.07}, {x: zombies[i].x, y: zombies[i].y, width: 0.07, height: 0.07})) {
        // GAME OVER PLAYER DEAD!!
        //console.log("YOU DEAD MAN!");
        konecIgre = true;
        document.getElementById("gameOver").classList.toggle("skrito");
        document.getElementById("score").innerHTML = zombiesKilled;
        var audio = new Audio('./sounds/gameOver.wav');
        audio.play();

      }
//////////////////////////////////////////////////////////////////////////////////////////////////////////
      var bulletRect;
      for (k in bullets) {
        if (bullets[k] == null) continue;
        bulletRect = {x: bullets[k].x, y: bullets[k].y, width: 0.1, height: 0.1};

        if (collision(bulletRect, {x: zombies[i].x, y: zombies[i].y, width: 0.07, height: 0.07})) {
          bullets[k] = null;
          zombies[i].health -= 50;
          if(zombies[i].health > 0){
            var zombieHitAudio = new Audio('./sounds/zombieHit.wav');
            zombieHitAudio.play();
          }

        }
      }
//////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (zombies[i].health <= 0) {
        zombies[i] = null;
        zombiesKilled += 1;
        var zombieDead = new Audio('./sounds/zombieDied.wav');
        zombieDead.play();
        continue;
      }
//////////////////////////////////////////////////////////////////////////////////////////////////////////

      var test = spremembaX + spremembaY;
      //console.log("Vsota: " + vsotaObeh + ", X + Y: " + test);
      var sprememba;
      if(zombies[i].smerX == 1){
        sprememba = zombies[i].ms * spremembaX;
        if(sprememba > 0.04) sprememba = 0.04;

        zombies[i].x += sprememba;
      }else{
        sprememba = zombies[i].ms * spremembaX;
        if(sprememba > 0.04) sprememba = 0.04;

        zombies[i].x -= sprememba;
      }
      if(zombies[i].smerY == 1){
        sprememba = zombies[i].ms * spremembaY;
        if(sprememba > 0.04) sprememba = 0.04;

        zombies[i].y += sprememba;
      }else{
        sprememba = zombies[i].ms * spremembaY;
        if(sprememba > 0.04) sprememba = 0.04;

        zombies[i].y -= sprememba;
      }
      // DOLOCANJE ROTACIJE
      var rot;
      if(zombies[i].smerX == -1 && zombies[i].smerY == -1){
        rot = Math.atan(deltaY / deltaX);
        rot = -rot;
        rot = rot - degToRad(90);


      }
      if(zombies[i].smerX == 1 && zombies[i].smerY == 1){
        rot = Math.atan(deltaY / deltaX);
        rot = -rot;

      }
      if(zombies[i].smerX == -1 && zombies[i].smerY == 1){
        rot = Math.atan(deltaX / deltaY);
        rot = -rot;
        rot = rot - degToRad(90);

      }
      if(zombies[i].smerX == 1 && zombies[i].smerY == -1){
        rot = Math.atan(deltaY / deltaX);
      }




      if(skacejo){
        zombies[i].ms += 0.002; // TO SPREMENI ZA 'SKAKANJE'
      }

      //console.log(zombieMS);

      zombies[i].draw(rot);
      //zombies[i].draw(zombies[i]);
   // }



 }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        COLLISION DETECTION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//    Axis-Aligned Bounding Box
function collision(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width &&
       rect1.x + rect1.width > rect2.x &&
       rect1.y < rect2.y + rect2.height &&
       rect1.height + rect1.y > rect2.y) {
        return true;
    }
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        KEYS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Keyboard handling helper functions
//
// handleKeyDown    ... called on keyDown event
// handleKeyUp      ... called on keyUp event
//
function handleKeyDown(event) {
  // storing the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = true;
  if(event.keyCode != 116){ // ni f5
    event.preventDefault();
  }


}

function handleKeyUp(event) {
  // reseting the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = false;
}

//
// handleKeys
//
// Called every time before redeawing the screen for keyboard
// input handling. Function continuisly updates helper variables.
//
function handleKeys() {

  // tipke za navigacijo kamere (developer tools, kasneje izbrisemo)//
                                                                    //
  /*if (currentlyPressedKeys[33]) {                                   //
    // Page Up                                                      //
    cameraPositionZ -= 0.05;                                        //
    console.log("Z: " + cameraPositionZ);                           //
  }                                                                 //
  if (currentlyPressedKeys[34]) {                                   //
    // Page Down                                                    //
    cameraPositionZ += 0.05;                                        //
    console.log("Z: " + cameraPositionZ);                           //
  }                                                                 //
  if (currentlyPressedKeys[74]) {                                   //
    // L                                                            //
    cameraPositionX += 0.05;                                        //
    console.log("X: " + cameraPositionX);                           //
  }                                                                 //
  if (currentlyPressedKeys[76]) {                                   //
    // J                                                            //
    cameraPositionX -= 0.05;                                        //
    console.log("X: " + cameraPositionX);                           //
  }                                                                 //
  if (currentlyPressedKeys[73]) {                                   //
    // I                                                            //
    cameraPositionY -= 0.05;                                        //
    console.log("Y: " + cameraPositionY);                           //
  }                                                                 //
  if (currentlyPressedKeys[75]) {                                   //
    // K                                                            //
    cameraPositionY += 0.05;                                        //
    console.log("Y: " + cameraPositionY);                           //
  }                                                                 //
  if (currentlyPressedKeys[82]) {                                   //
    //R                                                             //
    cameraRotationY -= 0.05;                                        //
    console.log("R: " + cameraRotationY);                           //
  }                                                                 //
  if (currentlyPressedKeys[84]) {                                   //
    //T                                                             //
    cameraRotationY += 0.05;                                        //
    console.log("R: " + cameraRotationY);                           //
  }
  */                                                             //
//////////////////////////////////////////////////////////////////////

  if (currentlyPressedKeys[68] && currentlyPressedKeys[83]) {
    //D & S
    playerMovementLR = playerSpeed/2;
    playerCameraMoveX = -playerSpeed/2;
    playerMovementUpDown = playerSpeed/2;
    playerCameraMoveY = playerSpeed/2 * Math.sin(degToRad(playerCameraRotationY));
    playerCameraMoveZ = -playerSpeed/2 * Math.cos(degToRad(playerCameraRotationY));

  } else if (currentlyPressedKeys[68] && currentlyPressedKeys[87]) {
    // D & W
    playerMovementLR = playerSpeed/2;
    playerCameraMoveX = -playerSpeed/2;
    playerMovementUpDown = -playerSpeed/2;
    playerCameraMoveY = -playerSpeed/2 * Math.sin(degToRad(playerCameraRotationY));
    playerCameraMoveZ = playerSpeed/2 * Math.cos(degToRad(playerCameraRotationY));

  } else if (currentlyPressedKeys[87] && currentlyPressedKeys[65]) {
    // W & A
    playerMovementUpDown = -playerSpeed/2;
    playerCameraMoveY = -playerSpeed/2 * Math.sin(degToRad(playerCameraRotationY));
    playerCameraMoveZ = playerSpeed/2 * Math.cos(degToRad(playerCameraRotationY));
    playerMovementLR = -playerSpeed/2;
    playerCameraMoveX = playerSpeed/2;

  } else if (currentlyPressedKeys[65] && currentlyPressedKeys[83]) {
    // A & S
    playerMovementLR = -playerSpeed/2;
    playerCameraMoveX = playerSpeed/2;
    playerMovementUpDown = playerSpeed/2;
    playerCameraMoveY = playerSpeed/2 * Math.sin(degToRad(playerCameraRotationY));
    playerCameraMoveZ = -playerSpeed/2 * Math.cos(degToRad(playerCameraRotationY));

  } else {
    if (currentlyPressedKeys[87]) {
      // W only
      playerMovementUpDown = -playerSpeed;
      playerCameraMoveY = -playerSpeed * Math.sin(degToRad(playerCameraRotationY));
      playerCameraMoveZ = playerSpeed * Math.cos(degToRad(playerCameraRotationY));
    } else {
      playerMovementUpDown = 0;
      playerCameraMoveY = 0;
      playerCameraMoveZ = 0;
    }
    if (currentlyPressedKeys[65]) {
      // A only
      playerMovementLR = -playerSpeed;
      playerCameraMoveX = playerSpeed;

    } else {
      playerMovementLR = 0;
      playerCameraMoveX = 0;
    }
    if (currentlyPressedKeys[68]) {
      // D only
      playerMovementLR = playerSpeed;
      playerCameraMoveX = -playerSpeed;

    }
    if (currentlyPressedKeys[83]) {
      // S only
      playerMovementUpDown = playerSpeed;
      playerCameraMoveY = playerSpeed * Math.sin(degToRad(playerCameraRotationY));
      playerCameraMoveZ = -playerSpeed * Math.cos(degToRad(playerCameraRotationY));
    }

  }
  if(currentlyPressedKeys[37] && !rotation8Controlls){ // left
    if(currentlyPressedKeys[16]){
      playerRotation += 5;
    }else{
      playerRotation += 2;
    }
    
  }
  if(currentlyPressedKeys[39]  && !rotation8Controlls){ // right
    if(currentlyPressedKeys[16]){
      playerRotation -= 5;
    }else{
      playerRotation -= 2;
    }
  }

  if (currentlyPressedKeys[37] && currentlyPressedKeys[38] && rotation8Controlls) {
    // Left & Up
    playerRotation = 135;
  } else if (currentlyPressedKeys[37] && currentlyPressedKeys[40] && rotation8Controlls) {
    // Left & Down
    playerRotation = 225;
  } else if (currentlyPressedKeys[40] && currentlyPressedKeys[39] && rotation8Controlls) {
    // Down & Right
    playerRotation = 315;
  } else if (currentlyPressedKeys[39] && currentlyPressedKeys[38] && rotation8Controlls) {
    // Up & Right
    playerRotation = 45;
  } else {
    if (currentlyPressedKeys[37] && rotation8Controlls) {
      playerRotation = 180;
    }
    if (currentlyPressedKeys[38] && rotation8Controlls) {
      playerRotation = 90;
    }
    if (currentlyPressedKeys[39] && rotation8Controlls) {
      playerRotation = 0;
    }
    if (currentlyPressedKeys[40] && rotation8Controlls) {
      playerRotation = 270;
    }
  }




  ////////////////////// SHOOTING BULLETS ///////////////////////////////
  if(currentlyPressedKeys[32]){
    if(lahkoStrelja){
      addBullet();
      stMetkov = stMetkov - 1;
      document.getElementById("stevec").innerHTML = stMetkov;
      lahkoStrelja = false;
      if(stMetkov > 0){
        setTimeout(function(){
          lahkoStrelja = true;
        }, 200);
      }else{
        document.getElementById("stevec").innerHTML = "RELOADING!";
        document.getElementById("metkiStevec").classList.toggle("red");
        document.getElementById("metkiStevec").classList.toggle("yellow");
        var audio = new Audio('./sounds/reload.wav');
        audio.play();
        setTimeout(function(){
          setTimeout(function(){
            lahkoStrelja = true;
          }, 200);
          stMetkov = 10;
          document.getElementById("stevec").innerHTML = stMetkov;
          document.getElementById("metkiStevec").classList.toggle("red");
          document.getElementById("metkiStevec").classList.toggle("yellow");
        }, 3000);

      }

    }
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        CAMERA
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //change camera

  if (currentlyPressedKeys[86]) {
    //V
    if (!buttonVpressed) {
      switchCameraView();
      buttonVpressed = true
    }
  }
  else {
    buttonVpressed = false;
  }

  // toggle rotation (8 smeri / vse smeri)
  if (currentlyPressedKeys[66]) {
    // B
    if (!buttonBpressed) {
      buttonBpressed = true;
      switchRotationControls();
    }
    else{
      buttonBpressed = false;
    }
  }
}

function switchRotationControls() {
    if (rotation8Controlls)
        rotation8Controlls = false;
    else
      rotation8Controlls = true;
}

function switchCameraView() {
  if (camera1) {
    camera1=false;
  } else {
    camera1=true;
  }
}

function cameraMovement() {
  if (camera1) {
    cameraPositionX = playerCameraPositonX;
    cameraPositionY = playerCameraPositionY;
    cameraPositionZ = playerCameraPositionZ;
    cameraRotationY = playerCameraRotationY;
  } else {
    cameraPositionX = fullViewCameraPositionX;
    cameraPositionY = fullViewCameraPositionY;
    cameraPositionZ = fullViewCameraPositionZ;
    cameraRotationY = fullViewCameraRotationY;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                        START
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// start
function start() {
  canvas = document.getElementById("glcanvas");

  gl = initGL(canvas);      // Initialize the GL context

  // Only continue if WebGL is available and working
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
    gl.clearDepth(1.0);                                     // Clear everything
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    initShaders();

    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    initTextures();
    loadPlayer();
    loadWorld();
    loadZombie();
    initZombies();
    loadBullet();
    // Bind keyboard handling functions to document handlers
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    // Set up to draw the scene periodically every 15ms.
    setInterval(function() {
      if(!konecIgre){
        if (texturesLoaded == 8) {
          handleKeys();
          cameraMovement();

          drawScene();
          drawBullets();
          if(!levelClear){
            manageLevel();
          }

        }
      }

    }, 20);
  }
}


// prikaz/skrivanje pomoči:
function togglePrikazPodatkov(){
  document.getElementById("pomoc").classList.toggle("skrito");
}
