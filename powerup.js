var powerupShader;

function initPowerupShader() {
    powerupShader = initShaders("powerup-vs", "powerup-fs");

    // active ce shader
    gl.useProgram(powerupShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    powerupShader.vertexPositionAttribute = gl.getAttribLocation(powerupShader, "aVertexPosition");
    gl.enableVertexAttribArray(powerupShader.vertexPositionAttribute); // active cet attribut 

    // pareil pour les coordonnees de texture 
    powerupShader.vertexCoordAttribute = gl.getAttribLocation(powerupShader, "aVertexCoord");
    gl.enableVertexAttribArray(powerupShader.vertexCoordAttribute);

    // adresse de la variable uniforme uOffset dans le shader
    powerupShader.positionUniform = gl.getUniformLocation(powerupShader, "uPosition");

    console.log("powerup shader initialized");
}

function Powerup(x,y,time) {
    this.initParameters(x,y,time);

    // cree un nouveau buffer sur le GPU et l'active
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    // un tableau contenant les positions des sommets (sur CPU donc)
    var wo2 = 0.3 * this.width;
    var ho2 = 0.3 * this.height;

    var vertices = [
        -wo2, -ho2, -0.5,
        wo2, -ho2, -0.5,
        wo2, ho2, -0.5,
        -wo2, ho2, -0.5
    ];

    // on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.numItems = 4;

    // meme principe pour les couleurs
    this.coordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
    var coords = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    this.coordBuffer.itemSize = 2;
    this.coordBuffer.numItems = 4;

    // creation des faces du cube (les triangles) avec les indices vers les sommets
    this.triangles = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
    var tri = [0, 1, 2, 0, 2, 3];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
    this.triangles.numItems = 6;
    console.log("powerup initialized");
}

Powerup.prototype.initParameters = function (x,y,time) {
    this.width = 0.2;
    this.height = 0.2;
    this.position = [x,y];
    this.time = time;
    this.end = false;
}

Powerup.prototype.setParameters = function (time) {
    if(time > (this.time + 2500)){
        this.end = true;
    }
}

Powerup.prototype.getPosition = function () {
    return this.position;
}

Powerup.prototype.setPosition = function (x, y) {
    this.position = [x, y];
}

Powerup.prototype.move = function () {
    var x = this.position[0];
    var y = this.position[1];
    this.position = [x, y + 0.008];
}

Powerup.prototype.shader = function () {
    return powerupShader;
}

Powerup.prototype.sendUniformVariables = function () {
    gl.uniform2fv(powerupShader.positionUniform, this.position);
}

Powerup.prototype.draw = function () {
    // active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(powerupShader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // active le buffer de coords
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
    gl.vertexAttribPointer(powerupShader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // dessine les buffers actifs
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
    gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}


