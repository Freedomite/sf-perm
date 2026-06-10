#!/usr/bin/env node
import {Command} from 'commander';
import {execSync} from 'child_process';
import {XMLParser, XMLBuilder, XMLValidator} from 'fast-xml-parser';
import fs from 'node:fs/promises'; // Or use require('node:fs/promises') for CommonJS

async function handlePermissions(options){
    let getPermSet = execSync('sf project retrieve start --source-dir ' + options.path + ' -c', { encoding: 'utf-8' });
    let file = await openFile(options.path);
    let permissionLoc = options.path.split('permissionsets');

    const parser = new XMLParser();
    let permissionJson = parser.parse(file);
    // fields 
    let fieldsToKeep = [];
    for (let fieldPermission of permissionJson.PermissionSet.fieldPermissions){
        let objectfield = fieldPermission.field.split('.');

        if (objectfield[1].substr(objectfield[1].length - 3) == '__c'){ // only remove it if it is a custom field because can only have custom fields in the repo 
            let fieldPath = permissionLoc[0] + '\\objects\\' + objectfield[0] + '\\fields\\' + objectfield[1] + '.field-meta.xml';
            let checkFile = await openFile(fieldPath);
            if (checkFile){
                fieldsToKeep.push(fieldPermission);
            }
        }else{
            fieldsToKeep.push(fieldPermission);
        }
    }
    permissionJson.PermissionSet.fieldPermissions = fieldsToKeep;

    const builder = new XMLBuilder({
        format: true,            // Enables pretty printing
        indentBy: '  ',          // Defines the indentation character(s)
        ignoreAttributes: false
    });
    const xmlContent = builder.build(permissionJson);
    await writeFileToPath(options.path, xmlContent);
}

async function openFile(fileName) {
    try {
        const data = await fs.readFile(fileName, { encoding: 'utf8' });
        return data;
    } catch (error) {
        //console.error('Error opening file:', error);
    }
}

async function writeFileToPath(fileName, content) {
  try {
    let lines = content.split('\n');
    lines[0] = '<?xml version="1.0" encoding="UTF-8"?>';
    lines[1] = '<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">';
    content = lines.join('\n');
    await fs.writeFile(fileName, content, 'utf8');
    console.log('File written successfully to:', fileName);
  } catch (error) {
    console.error('Error writing file:', error);
  }
}



const program = new Command();

program
    .version('1.0.0')
    .description('cli tool for getting permission sets')
    .option('-v, --help', 'Help context')
    .option('-p, --path [fileName]', 'path to permission set')
    .action((options) => {
        console.log(JSON.stringify(options));
        if (options.help) console.log('this is the help text');
        if (options.path) {
            handlePermissions(options);
        }
    });

program.parse(process.argv);






