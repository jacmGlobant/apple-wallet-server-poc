const fs = require('fs');
const fse = require('fs-extra');
const { PKPass } = require("passkit-generator");
const path = require('path');
const util = require('util');

const SAMPLE_PASS_DIR = path.resolve('./helpers/pkpass-generator/sample.pass');
const OUTPUT_PASS_DIR = path.resolve('./helpers/pkpass-generator/tmp/sample.pass');
const jsonPass = require(path.resolve('./helpers/pkpass-generator/sample.pass/pass.json'));

const writeFile = util.promisify(fs.writeFile);

const mapBgToTier = {
   'Star': 'rgb(193, 32, 51)',
   'Legend': 'rgb(34, 96, 147)',
   'Icon': 'rgb(207, 159, 53)',
   'X': 'rgb(16, 24, 32)'
}

const _createTemporaryDirectory = () => {
   try {
      if (fs.existsSync(OUTPUT_PASS_DIR)) {
         fs.rmSync(OUTPUT_PASS_DIR, { recursive: true, force: true });
      } 
      fs.mkdirSync(OUTPUT_PASS_DIR);
   } catch (error) {
      // log system here
   } 
}

const _copyPassToTemporaryLocation = async () => {
   try {
      await fse.copySync(SAMPLE_PASS_DIR, OUTPUT_PASS_DIR, { overwrite: true });
   } catch (error) {
      console.log('>>>>>>>>> error', error);
   }
}

const getId = ()  => {
   return Math.floor(Date.now() / 1000).toString();
 }

const _replaceJsonPass = async (data) => {
   jsonPass.serialNumber = getId();
   jsonPass.generic.primaryFields[0].value = data.accountNumber;
   jsonPass.generic.secondaryFields[0].value = data.name;
   jsonPass.generic.secondaryFields[1].value = data.tier;
   jsonPass.backgroundColor = mapBgToTier[data.tier];
   jsonPass.generic.backFields[0].value = data.name.split(' ')[0];
   jsonPass.generic.backFields[1].value = data.name.split(' ')[1];
   jsonPass.generic.backFields[2].value = data.accountNumber;
   jsonPass.generic.backFields[3].value = data.tier;
   await writeFile(path.resolve(`${OUTPUT_PASS_DIR}/pass.json`), JSON.stringify(jsonPass, null, 3));
}

const generatePkPass = async (data) => {
   await _createTemporaryDirectory();
   await _copyPassToTemporaryLocation();
   await _replaceJsonPass(data);

   const pass = await PKPass.from({
      model: path.resolve('./helpers/pkpass-generator/tmp/sample.pass'),
      certificates: {
         wwdr: fs.readFileSync('./helpers/pkpass-generator/certificates/WWDRG4.pem'),
         signerCert: fs.readFileSync('./helpers/pkpass-generator/certificates/signerCert.pem'),
         signerKey: fs.readFileSync('./helpers/pkpass-generator/certificates/signerKey.pem'),
         signerKeyPassphrase: '12345'
      },
   }, {
      serialNumber: data.accountNumber
   });
   pass.setBarcodes(data.accountNumber);   
   return pass.getAsBuffer();
}

module.exports = generatePkPass;