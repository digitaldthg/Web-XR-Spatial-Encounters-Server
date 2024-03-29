/**
 * Kreiiert ein neues UserdataObject
 * @param {object} data 
 * @returns {object} Ein Object mit sämtlichen Informationen über eine Userin
 */
const UserData = (data = {}) => {

    var userObj = {
        id: null,
        role: 0,
        visible: true,
        transform: {
            headHeight: 1.75,
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            headPosition: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
        },
        color: {
            r: 0.81,
            g: 0.88,
            b: 0.88,
            a: 1,
        },
    };

    Object.keys(data).map((keyName) => {
        if (userObj.hasOwnProperty(keyName)) {
            if (typeof (userObj[keyName]) === 'object' && userObj[keyName] != null && data.hasOwnProperty(keyName)) {
                userObj[keyName] = Object.assign(userObj[keyName], data[keyName]);
            } else {
                if (data.hasOwnProperty(keyName)) {
                    userObj[keyName] = data[keyName];
                }
            }
        }
    });

    return userObj;
}

export default UserData;