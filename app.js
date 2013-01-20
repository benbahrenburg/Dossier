/*jslint maxerr:1000 */

//Create our application namespace
var my = {};
//Import the module
my.dossier = require('dossier');

Ti.API.info('Copy one directory to another');

//Create our source and target directory paths
var sourceDir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'SampleData');
var targetDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + '/NewSampleData');

Ti.API.info('Copying ' + sourceDir.nativePath + ' to ' + targetDir.nativePath );
my.dossier.copy(sourceDir.nativePath,targetDir.nativePath);

Ti.API.info('List all the contents of ' + targetDir.nativePath);
var listTargetContents = my.dossier.listContents(targetDir.nativePath);

Ti.API.info('Move ' + sourceDir.nativePath + ' to ' + targetDir.nativePath );
my.dossier.move(sourceDir.nativePath,targetDir.nativePath);

Ti.API.info('List all the contents of ' + targetDir.nativePath);
listTargetContents = my.dossier.listContents(targetDir.nativePath);
