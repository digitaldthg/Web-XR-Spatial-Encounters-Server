import e from "express";

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
        this.data.Triangles = [];

        var midPoint = { x: 0, y: 0, z: 0 };

        var numberTris = Math.ceil(users.length / 3);

        //console.log("Player Count ßßß " , users.length);
        //console.log("Triangles " , numberTris);

        for (var tri = 0; tri < numberTris; tri++) {
            var triangle = Object.assign({}, TriangleDataObject);
            //console.log("----Init Tri ", tri, this.data.Triangles.length);
            var posCount = Math.min(users.length, 3) //2 or 3
            var positions = [];
            var posIdx = tri * 3; //0, 3, 6

            if (posIdx + 3 > users.length && tri > 0) {
                posIdx += (users.length - (posIdx + 3));
            }
            for (var i = 0; i < (posCount); i++) {
                positions[i] = users[posIdx + i].data.transform.position;
            }

            positions.map((p) => {
                midPoint.x += p.x
                midPoint.y += p.y
                midPoint.z += p.z
                return p
            })
   
            midPoint.x *= 1/posCount;
            midPoint.y *= 1/posCount;
            midPoint.z *= 1/posCount;

            positions =  positions.map((pos) => {
                return { x: pos.x + (midPoint.x - pos.x)*this.Scale, y: pos.y + (midPoint.y - pos.y)*this.Scale, z: pos.z + (midPoint.z - pos.z)*this.Scale}
            })

            Object.assign(triangle, {
                Positions: positions,
                Frequence: this.Frequence,
                Color: colors[tri]
            });
            
            this.data.Triangles[tri] = triangle;
            
        }
        // this.data.Triangles.forEach((triData, idx) => {
        //     console.log("data tris ", idx, triData.Frequence);
        // });
        return this.data;

        /* for (int tri = 0; tri < numberTris; tri++) {
             Vector3[] positions = new Vector3[Mathf.Min(players.Count,3) + 1];
             Debug.Log("Positions " + positions.Length);
             int posIdx = tri * 3;
             Debug.Log("Start Idx: " + posIdx);
     
             if (posIdx + 3 > players.Count && tri >0 ) {
                 posIdx += (players.Count - (posIdx + 3));
             }
             for (int i = 0; i < (positions.Length-1); i++) {
                 Debug.Log("idx " + (tri+i)+" players "+players.Count);
                 GameObject p = players[posIdx + i] as GameObject;
                 positions[i] = p.transform.position;
             }
             GameObject lastPos = players[posIdx] as GameObject;
             positions[positions.Length - 1] = lastPos.transform.position;
             Vector3 midPoint = Vector3.zero;
             for (int p = 0; p < positions.Length; p++) {
                 midPoint += positions[p];
             }
             midPoint /= positions.Length;
             for (int p = 0; p < positions.Length; p++)
             {
                 positions[p] = new Vector3(positions[p].x + (midPoint.x - positions[p].x) * (1-triangleScale), 0, positions[p].z + (midPoint.z - positions[p].z) * (1-triangleScale));
             }
             Color color = colors[tri % 3];
             GameObject shape = Instantiate(linePrefab);
             if (useGradient) {
                 color = gradients[tri % 3].Evaluate((midPoint.x + 10) / 20);
             }
             shape.GetComponent<Shape>().CreateShape(positions,color);
         }*/






        //calculat triangle center
        /*users.map((user) => {
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
                //return { x: pos.x + (midPoint.x - pos.x)*this.Scale, y: pos.y + (midPoint.y - pos.y)*this.Scale, z: pos.z + (midPoint.z - pos.z)*this.Scale};
                return { x: pos.x , y: pos.y , z: pos.z };
            }),
            Frequence: this.Frequence,
            Color: {
                r: Math.random(),
                g: Math.random(),
                b: Math.random(),
                a: Math.random()
            }
        });
        console.log("Create Tri:" ,triangle);
    
        this.data.Triangles.push(triangle);*/

    }
}



export default EnvironmentObject;