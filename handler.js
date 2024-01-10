'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet'); //google spreadsheet api library
const {JWT} = require('google-auth-library'); //google authentication
const fs = require("fs"); //file system
const os = require("os");

const Pokemon = require('./Pokemon.js');
const { format } = require('path');

const TEMP_DIR = os.tmpdir();

const test_sheet = '1CPAcrPbc7_1_ALa2UpmB8dDfUec-J8eSoA29J-6Jk1g';
const completion_copy = '1F3vkkhJPt0S1EO6gcjIQLqLa501E3XohItdWX3eAlxs';
const completion = '';

const SPREADSHEET_ID = completion_copy; //https://docs.google.com/spreadsheets/d/***1CPAcrPbc7_1_ALa2UpmB8dDfUec-J8eSoA29J-6Jk1g***/edit#gid=0 the triple starred part of the url
var __dexNumDict;

const POKEMON_COLUMN = "D"; // completion and completion_copy: "D", test_sheet: "C"
const STARTING_ROW = 9;

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
  
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.write = async event => {
  console.log('Starting write function');

  if(!event.body) {
    return formatResponse(400, { message: 'body is missing' });
  }
  const body = JSON.parse(event.body);

  if(!body.cells || !Array.isArray(body.cells)) {
    return formatResponse(400, { message: '"cells" should be an array' });
  }

  // Load up doc

  const doc = authenticateDoc();

  // load up everything that's necessary to work with cells
  const sheet = await loadSheet(doc);

  for(const { identifier, content } of body.cells) {
    const cell = sheet.getCellByA1(identifier);
    cell.value = content;
  }
  await sheet.saveUpdatedCells();
  return formatResponse(200, { message: 'Cells saved successfully'});
};

async function utilWrite(cells, contents){
  if(cells.length != contents.length) {
    return formatResponse(400, {message: 'The number of cells and contents are not equal'});
  }
  // Load up doc

  const doc = authenticateDoc();

  // load up everything that's necessary to work with cells
  const sheet = await loadSheet(doc);
  
  for(let i = 0; i < cells.length; i++) {
    let cell = sheet.getCellByA1(cells[i]);
    cell.value = contents[i];
  }

  await sheet.saveUpdatedCells();
  return formatResponse(200, { message: 'Cells saved successfully'});
}

module.exports.read = async event => {
  console.log('Starting read function');
  if(!event || !event.queryStringParameters || !event.queryStringParameters.cells) {
    return formatResponse(400, { message: 'Invalid parameters' });
  }

  const cells = event.queryStringParameters.cells;

  const doc = authenticateDoc();
  const sheet = await loadSheet(doc);

  const contents = cells.split(',').map(cell => sheet.getCellByA1(cell).value);

  return formatResponse(200, contents);
};

async function utilRead(cells){
  console.log(cells);
  // if(cells) {
  //   return formatResponse(400, { message: 'Invalid parameters' });
  // }
  const doc = authenticateDoc();
  const sheet = await loadSheet(doc);
  let contents = {};
  for(let i = 0; i < cells.length; i++){
    contents[i] = sheet.getCellByA1(cells[i]).value;
  }
  return formatResponse(200, contents);
}

module.exports.getPokemonObject = async event => {
  console.log('Starting get function');
  if(!event || !event.queryStringParameters || !event.queryStringParameters.names) {
    return formatResponse(400, { message: 'Invalid parameters' });
  }

  const doc = authenticateDoc();
  const sheet = await loadSheet(doc);
  const calcSheet = await loadSheet(doc, 2);

  const names = event.queryStringParameters.names.split(',');
  
  let objs = {};
  for(let i = 0; i < names.length; i++){
    let name = names[i];
    name = name.trim();
    let cell = await searchByName(name);
    if(cell == "Pokemon not found"){
      return formatResponse(404, "Pokemon not found");
    }
    
    // console.log(cell);
    const id = cell.substring(1) - STARTING_ROW + 1;

    const nativeRegion = calcSheet.getCellByA1("E" + (id + 1)).value;
    
    let inDex;
    if(calcSheet.getCellByA1("C"+ (id + 1)).value){
      inDex = "Both";
    }
    else if(calcSheet.getCellByA1("A" + (id + 1)).value){
      inDex = "Only XY";
    }
    else if(calcSheet.getCellByA1("B" + (id + 1)).value){
      inDex = "Only ORAS";
    }
    else{
      inDex = "Neither";
    }
    
    const caught = sheet.getCellByA1(String.fromCharCode(POKEMON_COLUMN.charCodeAt() + 1) + cell.substring(1)).value;

    // const available = sheet.getCellByA1();

    // const sprite = sheet.getCellByA1(String.fromCharCode(col.charCodeAt() - 1) + cell.substring(1)).value;
    // console.log(sprite);

    const obj = new Pokemon(name, id, nativeRegion, inDex, caught, "WIP", "WIP");
    objs[i] = obj;
  }

  return formatResponse(200, objs);
};

module.exports.setCaught = async event => {
  console.log('Starting set caught function');
  if(!event || !event.queryStringParameters || !event.queryStringParameters.names || !event.path) {
    return formatResponse(400, { message: 'Invalid parameters' });
  }

  let isCaught = (event.path == "/setCaught");
  console.log(isCaught);

  const names = event.queryStringParameters.names.split(',');
  let cells = [];
  let contents = [];
  for(let i = 0; i < names.length; i++){
    let name = names[i];
    name = name.trim();
    const cell = await searchByName(name);
    if(cell == "Pokemon not found"){
      return formatResponse(404, {message: "Pokemon not found"});
    }

    cells[i] = String.fromCharCode(POKEMON_COLUMN.charCodeAt() + 1) + cell.substring(1);
    contents[i] = isCaught;
  }
  
  // console.log(cells);
  // console.log(contents);
  return (await utilWrite(cells, contents));
  // console.log(await utilRead(cells));
};

async function searchByName(name){
  name = name.trim().toLowerCase();

  console.log('Starting search function on ' + name[0].toUpperCase() + name.slice(1));
  let sheet;
  if(__dexNumDict == null){
    const doc = authenticateDoc();
    sheet = await loadSheet(doc);
  }

  let dexNumDict = getHashAllPokemon(sheet);

  if(dexNumDict.hasOwnProperty(name)){
    const answer = dexNumDict[name];
    return answer;
  }

  return "Pokemon not found";
}

function formatResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(
      payload,
      null,
      2
    ),
  };
}

// function formatPokemon(statusCode, payload) {
//   return {
//     statusCode: statusCode,
//     body: JSON.stringify(
//       payload,
//       ["name", "id", "nativeRegion", "inDex", "caught"],
//       2
//     ),
//   };
// }


function authenticateDoc(){
  const serviceAccountAuth = new JWT({
    // env var values here are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

  return doc;
}

async function loadSheet(doc, sheetNum = 0){
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[sheetNum];
  await sheet.loadCells();

  return sheet;
}

function getHashAllPokemon(sheet){
  const filePath = TEMP_DIR + "/HashTable.json";
  // console.log(TEMP_DIR);
  if(__dexNumDict == null){
    if(fs.existsSync(filePath)){
      __dexNumDict = JSON.parse(fs.readFileSync(filePath));
    }
    else {
      console.log("Creating Hash Table");
      __dexNumDict = {};
      const startRow = STARTING_ROW;
      const endRow = startRow + 720;

      for(var i = 0; startRow + i <= endRow; i++){
        const range = POKEMON_COLUMN + (startRow + i).toString();
        const cell = sheet.getCellByA1(range);
        
        // console.log(cell);
        const name = cell.value.trim().toLowerCase();
        __dexNumDict[name] = range;
      }

      fs.writeFile(filePath, JSON.stringify(__dexNumDict), function (err) {
        if (err) {
            console.error("writeFile failed: " + err);
        } else {
            console.log("writeFile succeeded");
        }
      });
    }
  }
  return __dexNumDict;
}