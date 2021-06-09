var TriangleDataObject = {
    Positions:[
        {x : 0, y : 0, z: 0},
        {x : 2, y : 0, z: 0},
        {x : 1, y : 0, z: 1}
    ],
    Color :  { 
        r: Math.random(), 
        g: Math.random(), 
        b: Math.random(), 
        a : Math.random()
    },
    Frequence: .1
}

class EnvironmentObject {
    Frequence = .1;
    data = {
        Triangles : []
    }

    constructor(context){
        this.context = context;
    }

    Connect = (socket) =>{
        this.socket = socket;

        this.socket.on("client-change-frequency", this.ChangeFrequency);
    }
    ChangeFrequency = (data)=>{
        console.log(data);

        this.Frequence = data.frequency;
    }

    GetData = () => {
        return this.data;
    }
    ClearTriangles = () =>{
        this.data.Triangles = [];
    }
    CreateTriangle(users){
        
        var triangle = Object.assign({}, TriangleDataObject);

        Object.assign(triangle, {
            Positions : users.map((user)=>{
                return user.data.transform.position
            }),
            Frequence : this.Frequence,
            Color : { 
                r: Math.random(), 
                g: Math.random(), 
                b: Math.random(), 
                a : Math.random()
            }
        });

        
        this.data.Triangles.push(TriangleDataObject);

    }
}



export default EnvironmentObject;