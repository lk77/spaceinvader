var explosionShader;

function initExplosionShader() {
    explosionShader = initShaders("explosion-vs", "explosion-fs");

    // active ce shader
    gl.useProgram(explosionShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    explosionShader.vertexPositionAttribute = gl.getAttribLocation(explosionShader, "aVertexPosition");
    gl.enableVertexAttribArray(explosionShader.vertexPositionAttribute); // active cet attribut 

    // pareil pour les coordonnees de texture 
    explosionShader.vertexCoordAttribute = gl.getAttribLocation(explosionShader, "aVertexCoord");
    gl.enableVertexAttribArray(explosionShader.vertexCoordAttribute);

    // adresse de la variable uniforme uOffset dans le shader
    explosionShader.positionUniform = gl.getUniformLocation(explosionShader, "uPosition");

    console.log("explosion shader initialized");
}

function Explosion(x,y,time,factor) {
    factor = factor || 1;
    this.initParameters(x,y,time);

    // cree un nouveau buffer sur le GPU et l'active
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    // un tableau contenant les positions des sommets (sur CPU donc)
    var wo2 = 0.5 * factor*  this.width;
    var ho2 = 0.5 * factor * this.height;

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
    console.log("explosion initialized");
}

Explosion.prototype.initParameters = function (x,y,time) {
    this.width = 0.2;
    this.height = 0.2;
    this.position = [x, y];
    this.time = time;
    this.state = 0;
    this.end = false;
    //this.position = [0.0,0.0];
}

Explosion.prototype.setParameters = function (time) {
    if(time > (this.time + 100)){
        this.state = 1;
    }
    if(time > (this.time + 200)){
        this.state = 2;
    }
    /*if(time > (this.time + 300)){
        this.state = 3;
    }*/
    if(time > (this.time + 400)){
        this.end = true;
    }
}

Explosion.prototype.getTime = function () {
    return this.time;
}

Explosion.prototype.getPosition = function () {
    return this.position;
}

Explosion.prototype.setPosition = function (x, y) {
    this.position = [x, y];
}

Explosion.prototype.shader = function () {
    return explosionShader;
}

Explosion.prototype.sendUniformVariables = function () {
    gl.uniform2fv(explosionShader.positionUniform, this.position);
}

Explosion.prototype.draw = function () {
    // active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(explosionShader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // active le buffer de coords
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
    gl.vertexAttribPointer(explosionShader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // dessine les buffers actifs
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
    gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}


