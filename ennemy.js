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

function Ennemy(type) {
    this.initParameters(type);

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

Ennemy.prototype.initParameters = function (type) {
    this.width = 0.2;
    this.height = 0.2;
    this.position = [Math.random() * (0.9 + 0.9) - 0.9, Math.random() * (2.5 - 1.2) + 1.2];
    if (type === 1 || type === 2) {
        this.type = type;
    } else {
        this.type = 1;
    }
    //this.position = [0.0,0.0];
}

Ennemy.prototype.setParameters = function (elapsed) {
    // on pourrait animer des choses ici
}

Ennemy.prototype.getPosition = function () {
    return this.position;
}

Ennemy.prototype.getType = function () {
    return this.type;
}

Ennemy.prototype.setPosition = function (x, y) {
    this.position = [x, y];
}

Ennemy.prototype.move = function () {
    var x = this.position[0];
    var y = this.position[1];
    if (this.type === 1) {
        this.position = [x - Math.sin(y) * 0.0015, y - 0.01];
    }
    if (this.type === 2) {
        this.position = [x + Math.sin(y) * 0.0035, y - 0.025];
    }
}

Ennemy.prototype.shader = function () {
    return ennemyShader;
}

Ennemy.prototype.sendUniformVariables = function () {
    gl.uniform2fv(ennemyShader.positionUniform, this.position);
}

Ennemy.prototype.init = function (missiles,ennemies,explosions,spaceship) {
    gl.useProgram(this.shader());
    this.sendUniformVariables();
    if (!document.pause) {
        this.move();
    }
    var position = this.getPosition();
    this.ennemy = this;
    missiles.forEach(function (missile) {
        var position_missile = missile.getPosition();
        var position_ennemy = this.ennemy.getPosition();
        var diff_x = Math.abs(position_ennemy[0] - position_missile[0]);
        var diff_y = Math.abs(position_ennemy[1] - position_missile[1]);
        if ((diff_x < 0.1 && diff_x > 0) && (diff_y < 0.1 && diff_y > 0)) {
            console.log(diff_x);
            delete missiles[missiles.indexOf(missile)];
            delete ennemies[ennemies.indexOf(this.ennemy)];
            ennemies.push(new Ennemy);
            ennemies.push(new Ennemy);
            explosions.push(new Explosion(position_missile[0], position_missile[1], new Date().getTime()));
            console.log(diff_x);
            console.log(diff_y);
            console.log('ennemy destroyed');
            document.score++;
            document.scoreElement.innerHTML = document.score;
            console.log(document.scoreElement);
        }
    }, this);
    var position_spaceship = spaceship.getPosition();
    var diff_x = Math.abs(position_spaceship[0] - position[0]);
    var diff_y = Math.abs(position_spaceship[1] - position[1]);
    if ((diff_x < 0.1 && diff_x > 0) && (diff_y < 0.1 && diff_y > 0)) {
        delete ennemies[ennemies.indexOf(this.ennemy)];
        ennemies.push(new Ennemy);
        console.log('spaceship destroyed');
        if (document.scoreMax < document.score) {
            document.scoreMax = document.score;
            document.scoreMaxElement.innerHTML = document.score;
        }
        document.score = 0;
        document.scoreElement.innerHTML = document.score;
        explosions.push(new Explosion(position[0], position[1], new Date().getTime(), 2.5));
        ennemies = [];
        missiles = [];
        spaceship = new Spaceship();
        ennemies.push(new Ennemy);
    }

    if (position[1] < -1.2) {
        var index = ennemies.indexOf(this);
    }
    gl.activeTexture(gl.TEXTURE0); // on active l'unite de texture 0
    if (this.getType() === 1) {
        gl.bindTexture(gl.TEXTURE_2D, window['tennemy1']); // on place maTexture dans l'unitÃ© active
    }
    if (this.getType() === 2) {
        gl.bindTexture(gl.TEXTURE_2D, window['tennemy2']); // on place maTexture dans l'unitÃ© active
    }
    gl.enable(gl.BLEND, this);
    gl.depthMask(false);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(this.maTextureUniform, 0); // on dit au shader que maTextureUniform se trouve sur l'unite de texture 0
    this.draw();
    gl.depthMask(true);
    gl.disable(gl.BLEND);
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


