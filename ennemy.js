var ennemyShader;

function initEnnemyShader() {
    ennemyShader = initShaders("ennemy-vs", "ennemy-fs");

    // active ce shader
    gl.useProgram(ennemyShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    ennemyShader.vertexPositionAttribute = gl.getAttribLocation(ennemyShader, "aVertexPosition");
    gl.enableVertexAttribArray(ennemyShader.vertexPositionAttribute); // active cet attribut 

    // pareil pour les coordonnees de texture 
    ennemyShader.vertexCoordAttribute = gl.getAttribLocation(ennemyShader, "aVertexCoord");
    gl.enableVertexAttribArray(ennemyShader.vertexCoordAttribute);

    // adresse de la variable uniforme uOffset dans le shader
    ennemyShader.positionUniform = gl.getUniformLocation(ennemyShader, "uPosition");

    console.log("ennemy shader initialized");
}

function Ennemy() {
    this.initParameters();

    // cree un nouveau buffer sur le GPU et l'active
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    // un tableau contenant les positions des sommets (sur CPU donc)
    var wo2 = 0.5 * this.width;
    var ho2 = 0.5 * this.height;

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
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];
    /*
     * 0.0, 0.0,
     1.0, 0.0,
     1.0, 1.0,
     0.0, 1.0
     */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    this.coordBuffer.itemSize = 2;
    this.coordBuffer.numItems = 4;

    // creation des faces du cube (les triangles) avec les indices vers les sommets
    this.triangles = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
    var tri = [0, 1, 2, 0, 2, 3];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
    this.triangles.numItems = 6;
    console.log("ennemy initialized");
}

Ennemy.prototype.initParameters = function () {
    this.width = 0.2;
    this.height = 0.2;
    this.position = [Math.random() * (0.9 + 0.9) -0.9, Math.random() * (2.5 - 1.2) + 1.2];
    //this.position = [0.0,0.0];
}

Ennemy.prototype.setParameters = function (elapsed) {
    // on pourrait animer des choses ici
}

Ennemy.prototype.getPosition = function () {
    return this.position;
}

Ennemy.prototype.setPosition = function (x, y) {
    this.position = [x, y];
}

Ennemy.prototype.move = function () {
    var x = this.position[0];
    var y = this.position[1];
    this.position = [x, y - 0.01];
}

Ennemy.prototype.shader = function () {
    return ennemyShader;
}

Ennemy.prototype.sendUniformVariables = function () {
    gl.uniform2fv(ennemyShader.positionUniform, this.position);
}

Ennemy.prototype.draw = function () {
    // active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(ennemyShader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // active le buffer de coords
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
    gl.vertexAttribPointer(ennemyShader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // dessine les buffers actifs
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
    gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}


