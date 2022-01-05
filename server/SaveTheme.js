const fs = require("fs");

export default function (data){
  //console.log(data)
  var dir = './tmp';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  var tmpFolder = dir + "/" + data.name.replace(/ /g,"");
  if (!fs.existsSync(tmpFolder)){
    fs.mkdirSync(tmpFolder);
  }

  const saveObject = {
    "name":data.name,
    "fog_color":data.fog_color,
    "triangle_colors": [ data.triangle_colors_1, data.triangle_colors_2, data.triangle_colors_3, data.triangle_colors_4, data.triangle_colors_5, data.triangle_colors_6, data.triangle_colors_7, data.triangle_colors_8, data.triangle_colors_9],
    "triangle_color_bottom":data.triangle_color_bottom,
    "gradient_sun" : [
      {
        "stop" : data.gradient_sun_stop_1,
        "value" : data.gradient_sun_color_1
      },
      {
        "stop" : data.gradient_sun_stop_2,
        "value" : data.gradient_sun_color_2
      }
    ],
    
    "base_floor":[{
      "stop" : data.base_floor_stop,
      "value" :  data.base_floor_color
      }
    ],
    "gradient_skybox": [
      {
        "stop" : data.gradient_skybox_stop_1,
        "value" : data.gradient_skybox_color_1
      },
      {
        "stop" : data.gradient_skybox_stop_2,
        "value" : data.gradient_skybox_color_2
      },
      {
        "stop" : data.gradient_skybox_stop_3,
        "value" : data.gradient_skybox_color_3
      },
      {
        "stop" : data.gradient_skybox_stop_4,
        "value" : data.gradient_skybox_color_4
      }
    ],
    "gradient_fogFloor" : [
      {
        "stop" : data.gradient_fogFloor_stop_1,
        "value" : data.gradient_fogFloor_color_1
      },
      {
        "stop" : data.gradient_fogFloor_stop_2,
        "value" : data.gradient_fogFloor_color_2
      },
      {
        "stop" : data.gradient_fogFloor_stop_3,
        "value" : data.gradient_fogFloor_color_3
      }
    ],
    "gradient_fogFloorAlpha" : [
      {
        "stop" : data.gradient_fogFloorAlpha_stop_1,
        "value" : data.gradient_fogFloorAlpha_color_1
      },
      {
        "stop" : data.gradient_fogFloorAlpha_stop_2,
        "value" : data.gradient_fogFloorAlpha_color_2
      },
      {
        "stop" : data.gradient_fogFloorAlpha_stop_3,
        "value" : data.gradient_fogFloorAlpha_color_3
      },
      {
        "stop" : data.gradient_fogFloorAlpha_stop_4,
        "value" : data.gradient_fogFloorAlpha_color_4
      }
    ],
    "gradient_bg_front" : [
      {
        "stop" : data.gradient_bg_front_stop_1,
        "value" : data.gradient_bg_front_color_1
      },
      {
        "stop" : data.gradient_bg_front_stop_2,
        "value" : data.gradient_bg_front_color_2
      }
    ],
    "gradient_bg_back" : [
      {
        "stop" : data.gradient_bg_back_stop_1,
        "value" : data.gradient_bg_back_color_1
      },
      {
        "stop" : data.gradient_bg_back_stop_2,
        "value" : data.gradient_bg_back_color_2
      }
    ],
    "gradient_bg_moving": [
      {
        "stop": data.gradient_bg_moving_stop_1,
        "value": data.gradient_bg_moving_color_1
      },
      {
        "stop": data.gradient_bg_moving_stop_2,
        "value": data.gradient_bg_moving_color_2
      }
    ],
    "tex_floor" : SaveImage("tex_floor" , data.tex_floor, tmpFolder),
    "tex_skybox" :  SaveImage("tex_skybox" , data.tex_skybox, tmpFolder),
    "tex_bg_front" : SaveImage("tex_bg_front" , data.tex_bg_front, tmpFolder),
    "tex_bg_back" : SaveImage("tex_bg_back" , data.tex_bg_back, tmpFolder),
    "tex_bg_moving": SaveImage("tex_bg_moving" , data.tex_bg_moving, tmpFolder),
    "tex_guardian":SaveImage("tex_guardian" , data.tex_guardian, tmpFolder),
    "tex_sun":SaveImage("tex_sun" , data.tex_sun, tmpFolder),
  }


  fs.writeFileSync(tmpFolder + "/theme_" + data.name.replace(/ /g, "") + ".json", JSON.stringify(saveObject, null, 2));

  console.log("wrote file");
  

  return tmpFolder.replace("./","");

  //console.log(saveObject);

}


function CheckFormat(stringBase){
  if(stringBase.includes("png")){
    return "png";
  }else{
    return "jpg";
  }
}

function SaveImage(name, imageData, folder){
  let splitter = imageData != null ? imageData.split(';base64,') : null;

  let format = splitter != null ? CheckFormat(splitter[0]) : null
  let imageBase64 = imageData != null ? splitter[1] : null;

  if(imageBase64 != null){
    fs.writeFileSync( folder + "/"+ name + "." + format, imageBase64,'base64');
  }

  return name + "." + format;
}