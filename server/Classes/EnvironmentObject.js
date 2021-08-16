import e from "express";
import {
    Vector3
} from "three";

var TriangleDataObject = {
    Positions: [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 1, y: 0, z: 1 }
    ],
    Color: {
        r: 1,
        g: 0,
        b: 0,
        a: 0
    },
    Frequence: 1
}

var colors = [];
colors[0] = {
    r: 1,
    g: 0,
    b: 0,
    a: 0
}
colors[1] = {
    r: 1,
    g: 0.81,
    b: 0.91,
    a: 0
}
colors[2] = {
    r: 0.7,
    g: 0,
    b: 0.67,
    a: 0
}

class EnvironmentObject {
    Frequence = 1;
    Scale = 0.5;
    Speed = 0.1;
    data = {
        Triangles: []
    }

    constructor(context) {
        this.context = context;
    }

    Connect = (socket) => {
        this.socket = socket;

        this.socket.on("client-change-frequency", this.ChangeFrequency);
        this.socket.on("client-change-scale", this.ChangeScale);
    }
    ChangeFrequency = (data) => {

        this.Frequence = Math.max(0.01, data.frequency);
    }

    ChangeScale = (data) => {
        this.Scale = data.scale;
    }


    GetData = () => {
        return this.data;
    }
    ClearTriangles = () => {
        this.data.Triangles = [];
    }

    GetColor = (playerData) => {
        var lerpValue = 1 - (playerData.transform.headPosition.y / playerData.transform.headHeight)
        var color = playerData.color;

        return {
            r: color.r + (1 - color.r) * lerpValue,
            g: color.g + (1 - color.g) * lerpValue,
            b: color.b + (1 - color.b) * lerpValue,
            a: 1
        }
    }


    CreateTriangle(users) {
        this.data.Triangles = [];

        var midPoint = { x: 0, y: 0, z: 0 };

        var numberTris = Math.floor((users.length + 1) / 3);


        for (var tri = 0; tri < numberTris; tri++) {
            var triangle = Object.assign({}, TriangleDataObject);
            var colorList = [];

            var posCount = Math.min(users.length - tri * 3, 3) //1,2 or 3
            var positions = [];
            var posIdx = tri * 3; //0, 3, 6

            for (var i = 0; i < (posCount); i++) {
                positions[i] = users[posIdx + i].data.transform.position;
                colorList[i] = this.GetColor(users[posIdx + i].data);
                console.log("PLAYER COLOR ",colorList)
            }

            positions.map((p) => {
                midPoint.x += p.x
                midPoint.y += p.y
                midPoint.z += p.z
                return p
            })

            midPoint.x *= 1 / posCount;
            midPoint.y *= 1 / posCount;
            midPoint.z *= 1 / posCount;



console.log("SCALE ",this.Scale)
            positions = positions.map((pos) => {
                var direction = new Vector3(midPoint.x - pos.x, midPoint.y - pos.y, midPoint.z - pos.z);
                direction.normalize();
                return {
                    x: pos.x + direction.x * this.Scale,
                    y: pos.y + direction.y * this.Scale,
                    z: pos.z + direction.z * this.Scale
                }
            })

            Object.assign(triangle, {
                Positions: positions,
                Frequence: this.Frequence,
                Color: colorList
            });

            this.data.Triangles[tri] = triangle;

        }

        return this.data;

    }
}



export default EnvironmentObject;