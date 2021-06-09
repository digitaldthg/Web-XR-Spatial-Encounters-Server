var TriangleDataObject = {
    Positions: [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 1, y: 0, z: 1 }
    ],
    Color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random()
    },
    Frequence: .1
}

class EnvironmentObject {
    Frequence = .1;
    Scale = 1;
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
        console.log("Server Change Frequ:", data);

        this.Frequence = data.frequency;
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
    CreateTriangle(users) {
        var triangle = Object.assign({}, TriangleDataObject);
        var midPoint =  { x: 0, y: 0, z: 0 };
        //calculat triangle center
        users.map((user) => {
            midPoint.x += user.data.transform.position.x
            midPoint.y += user.data.transform.position.y
            midPoint.z += user.data.transform.position.z
            return user.data.transform.position
        })
        console.log("Mid Points before ", midPoint)
        console.log("User count ", Object.keys(users).length)
        
        var userCount = Object.keys(users).length
        midPoint.x *= 1/userCount;
        midPoint.y *= 1/userCount;
        midPoint.z *= 1/userCount;

        console.log("Mid Points ", midPoint)

        Object.assign(triangle, {
            Positions: users.map((user) => {
                var pos = user.data.transform.position;
                return { x: pos.x + (midPoint.x - pos.x)*this.Scale, y: pos.y + (midPoint.y - pos.y)*this.Scale, z: pos.z + (midPoint.z - pos.z)*this.Scale};
            }),
            Frequence: this.Frequence,
            Color: {
                r: Math.random(),
                g: Math.random(),
                b: Math.random(),
                a: Math.random()
            }
        });
        //console.log("Create Tri:" ,this.Frequence);

        this.data.Triangles.push(triangle);

    }
}



export default EnvironmentObject;